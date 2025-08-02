module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $reply[$channelID;$messageID;true]
    $async[$updateCommands]
    $async[$updateApplicationCommands]
    OK
    `
}