module.exports = {
    name: "searchSomeTrack",
    params: [{
        name: "query", // string
        description: "To show a results",
        required: true
    },
    {
        name: "provider", // enum
        description: "Provider to use",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
    $arrayLoad[results]
    $try[
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $if[$env[provider]==youtube;
    $jsonLoad[loadser;$try[$getYoutubeVideo[$env[query]];{}]]
    $jsonLoad[loadser2;$env[loadser;results]]
    $arrayForEach[loadser2;result;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[result;title]]
    $!jsonSet[kls;duration;$if[$env[result;duration]==0;LIVE;$parseDigital[$multi[$env[result;duration];1000]]]]
    $!jsonSet[kls;thumbnail;$env[result;thumbnail]]
    $!jsonSet[kls;url;$env[result;url]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==youtubetv;
    $jsonLoad[loadser;$try[$getYoutubeVideoLite[$env[query]];{}]]
    $jsonLoad[loadser2;$env[loadser;results]]
    $arrayForEach[loadser2;result;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[result;title]]
    $!jsonSet[kls;duration;$if[$env[result;duration]==-1;Unknown;$if[$env[result;duration]==0;LIVE;$parseDigital[$multi[$env[result;duration];1000]]]]]
    $!jsonSet[kls;thumbnail;$env[result;thumbnail]]
    $!jsonSet[kls;url;$env[result;url]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==youtubeshorts;
    $jsonLoad[ser;$try[$getYoutubeShorts[$env[query]];{}]]
    $jsonLoad[loadser;$env[ser;results]]
    $arrayForEach[loadser;result;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[result;title]]
    $!jsonSet[kls;duration;$parseDigital[$multi[$env[result;duration];1000]]]
    $!jsonSet[kls;thumbnail;$env[result;thumbnail]]
    $!jsonSet[kls;url;$env[result;url]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==youtubemusic;
    $jsonLoad[ser;$try[$getYoutubeMusic[$env[query]];{}]]
    $jsonLoad[loadser;$env[ser;results]]
    $arrayForEach[loadser;result;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[result;title]]
    $!jsonSet[kls;duration;$parseDigital[$multi[$env[result;duration];1000]]]
    $!jsonSet[kls;thumbnail;$env[result;thumbnail]]
    $!jsonSet[kls;url;$env[result;url]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==soundcloud;
    $let[tryattempt;0]
    $localFunction[refreshsc;
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $callFunction[generateAuth;soundcloud;;false]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $let[httpsc;$httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getCache[initclientmusic;authmusic_soundcloud]&limit=10;GET;tests]]
    $if[$or[$get[httpsc]==401;$get[httpsc]==403];$callLocalFunction[refreshsc;true] $return]
    $if[$get[httpsc]==429;$return]
    $jsonLoad[res;$env[tests;collection]]
    $arrayForEach[res;result;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[result;title]]
    $!jsonSet[kls;duration;$parseDigital[$env[result;full_duration]]$if[$env[result;duration]==30000; - REGION LOCK]]
    $!jsonSet[kls;thumbnail;$replace[$env[result;artwork_url];-large;-original]]
    $!jsonSet[kls;url;$env[result;permalink_url]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ;refresh]
    $callLocalFunction[refreshsc;false]
    ]
    $if[$env[provider]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $try[
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $callFunction[generateAuth;spotify;;false]
    $callFunction[generateAuth;spotify_token;;false]
    $letSum[tryattempt;1]
    ]
    $let[mdhedroute_spotify;{
    "Accept": "application/json",
    "Accept-Language": "en",
    "App-Platform": "WebPlayer",
    "Authorization": "Bearer $getCache[initclientmusic;authmusic_spotify]",
    "User-Agent": "$get[agent]"
    }]
    $let[mdquery;https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=10]
    $let[jsonres;$djsEval[const { request, Agent } = require("undici")\\; request(ctx.getKeyword("mdquery"), { dispatcher: new Agent({ connect: { family: 4 } }), headers: JSON.parse(ctx.getKeyword("mdhedroute_spotify")), method: "GET" }).then(a => { ctx.setKeyword('httpspo', a.statusCode)\\; return a.body.text() }).catch()]]
    $if[$or[$get[httpspo]==401;$get[httpspo]==400];$callLocalFunction[refreshspotify;true] $return]
    $if[$or[$get[httpspo]==429;$get[httpspo]==403];
    $let[mdhedroute_spotify2;{
    "Accept": "application/json",
    "Accept-Language": "en",
    "App-Platform": "WebPlayer",
    "Authorization": "Bearer $getCache[initclientmusic;authmusic_spotify]",
    "Client-Token": "$getCache[initclientmusic;authmusic_spotify_token]",
    "Content-Type": "application/json",
    "User-Agent": "$get[agent]"
    }]
    $jsonLoad[mdbody_spotify;{"variables":{"includePreReleases":false,"searchTerm":null,"offset":0,"limit":10,"includeAudiobooks":false,"includeAuthors":false},"operationName":"searchTracks","extensions":{"persistedQuery":{"version":1,"sha256Hash":"131fd38c13431be963a851082dca0108a4200998b886e7e9d20a21fc51a36aaf"}}}]
    $!jsonSet[mdbody_spotify;variables;searchTerm;$env[query]]
    $let[mdquery2;https://api-partner.spotify.com/pathfinder/v2/query]
    $let[jsonres2;$djsEval[const { request, Agent } = require("undici")\\; request(ctx.getKeyword("mdquery2"), { dispatcher: new Agent({ connect: { family: 4 } }), body: JSON.stringify(ctx.getEnvironmentKey("mdbody_spotify")), headers: JSON.parse(ctx.getKeyword("mdhedroute_spotify2")), method: "POST" }).then(a => { ctx.setKeyword('httpspo', a.statusCode)\\; return a.body.text() }).catch()]]
    $if[$or[$get[httpspo]==401;$get[httpspo]==400];$callLocalFunction[refreshspotify;true] $return]
    $if[$or[$get[httpspo]==429;$get[httpspo]==403];$return]
    $jsonLoad[jsonres;$get[jsonres2]]
    $jsonLoad[res1;$env[jsonres;data;searchV2;tracksV2;items]]
    $arrayForEach[res1;res2;
    $let[thospthumbnail;$advancedTextSplit[$env[res2;item;data;albumOfTrack;coverArt;sources;0;url];/;4]]
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[res2;item;data;name]]
    $!jsonSet[kls;duration;$parseDigital[$env[res2;item;data;duration;totalMilliseconds]]]
    $!jsonSet[kls;thumbnail;https://i.scdn.co/image/$cropText[$get[thospthumbnail];0;12]82c1$cropText[$get[thospthumbnail];16]]
    $!jsonSet[kls;url;https://open.spotify.com/track/$env[res2;item;data;id]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ;
    $jsonLoad[jsonres;$get[jsonres]]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $arrayForEach[res1;res2;
    $let[thospthumbnail;$advancedTextSplit[$env[res2;album;images;0;url];/;4]]
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[res2;name]]
    $!jsonSet[kls;duration;$parseDigital[$env[res2;duration_ms]]]
    $!jsonSet[kls;thumbnail;https://i.scdn.co/image/$cropText[$get[thospthumbnail];0;12]82c1$cropText[$get[thospthumbnail];16]]
    $!jsonSet[kls;url;$env[res2;external_urls;spotify]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    ]
    ;refresh]
    $callLocalFunction[refreshspotify;false]
    ]
    $if[$env[provider]==applemusic;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Authorization;Bearer $getCache[initclientmusic;authmusic_applemusic]]
    $httpAddHeader[Origin;https://music.apple.com]
    $httpAddHeader[Cookie;geo=US]
    $let[httpal;$httpRequest[https://api.music.apple.com/v1/catalog/us/search?types=songs&limit=10&offset=0&term=$env[query];GET;res]]
    $if[$or[$get[httpal]==401;$get[httpal]==400];
    $async[$callFunction[generateAuth;applemusic;;false]]
    $let[httpal;429]
    $if[$get[httpal]==429;
    $let[tryattempt;0]
    $localFunction[runitunes;
    $try[
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpSetContentType[Text]
    $!httpRequest[https://itunes.apple.com/search?media=music&entity=musicTrack&limit=10&country=US&lang=en-US&version=2&term=$env[query];GET;res]
    ]
    $onlyIf[$env[res]!=;$callLocalFunction[runitunes;true]]
    ;refresh]
    $callLocalFunction[runitunes;false]
    $jsonLoad[res;$env[res]]
    $jsonLoad[res2;$env[res;results]]
    $arrayForEach[res2;res3;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[res3;trackName]]
    $!jsonSet[kls;duration;$parseDigital[$env[res3;trackTimeMillis]]]
    $!jsonSet[kls;thumbnail;$replace[$env[res3;artworkUrl100];100x100bb;1x1ss]]
    $!jsonSet[kls;url;https://music.apple.com/us/song/$advancedTextSplit[$env[res3;trackViewUrl];/;$sub[$charCount[$env[res3;trackViewUrl];/];1]]/$env[res3;trackId]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    ;
    $jsonLoad[res2;$env[res;results;songs;data]]
    $arrayForEach[res2;res5;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[res5;attributes;name]]
    $!jsonSet[kls;duration;$parseDigital[$env[res5;attributes;durationInMillis]]]
    $!jsonSet[kls;thumbnail;$replace[$env[res5;attributes;artwork;url];{w}x{h}bb;1x1ss]]
    $!jsonSet[kls;url;https://music.apple.com/us/song/$advancedTextSplit[$env[res5;attributes;url];/;$sub[$charCount[$env[res5;attributes;url];/];1]]/$env[res5;id]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]]
    $if[$env[provider]==tidal;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[X-Tidal-Token;$getCache[initclientmusic;authmusic_tidal]]
    $!httpRequest[https://api.tidal.com/v1/search/tracks?countryCode=US&locale=en_US&limit=10&offset=0&query=$env[query];GET;res]
    $jsonLoad[res2;$env[res;items]]
    $arrayForEach[res2;res3;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[res3;title]$if[$and[$env[res3;version]!=;$env[res3;version]!=null]; - $env[res3;version]]]
    $!jsonSet[kls;duration;$parseDigital[$round[$multi[$env[res3;duration];1000]]]]
    $!jsonSet[kls;thumbnail;https://resources.tidal.com/images/$replace[$env[res3;album;cover];-;/]/1280x1280.jpg]
    $!jsonSet[kls;url;https://tidal.com/browse/track/$env[res3;id]/u]
    $!jsonSet[kls;isAi;$env[res3;ai]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==qobuz;
    $let[tryattempt;0]
    $localFunction[refreshqob;
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpSetContentType[Text]
    $!httpRequest[https://www.qobuz.com/us-en/search/tracks/$encodeURI[$env[query]]?ssf%5Bf%5D%5Bq%5D=ih.1;GET;a]
    $arrayLoad[b;<div class="ListItem">;$advancedTextSplit[$env[a];<section class="product">;1;</section>;0]]
    $!arrayShift[b]
    $onlyIf[$env[b;0]!=;$callLocalFunction[refreshqob;true]]
    $arrayLoad[results]
    $arrayForEach[b;c;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$trimLines[$advancedTextSplit[$env[c];class="ListItem__title";1;role="tooltip">;1;</a>;0]]]
    $!jsonSet[kls;duration;Unknown]
    $!jsonSet[kls;thumbnail;$advancedTextSplit[$env[c];<img;1;src=";1;";0]]
    $!jsonSet[kls;url;https://www.qobuz.com$advancedTextSplit[$env[c];href=";1;";0]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ;refresh]
    $callLocalFunction[refreshqob;false]
    ]
    $if[$env[provider]==amazonmusic;
    $let[tryattempt;0]
    $localFunction[refreshamz;
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $callFunction[generateAuth;amazonmusic;;false]
    $letSum[tryattempt;1]
    ]
    $jsonLoad[a;$default[$getCache[initclientmusic;authmusic_amazonmusic];{}]]
    $httpSetBody[{"keyword":"{\\\\"interface\\\\":\\\\"Web.TemplatesInterface.v1_0.Touch.SearchTemplateInterface.SearchKeywordClientInformation\\\\",\\\\"keyword\\\\":\\\\"$advancedReplace[$env[query];\\\\;;";\\\\\\\\"]\\\\"}","userHash":"{\\\\"level\\\\":\\\\"LIBRARY_MEMBER\\\\"}","headers":"{\\\\"x-amzn-authentication\\\\":\\\\"{\\\\\\\\\\\\"interface\\\\\\\\\\\\":\\\\\\\\\\\\"ClientAuthenticationInterface.v1_0.ClientTokenElement\\\\\\\\\\\\",\\\\\\\\\\\\"accessToken\\\\\\\\\\\\":\\\\\\\\\\\\"\\\\\\\\\\\\"}\\\\",\\\\"x-amzn-device-model\\\\":\\\\"WEBPLAYER\\\\",\\\\"x-amzn-device-width\\\\":\\\\"1920\\\\",\\\\"x-amzn-device-family\\\\":\\\\"WebPlayer\\\\",\\\\"x-amzn-device-id\\\\":\\\\"$env[a;deviceId]\\\\",\\\\"x-amzn-user-agent\\\\":\\\\"$get[agent]\\\\",\\\\"x-amzn-session-id\\\\":\\\\"$env[a;sessionId]\\\\",\\\\"x-amzn-device-height\\\\":\\\\"1080\\\\",\\\\"x-amzn-request-id\\\\":\\\\"$randomUUID\\\\",\\\\"x-amzn-device-language\\\\":\\\\"$env[a;displayLanguage]\\\\",\\\\"x-amzn-currency-of-preference\\\\":\\\\"USD\\\\",\\\\"x-amzn-os-version\\\\":\\\\"$advancedTextSplit[$env[a;version];.;0].$advancedTextSplit[$env[a;version];.;1]\\\\",\\\\"x-amzn-application-version\\\\":\\\\"$env[a;version]\\\\",\\\\"x-amzn-device-time-zone\\\\":\\\\"$djsEval[Intl.DateTimeFormat().resolvedOptions().timeZone]\\\\",\\\\"x-amzn-timestamp\\\\":\\\\"$getTimestamp\\\\",\\\\"x-amzn-csrf\\\\":\\\\"{\\\\\\\\\\\\"interface\\\\\\\\\\\\":\\\\\\\\\\\\"CSRFInterface.v1_0.CSRFHeaderElement\\\\\\\\\\\\",\\\\\\\\\\\\"token\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;token]\\\\\\\\\\\\",\\\\\\\\\\\\"timestamp\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;ts]\\\\\\\\\\\\",\\\\\\\\\\\\"rndNonce\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;rnd]\\\\\\\\\\\\"}\\\\",\\\\"x-amzn-music-domain\\\\":\\\\"music.amazon.com\\\\",\\\\"x-amzn-referer\\\\":\\\\"music.amazon.com\\\\",\\\\"x-amzn-affiliate-tags\\\\":\\\\"\\\\",\\\\"x-amzn-ref-marker\\\\":\\\\"\\\\",\\\\"x-amzn-page-url\\\\":\\\\"https://music.amazon.com/search\\\\",\\\\"x-amzn-weblab-id-overrides\\\\":\\\\"\\\\",\\\\"x-amzn-video-player-token\\\\":\\\\"\\\\",\\\\"x-amzn-feature-flags\\\\":\\\\"\\\\",\\\\"x-amzn-has-profile-id\\\\":\\\\"\\\\"}"}]
    $httpAddHeader[Origin;https://music.amazon.com]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $let[httpa;$httpRequest[https://na.mesk.skill.music.a2z.com/api/showSearch;POST;b]]
    $if[$or[$get[httpa]==400;$get[httpa]==429];$return]
    $if[$env[b;methods;0;template;header]!=;$callLocalFunction[refreshamz;true] $return]
    $jsonLoad[c;$env[b;methods;0;template;widgets]]
    $arrayMap[c;cd;$if[$toLowercase[$env[cd;header]]==songs;$return[$env[cd;items]]];d]
    $jsonLoad[e;$env[d;0]]
    $arrayForEach[e;ef;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[ef;primaryText;text]]
    $!jsonSet[kls;duration;Unknown]
    $!jsonSet[kls;thumbnail;https://m.media-amazon.com/images/$advancedTextSplit[$env[ef;image];images/;1;.;0].jpg]
    $!jsonSet[kls;url;https://music.amazon.com/tracks/$advancedTextSplit[$env[ef;primaryLink;deeplink];?trackAsin=;1]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ;refresh]
    $callLocalFunction[refreshamz;false]
    ]
    $if[$env[provider]==deezer;
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $let[status;$httpRequest[https://api.deezer.com/search?limit=10&q=$env[query];GET;res]]
    $jsonLoad[forres;$env[res;data]]
    $arrayForEach[forres;resat;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[resat;title]]
    $!jsonSet[kls;duration;$parseDigital[$multi[$env[resat;duration];1000]]]
    $!jsonSet[kls;thumbnail;$replace[$env[resat;album;cover_xl];1000x1000-000000-80;1920x1920-000000-100]]
    $!jsonSet[kls;url;$env[resat;link]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==ncs;
    $httpSetContentType[Text]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://ncs.io/music-search?q=$env[query]&genre=&mood=;GET]
    $arrayLoad[a;class="player-play";$advancedTextSplit[$httpResult;<tbody>;1;</tbody>;0]]
    $!arrayShift[a]
    $arrayForEach[a;b;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$advancedTextSplit[$env[b];" data-cover=";0;data-track=";1]]
    $!jsonSet[kls;duration;Unknown]
    $!jsonSet[kls;thumbnail;$advancedTextSplit[$env[b];img src=";1;";0]]
    $!jsonSet[kls;url;https://ncs.io$advancedTextSplit[$env[b];href=";1;";0]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==bandcamp;
    $jsonLoad[inputhttpquery;{"search_filter":"t","full_page":false}]
    $!jsonSet[inputhttpquery;search_text;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Origin;https://bandcamp.com]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://bandcamp.com/api/bcsearch_public_api/1/autocomplete_elastic;POST]
    $if[$httpResult[auto;results;0]==;$return]
    $jsonLoad[lv;$httpResult[auto;results]]
    $arrayForEach[lv;b;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[b;name]]
    $!jsonSet[kls;duration;Unknown]
    $!jsonSet[kls;thumbnail;$if[$env[b;img_id]==null;$advancedTextSplit[$env[b;img];/img/;0]/img/a$advancedTextSplit[$env[b;img];/img/;1];$env[b;img]]]
    $!jsonSet[kls;url;$env[b;item_url_path]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==jiosaavn;
    $httpSetContentType[Text]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://www.jiosaavn.com/api.php?_format=json&n=10&__call=search.getResults&q=$env[query];GET]
    $if[$httpResult==;$return]
    $jsonLoad[a;$httpResult]
    $if[$env[a;results;0]==;$return]
    $jsonLoad[res;$env[a;results]]
    $arrayForEach[res;tp;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[tp;song]]
    $!jsonSet[kls;duration;$parseDigital[$multi[$env[tp;duration];1000]]]
    $!jsonSet[kls;thumbnail;$env[tp;image]]
    $!jsonSet[kls;url;$default[$env[tp;perma_url];$env[tp;album_url]]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==capcut;
    $let[time;$round[$divide[$getTimestamp;1000]]]
    $let[linkhost;https://edit-api-sg.capcut.com/lv/v1/cc_web/replicate/search_templates]
    $jsonLoad[inputhttpquery;{"sdk_version":"100.0.0","count":10,"cursor":"0","scene":1,"search_version":2}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpSetContentType[Text]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Sign;$md5[9e2c|$cropText[$get[linkhost];-7]|7|5.8.0|$get[time]||11ac]]
    $httpAddHeader[Sign-Ver;1]
    $httpAddHeader[Device-Time;$get[time]]
    $httpAddHeader[Pf;7]
    $httpAddHeader[Appvr;5.8.0]
    $httpAddHeader[App-Sdk-Version;48.0.0]
    $httpAddHeader[Lan;en]
    $httpAddHeader[Loc;sg]
    $httpAddHeader[Origin;https://www.capcut.com]
    $httpAddHeader[Referer;https://www.capcut.com]
    $httpAddHeader[sec-fetch-site;same-site]
    $!httpRequest[$get[linkhost];POST]
    $jsonLoad[r;$httpResult]
    $jsonLoad[r;$env[r;data;video_templates]]
    $arrayForEach[r;tp;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$default[$env[tp;short_title];$env[tp;title]]]
    $!jsonSet[kls;duration;$parseDigital[$env[tp;duration]]]
    $!jsonSet[kls;thumbnail;$env[tp;optimized_cover_url;cover_url_large]]
    $!jsonSet[kls;url;https://www.capcut.com/template-detail/$env[tp;web_id]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==robloxmusic;
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://apis.roblox.com/toolbox-service/v1/marketplace/3?limit=10&keyword=$env[query];GET]
    $if[$httpResult[data;0]==;$return]
    $jsonLoad[a;$httpResult[data]]
    $arrayMap[a;b;$return[$env[b;id]];a]
    $let[assetids;$arrayJoin[a;,]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=$get[assetids];GET]
    $if[$httpResult[data;0]==;$return]
    $jsonLoad[a;$httpResult[data]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://thumbnails.roblox.com/v1/assets?assetIds=$get[assetids]&size=512x512&format=png;GET]
    $jsonLoad[k;$httpResult[data]]
    $arrayForEach[a;tp;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$trimLines[$env[tp;asset;audioDetails;title]]]
    $!jsonSet[kls;duration;$parseDigital[$multi[$env[tp;asset;duration];1000]]]
    $!jsonSet[kls;thumbnail;$if[$isValidLink[$env[k;$arrayFindIndex[k;p;$checkCondition[$env[p;targetId]==$env[tp;asset;id]]];imageUrl]];$env[k;$arrayFindIndex[k;p;$checkCondition[$env[p;targetId]==$env[tp;asset;id]]];imageUrl];https://prod.docsiteassets.roblox.com/assets/feeds/robloxYoutubeAvatar.webp]]
    $!jsonSet[kls;url;https://create.roblox.com/store/asset/$env[tp;asset;id]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==twitch;
    $jsonLoad[yctwitch;{}]
    $!jsonSet[yctwitch;query;$env[query]]
    $!jsonSet[yctwitch;includeIsDJ;true]
    $httpSetBody[{"operationName":"SearchResultsPage_SearchResults","variables":$jsonStringify[yctwitch],"extensions":{"persistedQuery":{"version":1,"sha256Hash":"7f3580f6ac6cd8aa1424cff7c974a07143827d6fa36bba1b54318fe7f0b68dc5"}}}]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Client-Id;kimne78kx3ncx6brgo4mv6wki5h1ko]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://gql.twitch.tv/gql;POST]
    $if[$or[$httpResult[data;searchFor;channelsWithTag;edges;0;item]!=;$httpResult[data;searchFor;channels;edges;0;item]!=]==false;$return]
    $if[$httpResult[data;searchFor;channelsWithTag;edges;0;item]==;
    $jsonLoad[lk;$httpResult[data;searchFor;channels;edges]]
    ;
    $jsonLoad[lk;$httpResult[data;searchFor;channelsWithTag;edges]]
    ]
    $arrayForEach[lk;tp;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[tp;item;broadcastSettings;title]]
    $!jsonSet[kls;duration;LIVE]
    $!jsonSet[kls;thumbnail;$replace[$env[tp;item;stream;templatePreviewImageURL];-{width}x{height};]]
    $!jsonSet[kls;url;https://www.twitch.tv/$env[tp;item;login]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    $if[$env[provider]==bilibili;
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://api.bilibili.tv/intl/gateway/web/v2/search_v2?s_locale=en_US&platform=web&highlight=1&pn=1&ps=10&keyword=$env[query];GET;l]
    $if[$or[$env[l;data;modules;1;items;0]!=;$env[l;data;modules;0;items;0]!=]==false;$return]
    $if[$env[l;data;modules;1;items;0]!=;
    $jsonLoad[l;$env[l;data;modules;1;items]]
    ;
    $jsonLoad[l;$env[l;data;modules;0;items]]
    ]
    $arrayForEach[l;tp;
    $jsonLoad[kls;{}]
    $!jsonSet[kls;title;$env[tp;title]]
    $!jsonSet[kls;duration;$parseDigital[$unparseDigital[$env[tp;duration]]]]
    $!jsonSet[kls;thumbnail;$env[tp;cover]]
    $!jsonSet[kls;url;https://www.bilibili.tv/video/$env[tp;aid]]
    $arrayPush[results;$jsonStringify[kls]]
    ]
    ]
    ]
    $arrayMap[results;rls;$if[$startsWith[$env[rls];{];$return[$env[rls]]];results]
    $if[$env[results;0]!=;$let[results;$jsonStringify[results]]]
    $async[
    $wait[1]
    $if[$env[results;0]!=;
    $jsonLoad[lf;{}]
    $!jsonSet[lf;playlist;$get[results]]
    $!putRecord[global;$jsonStringify[lf];cachesearch_global-query_$deflate[$env[provider]$toLowercase[$env[query]];hex]]]
    ]]
    ]
    $return[$get[results]]
    `
}