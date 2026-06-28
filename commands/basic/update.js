module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $async[$updateCommands]
    $async[$updateApplicationCommands
    $setCache[initclientmusic;listcommands-help;$applicationCommands]
    ]
    $async[
    $setCache[initclientmusic;system_file-config;$readFile[./back/config.json]]
    $setCache[initclientmusic;system_file-filterMedia;$readFile[./back/listRegex.json]]
    $setCache[initclientmusic;system_file-useCustom;$readFile[./back/messageConfig.json]]
    $setCache[initclientmusic;system_file-useIcon;$readFile[./back/iconsURL.json]]
    $setCache[initclientmusic;system_file-listRadio;$readFile[./back/listRadioCountry.json]]
    $setCache[initclientmusic;system_file-listLyricsLanguage;$readFile[./back/listLanguages.json]]
    ]
    $sendMessage[$channelID;$reply[$channelID;$messageID;true] OK]
    `
}