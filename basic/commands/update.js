module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $async[$updateCommands]
    $async[$updateApplicationCommands]
    OK
    `
}