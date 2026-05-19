// Removes youtubei logs appear
['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[YOUTUBEJS]')) return;
        original(...args);
    };
});
try { require('youtubei.js').Log.setLevel(0); } catch (e) { }
try { require('discord-player-youtubei/node_modules/youtubei.js').Log.setLevel(0); } catch (e) { }

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

// Disable DSP compressor by default for discord-player
const { FiltersChain } = require("@discord-player/equalizer");
const _origFiltersChainCreate = FiltersChain.prototype.create;
FiltersChain.prototype.create = function (src, presets = this.presets) {
    presets = { ...presets, compressor: { ...presets?.compressor, disabled: true } };
    return _origFiltersChainCreate.call(this, src, presets);
};

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
        GuildQueueEvent.PlayerError,
        GuildQueueEvent.PlayerPause,
        GuildQueueEvent.PlayerResume,
        GuildQueueEvent.PlayerTrigger,
        GuildQueueEvent.PlayerFinish,
        GuildQueueEvent.EmptyQueue
    ],
    blockStreamFrom: toggles.disable_YT ? [YoutubeiExtractor.identifier] : [],
    connectOptions: {
        disableHistory: true,
        disableBiquad: true,
        bufferingTimeout: 350,
        connectionTimeout: 30000,
        volume: 50,
        leaveOnEmpty: false,
        leaveOnEnd: false,
        leaveOnStop: false,
        pauseOnEmpty: false
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
        // new ForgeDB(),
        quorielDb,
        new QuorielEdge(),
        music
    ]
});

client.login();

music.player.extractors.register(SoundcloudExtractor);
music.player.extractors.register(SpotifyExtractor);
music.player.extractors.register(AppleMusicExtractor);
music.player.extractors.register(AttachmentExtractor);
music.player.extractors.register(YoutubeiExtractor, youtube);

quorielDb.commands.load("back/client/fdb");
client.functions.load("back/functions");
client.applicationCommands.load("commands/slash");
client.commands.load("back/interaction");
client.commands.load("back/client/fs");
client.commands.load("commands/basic");
music.commands.load("back/events/fm");
client.commands.load("back/events/fs");

module.exports = { music }; // for $joinVC

console.clear();