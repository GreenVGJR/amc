const { tarClient, tarClientYT } = require('../../functions/helpers/clientYoutube.js');

module.exports = [{
    type: "databaseConnect",
    code: `
    $!openDB[user;guild;global]
    $let[getpickclient;${tarClient()}]
    $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
    $let[isWebClient;$checkCondition[$env[listclient;targetDomain]!=youtubei.googleapis.com]]
    $let[ytinitcookiesalt;$djsEval[process.env.YOUTUBE_COOKIES]]
    $let[lookauthalt;$trimLines[$trim[$djsEval[process.env.YOUTUBE_AUTH]]]]
    $try[$jsonLoad[youtubeAuthalt;$get[lookauthalt]]]
    $logger[Debug;Refreshing cache data]
    $logger[Warn;Generating Auth while waiting client online]
    $async[
        $setCache[initclientmusic;system_file-config;$readFile[./back/config.json]]
        $let[lookwhatclientytuse;$toLowerCase[$callFunction[configMusic;useClientYT]]]
        $jsonLoad[checkytclient;["web_safari","web_parent","android_vr","android"\\]]
        $if[$and[$env[youtubeAuthalt;token]==;android_vr==$get[lookwhatclientytuse]];$logger[Warn;This client required auth ($callFunction[configMusic;useClientYT])]]
        $if[$arrayIncludes[checkytclient;$get[lookwhatclientytuse]];$logger[Warn;Youtube may enforcing SABR-only for this client ($callFunction[configMusic;useClientYT])]]
    ]
    $async[$setCache[initclientmusic;system_file-filterMedia;$readFile[./back/listRegex.json]]]
    $async[$setCache[initclientmusic;system_file-useCustom;$readFile[./back/messageConfig.json]]]
    $async[$setCache[initclientmusic;system_file-useIcon;$readFile[./back/iconsURL.json]]]
    $async[$setCache[initclientmusic;system_file-listRadio;$readFile[./back/listRadioCountry.json]]]
    $async[$setCache[initclientmusic;system_file-listLyricsLanguage;$readFile[./back/listLanguages.json]]]
    $async[$!prefetchDB[user;] $!prefetchDB[guild;] $!prefetchDB[global;]]
    $async[$callFunction[generateAuth;tidal;;true]]
    $callFunction[generateAuth;youtube_anon;;true]
    $if[$callFunction[configMusic;useClientYT]==ANDROID_VR;
    $callFunction[generateAuth;youtube;;true]
    $if[$env[lrtuy]!=false;
    $setInterval[$let[yyugn;$callFunction[generateTokenYoutube;false]];30m]
    ]
    ;
    $if[$or[$get[ytinitcookiesalt]==;$get[ytinitcookiesalt]==undefined]==false;
    $localFunction[checkcookies;
    $let[checkcookie;$callFunction[generateAuth;youtube;;$env[lfk];$env[toggle]]]
    $if[$getCache[initclientmusic;retrycookiesyt]==true;$deleteCache[initclientmusic;retrycookiesyt] $wait[10s] $callLocalFunction[checkcookies;true;false]]
    ;lfk;toggle]
    $callLocalFunction[checkcookies;true;false]
    $if[$and[$get[isWebClient]==true;$getCache[initclientmusic;disablecookiesyt]!=true];
    $setInterval[
    $callLocalFunction[checkcookies;false;false]
    ;10m]
    ]
    $deleteCache[initclientmusic;disablecookiesyt]
    ]]
    $async[$callFunction[generateAuth;tiktok;;true]]
    $async[$callFunction[generateAuth;instagram;;true]]
    $async[$callFunction[generateAuth;soundcloud;;true]]
    $async[$callFunction[generateAuth;spotify;;true]]
    $async[$callFunction[generateAuth;spotify_player;;true]]
    $async[$callFunction[generateAuth;spotify_token;;true]]
    $async[$callFunction[generateAuth;amazonmusic;;true]]
    $async[$callFunction[generateAuth;applemusic;;true]]
    $async[$callFunction[generateAuth;tidal_token;;true]]
    $async[$callFunction[generateAuth;deezer;;true]]
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