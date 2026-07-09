module.exports = [{
    type: "databaseConnect",
    code: `
    $!openDB[user;guild;global]
    $logger[Debug;Refreshing cache data]
    $async[
        $setCache[initclientmusic;system_file-config;$readFile[./back/config.json]]
        $let[lookwhatclientytuse;$toLowerCase[$callFunction[configMusic;useClientYT]]]
        $if[$or[$get[lookwhatclientytuse]==web_safari;$get[lookwhatclientytuse]==web_parent;$get[lookwhatclientytuse]==android_vr;$get[lookwhatclientytuse]==android];$logger[Warn;Youtube may enforcing SABR-only for this client ($callFunction[configMusic;useClientYT])]]
    ]
    $async[$setCache[initclientmusic;system_file-filterMedia;$readFile[./back/listRegex.json]]]
    $async[$setCache[initclientmusic;system_file-useCustom;$readFile[./back/messageConfig.json]]]
    $async[$setCache[initclientmusic;system_file-useIcon;$readFile[./back/iconsURL.json]]]
    $async[$setCache[initclientmusic;system_file-listRadio;$readFile[./back/listRadioCountry.json]]]
    $async[$setCache[initclientmusic;system_file-listLyricsLanguage;$readFile[./back/listLanguages.json]]]
    $async[$!prefetchDB[user;]]
    $async[$!prefetchDB[guild;]]
    $async[$!prefetchDB[global;]]
    $logger[Info;Waiting to online]
    `
},
{
    type: "recordUpdate",
    code: `
    $async[$!prefetchDB[user;]]
    $async[$!prefetchDB[guild;]]
    $async[$!prefetchDB[global;]]
    `
},
{
    type: "recordRemove",
    code: `
    $async[$!prefetchDB[user;]]
    $async[$!prefetchDB[guild;]]
    $async[$!prefetchDB[global;]]
    `
}]