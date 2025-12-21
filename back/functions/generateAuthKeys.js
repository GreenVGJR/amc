module.exports = {
    name: "generateAuthKeys",
    params: [{
        name: "type", // enum
        description: "Type",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: true
    },
    {
        name: "successlog",
        description: "Show successful on console",
        required: true
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $let[typedebug;$callFunction[configMusic;debug_auth]]

    $if[$or[$env[type]==all;$env[type]==youtube];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Youtube             | Visitor;cyan]]
    $let[ytinitcookies;$trimLines[$trim[$djsEval[process.env.YOUTUBE_COOKIES]]]]
    $try[
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;
        $if[$env[successlog]==true;$logger[Info;Using Youtube Cookies. Attempting to rotating]]
        $httpAddHeader[Cookie;$get[ytinitcookies]]
        ;
        $if[$env[successlog]==true;$logger[Warn;Missing Youtube Cookies. Some features might not available]]
        ]
        $httpSetContentType[Text]
        $!httpRequest[https://www.youtube.com/embed?html5=1;GET;g3]
        $if[$and[$or[$get[ytinitcookies]!=;$get[ytinitcookies]!=undefined]==false;$advancedTextSplit[$env[g3];"LOGIN_INFO":";1;";0]==];
        $let[abortproscookies;true]
        $logger[Error;Cookies no longer active. Please put a new one]
        $logger[Info;Continuing process]
        ]
        $if[$and[$get[abortproscookies]!=true;$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false];
        $localFunction[cookiessid;
        $let[tempgrinitcs;$default[$get[ytinitcookies_replacement];$get[ytinitcookies]]]
        $arrayLoad[lkcinitcookies_1;\\;;$get[tempgrinitcs]]
        $arrayMap[lkcinitcookies_1;b;$if[$charCount[$env[b];=]>=1;$return[$trim[$env[b]]]];lkcinitcookies_1]
        $let[tempgt-gr-c-0_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];__Secure-1PSIDCC]]]
        $let[tempgt-gr-c-1_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];__Secure-3PSIDCC]]]
        $let[tempgt-gr-c-2_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];SIDCC]]]
        $let[tempgt-gr-c-3_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];NID]]]
        $let[tempgt-gr-c-4_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];__Secure-ENID]]]
        $let[tempgt-gr-c-5_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];__Secure-1PSIDTS]]]
        $let[tempgt-gr-c-6_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];__Secure-3PSIDTS]]]
        $let[tempgt-gr-c-7_0;$arrayFindIndex[lkcinitcookies_1;a;$startsWith[$env[a];LOGIN_INFO]]]
        $arrayLoad[lkcinitcookies_2;\\;;$env[ab84830609467438272d]]
        $arrayMap[lkcinitcookies_2;b;$return[$default[$advancedTextSplit[$env[b];, ;1];$advancedTextSplit[$env[b]; ;0]]];lkcinitcookies_2]
        $arrayMap[lkcinitcookies_2;b;$if[$and[$charCount[$env[b]; ]==0;$charCount[$env[b]]!=0];$return[$env[b]]];lkcinitcookies_2]
        $let[tempgt-gr-c-0_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];__Secure-1PSIDCC]]]
        $let[tempgt-gr-c-1_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];__Secure-3PSIDCC]]]
        $let[tempgt-gr-c-2_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];SIDCC]]]
        $let[tempgt-gr-c-3_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];NID]]]
        $let[tempgt-gr-c-4_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];__Secure-ENID]]]
        $let[tempgt-gr-c-5_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];__Secure-1PSIDTS]]]
        $let[tempgt-gr-c-6_1;$arrayFindIndex[lkcinitcookies_2;a;$startsWith[$env[a];__Secure-3PSIDTS]]]
        $if[$and[$get[tempgt-gr-c-0_0]!=-1;$get[tempgt-gr-c-0_1]!=-1];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-0_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-0_1]]]
        ]
        $if[$and[$get[tempgt-gr-c-1_0]!=-1;$get[tempgt-gr-c-1_1]!=-1];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-1_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-1_1]]]
        ]
        $if[$and[$get[tempgt-gr-c-2_0]!=-1;$get[tempgt-gr-c-2_1]!=-1];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-2_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-2_1]]]
        ]
        $if[$and[$get[tempgt-gr-c-3_0]!=-1;$get[tempgt-gr-c-3_1]!=-1];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-3_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-3_1]]]
        ]
        $if[$and[$get[tempgt-gr-c-4_0]!=-1;$get[tempgt-gr-c-4_1]!=-1];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-4_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-4_1]]]
        ]
        $if[$and[$get[tempgt-gr-c-7_0]!=-1;$advancedTextSplit[$env[g3];"LOGIN_INFO":";1;";0]!=];
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-7_0];LOGIN_INFO=$advancedTextSplit[$env[g3];"LOGIN_INFO":";1;";0]]
        ]
        $let[ytinitcookies_replacement;$arrayJoin[lkcinitcookies_1;\\; ]]
        $if[$env[findtsidexist]==true;
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-5_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-5_1]]]
        $!jsonSet[lkcinitcookies_1;$get[tempgt-gr-c-6_0];$env[lkcinitcookies_2;$get[tempgt-gr-c-6_1]]]
        $let[ytinitcookies_replacement;$arrayJoin[lkcinitcookies_1;\\; ]]
        ]
        $return
        ;ab84830609467438272d;findtsidexist]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];false]
        $localFunction[attytrotate-1;
        $try[
        $httpSetContentType[Text]
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Referer;https://www.youtube.com]
        $httpAddHeader[Cookie;$default[$get[ytinitcookies_replacement];$get[ytinitcookies]]]
        $httpAddHeader[User-Agent;$get[agent]]
        $let[httpytrotate;$httpRequest[https://accounts.youtube.com/RotateCookiesPage?origin=https://www.youtube.com&yt_pid=1;GET;g3_1]]
        ]
        $onlyIf[$get[httpytrotate]==200;$return[0]]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];false]
        $let[ytinitrotateid+hp_init;$advancedTextSplit[$env[g3_1];init(';1;';0]]
        $let[ytinitrotatetd+up_init;$round[$trim[$advancedTextSplit[$env[g3_1];init(';1;,;2]]]]
        $return[$get[httpytrotate]]
        ]
        $localFunction[attytrotate-2;
        $try[
        $httpSetContentType[Text]
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Origin;https://accounts.youtube.com]
        $httpAddHeader[Referer;https://www.youtube.com]
        $httpAddHeader[Sec-Fetch-Site;same-origin]
        $httpAddHeader[Cookie;$default[$get[ytinitcookies_replacement];$get[ytinitcookies]]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpSetBody[\\[null,"$default[$get[ytinitrotateid+hp_init];$getCache[tempres-ytinitrotateid_0]]",$default[$get[ytinitrotatetd+up_init];$getCache[tempres-ytinitrotateid_1]]\\]]
        $let[httpytrotate_2;$httpRequest[https://accounts.youtube.com/RotateCookies;POST;g3_2]]
        ]
        $onlyIf[$get[httpytrotate_2]==200;$return[0]]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];$checkContains[$httpGetHeader[Set-Cookie];__Secure-1PSIDTS;__Secure-3PSIDTS]]
        $setCache[tempres-ytinitrotateid_0;$default[$get[ytinitrotateid+hp_init];$getCache[tempres-ytinitrotateid_0]]]
        $setCache[tempres-ytinitrotateid_1;$default[$get[ytinitrotatetd+up_init];$getCache[tempres-ytinitrotateid_1]]]
        $return[$get[httpytrotate_2]]
        ]
        $if[$env[successlog]==true;
        $wait[1s]
        $let[checkrotate-1;$callLocalFunction[attytrotate-1]]
        $if[$get[checkrotate-1]!=200;$let[abortproscookies;true];$logger[Info;1 - Rotating | Youtube Cookies]]
        ]
        $if[$get[abortproscookies]!=true;
        $wait[1s]
        $let[checkrotate-2;$callLocalFunction[attytrotate-2]]
        $if[$get[checkrotate-2]!=200;$let[abortproscookies;true];$logger[Info;2 - Rotating | Youtube Cookies]]
        $if[$get[abortproscookies]==true;$logger[Error;Cookie doesn't appear. Can't continue this process.];
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_COOKIES=$get[ytinitcookies];YOUTUBE_COOKIES=$get[ytinitcookies_replacement]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        $if[$env[successlog]==true;$logger[Info;Rotated. Continuing process]]
        ]
        ;
        $logger[Error;Cookie doesn't appear. Can't continue this process.]
        ]]
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $if[$get[a32]!=;$setCache[authmusic_youtube_visitor;$get[a32]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
    ;$logger[Info;Failed to Retrieve - Youtube]]
    $if[$get[a32]==;$logger[Warn;Re-trying - Youtube] $callFunction[generateAuthKeys;youtube;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==soundcloud];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://w.soundcloud.com/player/;GET]
        $arrayLoad[storeclientid]
        $arrayLoad[conres;widget.sndcdn.com;$httpResult]
        $arrayMap[conres;conrest;$if[$checkContains[$env[conrest];.js];$return[https://widget.sndcdn.com$advancedTextSplit[$env[conrest];</script>;0;";0]]];conres2]
        $arrayReverse[conres2;conres2]
        $arrayForEach[conres2;conres3;
        $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[$env[conres3];GET]
        ]
        $if[$charCount[$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";1]]==32;
        $arrayPushJSON[storeclientid;$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";1]]
        $arrayPushJSON[storeclientid;$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";3]]
        ]]
    $if[$env[storeclientid;0]!=;$setCache[authmusic_soundcloud;$env[storeclientid;0]]]
    $if[$env[storeclientid;1]!=;$setCache[authmusic_soundcloud_fall;$env[storeclientid;1]]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;0]!=;$cropText[$env[storeclientid;0];0;12;...];Failed to Retrieve] | Soundcloud / Player]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;1]!=;$cropText[$env[storeclientid;1];0;12;...];Failed to Retrieve] | Soundcloud / Stream]]
    ;$logger[Info;Failed to Retrieve - Soundcloud]]
    $if[$and[$env[storeclientid;0]==;$env[storeclientid;1]==];$logger[Warn;Re-trying - Soundcloud] $callFunction[generateAuthKeys;soundcloud;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Key;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
        $let[token;$advancedTextSplit[$httpResult;"accessToken":";1;";0]]
        $if[$get[token]!=;$setCache[authmusic_spotify;$get[token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify / Key]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==amazonmusic];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Amazon Music        | Config & Token;cyan]]
    $try[
        $httpAddHeader[Origin;https://music.amazon.com/]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpSetContentType[Text]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $!httpRequest[https://music.amazon.com/config.json;GET]
        $jsonLoad[tokens;$httpResult]
        $if[$env[tokens;csrf;token]!=;$setCache[authmusic_amazonmusic;$env[tokens]]]
        $if[$env[successlog]==true;$logger[Info;$if[$env[tokens;csrf;token]!=;$cropText[$env[tokens;csrf;token];0;12;...];Failed to Retrieve] | Amazon Music]]
    ;$logger[Info;Failed to Retrieve - Amazon Music]]
    $if[$env[tokens;csrf;token]==;$logger[Warn;Re-trying - Amazon Music] $callFunction[generateAuthKeys;amazonmusic;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tidal];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Tidal               | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com/tracks/$randomText[230917825;432597859;355309145;416356151;434875762];GET;tokens]
        $let[embti;$advancedTextSplit[$env[tokens];type="module";0;script src=";1;";0]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Content-Type;application/javascript]
        $httpAddHeader[Origin;https://embed.tidal.com]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com$get[embti];GET;rettokens]
        $let[finaltoken;$advancedTextSplit[$env[rettokens];.append("X-Tidal-Token";1;";1]]
        $if[$get[finaltoken]!=;$setCache[authmusic_tidal;$get[finaltoken]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    $if[$get[finaltoken]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tiktok];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Tiktok              | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://www.tiktok.com/node/common/location;GET]
        $let[a13;$httpGetHeader[Set-Cookie]]
        $jsonLoad[runtik;$httpResult]
        $let[a12;$env[runtik;body;webId]]
        $if[$get[a13]!=;$setCache[authmusic_tiktok;$deflate[$get[a13];base64]]]
        $if[$get[a12]!=;$setCache[authmusic_tiktok_did;$get[a12]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a13]!=;$cropText[$deflate[$get[a13];base64];0;12;...];Failed to Retrieve] | Tiktok / Cookie]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a12]!=;$cropText[$get[a12];0;12;...];Failed to Retrieve] | Tiktok / Device ID]]
    ;$logger[Info;Failed to Retrieve - Tiktok]]
    $if[$and[$get[a12]==;$get[a13]==];$logger[Warn;Re-trying - Tiktok] $callFunction[generateAuthKeys;tiktok;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==applemusic];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Apple Music         | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://www.shazam.com/services/partner/oauth/commerce/validate;GET]
        $let[a14;$httpGetHeader[x-shz-validation]]
        $if[$get[a14]!=;$setCache[authmusic_applemusic;$get[a14]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a14]!=;$cropText[$get[a14];0;12;...];Failed to Retrieve] | Apple Music]]
    ;$logger[Info;Failed to Retrieve - Apple Music]]
    $if[$get[a14]==;$logger[Warn;Re-trying - Apple Music] $callFunction[generateAuthKeys;applemusic;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==deezer];
    $if[$get[typedebug];$chalkLog[\\[LYRIC\\] Generating Deezer               | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Accept;application/json]
        $httpSetContentType[Text]
        $!httpRequest[https://auth.deezer.com/login/anonymous?jo=p&rto=p;GET]
        $let[hgk;$advancedTextSplit[$httpResult;"jwt":";1;";0]]
        $if[$get[hgk]!=;$setCache[authmusic_deezer;$get[hgk]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[hgk]!=;$cropText[$get[hgk];0;12;...];Failed to Retrieve] | Deezer]]
    ;$logger[Info;Failed to Retrieve - Deezer]]
    $if[$get[hgk]==;$logger[Warn;Re-trying - Deezer] $callFunction[generateAuthKeys;deezer;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==twitter];
    $if[$get[typedebug];$chalkLog[\\[OTHER\\] Generating Twitter              | Token & ID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://x.com;GET]
        $arrayLoad[a;crossorigin="anonymous";$httpResult]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[$advancedTextSplit[$env[a;$arrayFindIndex[a;b;$checkCondition[$advancedTextSplit[$env[b];client-web/main;1]!=]]];href=";1;";0];GET]
        $let[ts;$advancedTextSplit[$httpResult;operationName:"TweetResultByRestId";0]]
        $let[xts_ot;$advancedTextSplit[$httpResult;return"Bearer ;1;";0]]
        $let[xts_qi;$advancedTextSplit[$get[ts];queryId:;$charCount[$get[ts];queryId:];";1]]
        $if[$get[xts_ot]!=;$setCache[authmusic_twitter;$get[xts_ot]]]
        $if[$get[xts_qi]!=;$setCache[authmusic_twitter_qid;$get[xts_qi]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ot]!=;$cropText[$get[xts_ot];0;12;...];Failed to Retrieve] | Twitter / Token]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_qi]!=;$cropText[$get[xts_qi];0;12;...];Failed to Retrieve] | Twitter / QueryID]]
    ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$and[$get[xts_ot]==;$get[xts_qi]==];$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter;;true]]
    ]
    $return
    `
}