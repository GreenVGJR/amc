const { tarClient, tarClientYT } = require('../../functions/helpers/clientYoutube.js');

module.exports = {
    type: "clientReady",
    code: `
    $let[getpickclient;${tarClient()}]
    $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
    $let[isWebClient;$checkCondition[$env[listclient;targetDomain]!=youtubei.googleapis.com]]
    $logger[Info;Ready on client $username[$clientID]]
    $if[$callFunction[configMusic;cacheAllContextNeed];
    $logger[Warn;Caching Discord context for better performance]
    $async[$callFunction[fetchDiscordContext]]
    ]
    $setCache[initclientmusic;countmusicnode;"0"]
    $setCache[initclientmusic;system_filetp-defaultDiscordAgent;$try[$djsEval[require("@discordjs/rest").DefaultUserAgent]]]
    $setInterval[
        $arrayLoad[guild;,;$guildIDs[,]]
        $let[countnode;0]
        $arrayForEach[guild;guilds;
        $try[
        $if[$djsEval[(0, require("discord-player").useMainPlayer)().queues.get(ctx.client.guilds.cache.get("$env[guilds]"))?.isPlaying() || false];$letSum[countnode;1]]
        ]]
        $setCache[initclientmusic;countmusicnode;"$get[countnode]"]
    ;30s]
    $logger[Info;Generating Auth]
    $let[ytinitcookiesalt;$djsEval[process.env.YOUTUBE_COOKIES]]
    $if[$or[$get[ytinitcookiesalt]==;$get[ytinitcookiesalt]==undefined;$callFunction[configMusic;useBearer]==true];
    $callFunction[generateAuthKeys;youtube;;true]
    $if[$callFunction[configMusic;useBearer]==true;
    $if[$env[lrtuy]!=false;
    $setInterval[$let[yyugn;$callFunction[generateTokenYoutube;false]];30m]
    ]]
    ;
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuthKeys;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[initclientmusic;retrycookiesyt]==true;$deleteCache[initclientmusic;retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;false]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    $if[$and[$get[isWebClient]==true;$getCache[initclientmusic;disablecookiesyt]!=true];
    $setInterval[
    $callLocalFunction[checkcookies;false;false]
    ;10m]
    ]
    $deleteCache[initclientmusic;disablecookiesyt]
    ]
    $async[$callFunction[generateAuthKeys;tiktok;;true]]
    $async[$callFunction[generateAuthKeys;soundcloud;;true]]
    $async[$callFunction[generateAuthKeys;spotify;;true]]
    $async[$callFunction[generateAuthKeys;spotify_player;;true]]
    $async[$callFunction[generateAuthKeys;spotify_token;;true]]
    $async[$callFunction[generateAuthKeys;amazonmusic;;true]]
    $async[$callFunction[generateAuthKeys;applemusic;;true]]
    $async[
    $callFunction[generateAuthKeys;tidal;;true]
    $callFunction[generateAuthKeys;tidal_token;;true]
    ]
    $async[$callFunction[generateAuthKeys;deezer;;true]]
    $async[$setCache[initclientmusic;listcommands-help;$applicationCommands]]
    $setInterval[
    $logger[Info;Re-generating keys - $getTimestamp]
    $callFunction[generateAuthKeys;all;;false]
    $logger[Info;Done - $getTimestamp]
    ;6h]
    `
}