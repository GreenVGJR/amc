require('dotenv').config(); // Load Environment

// Config
const youtube = require('./back/client/youtubeConfig');
const toggles = require('./back/config.json');

// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeMusic, GuildQueueEvent } = require('@tryforge/forge.music');
const { QuorielDB } = require("@quoriel/db");
// const { ForgeDB } = require("@tryforge/forge.db");

// Extractor
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { SpotifyExtractor } = require("discord-player-spotify");
const { AppleMusicExtractor } = require("discord-player-applemusic");
const { AttachmentExtractor } = require("@discord-player/extractor");

const quorielDb = new QuorielDB({
    events: [
        "dbConnect",
        "recordUpdate",
        "recordRemove"
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
    blockStreamFrom: toggles.disable_YT ? [YoutubeiExtractor.identifier] : [],
    connectOptions: {
        disableResampler: false,
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

console.clear();

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
        music
    ]
});

client.login();

quorielDb.commands.load("back/client/fdb");
client.functions.load("back/functions");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.player.extractors.register(SoundcloudExtractor);
music.player.extractors.register(SpotifyExtractor);
music.player.extractors.register(AppleMusicExtractor);
music.player.extractors.register(AttachmentExtractor);
music.player.extractors.register(YoutubeiExtractor, youtube);
music.commands.load("back/events");