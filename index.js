// Main
const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeLinked } = require('ForgeLinked');
const { QuorielDB } = require("@quoriel/db");
const { QuorielEdge } = require("@quoriel/edge");
// const { ForgeDB } = require("@tryforge/forge.db");

require('dotenv').config(); // Load Environment

const quorielDb = new QuorielDB({
  events: [
    "databaseConnect",
    "recordUpdate",
    "recordRemove"
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
      host: "localhost",
      port: 3000,
      authorization: "hai",
      secure: false
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
    // new ForgeDB(),
    quorielDb,
    new QuorielEdge()
  ]
});

client.login();

client.functions.load("back/functions");
quorielDb.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
lavalink.commands.load("back/events");

console.clear();