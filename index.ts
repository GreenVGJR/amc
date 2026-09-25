// Main
import { ForgeClient, LogPriority } from "@tryforge/forgescript";
import { ForgeLinked } from "ForgeLinked";
import { QuorielDB } from "@nationdex/qdb";
import { QuorielEdge } from "@nationdex/edge";
// import { ForgeDB } from "@tryforge/forge.db";

import dotenv from "dotenv";
dotenv.config(); // Load Environment

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
    "linkedTrackEnd",
    "linkedNodeConnect"
  ],
  nodes: [
    {
      host: "lavalinkv4.serenetia.com",
      port: 443,
      authorization: "https://seretia.link/discord",
      secure: true,
      closeOnError: false
    },
    {
      host: "localhost",
      port: 3000,
      authorization: "hai",
      secure: false,
      closeOnError: false
    }
  ],
  playerOptions: {
    defaultSearchPlatform: "ytsearch",
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: true
    },
    onEmptyQueue: {
      destroyAfterMs: 0
    },
    useUnresolvedData: true
  }
} as any);

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
} as any);

client.login();

client.functions.load("back/functions");
quorielDb.commands.load("back/client/fdb");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
lavalink.commands.load("back/events");
lavalink.commands.load("back/client/fl");

console.clear();
