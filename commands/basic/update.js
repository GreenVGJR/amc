module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $let[mid;$sendMessage[$channelID;$reply[$channelID;$messageID;true] Updating Commands.;true]]
    $setTimeout[$updateCommands;0]
    $!editMessage[$channelID;$get[mid];$nomention Updating Slash.]
    $setTimeout[
    $updateApplicationCommands
    $!setGlobalVar[listcommands-help;$applicationCommands]
    ;0]
    $!editMessage[$channelID;$get[mid];$nomention OK]
    `
}