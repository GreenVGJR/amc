require("./back/client/youtubeiLogs.js");

// Config
require('dotenv').config({ quiet: true }); // Load Environment
const toggles = require('./back/config.json');
const youtube = require('./back/client/youtubeConfig.js');

// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeMusic, GuildQueueEvent } = require('@tryforge/forge.music');
const { QuorielDB } = require("@quoriel/db");
const { QuorielEdge } = require("@quoriel/edge");
// const { ForgeDB } = require("@tryforge/forge.db");

// Extractor warmup (background, retried, logged - see back/client/extractorWarmup.js)
const { warmupExtractors } = require("./back/client/extractorWarmup.js");

// Disable DSP compressor by default for discord-player
const { FiltersChain } = require("@discord-player/equalizer");
const _origFiltersChainCreate = FiltersChain.prototype.create;
FiltersChain.prototype.create = function (src, presets = this.presets) {
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
    blockStreamFrom: toggles.disable_YT ? [YoutubeiExtractor.identifier] : [],
    connectOptions: {
        disableFallbackStream: true,
        disableBiquad: true,
        ...(!toggles.useNativeStream && { bufferingTimeout: 250 }),
        connectionTimeout: 30000,
        volume: 50,
        leaveOnEmpty: false,
        leaveOnEnd: false,
        leaveOnStop: false,
        pauseOnEmpty: false
    }
});

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
        // new ForgeDB(),
        quorielDb,
        quorielEdge,
        music
    ],
    waitGuildTimeout: 60000,
});

warmupExtractors(music.player, { youtube });

client.functions.load("back/functions");
quorielDb.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.commands.load("back/events/fm");
client.commands.load("back/events/fs");

client.login();

module.exports = { music }; // for $joinVC