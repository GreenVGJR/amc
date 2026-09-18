const { Logger } = require("@tryforge/forgescript");
const { YoutubeExtractor } = require("discord-player-youtubei");
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { SpotifyExtractor } = require("discord-player-spotify");
const { AppleMusicExtractor } = require("discord-player-applemusic");
const { AttachmentExtractor } = require("@discord-player/extractor");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function registerWithRetry(player, ExtractorClass, options, emit, retries, backoffMs) {
    const name = ExtractorClass.identifier || ExtractorClass.name || "unknown";
    try {
        if (typeof player?.extractors?.isRegistered === "function" && player.extractors.isRegistered(name)) {
            emit(`Extractor ${name}: already registered`);
            return { name, ok: true };
        }
    } catch { /* fall through */ }
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const ext = await player.extractors.register(ExtractorClass, options);
            if (ext) {
                emit(`Extractor ${name}: ready`);
                return { name, ok: true };
            }
            emit(`Extractor ${name}: register returned null (attempt ${attempt}/${retries + 1})`);
        } catch (e) {
            emit(`Extractor ${name}: failed (attempt ${attempt}/${retries + 1}): ${e?.message || e}`);
        }
        if (attempt <= retries) await sleep(backoffMs);
    }
    emit(`Extractor ${name}: FAILED after ${retries + 1} attempts`);
    return { name, ok: false };
}

async function primeExtractor(label, fn, emit) {
    try {
        await fn();
    } catch (e) {
        emit(`${label} prime failed: ${e?.message || e}`);
    }
}

async function warmupExtractors(player, { youtube, log, retries = 3, backoffMs = 5000 } = {}) {
    const emit = typeof log === "function" ? log : (...args) => Logger.info(...args);
    try {
        try {
            if (typeof player?.extractors?.on === "function") {
                player.extractors.on("error", (_ctx, extractor, err) => {
                    emit(`Extractor ${extractor?.identifier || "unknown"} error: ${err?.message || err}`);
                });
            }
        } catch { /* best-effort */ }
        const list = [
            [SoundcloudExtractor, undefined],
            [SpotifyExtractor, undefined],
            [AppleMusicExtractor, undefined],
            [AttachmentExtractor, undefined],
            [YoutubeExtractor, youtube]
        ];
        const results = await Promise.allSettled(
            list.map(([Cls, opts]) => registerWithRetry(player, Cls, opts, emit, retries, backoffMs))
        ).then((settled) => settled.map((s) => (s.status === "fulfilled" ? s.value : { name: "unknown", ok: false })));
        const byName = (Cls) => {
            try {
                return player?.extractors?.get?.(Cls.identifier);
            } catch {
                return undefined;
            }
        };
        await Promise.allSettled([
            primeExtractor("Spotify", async () => {
                const ext = byName(SpotifyExtractor);
                if (typeof ext?.internal?.ensureValidToken === "function") await ext.internal.ensureValidToken();
            }, emit),
            primeExtractor("SoundCloud", async () => {
                const ext = byName(SoundcloudExtractor);
                if (typeof ext?.internal?.api?.getClientId === "function") await ext.internal.api.getClientId();
            }, emit)
        ]);
        return results;
    } catch (e) {
        emit(`Extractor warmup crashed: ${e?.message || e}`);
        return [];
    }
}

module.exports = { warmupExtractors };
