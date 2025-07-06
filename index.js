const { ForgeClient, LogPriority } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ForgeLink } = require("@tryforge/forge.linked");
const { ForgeYoutube } = require("forgeyoutube");

require("dotenv").config();

const youtube = new ForgeYoutube({
  youtube: {
    apiKey: ""
  }
});

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
    logLevel: LogPriority.High,
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
        db,
        lavalink,
        youtube
    ]
});

client.login();

client.functions.load("back/scrape") // Custom Functions

client.commands.load("basic/commands") // Basic Command
client.commands.load("basic/autocomplete") // Autocomplete
client.commands.load("basic/events") // Events

client.applicationCommands.load("commands") // Slash Command

lavalink.commands.kazagumo.load("back/events") // Events


client.commands.add({
    type: "ready",
    code: `
    $setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk]
    $setInterval[$setStatus[online;Streaming;Music;;https://www.youtube.com/watch?v=jfKfPfyJRdk];1m]
    ` 
});

db.commands.add({
    type: "connect",
    code: `
    $chalkLog[--- Refreshing Cache ---;blue]
    $deleteRecords[cachesearchistory_user_autocomplete]
    $log[OK]
    $deleteRecords[musicplayer_message]
    $log[OK]
    $!setGlobalVar[authmusic_youtube_key;]
    $!setGlobalVar[authmusic_soundcloud;]
    $!setGlobalVar[authmusic_spotify;]
    $!setGlobalVar[authmusic_amazonmusic;]
    $!setGlobalVar[authmusic_deezer;]
    $!setGlobalVar[authmusic_azlyrics;]
    $localFunction[refreshkey;
    $if[$env[refresh]==true;
    ]
    $chalkLog[\n--- Checking all Requires Auth ---\n;blue]
    $let[lyric1;$getGlobalVar[authmusic_azlyrics]]

    $let[aa;$getGlobalVar[authmusic_youtube_key]]
    $let[b;$getGlobalVar[authmusic_soundcloud]]
    $let[c;$getGlobalVar[authmusic_spotify]]
    $let[d;$getGlobalVar[authmusic_amazonmusic]]
    $let[d;$getGlobalVar[authmusic_deezer]]

    $let[z;$getGlobalVar[authmusic_checktime;0]]
    $chalkLog[AZLyrics        :  $if[$get[lyric1]!=;✅;❌]\n
Youtube         :  $if[$get[aa]!=;✅;❌]
Soundcloud      :  $if[$get[b]!=;✅;❌]
Spotify         :  $if[$get[c]!=;✅;❌]
Amazon Music    :  $if[$get[d]!=;✅;❌]
Deezer          :  $if[$get[e]!=;✅;❌] (Constant Refresh);red]
    $chalkLog[\nLast update: $get[z] / $parseDate[$multi[$get[z];1000];ISO]\n$if[$get[z]!=0;This will auto update every a hour or you do starts this bot.\n];blue]
    $async[$!setGlobalVar[authmusic_checktime;$cropText[$getTimestamp;0;10]]]
    $chalkLog[--- Generate ---;blue]
    $if[$or[$get[lyric1]==;$env[refresh]==true];
    $try[
    $async[
        $chalkLog[\\[LYRIC\\]  Generating AZLyrics            | Token;cyan]
        $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
        $!httpRequest[https://www.azlyrics.com/geo.js;GET;g1]
        $let[a1;$advancedTextSplit[$env[g1];"value",;1;";1;";0]]
        $log[$if[$get[a1]!=;OK - $cropText[$get[a1];0;12;...]$!setGlobalVar[authmusic_azlyrics;$get[a1]];Failed to Retrieve] - AZLyrics]
    ]
    ;$log[Failed to Retrieve - AZLyrics]]
    ]
    $if[$or[$get[aa]==;$env[refresh]==true];
    $try[
    $async[
        $chalkLog[\\[PLAYER\\] Generating InnerTube (Youtube) | Key;cyan]
            $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
            $!httpRequest[https://www.youtube.com;GET;g1]
            $let[a1;$advancedTextSplit[$env[g1];"INNERTUBE_API_KEY":";1;";0]]
            $log[$if[$get[a1]!=;OK - $cropText[$get[a1];0;12;...]$!setGlobalVar[authmusic_youtube_key;$get[a1]];Failed to Retrieve] - InnerTube (Youtube)]
    ]
    ;$log[Failed to Retrieve - InnerTube (Youtube)]]
    ]
    $if[$or[$get[b]==;$env[refresh]==true];
    $try[
    $async[
        $chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]
            $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
            $!httpRequest[https://m.soundcloud.com;GET;g1]
            $let[a2;$advancedTextSplit[$env[g1];"clientId":";1;";0]]
            $log[$if[$get[a2]!=;OK - $cropText[$get[a2];0;12;...]$!setGlobalVar[authmusic_soundcloud;$get[a2]];Failed to Retrieve] - Soundcloud]
    ]
    ;$log[Failed to Retrieve - Soundcloud]]
    ]
    $if[$or[$get[c]==;$env[refresh]==true];
    $try[
    $async[
        $chalkLog[\\[PLAYER\\] Generating Spotify             | Token;cyan]
            $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
            $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
            $let[token;$advancedTextSplit[$httpResult;"accessToken":";1;";0]]
            $log[$if[$get[token]!=;OK - $cropText[$get[token];0;12;...]$!setGlobalVar[authmusic_spotify;$get[token]];Failed to Retrieve] - Spotify]
    ]
    ;$log[Failed to Retrieve - Spotify]]
    ]
    $if[$or[$get[d]==;$env[refresh]==true];
    $try[
    $async[
        $chalkLog[\\[PLAYER\\] Generating Amazon Music        | Config & Token;cyan]
            $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
            $!httpRequest[https://music.amazon.com/;HEAD]
            $httpAddHeader[Cookie;$httpGetHeader[Set-Cookie]]
            $httpAddHeader[Origin;https://music.amazon.com/]
            $httpAddHeader[User-Agent;Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36]
            $!httpRequest[https://music.amazon.com/config.json;GET;tokens]
            $log[$if[$env[tokens;csrf;token]!=;OK - $cropText[$env[tokens;csrf;token];0;12;...]$!setGlobalVar[authmusic_amazonmusic;$env[tokens]];Failed to Retrieve] - Amazon Music]
    ]
    ;$log[Failed to Retrieve - Amazon Music]]
    ]
    $setTimeout[$callLocalFunction[refreshkey;true];$randomNumber[45;60]m]
    ;refresh]
    $callLocalFunction[refreshkey;true]
    `,
});