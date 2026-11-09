import { BaseExtractor, Playlist, QueryType, Track, Util } from "discord-player";
import type { ExtractorInfo, ExtractorSearchContext, GuildQueueHistory } from "discord-player";
import { fallbackYTStream, fetchYoutubePlaylist, resolveYoutubeMetadata, searchYoutube } from "./youtubeConfig.ts";

const YOUTUBE_URL = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?|playlist\?|shorts\/|embed\/|live\/)|youtu\.be\/)/i;

function getVideoId(input: string) {
    return input.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/)?.[1] || null;
}

function getPlaylistId(input: string) {
    try {
        return new URL(input).searchParams.get("list");
    } catch {
        return null;
    }
}

export class YoutubeExtractor extends BaseExtractor {
    static identifier = "amc.youtube";
    priority = 10;

    async activate() {
        this.protocols = ["yt", "youtube"];
    }

    async deactivate() {}

    async validate(query: string, type?: any) {
        if (type === QueryType.YOUTUBE_PLAYLIST) return YOUTUBE_URL.test(query) || /^[A-Za-z0-9_-]{10,}$/.test(query);
        if (YOUTUBE_URL.test(query)) return true;
        return [QueryType.YOUTUBE, QueryType.YOUTUBE_VIDEO, QueryType.YOUTUBE_SEARCH, QueryType.AUTO, QueryType.AUTO_SEARCH].includes(type);
    }

    async handle(query: string, context: ExtractorSearchContext): Promise<ExtractorInfo> {
        const playlistId = getPlaylistId(query) || (context.type === QueryType.YOUTUBE_PLAYLIST ? query : null);
        if (playlistId && (context.type === QueryType.YOUTUBE_PLAYLIST || !getVideoId(query))) {
            const data = await fetchYoutubePlaylist(playlistId);
            if (!data) return this.createResponse(null, []);
            const tracks = data.tracks.map((result) => this.buildTrackFromResult(result, context));
            const playlist = new Playlist(this.context.player, {
                title: data.title || playlistId,
                thumbnail: data.thumbnail,
                description: "",
                author: { name: data.author || "", url: "" },
                tracks: [],
                id: playlistId,
                url: `https://www.youtube.com/playlist?list=${playlistId}`,
                type: "playlist",
                source: "youtube",
            });
            playlist.tracks = tracks;
            return this.createResponse(playlist, tracks);
        }

        const videoId = getVideoId(query);
        if (videoId) {
            const metadata = await resolveYoutubeMetadata(videoId);
            return this.createResponse(null, [this.buildTrack(videoId, metadata, context)]);
        }

        const results = await searchYoutube(query, 10);
        if (results.length || (context.type !== QueryType.AUTO && context.type !== QueryType.AUTO_SEARCH)) {
            return this.createResponse(null, results.map((result) => this.buildTrackFromResult(result, context)));
        }

        const soundcloud = this.context.player.extractors.get("com.discord-player.soundcloudextractor");
        return soundcloud ? soundcloud.handle(query, context) : this.createResponse(null, []);
    }

    async stream(info: Track) {
        return fallbackYTStream(info.url, info);
    }

    async getRelatedTracks(track: Track, history: GuildQueueHistory): Promise<ExtractorInfo> {
        return this.createResponse(null, []);
    }

    private buildTrackFromResult(result: { id: string; title: string; author: string; duration: string; thumbnail: string; live: boolean }, context: ExtractorSearchContext) {
        return new Track(this.context.player, {
            title: result.title,
            author: result.author,
            url: `https://www.youtube.com/watch?v=${result.id}`,
            thumbnail: result.thumbnail,
            duration: /^\d{1,2}:\d{2}(:\d{2})?$/.test(result.duration) ? result.duration : "0:00",
            live: result.live,
            source: "youtube",
            queryType: QueryType.YOUTUBE_VIDEO,
            requestedBy: context.requestedBy,
            raw: { source: "youtube", videoId: result.id, youtubeResolved: true },
        });
    }

    private buildTrack(videoId: string, metadata: { title?: string; author?: string; lengthSeconds?: number } | null, context: ExtractorSearchContext) {
        const lengthSeconds = Number(metadata?.lengthSeconds) || 0;
        return new Track(this.context.player, {
            title: metadata?.title || videoId,
            author: metadata?.author || "",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: lengthSeconds > 0 ? Util.buildTimeCode(Util.parseMS(lengthSeconds * 1000)) : "0:00",
            live: lengthSeconds <= 0,
            source: "youtube",
            queryType: QueryType.YOUTUBE_VIDEO,
            requestedBy: context.requestedBy,
            raw: { source: "youtube", videoId, youtubeResolved: !!metadata },
        });
    }
}
