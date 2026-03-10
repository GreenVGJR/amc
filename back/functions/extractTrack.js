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
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $jsonLoad[filterid;$callFunction[filterMediaID;https://$get[spliturl]]]
    $onlyIf[$or[$env[filterid;id]==null;$env[filterid;type]==null]!=true;$return]
    $arrayLoad[results]
    $try[
    $if[$env[filterid;type]==youtube;
    $let[tryattempt;0]
    $localFunction[refreshyt;
    $if[$env[retry]==true;
    $if[$get[tryattempt]>=3;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetBody[{"videoId":"$env[filterid;id]","context":{"client":{"clientName":2,"clientVersion":"2.20261231"}}}]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://m.youtube.com/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,videoDetails(videoId,title,lengthSeconds,channelId,isCrawlable,viewCount,author,isPrivate,isLiveContent);POST;reshttp]]
    $jsonLoad[reshttp;$env[reshttp]]
    $c[Fallback]
    $if[$and[$env[reshttp;playabilityStatus;status]!=OK;$env[reshttp;videoDetails;videoId]==];
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
    $let[http2;$httpRequest[https://www.youtube.com/watch?v=$env[filterid;id];GET]]
    $let[outputhtyt;$advancedTextSplit[$httpResult;var ytInitialData =;1;\\;;0]]
    $onlyIf[$isJSON[$get[outputhtyt]];$callLocalFunction[refreshyt;true] $stop]
    $jsonLoad[reshttptest;{}]
    $jsonLoad[reshttp2;$get[outputhtyt]]
    $jsonLoad[resfindindex;$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents]]
    $!jsonSet[reshttptest;videoId;$env[reshttp2;currentVideoEndpoint;watchEndpoint;videoId]]
    $!jsonSet[reshttptest;title;$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]];videoPrimaryInfoRenderer;title;runs;0;text]]
    $!jsonSet[reshttptest;lengthSeconds;0] $c[i couldn't find which data return that]
    $!jsonSet[reshttptest;channelId;$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoSecondaryInfoRenderer]!=]];videoSecondaryInfoRenderer;owner;videoOwnerRenderer;navigationEndpoint;browseEndpoint;browseId]]
    $!jsonSet[reshttptest;isCrawlable;true] $c[i couldn't find which data return that]
    $!jsonSet[reshttptest;viewCount;"$advancedReplace[$advancedTextSplit[$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]];videoPrimaryInfoRenderer;viewCount;videoViewCountRenderer;viewCount;simpleText]; ;0];,;;.;]"]
    $!jsonSet[reshttptest;author;$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoSecondaryInfoRenderer]!=]];videoSecondaryInfoRenderer;owner;videoOwnerRenderer;title;runs;0;text]]
    $!jsonSet[reshttptest;isPrivate;$checkCondition[$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]]==-1]]
    $!jsonSet[reshttptest;isLiveContent;$if[$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]];videoPrimaryInfoRenderer;viewCount;videoViewCountRenderer;isLive]!=;$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]];videoPrimaryInfoRenderer;viewCount;videoViewCountRenderer;isLive];$startsWith[$env[reshttp2;contents;twoColumnWatchNextResults;results;results;contents;$arrayFindIndex[resfindindex;g;$checkCondition[$env[g;videoPrimaryInfoRenderer]!=]];videoPrimaryInfoRenderer;dateText;simpleText];Started streaming]]]
    $let[results;{"status":$get[http2],"results":$if[$env[reshttptest;videoId]==;null;$env[reshttptest]]}]
    ;
    $let[results;{"status":$get[http],"results":$if[$env[reshttp;videoDetails]==;null;$env[reshttp;videoDetails]]}]
    ]
    ;retry]
    $callLocalFunction[refreshyt;false]
    ]
    $if[$env[filterid;type]==soundcloud;
    $let[keturl;https://$get[spliturl]]
    $if[$charCount[$advancedTextSplit[$get[spliturl];/;0];.]>=2;$!djsEval[require("undici").request(ctx.getKeyword("keturl"), { method: "HEAD" }).then(a => a.headers?.location ? ctx.setKeyword("keturl", a.headers?.location) : '').catch()]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://api-v2.soundcloud.com/resolve?url=$get[keturl]&client_id=$getCache[authmusic_soundcloud];GET;reshttp]]
    $let[a;$env[reshttp]]
    $let[results;{"status":$get[http],"results":$if[$get[a]=={};null;$advancedReplace[$get[a];/preview/progressive;/preview/progressive?client_id=$getCache[authmusic_soundcloud_fall];/stream/progressive;/stream/progressive?client_id=$getCache[authmusic_soundcloud_fall];/preview/hls;/preview/hls?client_id=$getCache[authmusic_soundcloud_fall];/stream/hls;/stream/hls?client_id=$getCache[authmusic_soundcloud_fall]]]}]
    ]
    $if[$env[filterid;type]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<3;$return]
    $callFunction[generateAuthKeys;spotify;;false]
    $letSum[tryattempt;1]
    ]
    $let[mdhedroute_spotify;{
    "App-Platform": "WebPlayer",
    "Authorization": "Bearer $getCache[authmusic_spotify]",
    "Sec-Fetch-Site": "none",
    "User-Agent": "$get[agent]"
    }]
    $let[mdquery;https://api.spotify.com/v1/tracks/$advancedTextSplit[$env[filterid;id];/;1]?market=US]
    $let[b;$djsEval[const { request, Agent } = require("undici")\\; request(ctx.getKeyword("mdquery"), { dispatcher: new Agent({ connect: { family: 4 } }), headers: JSON.parse(ctx.getKeyword("mdhedroute_spotify")), method: "GET" }).then(a => { ctx.setKeyword('http', a.statusCode)\\; return a.body.text() }).catch()]]
    $onlyIf[$or[$get[http]==401;$get[http]==400]!=true;$callLocalFunction[refreshspotify;true]]
    $if[$or[$get[http]==403;$get[http]==429];
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://open.spotify.com/embed/$env[filterid;id]?utm_source=oembed;GET;a]]
    $if[$get[http]==403;
    $let[a;null]
    ;
    $let[a;$advancedTextSplit[$env[a];type="application/json">;1;</script>;0]]
    ]
    ;
    $let[a;$get[b]]
    ]
    $let[results;{"status":$get[http],"results":$if[$get[a]==;null;$get[a]]}]
    ;retry]
    $callLocalFunction[refreshspotify;false]
    ]]
    $if[$env[filterid;type]==tiktokmob;
    $jsonLoad[filterid;$callFunction[filterMediaID;$djsEval[require("undici").request("$replace[$get[url];vm.tiktok.com;vt.tiktok.com]", { method: 'GET' }).then(a => a.headers.location).catch()]]]
    $onlyIf[$or[$env[filterid;id]==;$env[filterid;id]==null]!=true;$return]
    ]
    $if[$env[filterid;type]==tiktok;
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[User-Agent;Bot]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://www.tiktok.com/@/video/$env[filterid;id];GET]]
    $onlyIf[$get[http]==200;$return]
    $jsonLoad[a;$advancedTextSplit[$httpResult;"webapp.video-detail":;1;,"webapp;0]]
    $if[$and[$isJSON[$env[a]]==false;$checkContains[$httpResult;Please wait]];$return[{"status":null,"results":{"error":"IP blocked"}}]]
    $if[$env[a;statusCode]!=0;$return[{"status":null,"results":{"error":"$env[a;statusMsg]"}}]]
    $jsonLoad[b;$env[a;itemInfo;itemStruct]]
    $if[$env[b;author]==;
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[User-Agent;Bot]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://www.tiktok.com/player/api/v1/items?item_ids=$env[filterid;id];GET]]
    $if[$or[$get[http]==200;$isJSON[$httpResult]]==false;$return[{"status":null,"results":{"error":"IP blocked"}}]]
    $jsonLoad[a;$httpResult]
    $onlyIf[$env[a;items;0]!=;$return]
    $jsonLoad[b;$env[a;items;0]]
    ]
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
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $httpAddHeader[X-Khronos;$round[$divide[$getTimestamp;1000]]]
    $httpAddHeader[X-Argus;]
    $c[Doesn't require to solve challenge for this, for now]
    $!httpRequest[https://api-boot.tiktokv.com/aweme/v1/music/aweme/?music_id=$env[filterid;id]&aid=1233&device_id=$randomNumber[100000000;999999999;false]$randomNumber[1000000000;9999999999;false]&user_is_login=true&cookie_enabled=true&region=&referer=;GET;a]
    $onlyIf[$env[a]!=;$callLocalFunction[refreshvm;true]]
    $jsonLoad[a;$env[a]]
    $jsonLoad[a;$env[a;aweme_list]]
    $let[index;$arrayFindIndex[a;b;$checkCondition[$env[b;added_sound_music_info;mid]==$env[filterid;id]]]]
    $if[$get[index]==-1;
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
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
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $let[xgnarly;$callFunction[xGnarlyTiktok;count=10&cursor=0&aid=1180&device_id=$getCache[authmusic_tiktok_did]&user_is_login=true&cookie_enabled=true&region=&referer=&keyword=$encodeURI[$get[stctitle]];$get[agent]]]
    $!httpRequest[https://api-boot.tiktokv.com/aweme/v1/music/search/?count=10&cursor=0&aid=1180&device_id=$getCache[authmusic_tiktok_did]&user_is_login=true&cookie_enabled=true&region=&referer=&keyword=$encodeURI[$get[stctitle]]&X-Gnarly=$get[xgnarly];GET;c]
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
    $let[url;https://web.facebook.com$advancedTextSplit[$get[url];facebook.com;1]]
    $!djsEval[require("undici").request(ctx.getKeyword("url"), {method:"GET", headers:{"Accept": "text/html", "User-Agent":"Mozilla/5.0", "Sec-Fetch-Mode":"navigate", "Sec-Fetch-Site":"none"}}).then(a => { a.headers?.location ? ctx.setKeyword("url", a.headers?.location) : "" }).catch()]
    $httpAddHeader[Accept;text/html]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
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
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Sec-Fetch-Site;same-origin]
    $httpAddHeader[Origin;https://i.instagram.com]
    $httpSetContentType[Text]
    $!httpRequest[https://i.instagram.com/graphql/query/?doc_id=8845758582119845&variables={"shortcode":"$advancedTextSplit[$env[filterid;id];/;$charCount[$env[filterid;id];/]]"};GET]
    $onlyIf[$isJSON[$httpResult];$return]
    $jsonLoad[lkck;$httpResult]
    $if[$env[lkck;require_login]==true;
    $httpAddHeader[Accept;text/html, */*]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Sec-Fetch-Site;none]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $!httpRequest[https://www.instagram.com/reel/$advancedTextSplit[$env[filterid;id];/;$charCount[$env[filterid;id];/]]/embedded;GET]
    $arrayLoad[iru;script type="application/json";$httpResult]
    $jsonLoad[irk;$advancedTextSplit[$env[iru;$arrayFindIndex[iru;r;$checkCondition[$advancedTextSplit[$env[r];RelayPrefetchedStreamCache;1;xdt_api__v1__media__shortcode__web_info;1]!=]]];data-sjs>;1;</script>;0]]
    $jsonLoad[lck;$env[irk;require;0;3;0;__bbox;require;0;3;1;__bbox;result;data;xdt_api__v1__media__shortcode__web_info;items;0]]
    $onlyIf[$env[lck;pk]!=;$return]
    $let[results;{"status":null,"results":$if[$env[lck;id]==;null;$env[lck]]}]
    ;
    $let[results;{"status":null,"results":$if[$env[lkck;data;xdt_shortcode_media;id]==;null;$env[lkck;data;xdt_shortcode_media]]}]
    ]]
    $if[$env[filterid;type]==instagramaudio;
    $httpSetBody[audio_cluster_id=$env[filterid;id]&max_id&original_sound_audio_asset_id=$env[filterid;id]]
    $httpAddHeader[Content-Type;application/x-www-form-urlencoded]
    $httpAddHeader[User-Agent;Instagram 414.0.0 Android]
    $httpAddHeader[Sec-Fetch-Site;same-origin]
    $httpAddHeader[Origin;https://i.instagram.com]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
    $!httpRequest[https://i.instagram.com/api/v1/clips/music/;POST]
    $onlyIf[$isJSON[$httpResult];$return]
    $jsonLoad[lkig;$httpResult]
    $let[results;{"status":null,"results":$if[$env[lkig;items;0]==;null;$env[lkig]]}]
    ]
    $if[$env[filterid;type]==bandcamp;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[$env[filterid;id];GET]
    $let[a;$advancedTextSplit[$httpResult;data-tralbum=";1;";0]]
    $let[a;$djsEval[require("entities").decodeHTML(ctx.getKeyword("a"))]]
    $jsonLoad[a;$default[$get[a];{}]]
    $if[$env[a;trackinfo;0;artist]==null;
    $let[b;$advancedTextSplit[$httpResult;data-band=";1;";0]]
    $let[b;$djsEval[require("entities").decodeHTML(ctx.getKeyword("b"))]]
    $jsonLoad[b;$default[$get[b];{}]]
    $!jsonSet[a;trackinfo;0;artist;$env[b;name]]
    ]
    $let[results;{"status":null,"results":$if[$env[a;trackinfo]==;null;$env[a;trackinfo;0]]}]
    ]
    $if[$env[filterid;type]==twitter;
    $let[xr_variables;{"tweetId":"$env[filterid;id]","includePromotedContent":false,"withBirdwatchNotes":false,"withVoice":false,"withCommunity":false}]
    $let[xr_features;$getCache[authmusic_twitter_features]]
    $let[tryattempt;0]
    $localFunction[refreshx;
    $if[$env[retry]==true;
    $if[$get[tryattempt]>=3;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Sec-Fetch-Site;same-site]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_twitter_cookies];base64]]
    $httpAddHeader[Referer;https://x.com]
    $httpAddHeader[Origin;https://x.com]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Authorization;Bearer $getCache[authmusic_twitter]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://api.x.com/graphql/$getCache[authmusic_twitter_qid]/TweetResultByRestId?variables=$encodeURI[$get[xr_variables]]&features=$encodeURI[$get[xr_features]];GET]]
    $if[$or[$get[http]==401;$get[http]==400;$get[http]==429];
    $callFunction[generateAuthKeys;twitter;;true]
    $callFunction[generateAuthKeys;twitter_cookies;;true]
    $callLocalFunction[refreshx;true]
    $stop
    ]
    $jsonLoad[thers;$httpResult]
    ;retry]
    $callLocalFunction[refreshx;false]
    $let[results;{"status":null,"results":$if[$env[thers;data;tweetResult]==;null;$env[thers;data;tweetResult;result]]}]
    ]
    $let[resultforeturn;$get[results]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];0;2000;];$get[resultforeturn]]]
    `
}