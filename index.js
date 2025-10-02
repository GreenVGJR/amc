// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeLinked } = require('ForgeLinked');

require("dotenv").config({ quiet: true }); // Load Environment

const db = new ForgeDB({
    events: [
        "connect"
    ]
});

const lavalink = new ForgeLinked({
  events: [
    "error",
    "linkedTrackError",
    "linkedPlayerDestroy",
    "linkedPlayerDisconnect",
    "linkedPlayerUpdate",
    "linkedTrackStart",
    "linkedTrackEnd"
  ],
  nodes: [
    {
      id: "maow",
      host: "localhost",
      port: 3000,
      authorization: "hai",
      secure: false
    }    
  ],
  playerOptions: {
    defaultSearchPlatform: "youtube"
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

client.functions.load("back/functions");
db.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
lavalink.commands.load("back/events");

console.clear();