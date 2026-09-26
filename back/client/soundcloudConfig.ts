import { SoundcloudExtractor } from "discord-player-soundcloud";

type SoundcloudTrack = {
	id?: number;
	track_authorization?: string;
	media?: {
		transcodings?: Array<{
			url?: string;
			snipped?: boolean;
			format?: { protocol?: string; mime_type?: string };
		}>;
	};
};

async function getClientId() {
	const api = (SoundcloudExtractor.instance as any)?.internal?.api;
	return await api?.getClientId?.();
}

const SEARCH_RESULT_LIMIT = 10;

function appendQuery(url: string, params: Record<string, string>) {
	const target = new URL(url);
	for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
	return target.toString();
}

function selectTranscoding(transcodings: SoundcloudTrack["media"]["transcodings"]) {
	return transcodings
		?.filter(item => {
			const protocol = item.format?.protocol?.toLowerCase() || "";
			const mimeType = item.format?.mime_type?.toLowerCase() || "";
			return (protocol.startsWith("hls") || protocol === "progressive")
				&& !protocol.includes("encrypted")
				&& !mimeType.includes("encrypted");
		})
		.sort((left, right) => {
			const leftProtocol = left.format?.protocol?.toLowerCase() || "";
			const rightProtocol = right.format?.protocol?.toLowerCase() || "";
			const leftRank = leftProtocol.startsWith("hls") ? 0 : 2;
			const rightRank = rightProtocol.startsWith("hls") ? 0 : 2;
			const leftPreviewRank = left.snipped ? 1 : 0;
			const rightPreviewRank = right.snipped ? 1 : 0;
			return (leftRank + leftPreviewRank) - (rightRank + rightPreviewRank);
		})[0];
}

export async function searchSoundcloudFallback(title: unknown, author: unknown): Promise<string | undefined> {
	const trackTitle = typeof title === "string" ? title.trim() : "";
	const trackAuthor = typeof author === "string" ? author.trim() : "";
	const query = [trackAuthor, trackTitle].filter(Boolean).join(" - ");
	if (!query) return undefined;

	try {
		const clientId = await getClientId();
		if (!clientId) return undefined;

		const searchUrl = new URL("https://api-v2.soundcloud.com/search/tracks");
		searchUrl.searchParams.set("q", query);
		searchUrl.searchParams.set("client_id", clientId);
		searchUrl.searchParams.set("limit", String(SEARCH_RESULT_LIMIT));

		const searchResponse = await fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
		if (!searchResponse.ok) return undefined;
		const searchData = await searchResponse.json() as { collection?: SoundcloudTrack[] };
		if (!searchData.collection?.length) return undefined;

		for (const track of searchData.collection.slice(0, SEARCH_RESULT_LIMIT)) {
			if (!track?.id) continue;

			const transcoding = selectTranscoding(track.media?.transcodings);
			if (!transcoding?.url) continue;

			const streamResponse = await fetch(appendQuery(transcoding.url, {
				client_id: clientId,
				...(track.track_authorization ? { track_authorization: track.track_authorization } : {})
			})).catch(() => null);
			if (!streamResponse?.ok) continue;

			const streamData = await streamResponse.json().catch(() => null) as { url?: string } | null;
			if (streamData?.url) return streamData.url;
		}

		return undefined;
	} catch {
		return undefined;
	}
}
