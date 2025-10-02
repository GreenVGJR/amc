module.exports = {
    name: "eval",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $eval[$message;false]
    `
}