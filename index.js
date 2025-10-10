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
      host: "lava-v4.ajieblogs.eu.org", // https://free.lavalink.rf.gd
      port: 443,
      authorization: "https://dsc.gg/ajidevserver",
      secure: true
    },
    {
      id: "maow2",
      host: "lavalinkv4.serenetia.com",
      port: 443,
      authorization: "https://dsc.gg/ajidevserver", // https://free.lavalink.rf.gd
      secure: true
	  }
  ],
  playerOptions: {
    defaultSearchPlatform: "youtube",
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: true
    },
    onEmptyQueue: {
      destroyAfterMs: 0
    }
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