module.exports = {
    name: "fetchDiscordContext",
    code: `
    $arrayLoad[anGuild;,;$guildIDs[,]]
    $arrayForEach[anGuild;a;
    $async[
    $fetchMembers[$env[a];$clientID]
    $fetchMembers[$env[a]]
    $fetchChannels[$env[a]]
    $fetchRoles[$env[a]]
    ]]
    $return
    `
}