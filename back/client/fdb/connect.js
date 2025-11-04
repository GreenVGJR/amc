module.exports = {
    type: "dbConnect",
    code: `
    $logger[Info;Waiting to online]
    $logger[Debug;Refreshing cache data]
    $!openDB[user;guild;global]
    $!prefetchDB[user;]
    $!prefetchDB[guild;]
    $!prefetchDB[global;]
    $setCache[system_file-config;$readFile[./back/config.json]]
    $setCache[system_file-filterMedia;$readFile[./back/listRegex.json]]
    $setCache[system_file-useCustom;$readFile[./back/messageConfig.json]]
    $setCache[system_file-useIcon;$readFile[./back/iconsURL.json]]
    $setCache[system_file-listRadio;$readFile[./back/listRadioCountry.json]]
    `
}