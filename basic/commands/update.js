module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $async[$updateCommands]
    $async[$updateApplicationCommands]
    OK`
}