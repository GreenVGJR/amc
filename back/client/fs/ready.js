module.exports = {
    type: "clientReady",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $if[$callFunction[configMusic;cacheAllContextNeed];
    $logger[Warn;Caching Discord context for better performance]
    $async[$callFunction[fetchDiscordContext]]
    ]
    $logger[Info;Generating Auth]
    $let[ytinitcookies;$djsEval[process.env.YOUTUBE_COOKIES]]
    $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined];
    $async[$callFunction[generateAuthKeys;youtube;;true]]
    ;
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuthKeys;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[retrycookiesyt]==true;$deleteCache[retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;true]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    $setInterval[
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuthKeys;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[retrycookiesyt]==true;$deleteCache[retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;true]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    ;9m]
    ]
    $async[$callFunction[generateAuthKeys;tiktok;;true]]
    $async[$callFunction[generateAuthKeys;soundcloud;;true]]
    $async[$callFunction[generateAuthKeys;spotify;;true]]
    $async[$callFunction[generateAuthKeys;spotify_token;;true]]
    $async[$callFunction[generateAuthKeys;amazonmusic;;true]]
    $async[$callFunction[generateAuthKeys;applemusic;;true]]
    $async[$callFunction[generateAuthKeys;tidal;;true]]
    $async[$callFunction[generateAuthKeys;deezer;;true]]
    $async[$setCache[listcommands-help;$applicationCommands]]
    $callFunction[generateAuthKeys;twitter;;true]
    $callFunction[generateAuthKeys;twitter_cookies;;true]
    $setInterval[$logger[Info;Re-generating keys - $getTimestamp] $callFunction[generateAuthKeys;all;;false] $logger[Info;Done - $getTimestamp];6h]
    `
}