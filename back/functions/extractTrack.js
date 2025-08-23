module.exports = {
    name: "extractTrack",
    params: [{
        name: "url", // string
        description: "To provide a information",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    },
    {
        name: "limitChar", // int
        description: "Limit Character to 2000",
        required: false
    }],
    code: `
    $let[url;$env[url]]
    $let[spliturl;$advancedTextSplit[$get[url];://;1]]
    $let[agent;$if[$env[userAgent]==null;Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $jsonLoad[filterid;$callFunction[filterMediaID;https://$get[spliturl]]]
    $onlyIf[$or[$env[filterid;id]==null;$env[filterid;type]==null]!=true;$return[{}]]
    $arrayLoad[results]
    $try[
    $if[$env[filterid;type]==youtube;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetBody[{"videoId":"$env[filterid;id]","context":{"client":{"clientName":"TVHTML5_SIMPLY_EMBEDDED_PLAYER","clientVersion":"2.0"}}}]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http;$httpRequest[https://www.youtube.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=videoDetails;POST;reshttp]]
    $let[results;{"status":$get[http],"results":$if[$env[reshttp;videoDetails]==;null;$env[reshttp;videoDetails]]}]
    ]
    $if[$env[filterid;type]==soundcloud;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http;$httpRequest[https://$get[spliturl];GET;reshttp]]
    $let[a;$advancedTextSplit[$env[reshttp];<script>window.__sc_hydration;1;= ;1;\\;</script>;0]]
    $let[results;{"status":$get[http],"results":$if[$get[a]==;null;$replace[$replace[$get[a];/preview/progressive;/preview/progressive?client_id=$getGlobalVar[authmusic_soundcloud_fall]];/stream/progressive;/stream/progressive?client_id=$getGlobalVar[authmusic_soundcloud_fall]]]}]
    ]
    $if[$env[filterid;type]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<5;$return[{}]]
    $callFunction[generateAuthKeys;spotify;;false]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[Authorization;Bearer $getGlobalVar[authmusic_spotify]]
    $httpAddHeader[Client-Token;$getGlobalVar[authmusic_spotify_token]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Origin;https://open.spotify.com/]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[app-platform;WebPlayer]
    $httpAddHeader[spotify-app-version;1.0]
    $httpAddHeader[User-Agent;$get[agent]]
    $let[gid;$djsEval[(id => \\[...id\\].reduce((a, c) => a * 62n + BigInt("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c)), 0n).toString(16).padStart(32, '0'))("$advancedTextSplit[$env[filterid;id];/;1]")]]
    $let[http;$httpRequest[https://spclient.wg.spotify.com/metadata/4/track/$get[gid];GET;a]]
    $onlyIf[$or[$get[http]==401;$get[http]==400]!=true;$callLocalFunction[refreshspotify;true]]
    $let[results;{"status":$get[http],"results":$if[$env[a]==;null;$env[a]]}]
    ;retry]
    $callLocalFunction[refreshspotify;false]
    ]]
    $if[$or[$env[filterid;type]==tiktok;$env[filterid;type]==tiktokmob];
    $if[$env[filterid;type]==tiktokmob;
    $jsonLoad[filterid;$callFunction[filterMediaID;$djsEval[(async()=>{try{return (await fetch(ctx.getKeyword("url"),{method:"GET",redirect:"manual"})).headers.get("location").split("?")\\[0\\]}catch(e){return null}})()\;]]]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$inflate[$getGlobalVar[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://www.tiktok.com/@/video/$env[filterid;id];GET]]
    $onlyIf[$get[http]==200;$return[{}]]
    $let[web;$advancedTextSplit[$httpResult;"webapp.video-detail":;1;,"webapp;0]]
    $jsonLoad[a;$get[web]]
    $jsonLoad[b;$env[a;itemInfo;itemStruct]]
    $let[results;{"status":$get[http],"results":$if[$env[b]==;null;$env[b]]}]
    ]
    $if[$env[filterid;type]==tiktokmusic;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Cookie;$inflate[$getGlobalVar[authmusic_tiktok];base64]]
    $!httpRequest[https://api16-normal.tiktokv.com/aweme/v1/music/aweme/?music_id=$env[filterid;id]&aid=1128&device_id=$getGlobalVar[authmusic_tiktok_did];GET;a]
    $onlyIf[$env[a]!=;$return[{}]]
    $jsonLoad[a;$env[a]]
    $jsonLoad[a;$env[a;aweme_list]]
    $let[index;$arrayFindIndex[a;b;$or[$env[b;added_sound_music_info;play_url;uri]!=;$checkCondition[$env[b;added_sound_music_info;mid]==$get[mid]]]]]
    $let[results;{"status":null,"results":$if[$env[a;$get[index]]==;null;$env[a;$get[index];added_sound_music_info]]}]
    ]
    $let[resultforeturn;$get[results]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];0;2000;];$get[resultforeturn]]]
    `
}