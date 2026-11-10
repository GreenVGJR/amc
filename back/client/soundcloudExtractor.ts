import { SoundcloudExtractor as BaseSoundcloudExtractor } from "discord-player-soundcloud";
import type { Track } from "discord-player";

function transcodingScore(transcoding: any) {
    const preset = String(transcoding?.preset || "").toLowerCase();
    const quality = String(transcoding?.quality || "").toLowerCase();
    const mime = String(transcoding?.format?.mime_type || "").toLowerCase();
    let score = 0;

    if (preset.includes("aac_") || mime.includes("audio/mp4")) score += 1000;
    else if (preset.includes("abr_")) score += 500;

    const bitrate = preset.match(/(\d+)k/);
    if (bitrate) score += Number(bitrate[1]);

    if (quality === "hq") score += 30;
    else if (quality === "sq") score += 20;
    else if (quality === "lq") score += 10;

    return score;
}

export class SoundcloudExtractor extends BaseSoundcloudExtractor {
    private async getTrack(info: Track) {
        const metadata: any = (info as any).metadata;
        if (metadata?.media?.transcodings) return metadata;
        return await this.internal.tracks.getV2(info.url).catch(() => null);
    }

    private async resolveTranscoding(track: any, protocol: "hls" | "progressive") {
        const transcodings = (track?.media?.transcodings || [])
            .filter((item: any) => item?.url && item?.format?.protocol === protocol)
            .sort((a: any, b: any) => transcodingScore(b) - transcodingScore(a));

        for (const transcoding of transcodings) {
            let clientId = await this.internal.api.getClientId().catch(() => null);
            for (let attempt = 0; attempt < 2; attempt++) {
                const url = transcoding.url + (transcoding.url.includes("?") ? "&" : "?") + `client_id=${clientId}`;
                const response = await fetch(url, { headers: this.internal.api.headers }).catch(() => null);
                if (response?.ok) {
                    const data = await response.json().catch(() => null);
                    if (data?.url) return data.url;
                }
                clientId = await this.internal.api.getClientId(true).catch(() => null);
            }
        }

        return null;
    }

    async stream(info: Track): Promise<any> {
        const track = await this.getTrack(info);

        const hls = await this.resolveTranscoding(track, "hls");
        if (hls) return hls;

        const progressive = await this.resolveTranscoding(track, "progressive");
        if (progressive) return progressive;

        const protocols = (track?.media?.transcodings || []).map((item: any) => item?.format?.protocol).filter(Boolean);
        const isEncrypted = protocols.some((protocol: string) => typeof protocol === "string" && protocol.includes("encrypted"));

        throw new Error(isEncrypted ? "This track is DRM Protected." : "This track is unplayable, likely geo-restriction or subscriber only.");
    }
}
