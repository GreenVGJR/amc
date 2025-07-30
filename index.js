// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeMusic, DefaultExtractors } = require('@tryforge/forge.music');

// Extractor
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { SoundcloudExtractor } = require("discord-player-soundcloud");

require('dotenv').config(); // Load Environment

const db = new ForgeDB({
    events: [
        "connect"
    ]
});

const music = new ForgeMusic({
    events: [
     // "connection",
        "connectionDestroyed",
        "disconnect",
        "emptyQueue",
        "error",
        "playerError",
        "playerPause",
        "playerResume",
        "playerTrigger",
        "playerFinish",
        ],
    includeExtractors: DefaultExtractors,
    connectOptions: {
        bufferingTimeout: 0,
        connectionTimeout: 300000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 30000,
        pauseOnEmpty: true
    },
    connectionTimeout: 86400000,
    probeTimeout: 0,
    lagMonitor: 0
    // For avoids connect error thing
});

const client = new ForgeClient({
    token: process.env.DISCORD_TOKEN,
    logLevel: LogPriority.Low,
    shards: "auto",
    shardCount: 3,
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent"
    ],
    events: [
        "ready",
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

// Custom Functions, Autocomplete, Events
client.functions.load("back/scrape")
client.commands.load("basic/autocomplete") 
client.commands.load("basic/events")

client.commands.load("basic/commands") // Basic Command
client.applicationCommands.load("commands") // Slash Command

music.commands.load("back/events") // Events

music.player.extractors.register(SoundcloudExtractor, {})
music.player.extractors.register(YoutubeiExtractor, {
    generateWithPoToken: true,
    ignoreSignInErrors: true,
    forceRevalidate: true,
    disablePlayer: false,
    slicePlaylist: true,
    streamOptions: {
        useClient: "WEB_EMBEDDED",
        highWaterMark: 1<<25
    }
});

client.commands.add({
    type: "ready",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk]
    $setInterval[$setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk];1m]

    $logger[Info;Attempting to Generate]
    $callFunction[generateAuthKeys;all;;true]
    $setInterval[$logger[Info;\nAttempting to Generate] $callFunction[generateAuthKeys;all;;true];1h]
    ` 
});

db.commands.add({
    type: "connect",
    code: `
    $logger[Info;Waiting to online]
    $try[
    $deleteRecords[cachesearchistory_user_autocomplete]
    ]
    $try[
    $deleteRecords[musicplayer_message]
    ]
    $try[
    $deleteRecords[radioplayer_data]
    ]
    $!setGlobalVar[authmusic_youtube_key;]
    $!setGlobalVar[authmusic_soundcloud;]
    $!setGlobalVar[authmusic_spotify;]
    $!setGlobalVar[authmusic_spotify_token;]
    $!setGlobalVar[authmusic_amazonmusic;]
    $!setGlobalVar[authmusic_deezer;]
    $!setGlobalVar[authmusic_azlyrics;]
    `,
});