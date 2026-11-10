import "./back/client/youtubeiLogs.ts";

// Config
import dotenv from "dotenv";
dotenv.config({ quiet: true }); // Load Environment
import toggles from "./back/config.json" with { type: "json" };
import { fallbackYTStream, resolveYoutubeMetadata } from "./back/client/youtubeConfig.ts";

// Main
import { ForgeClient, LogPriority, Logger } from "@tryforge/forgescript";
import { Util } from "discord-player";
import { ForgeMusic, GuildQueueEvent } from "@tryforge/forge.music";
import { QuorielDB } from "@nationdex/qdb";
import { QuorielEdge } from "@nationdex/edge";
import { ForgeH2 } from "forgeH2";
// import { ForgeDB } from "@tryforge/forge.db";

// Extractor warmup (background, retried, logged - see back/client/extractorWarmup.ts)
import { warmupExtractors } from "./back/client/extractorWarmup.ts";

import { installTypeScriptModuleLoaders } from "./back/client/typescriptLoaders.ts";
import { YoutubeExtractor } from "./back/client/youtubeExtractor.ts";

// Disable DSP compressor by default for discord-player
import { FiltersChain } from "@discord-player/equalizer";
const _origFiltersChainCreate = (FiltersChain.prototype as any).create;
(FiltersChain.prototype as any).create = function (src: any, presets: any = (this as any).presets) {
    presets = { ...presets, compressor: { ...presets?.compressor, disabled: true } };
    return _origFiltersChainCreate.call(this, src, presets);
};

const quorielDb = new QuorielDB({
    events: [
        "databaseConnect",
        "recordUpdate",
        "recordRemove"
    ]
});

const quorielEdge = new QuorielEdge({
    caches: ["initclientmusic", "pornamecachingretry"]
});

const music = new ForgeMusic({
    events: [
        GuildQueueEvent.ConnectionDestroyed,
        GuildQueueEvent.Error,
        GuildQueueEvent.PlayerError,
        GuildQueueEvent.PlayerPause,
        GuildQueueEvent.PlayerResume,
        GuildQueueEvent.PlayerTrigger,
        GuildQueueEvent.PlayerFinish,
        GuildQueueEvent.EmptyQueue,
        GuildQueueEvent.AudioTrackAdd
    ],
    blockStreamFrom: toggles.disable_YT ? [YoutubeExtractor.identifier] : [],
    connectOptions: {
        disableFallbackStream: true,
        bufferingTimeout: 250,
        connectionTimeout: 30000,
        volume: 50,
        leaveOnEmpty: false,
        leaveOnEnd: false,
        leaveOnStop: false,
        pauseOnEmpty: false,
        onBeforeCreateStream: async (track) => {
            const storedStream = track.raw?.youtubeCreateStream;
            if (typeof storedStream === "function") {
                try {
                    const stream = await storedStream(track);
                    if (stream) return stream;
                } catch { }
            }

            const videoId = track.url?.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1];
            if (!videoId) return null;

            const metadata = await resolveYoutubeMetadata(videoId).catch(() => null);
            if (!metadata) Logger.warn(`/ [YoutubeConfig] metadata miss | ${videoId} | ${track.url}`);
            if (metadata) {
                if (metadata.title) track.title = metadata.title;
                if (metadata.author) track.author = metadata.author;
                if (metadata.lengthSeconds > 0) track.duration = Util.buildTimeCode(Util.parseMS(metadata.lengthSeconds * 1000));
                track.live = metadata.lengthSeconds === 0;
                if (!track.thumbnail) track.thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                if (metadata.createStream) {
                    if (!track.raw) track.raw = {};
                    track.raw.youtubeCreateStream = metadata.createStream;
                    try {
                        const stream = await metadata.createStream(track);
                        if (stream) return stream;
                    } catch { }
                }
            }

            try {
                return await fallbackYTStream(track.url, track);
            } catch {
                return null;
            }
        }
    }
} as any);

const client = new ForgeClient({
    token: process.env.DISCORD_TOKEN,
    logLevel: LogPriority.Medium,
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent"
    ],
    events: [
        "clientReady",
        "voiceStateUpdate",
        "interactionCreate",
        "messageCreate",
        "guildDelete"
    ],
    prefixes: [
        "?"
    ],
    extensions: [
        new ForgeH2(),
        // new ForgeDB(),
        quorielDb,
        quorielEdge,
        music
    ],
    waitGuildTimeout: 60000,
} as any);

warmupExtractors(music.player);

installTypeScriptModuleLoaders();

client.functions.load("back/functions");
quorielDb.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.commands.load("back/events/fm");
client.commands.load("back/events/fs");

client.login();

export { music }; // for $joinVC
