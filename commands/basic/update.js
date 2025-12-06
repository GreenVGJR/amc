module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $async[$updateCommands]
    $async[$updateApplicationCommands
    $setCache[listcommands-help;$applicationCommands]
    ]
    $sendMessage[$channelID;$reply[$channelID;$messageID;true] OK]
    `
}