['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[YOUTUBEJS]')) return;
        original(...args);
    };
});
try { require('youtubei.js').Log.setLevel(0); } catch (e) {}
try { require('discord-player-youtubei/node_modules/youtubei.js').Log.setLevel(0); } catch (e) {}

// Config
const toggles = require('./back/config.json');
const youtube = require('./back/client/youtubeConfig');

require('dotenv').config(); // Load Environment

// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeMusic, GuildQueueEvent } = require('@tryforge/forge.music');
const { QuorielDB } = require("@quoriel/db");
const { QuorielEdge } = require("@quoriel/edge");
// const { ForgeDB } = require("@tryforge/forge.db");

// Extractor
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { SpotifyExtractor } = require("discord-player-spotify");
const { AppleMusicExtractor } = require("discord-player-applemusic");
const { AttachmentExtractor } = require("@discord-player/extractor");
let YoutubeSabrExtractor;
if(toggles.useSABR) {
    ({ YoutubeSabrExtractor } = require('discord-player-googlevideo'));
}

const quorielDb = new QuorielDB({
    events: [
        "databaseConnect",
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
        defaultFFmpegFilters: ["compressor"],
        disableResampler: true,
        disableFallbackStream: !toggles.useSABR,
        bufferingTimeout: 350,
        volume: 50,
        connectionTimeout: 10000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 15000,
        pauseOnEmpty: true
    },
    skipFFmpeg: true,
    probeTimeout: 1
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
        new QuorielEdge(),
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
if(toggles.useSABR) music.player.extractors.register(YoutubeSabrExtractor, {});
music.player.extractors.register(SoundcloudExtractor);
music.player.extractors.register(SpotifyExtractor);
music.player.extractors.register(AppleMusicExtractor);
music.player.extractors.register(AttachmentExtractor);
music.player.extractors.register(YoutubeiExtractor, youtube);
music.commands.load("back/events");

console.clear();
