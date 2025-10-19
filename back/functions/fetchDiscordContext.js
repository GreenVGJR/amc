module.exports = {
    name: "fetchDiscordContext",
    code: `
    $arrayLoad[anGuild;,;$guildIDs[,]]
    $arrayForEach[anGuild;a;
    $fetchMembers[$env[a];$clientID]
    $fetchMembers[$env[a]]
    $fetchChannels[$env[a]]
    ]
    $return
    `
}