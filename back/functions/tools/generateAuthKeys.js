const { tarClient, tarClientYT } = require('../helpers/clientYoutube.js');

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
    $if[$env[successlog]==true;
    $let[genpotytlk;$callFunction[generateColdPotYoutube]]
    $setCache[initclientmusic;authmusic_youtube_pot;$get[genpotytlk]]
    $logger[Info;$if[$get[genpotytlk]!=;$cropText[$get[genpotytlk];0;12;...];Failed to Retrieve] | Youtube / POT]
    ]
    $if[$and[$callFunction[configMusic;useClientYT]==ANDROID_VR;$callFunction[configMusic;useBearer]==true];
    $if[$env[successlog]==true;$logger[Info;Using Youtube Token. Looking auth]]
    $jsonLoad[lrtuy;$callFunction[generateTokenYoutube;true]]
    $if[$env[lrtuy]==false;
    $logger[Warn;This client does not support OAuth2. Skipping]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Content-Type;application/json]
    $httpSetBody[{"context":{"client":{"clientName":1,"clientVersion":"2.20261231"}}}]
    $httpSetContentType[Text]
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?prettyPrint=false&alt=json&fields=responseContext(visitorData);POST]
    $if[$isJSON[$httpResult];
    $jsonLoad[fffyl;$httpResult]
    $let[a32;$env[fffyl;responseContext;visitorData]]
    $setCache[initclientmusic;authmusic_youtube_visitor;$get[a32]]
    ]
    $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
    ;
    $let[ytinitcookies;$trimLines[$trim[$djsEval[process.env.YOUTUBE_COOKIES]]]]
    $let[ytinitua;$trimLines[$trim[$djsEval[process.env.YOUTUBE_UA]]]]
    $try[
        $localFunction[testfetchvtyt;
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[User-Agent;$if[$or[$get[ytinitua]==;$get[ytinitua]==undefined]==false;$get[ytinitua];$get[agent]]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Sec-Fetch-Dest;document]
        $httpAddHeader[Sec-Fetch-Site;none]
        $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;
        $if[$and[$env[cookielog]!=true;$env[successlog]==true];$logger[Info;Using Youtube Cookies. Attempting to rotating]
        $if[$and[$env[dlk]==false;$or[$get[ytinitua]==;$get[ytinitua]==undefined]];$logger[Warn;Using default User Agent. Rotation may fails]]
        ]
        $httpAddHeader[Cookie;$get[ytinitcookies]]
        ]
        $httpSetContentType[Text]
        $if[$env[dlk]==false;
        $let[checkythttp;$httpRequest[https://www.youtube.com/results;GET;g3]]
        ;
        $let[checkythttp;$httpRequest[https://www.youtube.com;GET;g3]]
        ]
        $if[$get[checkythttp]==200;
        $if[$and[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;$advancedTextSplit[$env[g3];"LOGIN_INFO":";1;";0]==];
        $let[abortproscookies;true]
        $logger[Error;Cookies no longer active. Please put a new one - Youtube]
        $if[$env[successlog]==true;$logger[Info;Continuing process]]
        ;
        $if[$and[$checkContains[$httpGetHeader[Set-Cookie];SIDCC];$env[successlog]==true];$logger[Info;1 - Rotating | Youtube Cookies]]
        ]
        ;
        $if[$env[successlog]==true;$logger[Warn;($get[checkythttp]) Can't retrieve web content$if[$env[ftst]!=false;. Some features might not available] - Youtube]]
        $if[$env[ftst]==false;
        $if[$env[successlog]==true;$logger[Warn;Re-trying (Fallback) - Youtube]]
        $callLocalFunction[testfetchvtyt;true;true]
        $return
        ]]
        ;dlk;ftst]
        $callLocalFunction[testfetchvtyt;false;false]
        $if[$advancedTextSplit[$env[g3];"visitorData":";1;";0]!=;
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $setCache[initclientmusic;authmusic_youtube_visitor;$get[a32]]
        ;
        $if[$env[successlog]==true;$logger[Warn;InnerTube: Re-trying (Fallback)]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Content-Type;application/json]
        $httpSetBody[{"context":{"client":{"clientName":1,"clientVersion":"2.20261231"}}}]
        $httpSetContentType[Text]
        $!httpRequest[https://www.youtube.com/youtubei/v1/player?prettyPrint=false&alt=json&fields=responseContext(visitorData);POST]
        $if[$isJSON[$httpResult];
        $jsonLoad[fffyl;$httpResult]
        $let[a32;$env[fffyl;responseContext;visitorData]]
        $setCache[initclientmusic;authmusic_youtube_visitor;$get[a32]]
        ;
        $if[$env[successlog]==true;$logger[Error;InnerTube: Can't continue the process]]
        ]]
        $let[tempCookiesYTEnv;$djsEval[process.env.YOUTUBE_ANONCOOKIES]]
        $let[tempCookiesYT;$callFunction[filterCookies;2;$get[tempCookiesYTEnv];$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]]
        $let[a33;$advancedTextSplit[$advancedTextSplit[$env[g3];"DATASYNC_ID":";1;";0];||;0]]
        $if[$get[a33]!=;$setCache[initclientmusic;authmusic_youtube_datasync_id;$get[a33]]]
        $jsonLoad[listconfig;$getCache[initclientmusic;system_file-config]]
        $if[$and[$env[successlog]==true;$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]];
        $setCache[initclientmusic;authmusic_youtube_tempcookies;$get[tempCookiesYT]]
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_ANONCOOKIES=$get[tempCookiesYTEnv];YOUTUBE_ANONCOOKIES=$get[tempCookiesYT]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        ]
        $if[$and[$get[abortproscookies]!=true;$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false];
        $localFunction[cookiessid;
        $let[tempgrinitcs;$default[$get[ytinitcookies_replacement];$get[ytinitcookies]]]
        $let[tempfrreslm1;$callFunction[filterCookies;0;$get[tempgrinitcs]]]
        $let[tempfrreslm2;$callFunction[filterCookies;1;$env[56fe40cf]]]
        $let[ytinitcookies_replacement;$callFunction[filterCookies;2;$get[tempfrreslm1];$get[tempfrreslm2]]]
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
        $if[$get[httpytrotate]==403;
        $logger[Warn;This client doesn't support cookies | Youtube Cookies]
        $setCache[initclientmusic;disablecookiesyt;true]
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
        $httpSetBody[\\[null,"$default[$get[ytinitrotateid+hp_init];$getCache[initclientmusic;tempres-ytinitrotateid_0]]",$default[$get[ytinitrotatetd+up_init];$getCache[initclientmusic;tempres-ytinitrotateid_1]]\\]]
        $let[httpytrotate_2;$httpRequest[https://accounts.youtube.com/RotateCookies;POST;g3_2]]
        ]
        $onlyIf[$get[httpytrotate_2]==200;$return[0]]
        $callLocalFunction[cookiessid;$httpGetHeader[Set-Cookie];$checkContains[$httpGetHeader[Set-Cookie];__Secure-1PSIDTS;__Secure-3PSIDTS]]
        $setCache[initclientmusic;tempres-ytinitrotateid_0;"$default[$get[ytinitrotateid+hp_init];$getCache[initclientmusic;tempres-ytinitrotateid_0]]"]
        $setCache[initclientmusic;tempres-ytinitrotateid_1;"$default[$get[ytinitrotatetd+up_init];$getCache[initclientmusic;tempres-ytinitrotateid_1]]"]
        $return[$get[httpytrotate_2]]
        ]
        $if[$env[successlog]==true;
        $let[checkrotate-1;$callLocalFunction[attytrotate-1]]
        $if[$get[checkrotate-1]!=200;$let[abortproscookies;true];$if[$env[successlog]==true;$logger[Info;2 - Rotating | Youtube Cookies]]]
        ]
        $if[$get[abortproscookies]!=true;
        $let[checkrotate-2;$callLocalFunction[attytrotate-2]]
        $if[$get[checkrotate-2]!=200;$let[abortproscookies;true];$if[$env[successlog]==true;$logger[Info;3 - Rotating | Youtube Cookies]]]
        $if[$get[abortproscookies]==true;
        $logger[Error;Cookie doesn't appear.]
        $logger[Warn;Re-trying in 10 seconds - Youtube Cookies]
        $setCache[initclientmusic;retrycookiesyt;true]
        $stop
        ;
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_COOKIES=$get[ytinitcookies];YOUTUBE_COOKIES=$get[ytinitcookies_replacement]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        $if[$env[successlog]==true;
        $let[getpickclient;${tarClient()}]
        $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
        $let[defytdomain;$env[listclient;targetDomain]]
        $!jsonDelete[listclient;targetDomain]
        $!jsonDelete[listclient;client_id]
        $!jsonDelete[listclient;client_secret]
        $!jsonSet[listclient;visitorData;$getCache[initclientmusic;authmusic_youtube_visitor]]
        $!jsonSet[listclient;hl;en]
        $!jsonSet[listclient;gl;US]
        $let[testvideoid;fa5IWHDbftI]
        $logger[Warn;Solving challenge - Youtube Cookies]

        $let[testtempcookies;$djsEval[process.env.YOUTUBE_COOKIES]]
        $let[signatureTimestamp;$djsEval[require('youtubei.js').Player.create().then(p=>p.signature_timestamp)]]

        $httpAddHeader[Accept-Encoding;]
        $httpAddHeader[Cookie;$get[testtempcookies]]
        $httpAddHeader[Origin;https://$get[defytdomain]]
        $httpAddHeader[X-Origin;https://$get[defytdomain]]
        $httpAddHeader[X-Youtube-Bootstrap-Logged-In;true]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[X-Goog-Visitor-Id;$getCache[initclientmusic;authmusic_youtube_visitor]]
        $httpAddHeader[User-Agent;$default[$env[listclient;userAgent];$callFunction[configMusic;default_userAgent]]]
        $httpAddHeader[X-Youtube-Client-Name;$env[listclient;clientName]]
        $httpAddHeader[X-Youtube-Client-Version;$env[listclient;clientVersion]]
        $httpSetBody[{"context":{"client":$jsonStringify[listclient]}}]
        $let[nncps;$httpRequest[https://$get[defytdomain]/youtubei/v1/config?prettyPrint=false;POST]]

        $if[$httpResult[responseContext;globalConfigGroup]!=;
        $jsonLoad[cfgytweb;{}]
        $!jsonSet[cfgytweb;coldConfigData;$httpResult[responseContext;globalConfigGroup;rawColdConfigGroup;configData]]
        $!jsonSet[cfgytweb;coldHashData;$httpResult[responseContext;globalConfigGroup;coldHashData]]
        $!jsonSet[cfgytweb;hotHashData;$httpResult[responseContext;globalConfigGroup;hotHashData]]
        $!jsonSet[listclient;configInfo;$env[cfgytweb]]
        ]

        $logger[Info;Cookies Rotated. Test Fetching | $get[testvideoid] ($get[getpickclient])]
        $httpAddHeader[Accept-Encoding;]
        $httpAddHeader[Authorization;$callFunction[generateBearerYt;$get[testtempcookies];$getCache[initclientmusic;authmusic_youtube_datasync_id];$get[defytdomain]]]
        $httpAddHeader[Cookie;$get[testtempcookies]]
        $httpAddHeader[Origin;https://$get[defytdomain]]
        $httpAddHeader[X-Origin;https://$get[defytdomain]]
        $httpAddHeader[Referer;https://$get[defytdomain]]
        $httpAddHeader[Alt-Used;$get[defytdomain]]
        $httpAddHeader[X-Youtube-Bootstrap-Logged-In;true]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[X-Goog-Visitor-Id;$getCache[initclientmusic;authmusic_youtube_visitor]]
        $httpAddHeader[User-Agent;$default[$env[listclient;userAgent];$callFunction[configMusic;default_userAgent]]]
        $httpAddHeader[X-Youtube-Client-Name;$env[listclient;clientName]]
        $httpAddHeader[X-Youtube-Client-Version;$env[listclient;clientVersion]]
        $httpAddHeader[X-Goog-AuthUser;0]
        $httpSetBody[{"videoId":"$get[testvideoid]","context":{"client":$jsonStringify[listclient]},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":false,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1","signatureTimestamp":"$get[signatureTimestamp]"}},"racyCheckOk":true,"contentCheckOk":true,"cpn":"$randomString[16]"}]
        $let[nncm;$httpRequest[https://$get[defytdomain]/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus(status);POST]]
        $if[$httpResult[playabilityStatus;status]==OK;$logger[Info;Cookies & Auth are Valid. Continuing process];$if[$get[nncm]==400;$setCache[initclientmusic;disablecookiesyt;true]] $logger[Warn;$if[$get[nncm]==400;This client doesn't support cookies.;Failed to fetch.\nYoutube may blocked the ip address or the client doesn't support cookies.] Continuing process]]
        ]]
        ;
        $logger[Error;Cookie doesn't appear. Can't continue this process.]
        ]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a33]!=;$cropText[$get[a33];0;12;...];Failed to Retrieve] | Youtube / DataSyncID]]
    ;$if[$hasCache[initclientmusic;retrycookiesyt]==false;$logger[Info;Failed to Retrieve - Youtube]]]
    ]
    $if[$and[$get[a32]==;$get[abortproscookies]!=true];$logger[Warn;Re-trying - Youtube] $callFunction[generateAuthKeys;youtube;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==soundcloud];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $let[schttp;$httpRequest[https://w.soundcloud.com/player/;GET]]
        $if[$get[schttp]==403;
        $if[$env[successlog]==true;
        $logger[Warn;You have been blocked. - Soundcloud]
        ]
        $let[abortscht;true]
        $return
        ]
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
    $if[$env[storeclientid;0]!=;$setCache[initclientmusic;authmusic_soundcloud;$env[storeclientid;0]]]
    $if[$env[storeclientid;1]!=;$setCache[initclientmusic;authmusic_soundcloud_fall;$env[storeclientid;1]]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;0]!=;$cropText[$env[storeclientid;0];0;12;...];Failed to Retrieve] | Soundcloud / Player]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;1]!=;$cropText[$env[storeclientid;1];0;12;...];Failed to Retrieve] | Soundcloud / Stream]]
    ;$logger[Info;Failed to Retrieve - Soundcloud]]
    $if[$and[$env[storeclientid;0]==;$env[storeclientid;1]==;$get[abortscht]!=true];$logger[Warn;Re-trying - Soundcloud] $callFunction[generateAuthKeys;soundcloud;;true]]
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
        $if[$get[token]!=;$setCache[initclientmusic;authmusic_spotify;$get[token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify / Key$if[$get[cjdspo]; (with Cookies)]]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify_player];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Key;cyan]]
    $try[
    $let[spinitcookies;$trimLines[$trim[$djsEval[process.env.SPOTIFY_COOKIES]]]]
    $httpAddHeader[Cookie;$get[spinitcookies]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpSetContentType[Text]
    $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
    $let[parsejsspo;$advancedTextSplit[$httpResult;id="__NEXT_DATA__" type="application/json">;1;</script>;0]]
    $jsonLoad[parsejsspo;$default[$get[parsejsspo];{}]]
    $let[token;$env[parsejsspo;props;pageProps;state;settings;session;accessToken]]
    $if[$get[token]!=;$setCache[initclientmusic;authmusic_spotify_fall;$get[token]]]
    $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify - Alt / Key$if[$env[parsejsspo;props;pageProps;state;settings;session;isAnonymous]==false; (with Cookies)]]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify_player;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify_token];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Accept;application/json]
        $httpSetBody[{"client_data":{"client_version":"1.0","client_id":"f6a40776580943a7bc5173125a1e8832","js_sdk_data":{}}}]
        $!httpRequest[https://clienttoken.spotify.com/v1/clienttoken;POST]
        $let[token;$httpResult[granted_token;token]]
        $if[$get[token]!=;$setCache[initclientmusic;authmusic_spotify_token;$get[token]]]
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
        $if[$env[tokens;csrf;token]!=;$setCache[initclientmusic;authmusic_amazonmusic;$env[tokens]]]
        $if[$env[successlog]==true;$logger[Info;$if[$env[tokens;csrf;token]!=;$cropText[$env[tokens;csrf;token];0;12;...];Failed to Retrieve] | Amazon Music]]
    ;$logger[Info;Failed to Retrieve - Amazon Music]]
    $if[$env[tokens;csrf;token]==;$logger[Warn;Re-trying - Amazon Music] $callFunction[generateAuthKeys;amazonmusic;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tidal];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Tidal               | Token;cyan]]
    $if[a!=a;
    $try[
        $let[tidalids;$randomText[406956243;1550546;426987551;426987552;426987553]]
        $let[tidalurl;https://tidal.com/track/$get[tidalids]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $let[ttjf;$httpRequest[$get[tidalurl];GET;tokenslf]]
        $if[$get[ttjf]==200;
        $let[kkfti;$advancedTextSplit[$env[tokenslf];/assets/store;1;";0]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Sec-Fetch-Dest;script]
        $httpAddHeader[Referer;$get[tidalurl]]
        $httpSetContentType[Text]
        $!httpRequest[https://tidal.com/assets/store$get[kkfti];GET;rettokenslf]
        $let[lookattr;$advancedTextSplit[$env[rettokenslf];USE_STAGE_APIS;0]]
        $let[findattr;$advancedTextSplit[$get[lookattr];env:\`PROD\`;0;\\[;$charCount[$advancedTextSplit[$get[lookattr];env:\`PROD\`;0];\\[];,;0]]
        $let[finaltoken;$advancedTextSplit[$get[lookattr];$get[findattr]=\`;1;\`;0]]
        ;
        $let[embedtidalurl;https://embed.tidal.com/tracks/$get[tidalids]]
        $httpAddHeader[Sec-Fetch-Dest;iframe]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[$get[embedtidalurl];GET;tokens]
        $let[embti;$advancedTextSplit[$env[tokens];type="module";0;script src=";1;";0]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Sec-Fetch-Dest;script]
        $httpAddHeader[Referer;$get[embedtidalurl]]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com$get[embti];GET;rettokens]
        $let[finaltoken;$advancedTextSplit[$env[rettokens];.append("X-Tidal-Token";1;";1]]
        ]
        $if[$get[finaltoken]!=;$setCache[initclientmusic;authmusic_tidal;$get[finaltoken]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal / Token]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    ]
    $let[finaltoken;txNoH4kkV41MfH25] $c[Static key]
    $setCache[initclientmusic;authmusic_tidal;$get[finaltoken]]
    $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal / Token]]
    $if[$get[finaltoken]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tidal_token];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Tidal               | Auth;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Content-Type;application/x-www-form-urlencoded]
        $c[Seems static]
        $httpSetBody[client_id=$getCache[initclientmusic;authmusic_tidal]&client_secret=dQjy0MinCEvxi1O4UmxvxWnDjt4cgHBPw8ll6nYBk98%3D&grant_type=client_credentials]
        $!httpRequest[https://auth.tidal.com/v1/oauth2/token;POST;jjgk]
        $let[finalauth;$env[jjgk;access_token]]
        $if[$get[finalauth]!=;$setCache[initclientmusic;authmusic_tidal_token;$get[finalauth]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finalauth]!=;$cropText[$get[finalauth];0;12;...];Failed to Retrieve] | Tidal / Auth]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    $if[$get[finalauth]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal_token;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tiktok];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Tiktok              | Token & Cookies;cyan]]
    $try[
        $let[finaljs;false]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Referer;https://www.tiktok.com/]
        $httpSetContentType[Text]
        $let[checkstatustt;$httpRequest[https://www.tiktok.com/node-webapp/api/common-app-context;GET;nioang]]
        $let[los;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $if[$or[$env[nioang]==;$get[los]==];
        $let[finaljs;true]
        ;
        $jsonLoad[nioang;$env[nioang]]
        $let[a12;$env[nioang;wid]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpAddHeader[Cookie;$get[los]]
        $httpAddHeader[Referer;https://www.tiktok.com/]
        $httpSetContentType[Text]
        $let[checkstatustt;$httpRequest[https://www.tiktok.com/node-webapp/api/biz-context?app_name=desktop;GET;nioang2]]
        $let[los2;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $if[$or[$env[nioang2]==;$get[los2]==];
        $let[finaljs;true]
        ;
        $let[lod;$callFunction[filterCookies;2;$get[los];$get[los2]]]
        $let[a13;$get[lod]]
        ]]
        $if[$get[finaljs]==true;
        $if[$env[successlog]==true;
        $c[Sometime 200 but blank page but i didnt test further]
        $if[$or[$get[checkstatustt]==403;$get[checkstatustt]==429];
        $logger[Warn;You have been blocked. Using fallback - Tiktok]
        ;
        $logger[Error;Can't retrieve contents. Using fallback - Tiktok]
        ]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept;application/json]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://www.tiktok.com/node/common/location;GET]
        $let[a13;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $jsonLoad[runtik;$httpResult]
        $let[a12;$env[runtik;body;webId]]
        ]
        $if[$get[a13]!=;$setCache[initclientmusic;authmusic_tiktok;$deflate[$get[a13];base64]]]
        $if[$get[a12]!=;$setCache[initclientmusic;authmusic_tiktok_did;"$get[a12]"]]
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
        $if[$get[a14]!=;$setCache[initclientmusic;authmusic_applemusic;$get[a14]]]
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
        $if[$get[hgk]!=;$setCache[initclientmusic;authmusic_deezer;$get[hgk]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[hgk]!=;$cropText[$get[hgk];0;12;...];Failed to Retrieve] | Deezer]]
    ;$logger[Info;Failed to Retrieve - Deezer]]
    $if[$get[hgk]==;$logger[Warn;Re-trying - Deezer] $callFunction[generateAuthKeys;deezer;;true]]
    ]
    $return
    `
}
