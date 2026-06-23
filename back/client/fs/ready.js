module.exports = {
    type: "clientReady",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $if[$callFunction[configMusic;cacheAllContextNeed];
    $logger[Warn;Caching Discord context for better performance]
    $async[$callFunction[fetchDiscordContext]]
    ]
    $setCache[countmusicnode;"0"]
    $setCache[system_filetp-defaultDiscordAgent;$try[$djsEval[require("@discordjs/rest").DefaultUserAgent]]]
    $setInterval[
        $arrayLoad[guild;,;$guildIDs[,]]
        $let[countnode;0]
        $arrayForEach[guild;guilds;
        $try[
        $if[$djsEval[(0, require("discord-player").useMainPlayer)().queues.get(ctx.client.guilds.cache.get("$env[guilds]"))?.isPlaying() || false];$letSum[countnode;1]]
        ]]
        $setCache[countmusicnode;"$get[countnode]"]
    ;30s]
    $logger[Info;Generating Auth]
    $let[ytinitcookies;$djsEval[process.env.YOUTUBE_COOKIES]]
    $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined;$callFunction[configMusic;useBearer]==true];
    $callFunction[generateAuthKeys;youtube;;true]
    $if[$callFunction[configMusic;useBearer]==true;
    $if[$env[lrtuy]!=false;
    $setInterval[$let[yyugn;$callFunction[generateTokenYoutube;false]];30m]
    ]]
    ;
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuthKeys;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[retrycookiesyt]==true;$deleteCache[retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;false]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    $if[$getCache[disablecookiesyt]!=true;
    $setInterval[
    $callLocalFunction[checkcookies;false;false]
    ;10m]
    ]
    $deleteCache[disablecookiesyt]
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
    $async[$setCache[listcommands-help;$applicationCommands]]
    $setInterval[
    $logger[Info;Re-generating keys - $getTimestamp]
    $callFunction[generateAuthKeys;all;;false]
    $logger[Info;Done - $getTimestamp]
    ;6h]
    `
}