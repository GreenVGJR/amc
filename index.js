// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeLink } = require("@tryforge/forge.linked");

require("dotenv").config();

const db = new ForgeDB({
    events: [
        "connect"
    ]
});

const lavalink = new ForgeLink({
    events: {
        kazagumo: [
            "playerClosed",
            "playerCreate",
            "playerDestroy",
            "playerEmpty",
            "playerResumed",
            "playerStart",
        ],
    },
    kazagumoOptions: {
        defaultSearchEngine: "youtube"
    },
    nodes: [
        {
            name: "Test Node",
            auth: "hai",
            url: "localhost:3000",
            secure: false
        }
    ]
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
        lavalink,
        db
    ]
});

client.login();

client.functions.load("back/scrape") // Custom Functions

// Basic Command, Autocomplete, Events
client.commands.load("basic/commands")
client.commands.load("basic/autocomplete")
client.commands.load("basic/events")

client.applicationCommands.load("commands") // Slash Command

lavalink.commands.kazagumo.load("back/events") // Events

client.commands.add({
    type: "ready",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk]
    $setInterval[$setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk];1m]

    $logger[Info;Attempting to Generate]
    $callFunction[generateAuthKeys;all;;true]
    $setInterval[$logger[Info;Attempting to Generate] $callFunction[generateAuthKeys;all;;true];1h]
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