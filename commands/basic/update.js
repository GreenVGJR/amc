module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $async[$updateCommands]
    $async[$updateApplicationCommands
    $setCache[listcommands-help;$applicationCommands]
    ]
    $async[
    $setCache[system_file-config;$readFile[./back/config.json]]
    $setCache[system_file-filterMedia;$readFile[./back/listRegex.json]]
    $setCache[system_file-useCustom;$readFile[./back/messageConfig.json]]
    $setCache[system_file-useIcon;$readFile[./back/iconsURL.json]]
    $setCache[system_file-listRadio;$readFile[./back/listRadioCountry.json]]
    ]
    $sendMessage[$channelID;$reply[$channelID;$messageID;true] OK]
    `
}