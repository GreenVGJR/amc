module.exports = {
    type: "dbConnect",
    code: `
    $logger[Info;Waiting to online]
    $!openDB[user;guild;global]
    $logger[Debug;Refreshing cache data]
    $setCache[system_file-config;$readFile[./back/config.json]]
    $setCache[system_file-filterMedia;$readFile[./back/listRegex.json]]
    $setCache[system_file-useCustom;$readFile[./back/messageConfig.json]]
    $setCache[system_file-useIcon;$readFile[./back/iconsURL.json]]
    $setCache[system_file-listRadio;$readFile[./back/listRadioCountry.json]]
    $!prefetchDB[user;]
    $!prefetchDB[guild;]
    $!prefetchDB[global;]
    `
}