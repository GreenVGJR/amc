require('dotenv').config(); // Load Environment

// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeMusic, DefaultExtractors, GuildQueueEvent } = require('@tryforge/forge.music');
const { QuorielDB } = require("@quoriel/db");
// const { ForgeDB } = require("@tryforge/forge.db");

// Extractor & Config
const { YoutubeiExtractor } = require("discord-player-youtubei");
const youtube = require('./back/client/youtubeConfig');
const toggles = require('./back/config.json');


const quorielDb = new QuorielDB({
    events: [
        "dbConnect"
    ]
});

const music = new ForgeMusic({
    events: [
        GuildQueueEvent.ConnectionDestroyed,
        GuildQueueEvent.Error,
        GuildQueueEvent.PlayerError,
        GuildQueueEvent.PlayerPause,
        GuildQueueEvent.PlayerResume,
        GuildQueueEvent.PlayerTrigger,
        GuildQueueEvent.PlayerFinish
    ],
    includeExtractors: DefaultExtractors,
    blockStreamFrom: toggles.disable_YT ? [YoutubeiExtractor.identifier] : [],
    connectOptions: {
        disableResampler: true,
        disableFallbackStream: toggles.disable_YT,
        bufferingTimeout: 500,
        volume: 50,
        connectionTimeout: 10000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 15000,
        pauseOnEmpty: true
    },
    skipFFmpeg: true
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
        "messageCreate"
    ],
    prefixes: [
        "?"
    ],
    extensions: [
     // new ForgeDB(),
        quorielDb,
        music,
    ]
});

quorielDb.commands.load("back/client/fdb");
client.functions.load("back/functions");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.player.extractors.register(YoutubeiExtractor, youtube);
music.commands.load("back/events");

console.clear();
client.login();