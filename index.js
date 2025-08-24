// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeMusic, DefaultExtractors } = require('@tryforge/forge.music');

// Extractor
const { YoutubeiExtractor } = require("discord-player-youtubei");

require('dotenv').config({ quiet: true }); // Load Environment

const db = new ForgeDB({
    events: [
        "connect"
    ]
});

const music = new ForgeMusic({
    events: [
        "connectionDestroyed",
        "error",
        "playerError",
        "playerPause",
        "playerResume",
        "playerTrigger",
        "playerFinish",
        ],
    includeExtractors: DefaultExtractors,
    connectOptions: {
        disableEqualizer: true,
        disableBiquad: true,
        disableHistory: true,
        disableFallbackStream: true,
        bufferingTimeout: 500,
        connectionTimeout: 300000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 30000,
        pauseOnEmpty: true
    },
    skipFFmpeg: true,
    connectionTimeout: 86400000,
    probeTimeout: 30000,
    lagMonitor: 30000
    // For avoids connect error thing
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
client.functions.load("back/functions");
client.commands.load("back/interaction"); 

client.commands.load("commands/basic"); // Basic Command
client.applicationCommands.load("commands/slash"); // Slash Command

music.commands.load("back/events"); // Events

music.player.extractors.register(YoutubeiExtractor, {
    generateWithPoToken: true,
    forceRevalidate: true,
    ignoreSignInErrors: true,
    disablePlayer: false,
    slicePlaylist: true,
    useServerAbrStream: false,
    streamOptions: {
        useClient: "WEB_EMBEDDED",
        highWaterMark: 10 * 1024
    },
});

client.commands.add({
    type: "ready",
    code: `
    $logger[Info;Ready on client $username[$clientID] - $sub[$getTimestamp;$getGlobalVar[startuptimebot]]ms]
    $!deleteGlobalVar[startuptimebot]
    $setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk]
    $setInterval[$setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk];1m]
    $!setGlobalVar[listcommands-help;$applicationCommands]
    $logger[Info;Attempting to Generate]
    $async[$callFunction[generateAuthKeys;tiktok;;true]] $async[$callFunction[generateAuthKeys;soundcloud;;true]] $async[$callFunction[generateAuthKeys;spotify;;true]] $async[$callFunction[generateAuthKeys;youtube;;true]] $async[$callFunction[generateAuthKeys;amazonmusic;;true]] $async[$callFunction[generateAuthKeys;applemusic;;true]] $async[$callFunction[generateAuthKeys;deezer;;true]]
    $setInterval[$logger[Info;Attempting to Generate] $callFunction[generateAuthKeys;all;;true];1h]
    ` 
});

db.commands.add({
    type: "connect",
    code: `
    $logger[Info;Waiting to online]
    $setGlobalVar[startuptimebot;$getTimestamp]
    $try[
    $deleteRecords[storecachesearchusersfetch-q]
    $deleteRecords[storecachesearchusersfetch-p]
    ]
    $try[
    $deleteRecords[cachesearchistory_user_autocomplete]
    ]
    $try[
    $deleteRecords[musicplayer_message]
    ]
    $try[
    $deleteRecords[radioplayer_data]
    ]
    $!setGlobalVar[listcommands-help;]
    `,
});