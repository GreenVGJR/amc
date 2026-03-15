const { tarClient, tarClientYT } = require('./clientYoutube.js');

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
    },
    {
        name: "cookielog",
        description: "Cookies log",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $let[typedebug;$callFunction[configMusic;debug_auth]]

    $if[$or[$env[type]==all;$env[type]==youtube];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Youtube             | Visitor;cyan]]
    $let[ytinitcookies;$trimLines[$trim[$djsEval[process.env.YOUTUBE_COOKIES]]]]
    $let[ytinitua;$trimLines[$trim[$djsEval[process.env.YOUTUBE_UA]]]]
    $try[
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[User-Agent;$if[$or[$get[ytinitua]==;$get[ytinitua]==undefined]==false;$get[ytinitua];$get[agent]]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Sec-Fetch-Dest;document]
        $httpAddHeader[Sec-Fetch-Site;none]
        $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;
        $if[$and[$env[cookielog]!=true;$env[successlog]==true];$logger[Info;Using Youtube Cookies. Attempting to rotating]
        $if[$or[$get[ytinitua]==;$get[ytinitua]==undefined];$logger[Warn;Using default User Agent. Rotation may fails]]
        ]
        $httpAddHeader[Cookie;$get[ytinitcookies]]
        ]
        $httpSetContentType[Text]
        $!httpRequest[https://www.youtube.com;GET;g3]
        $if[$and[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;$advancedTextSplit[$env[g3];"LOGIN_INFO":";1;";0]==];
        $let[abortproscookies;true]
        $logger[Error;Cookies no longer active. Please put a new one - Youtube]
        $logger[Info;Continuing process]
        ]
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $let[tempCookiesYT;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $if[$get[a32]!=;$setCache[authmusic_youtube_visitor;$get[a32]]]
        $let[a33;$advancedTextSplit[$advancedTextSplit[$env[g3];"DATASYNC_ID":";1;";0];||;0]]
        $if[$get[a33]!=;$setCache[authmusic_youtube_datasync_id;$get[a33]]]
        $jsonLoad[listconfig;$getCache[system_file-config]]
        $if[$and[$env[listconfig;useSABR]==false;$env[successlog]==true;$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]];
        $setCache[authmusic_youtube_tempcookies;$get[tempCookiesYT]]
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_ANONCOOKIES=$djsEval[process.env.YOUTUBE_ANONCOOKIES];YOUTUBE_ANONCOOKIES=$get[tempCookiesYT]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        $if[$checkContains[$get[tempCookiesYT];Secure-YNID=]==false;
        $logger[Warn;InnerTube: No 'Secure-YNID' Cookie appears]
        ]
        $let[getpickclient;${tarClient()}]
        $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
        $let[defytdomain;$env[listclient;targetDomain]]
        $!jsonDelete[listclient;targetDomain]
        $!jsonSet[listclient;visitorData;$getCache[authmusic_youtube_visitor]]
        $!jsonSet[listclient;hl;en]
        $!jsonSet[listclient;gl;US]
        $c[-- Test Fetch Youtube Video --]
        $httpAddHeader[Accept-Encoding;]
        $httpAddHeader[User-Agent;$default[$env[listclient;userAgent];$callFunction[configMusic;default_userAgent]]]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Cookie;$get[tempCookiesYT]]
        $let[testvideoid;fa5IWHDbftI]
        $httpSetBody[{"videoId":"$get[testvideoid]","context":{"client":$jsonStringify[listclient]}}]
        $logger[Info;InnerTube: Test Fetching  | $get[testvideoid] ($get[getpickclient])]
        $!httpRequest[https://$get[defytdomain]/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus(status),streamingData(adaptiveFormats(itag,url));POST]
        $if[$httpResult[playabilityStatus;status]!=OK;
        $logger[Warn;InnerTube: $default[$httpResult[playabilityStatus;status];Unknown] - Some features might not available]
        ]
        $if[$httpResult[playabilityStatus;status]==OK;
        $jsonLoad[osav;$httpResult[streamingData;adaptiveFormats]]
        $let[testitag;$arrayFindIndex[osav;v;$or[$env[v;itag]==251;$env[v;itag]==140]]]
        $logger[Info;InnerTube: Test Streaming | Itag $env[osav;$get[testitag];itag]]
        $let[ckec;$httpRequest[$env[osav;$get[testitag];url];HEAD]]
        $if[$or[$get[ckec]==403;$get[ckec]==400];
        $logger[Warn;InnerTube: $get[ckec] | These clients may not working normally: ANDROID, IOS, ANDROID_VR]
        ;
        $logger[Info;InnerTube: $get[ckec]]
        ]
        ]
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
        $arrayLoad[lkcinitcookies_2;\\;;$env[56fe40cf]]
        $arrayMap[lkcinitcookies_2;b;$return[$default[$advancedTextSplit[$env[b];, ;1];$advancedTextSplit[$env[b]; ;0]]];lkcinitcookies_2]
        $arrayMap[lkcinitcookies_2;b;$if[$and[$charCount[$env[b]; ]==0;$charCount[$env[b]]!=0];$return[$env[b]]];lkcinitcookies_2]
        $let[tempgt-gr-c-0_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];__Secure-1PSIDCC];$advancedTextSplit[$env[a];__Secure-1PSIDCC=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-1_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];__Secure-3PSIDCC];$advancedTextSplit[$env[a];__Secure-3PSIDCC=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-2_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];SIDCC];$advancedTextSplit[$env[a];SIDCC=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-3_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];NID];$advancedTextSplit[$env[a];NID=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-4_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];__Secure-ENID];$advancedTextSplit[$env[a];__Secure-ENID=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-5_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];__Secure-1PSIDTS];$advancedTextSplit[$env[a];__Secure-1PSIDTS=;1;\\;;0]!=]]]
        $let[tempgt-gr-c-6_1;$arrayFindIndex[lkcinitcookies_2;a;$and[$startsWith[$env[a];__Secure-3PSIDTS];$advancedTextSplit[$env[a];__Secure-3PSIDTS=;1;\\;;0]!=]]]
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
        ;56fe40cf;findtsidexist]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];false]
        $localFunction[attytrotate-1;
        $try[
        $jsonLoad[listclient;${tarClientYT()}]
        $let[ytdomain;$env[listclient;targetDomain]]
        $httpSetContentType[Text]
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Referer;https://www.youtube.com]
        $httpAddHeader[Cookie;$default[$get[ytinitcookies_replacement];$get[ytinitcookies]]]
        $httpAddHeader[User-Agent;$if[$or[$get[ytinitua]==;$get[ytinitua]==undefined]==false;$get[ytinitua];$get[agent]]]
        $let[httpytrotate;$httpRequest[https://accounts.youtube.com/RotateCookiesPage?origin=https://$get[ytdomain]&yt_pid=1;GET;g3_1]]
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
        $httpAddHeader[User-Agent;$if[$or[$get[ytinitua]==;$get[ytinitua]==undefined]==false;$get[ytinitua];$get[agent]]]
        $httpSetBody[\\[null,"$default[$get[ytinitrotateid+hp_init];$getCache[tempres-ytinitrotateid_0]]",$default[$get[ytinitrotatetd+up_init];$getCache[tempres-ytinitrotateid_1]]\\]]
        $let[httpytrotate_2;$httpRequest[https://accounts.youtube.com/RotateCookies;POST;g3_2]]
        ]
        $onlyIf[$get[httpytrotate_2]==200;$return[0]]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];$checkContains[$httpGetHeader[Set-Cookie];__Secure-1PSIDTS;__Secure-3PSIDTS]]
        $setCache[tempres-ytinitrotateid_0;"$default[$get[ytinitrotateid+hp_init];$getCache[tempres-ytinitrotateid_0]]"]
        $setCache[tempres-ytinitrotateid_1;"$default[$get[ytinitrotatetd+up_init];$getCache[tempres-ytinitrotateid_1]]"]
        $return[$get[httpytrotate_2]]
        ]
        $if[$env[successlog]==true;
        $wait[1s]
        $let[checkrotate-1;$callLocalFunction[attytrotate-1]]
        $if[$get[checkrotate-1]!=200;$let[abortproscookies;true];$if[$env[successlog]==true;$logger[Info;1 - Rotating | Youtube Cookies]]]
        ]
        $if[$get[abortproscookies]!=true;
        $wait[1s]
        $let[checkrotate-2;$callLocalFunction[attytrotate-2]]
        $if[$get[checkrotate-2]!=200;$let[abortproscookies;true];$if[$env[successlog]==true;$logger[Info;2 - Rotating | Youtube Cookies]]]
        $if[$get[abortproscookies]==true;
        $logger[Error;Cookie doesn't appear.]
        $logger[Warn;Re-trying in 10 seconds - Youtube Cookies]
        $setCache[retrycookiesyt;true]
        $stop
        ;
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_COOKIES=$get[ytinitcookies];YOUTUBE_COOKIES=$get[ytinitcookies_replacement]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        $if[$env[successlog]==true;
        $let[getpickclient;${tarClient()}]
        $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
        $let[defytdomain;$env[listclient;targetDomain]]
        $!jsonDelete[listclient;targetDomain]
        $!jsonSet[listclient;visitorData;$getCache[authmusic_youtube_visitor]]
        $!jsonSet[listclient;hl;en]
        $!jsonSet[listclient;gl;US]
        $let[testvideoid;fa5IWHDbftI]
        $logger[Warn;Rotated. Test Fetching | $get[testvideoid] ($get[getpickclient])]
        $let[testtempcookies;$djsEval[process.env.YOUTUBE_COOKIES]]
        $httpAddHeader[Accept-Encoding;]
        $httpAddHeader[Authorization;$callFunction[generateBearerYt;$get[testtempcookies];;$get[defytdomain]]]
        $httpAddHeader[Cookie;$get[testtempcookies]]
        $httpAddHeader[Origin;https://$get[defytdomain]]
        $httpAddHeader[X-Origin;https://$get[defytdomain]]
        $httpAddHeader[Referer;https://$get[defytdomain]]
        $httpAddHeader[Alt-Used;$get[defytdomain]]
        $httpAddHeader[X-Youtube-Bootstrap-Logged-In;true]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[X-Goog-Visitor-Id;$getCache[authmusic_youtube_visitor]]
        $httpAddHeader[User-Agent;$default[$env[listclient;userAgent];$callFunction[configMusic;default_userAgent]]]
        $httpAddHeader[X-Youtube-Client-Name;$env[listclient;clientName]]
        $httpAddHeader[X-Youtube-Client-Version;$env[listclient;clientVersion]]
        $httpAddHeader[X-Goog-AuthUser;0]
        $httpSetBody[{"videoId":"$get[testvideoid]","context":{"client":$jsonStringify[listclient],"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"racyCheckOk":true,"contentCheckOk":true}]
        $!httpRequest[https://$get[defytdomain]/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus(status);POST]
        $if[$httpResult[playabilityStatus;status]==OK;$logger[Info;Cookies & Auth are Valid. Continuing process];$logger[Warn;Failed to fetch.\nYoutube may blocked the ip address or the client doesn't support cookies. Continuing process]]
        ]]
        ;
        $logger[Error;Cookie doesn't appear. Can't continue this process.]
        ]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a33]!=;$cropText[$get[a33];0;12;...];Failed to Retrieve] | Youtube / DataSyncID]]
    ;$if[$hasCache[retrycookiesyt]==false;$logger[Info;Failed to Retrieve - Youtube]]]
    $if[$and[$get[a32]==;$get[abortproscookies]!=true];$logger[Warn;Re-trying - Youtube] $callFunction[generateAuthKeys;youtube;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==soundcloud];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://w.soundcloud.com/player/;GET]
        $arrayLoad[storeclientid]
        $arrayLoad[conres;script crossorigin src=";$httpResult]
        $arrayMap[conres;conrest;$return[$advancedTextSplit[$env[conrest];";0]];conres2]
        $!arrayShift[conres2]
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
    $let[spinitcookies;$trimLines[$trim[$djsEval[process.env.SPOTIFY_COOKIES]]]]
    $if[$or[$get[spinitcookies]==;$get[spinitcookies]==undefined]==false;
        $djsEval[const crypto = require('crypto')\\;

        const verifier = crypto.randomBytes(64).toString('base64url').slice(0, 128)\\;
        const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')\\;

        ctx.setKeyword("jasg", verifier)\\;
        ctx.setKeyword("jasc", challenge)\\;
        ]
        $httpAddHeader[Cookie;$get[spinitcookies]]
        $httpAddHeader[Referer;https://developer.spotify.com/]
        $httpAddHeader[Sec-Fetch-Dest;iframe]
        $httpAddHeader[Sec-Fetch-Site;same-site]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://accounts.spotify.com/oauth2/v2/auth?response_type=code&client_id=cfe923b2d660439caf2b557b21f31221&scope=&redirect_uri=https%3A%2F%2Fdeveloper.spotify.com&code_challenge=$get[jasc]&code_challenge_method=S256&response_mode=web_message&prompt=none;GET]
        $let[pkcode;$advancedTextSplit[$httpResult;"code": ";1;";0]]
        $httpAddHeader[Origin;https://developer.spotify.com/]
        $httpAddHeader[Referer;https://developer.spotify.com/]
        $httpAddHeader[Sec-Fetch-Dest;empty]
        $httpAddHeader[Sec-Fetch-Site;same-site]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Accept;application/json]
        $httpAddHeader[Content-Type;application/x-www-form-urlencoded]
        $httpSetBody[grant_type=authorization_code&client_id=cfe923b2d660439caf2b557b21f31221&code=$get[pkcode]&redirect_uri=https%3A%2F%2Fdeveloper.spotify.com&code_verifier=$get[jasg]]
        $httpSetContentType[Json]
        $!httpRequest[https://accounts.spotify.com/api/token;POST]
        $let[cjdspo;true]
        $let[token;$httpResult[access_token]]
        ;
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
        $let[parsejsspo;$advancedTextSplit[$httpResult;id="__NEXT_DATA__" type="application/json">;1;</script>;0]]
        $jsonLoad[parsejsspo;$default[$get[parsejsspo];{}]]
        $let[token;$env[parsejsspo;props;pageProps;state;settings;session;accessToken]]
        ]
        $if[$get[token]!=;$setCache[authmusic_spotify;$get[token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify / Key$if[$get[cjdspo]; (with Cookies)]]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify_token];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Accept;application/json]
        $httpSetBody[{"client_data":{"client_version":"1.0","client_id":"d8a5ed958d274c2e8ee717e6a4b0971d","js_sdk_data":{}}}]
        $!httpRequest[https://clienttoken.spotify.com/v1/clienttoken;POST]
        $let[token;$httpResult[granted_token;token]]
        $if[$get[token]!=;$setCache[authmusic_spotify_token;$get[token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify / Token]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify_token;;true]]
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
        $let[tidalurl;https://embed.tidal.com/tracks/$randomText[406956243;1550546;426987551;426987552;426987553]]
        $httpAddHeader[Sec-Fetch-Dest;iframe]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[$get[tidalurl];GET;tokens]
        $let[embti;$advancedTextSplit[$env[tokens];type="module";0;script src=";1;";0]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Sec-Fetch-Dest;script]
        $httpAddHeader[Referer;$get[tidalurl]]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com$get[embti];GET;rettokens]
        $let[finaltoken;$advancedTextSplit[$env[rettokens];.append("X-Tidal-Token";1;";1]]
        $if[$get[finaltoken]!=;$setCache[authmusic_tidal;$get[finaltoken]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    $if[$get[finaltoken]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tiktok];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Tiktok              | Token & Cookies;cyan]]
    $try[
        $let[finaljs;false]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $httpRequest[https://www.tiktok.com;GET]
        $let[los;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $if[$get[los]==;
        $if[$env[successlog]==true;$logger[Warn;WAF detected. Solving challenge - Tiktok]]
        $let[lks;$callFunction[wafTiktok;$httpResult]]
        $if[$get[lks]==0;$let[finaljs;true]]
        $if[$get[finaljs]==false;
        $httpAddHeader[Cookie;$get[lks]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $httpRequest[https://www.tiktok.com;GET]
        $let[finalck;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $if[$get[finalck]==;$let[finaljs;true]]
        $if[$get[finaljs]==false;
        $let[a13;$get[finalck]]
        $let[a12;$advancedTextSplit[$httpResult;"wid":";1;";0]]
        ]]]
        $if[$get[finaljs]==true;
        $if[$env[successlog]==true;$logger[Warn;Failed to solve. Using fallback - Tiktok]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept;application/json]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://www.tiktok.com/node/common/location;GET]
        $let[a13;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $jsonLoad[runtik;$httpResult]
        $let[a12;$env[runtik;body;webId]]
        ;
        $if[$has[finalck]==false;
        $let[a13;$get[los]]
        $let[a12;$advancedTextSplit[$httpResult;"wid":";1;";0]]
        ]]
        $if[$get[a13]!=;$setCache[authmusic_tiktok;$deflate[$get[a13];base64]]]
        $if[$get[a12]!=;$setCache[authmusic_tiktok_did;"$get[a12]"]]
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
        $if[$advancedTextSplit[$httpResult;return"Bearer ;1;";0]!=;
        $let[xts_ot;$advancedTextSplit[$httpResult;return"Bearer ;1;";0]]
        ;
        $let[xts_ot;$advancedTextSplit[$httpResult;"Authorization;0;=";$charCount[$advancedTextSplit[$httpResult;"Authorization;0];="];";0]]
        ]
        $let[xts_qi;$advancedTextSplit[$get[ts];queryId:;$charCount[$get[ts];queryId:];";1]]
        $let[lck;$advancedTextSplit[$httpResult;operationName:"TweetResultByRestId";1;featureSwitches:;1;,field;0]]
        $jsonLoad[oiang;$get[lck]]
        $jsonLoad[oiang_res;{}]
        $arrayForEach[oiang;oiasg;$!jsonSet[oiang_res;$env[oiasg];false]]
        $if[$env[oiang_res]!={};
        $let[xts_ft;$jsonStringify[oiang_res]]
        ]
        $if[$get[xts_ot]!=;$setCache[authmusic_twitter;$get[xts_ot]]]
        $if[$get[xts_qi]!=;$setCache[authmusic_twitter_qid;$get[xts_qi]]]
        $if[$get[xts_ft]!=;$setCache[authmusic_twitter_features;$get[xts_ft]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ot]!=;$cropText[$get[xts_ot];0;12;...];Failed to Retrieve] | Twitter / Token]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_qi]!=;$cropText[$get[xts_qi];0;12;...];Failed to Retrieve] | Twitter / QueryID]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ft]!=;$cropText[$get[xts_ft];0;12;...];Failed to Retrieve] | Twitter / Features]]
        ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$or[$get[xts_ot]==;$get[xts_qi]==;$get[xts_ft]==];$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==twitter_cookies];
    $if[$get[typedebug];$chalkLog[\\[OTHER\\] Generating Twitter              | Cookies;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Authorization;Bearer $getCache[authmusic_twitter]]
        $httpSetContentType[Text]
        $!httpRequest[https://api.x.com/1.1/guest/activate.json;POST;oas]
        $if[$isJSON[$env[oas]];$jsonLoad[oas;$env[oas]]]
        $if[$env[oas;guest_token]!=;
        $arrayLoad[oalvm;\\;;$httpGetHeader[Set-Cookie]]
        $arrayMap[oalvm;b;$return[$default[$advancedTextSplit[$env[b];, ;1];$advancedTextSplit[$env[b]; ;0]]];oalvm]
        $arrayMap[oalvm;b;$if[$and[$charCount[$env[b]; ]==0;$charCount[$env[b]]!=0];$return[$env[b]]];oalvm]
        $arrayPush[oalvm;guest_token=$env[oas;guest_token]]
        $let[xts_ry;$deflate[$arrayJoin[oalvm;\\; ];base64]]
        ]
        $if[$get[xts_ry]!=;$setCache[authmusic_twitter_cookies;$get[xts_ry]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ry]!=;$cropText[$get[xts_ry];0;12;...];Failed to Retrieve] | Twitter / Cookies]]
    ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$get[xts_ry]==;$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter_cookies;;true]]
    ]
    $return
    `
}
