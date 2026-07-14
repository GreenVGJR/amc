module.exports = {
    type: "clientReady",
    code: `
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
    $async[$setCache[initclientmusic;listcommands-help;$applicationCommands]]
    $setInterval[
    $logger[Info;Re-generating keys - $getTimestamp]
    $callFunction[generateAuthKeys;all;;false]
    $logger[Info;Done - $getTimestamp]
    ;6h]
    $logger[Info;Ready on client $username[$clientID]]
    `
}