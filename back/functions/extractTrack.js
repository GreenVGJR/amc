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
    $onlyIf[$or[$env[filterid;id]==null;$env[filterid;type]==null]!=true;$return]
    $arrayLoad[results]
    $try[
    $if[$env[filterid;type]==youtube;
    $let[tryattempt;0]
    $localFunction[refreshyt;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<5;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetBody[{"videoId":"$env[filterid;id]","context":{"client":{"clientName":"TVHTML5_SIMPLY_EMBEDDED_PLAYER","clientVersion":"2.0"}}}]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http;$httpRequest[https://youtubei.googleapis.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=videoDetails(videoId,title,lengthSeconds,channelId,isCrawlable,viewCount,author,isPrivate,isLiveContent);POST;reshttp]]
    $onlyIf[$env[reshttp;videoDetails]!=;$callLocalFunction[refreshyt;true]]
    $let[results;{"status":$get[http],"results":$if[$env[reshttp;videoDetails]==;null;$env[reshttp;videoDetails]]}]
    ;retry]
    $callLocalFunction[refreshyt;false]
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
    $onlyIf[$get[tryattempt]<5;$return]
    $callFunction[generateAuthKeys;spotify;;false]
    $callFunction[generateAuthKeys;spotify_token;;false]
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
    $if[$env[filterid;type]==tiktokmob;
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$inflate[$getGlobalVar[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $!httpRequest[$replace[$get[url];vm.tiktok.com;vt.tiktok.com];GET]
    $jsonLoad[filterid;$callFunction[filterMediaID;$replace[$advancedTextSplit[$httpResult;"seo.abtest":{"canonical":";1;";0];\\\\\\u002F;/]]]
    ]
    $if[$env[filterid;type]==tiktok;
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$inflate[$getGlobalVar[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://www.tiktok.com/@/video/$env[filterid;id];GET]]
    $onlyIf[$get[http]==200;$return]
    $let[web;$advancedTextSplit[$httpResult;"webapp.video-detail":;1;,"webapp;0]]
    $jsonLoad[a;$get[web]]
    $jsonLoad[b;$env[a;itemInfo;itemStruct]]
    $let[results;{"status":$get[http],"results":$if[$env[b]==;null;$env[b]]}]
    ]
    $if[$env[filterid;type]==tiktokmusic;
    $let[tryattempt;0]
    $localFunction[refreshvm;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<10;$return]
    $letSum[tryattempt;1]
    ]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Cookie;$inflate[$getGlobalVar[authmusic_tiktok];base64]]
    $!httpRequest[https://api16-normal-quic.tiktokv.com/aweme/v1/music/aweme/?music_id=$env[filterid;id]&aid=1322&device_id=$randomNumber[100000000;999999999;false]$randomNumber[1000000000;9999999999;false];GET;a]
    $onlyIf[$env[a]!=;$callLocalFunction[refreshvm;true]]
    $jsonLoad[a;$env[a]]
    $jsonLoad[a;$env[a;aweme_list]]
    $let[index;$arrayFindIndex[a;b;$checkCondition[$env[b;added_sound_music_info;mid]==$env[filterid;id]]]]
    $if[$get[index]==-1;
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[User-Agent;Mozilla/5.0 (compatible\\; Discordbot/2.0\\; +https://discordapp.com)]
    $httpSetContentType[Text]
    $onlyIf[$httpRequest[https://www.tiktok.com/music/-$env[filterid;id];GET]==200;$callLocalFunction[refreshvm;true]]
    $if[$checkContains[$advancedTextSplit[$httpResult;property="al:android:url";1;content=";1;";0];//music/detail/];
    $let[cl;$djsEval[require("entities").decodeHTML("$advancedTextSplit[$httpResult;<title>;1;</title>;0]")]]
    $let[stctitle;$toLowercase[$advancedTextSplit[$replace[$get[cl];♬ ;]; | ;0; & ;0] $advancedTextSplit[$replace[$get[cl];♬ ;]; | ;1]]]
    ;
    $return
    ]
    $!httpRequest[https://api16-normal.tiktokv.com/aweme/v1/music/search/?count=10&cursor=0&aid=1180&device_id=$getGlobalVar[authmusic_tiktok_did]&keyword=$get[stctitle];GET;c]
    $onlyIf[$env[c]!=;$return]
    $jsonLoad[c;$env[c]]
    $jsonLoad[c;$env[c;music_info_list]]
    $jsonLoad[c;$env[c;$arrayFindIndex[c;k;$checkCondition[$env[k;music;id_str]==$env[filterid;id]]]]]
    $let[results;{"status":null,"results":$if[$env[c]==;null;$env[c;music]]}]
    ;
    $let[results;{"status":null,"results":$if[$env[a;$get[index]]==;null;$env[a;$get[index];music]]}]
    ]
    ;retry]
    $callLocalFunction[refreshvm;false]
    ]
    $if[$env[filterid;type]==facebook;
    $httpAddHeader[Accept;text/html]
    $httpAddHeader[Accept-Language;en-US]
    $!httpRequest[https://web.facebook.com/plugins/video.php?href=$get[url]&show_text=true;GET]
    $let[cs;$default[$advancedTextSplit[$httpResult;"videoData":\\[;1;,"player_version;0];{]]
    $jsonLoad[b;$get[cs]}]
    $if[$env[b;video_id]!=;
    $!jsonSet[b;text;$advancedTextSplit[$httpResult;class="text_exposed_root"><p>;1;<;0]]
    $!jsonSet[b;owner;$advancedTextSplit[$httpResult;<a title=";1;" target=;0]]
    ]
    $let[results;{"status":null,"results":$env[b]}]
    ]
    $if[$env[filterid;type]==instagram;
    $httpAddHeader[Sec-Fetch-Site;none]
    $httpAddHeader[Accept;text/html]
    $httpAddHeader[Accept-Language;en-US]
    $!httpRequest[https://www.instagram.com/$env[filterid;id];GET]
    $arrayLoad[a;script type="application/json";$httpResult]
    $let[test;$env[a;$arrayFindIndex[a;b;$checkCondition[$advancedTextSplit[$env[b];xdt_api__v1__media;1;video_versions;1]!=]]]]
    $jsonLoad[a;$advancedTextSplit[$get[test];data-sjs>;1;</script>;0]]
    $let[results;{"status":null,"results":$if[$env[a;require]==;null;$env[a;require;0;3;0;__bbox;require;0;3;1;__bbox;result;data;xdt_api__v1__media__shortcode__web_info;items;0]]}]
    ]
    $if[$env[filterid;type]==bandcamp;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $!httpRequest[$env[filterid;id];GET]
    $let[a;$advancedTextSplit[$httpResult;data-tralbum=";1;";0]]
    $let[a;$djsEval[require("entities").decodeHTML(ctx.getKeyword("a"))]]
    $jsonLoad[a;$default[$get[a];{}]]
    $let[results;{"status":null,"results":$if[$env[a;trackinfo]==;null;$env[a;trackinfo;0]]}]
    ]
    $let[resultforeturn;$get[results]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];0;2000;];$get[resultforeturn]]]
    `
}