module.exports = {
    type: "clientReady",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $async[$!setGlobalVar[listcommands-help;$applicationCommands]]
    $if[$callFunction[configMusic;cacheAllContextNeed];
    $logger[Info;Caching Discord Context]
    $callFunction[fetchDiscordContext]
    ]
    $logger[Info;Attempting to Generate]
    $async[$callFunction[generateAuthKeys;tiktok;;true]]
    $async[$callFunction[generateAuthKeys;youtube;;true]]
    $async[$callFunction[generateAuthKeys;soundcloud;;true]]
    $async[$callFunction[generateAuthKeys;spotify;;true]]
    $async[$callFunction[generateAuthKeys;spotify_token;;true]]
    $async[$callFunction[generateAuthKeys;qobuz;;true]]
    $async[$callFunction[generateAuthKeys;amazonmusic;;true]]
    $async[$callFunction[generateAuthKeys;applemusic;;true]]
    $async[$callFunction[generateAuthKeys;tidal;;true]]
    $async[$callFunction[generateAuthKeys;deezer;;true]]
    $async[$callFunction[generateAuthKeys;twitter;;true]]
    $setInterval[$logger[Info;Re-generating keys - $getTimestamp] $callFunction[generateAuthKeys;all;;false] $logger[Info;Done - $getTimestamp];6h]
    `
}