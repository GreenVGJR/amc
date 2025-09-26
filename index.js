// Main
const { ForgeMusic, DefaultExtractors, GuildQueueEvent } = require('@tryforge/forge.music');
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");

// Extractor & Config
const { YoutubeiExtractor } = require("discord-player-youtubei");
const youtube = require('./back/client/youtubeConfig');

require('dotenv').config({ quiet: true }); // Load Environment

const db = new ForgeDB({
    events: [
        "connect"
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
    connectOptions: {
        disableHistory: true,
        disableResampler: true,
        bufferingTimeout: 2000,
        connectionTimeout: 10000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 15000,
        pauseOnEmpty: true,
    },
    skipFFmpeg: true
});
const client = new ForgeClient({
    token: process.env.DISCORD_TOKEN,
    logLevel: LogPriority.Low,
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
        music,
        db
    ]
});

client.login();

client.functions.load("back/functions");
db.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.player.extractors.register(YoutubeiExtractor, youtube);
music.commands.load("back/events");