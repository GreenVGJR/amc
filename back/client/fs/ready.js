module.exports = {
    type: "clientReady",
    code: `
    $logger[Info;Ready on client $username[$clientID]]
    $logger[Info;Waiting Lavalink connections]
    $if[$callFunction[configMusic;cacheAllContextNeed];
    $logger[Warn;Caching Discord context for better performance]
    $async[$callFunction[fetchDiscordContext]]
    ]
    $logger[Info;Generating Auth]
    $async[$callFunction[generateAuthKeys;youtube;;true]]
    $async[$callFunction[generateAuthKeys;tiktok;;true]]
    $async[$callFunction[generateAuthKeys;soundcloud;;true]]
    $async[$callFunction[generateAuthKeys;spotify;;true]]
    $async[$callFunction[generateAuthKeys;spotify_token;;true]]
    $async[$callFunction[generateAuthKeys;amazonmusic;;true]]
    $async[$callFunction[generateAuthKeys;applemusic;;true]]
    $async[
    $callFunction[generateAuthKeys;tidal;;true]
    $callFunction[generateAuthKeys;tidal_token;;true]
    ]
    $async[$callFunction[generateAuthKeys;deezer;;true]]
    $async[$setCache[listcommands-help;$applicationCommands]]
    $callFunction[generateAuthKeys;twitter;;true]
    $callFunction[generateAuthKeys;twitter_cookies;;true]
    $setInterval[$logger[Info;Re-generating keys - $getTimestamp] $callFunction[generateAuthKeys;all;;false] $logger[Info;Done - $getTimestamp];6h]
    `
}