const { tarClient, tarClientYT } = require('../../functions/helpers/clientYoutube.js');

module.exports = [{
    type: "databaseConnect",
    code: `
    $!openDB[user;guild;global]
    $let[getpickclient;${tarClient()}]
    $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
    $let[isWebClient;$checkCondition[$env[listclient;targetDomain]!=youtubei.googleapis.com]]
    $let[ytinitcookiesalt;$djsEval[process.env.YOUTUBE_COOKIES]]
    $logger[Debug;Refreshing cache data]
    $logger[Warn;Generating Auth while waiting client online]
    $async[
        $setCache[initclientmusic;system_file-config;$readFile[./back/config.json]]
        $let[lookwhatclientytuse;$toLowerCase[$callFunction[configMusic;useClientYT]]]
        $jsonLoad[checkytclient;["web_safari","web_parent","android_vr","android"\\]]
        $if[$arrayIncludes[checkytclient;$get[lookwhatclientytuse]];$logger[Warn;Youtube may enforcing SABR-only for this client ($callFunction[configMusic;useClientYT])]]
    ]
    $async[$setCache[initclientmusic;system_file-filterMedia;$readFile[./back/listRegex.json]]]
    $async[$setCache[initclientmusic;system_file-useCustom;$readFile[./back/messageConfig.json]]]
    $async[$setCache[initclientmusic;system_file-useIcon;$readFile[./back/iconsURL.json]]]
    $async[$setCache[initclientmusic;system_file-listRadio;$readFile[./back/listRadioCountry.json]]]
    $async[$setCache[initclientmusic;system_file-listLyricsLanguage;$readFile[./back/listLanguages.json]]]
    $async[$!prefetchDB[user;] $!prefetchDB[guild;] $!prefetchDB[global;]]
    $async[$callFunction[generateAuthKeys;tidal;;true]]
    $if[$or[$get[ytinitcookiesalt]==;$get[ytinitcookiesalt]==undefined;$callFunction[configMusic;useBearer]==true];
    $callFunction[generateAuthKeys;youtube;;true]
    $if[$callFunction[configMusic;useBearer]==true;
    $if[$env[lrtuy]!=false;
    $setInterval[$let[yyugn;$callFunction[generateTokenYoutube;false]];30m]
    ]]
    ;
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuthKeys;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[initclientmusic;retrycookiesyt]==true;$deleteCache[initclientmusic;retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;false]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    $if[$and[$get[isWebClient]==true;$getCache[initclientmusic;disablecookiesyt]!=true];
    $setInterval[
    $callLocalFunction[checkcookies;false;false]
    ;10m]
    ]
    $deleteCache[initclientmusic;disablecookiesyt]
    ]
    $async[$callFunction[generateAuthKeys;tiktok;;true]]
    $async[$callFunction[generateAuthKeys;instagram;;true]]
    $async[$callFunction[generateAuthKeys;soundcloud;;true]]
    $async[$callFunction[generateAuthKeys;spotify;;true]]
    $async[$callFunction[generateAuthKeys;spotify_player;;true]]
    $async[$callFunction[generateAuthKeys;spotify_token;;true]]
    $async[$callFunction[generateAuthKeys;amazonmusic;;true]]
    $async[$callFunction[generateAuthKeys;applemusic;;true]]
    $async[$callFunction[generateAuthKeys;tidal_token;;true]]
    $async[$callFunction[generateAuthKeys;deezer;;true]]
    `
},
{
    type: "recordUpdate",
    code: `
    $async[$!prefetchDB[user;] $!prefetchDB[guild;] $!prefetchDB[global;]]
    `
},
{
    type: "recordRemove",
    code: `
    $async[$!prefetchDB[user;] $!prefetchDB[guild;] $!prefetchDB[global;]]
    `
}]