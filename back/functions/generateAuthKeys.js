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
    $try[
        $httpAddHeader[Accept;*/*]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip, deflate, br]
        $httpSetContentType[Text]
        $!httpRequest[https://www.youtube.com/;GET;g3]
        $let[tempCookiesYT;$callFunction[filterCookies;1;$httpGetHeader[Set-Cookie]]]
        $setCache[authmusic_youtube_tempcookies;$get[tempCookiesYT]]
        $writeFile[.env;$replace[$readFile[.env];YOUTUBE_ANONCOOKIES=$djsEval[process.env.YOUTUBE_ANONCOOKIES];YOUTUBE_ANONCOOKIES=$get[tempCookiesYT]]]
        $!djsEval[require('dotenv').config({ override: true, quiet: true })]
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $if[$get[a32]!=;$setCache[authmusic_youtube_visitor;$get[a32]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
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
        $if[$get[finaltoken]!=;$setCache[authmusic_tidal;$get[finaltoken]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal / Token]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    ]
    $let[finaltoken;txNoH4kkV41MfH25] $c[Static key]
    $setCache[authmusic_tidal;$get[finaltoken]]
    $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal / Token]]
    $if[$get[finaltoken]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tiktok];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Tiktok              | Token & Cookies;cyan]]
    $try[
        $let[finaljs;false]
        $httpAddHeader[User-Agent;Mozilla/5.0 (Linux\\; Android 10\\; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0]
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
        $httpAddHeader[User-Agent;Mozilla/5.0 (Linux\\; Android 10\\; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0]
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
        $if[$advancedTextSplit[$httpResult;Bearer ;1;";0]!=;
        $let[xts_ot;$advancedTextSplit[$httpResult;Bearer ;1;";0]]
        ;
        $let[xts_ot;AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA]
        ]
        $let[xts_qi;$advancedTextSplit[$get[ts];queryId:;$charCount[$get[ts];queryId:];";1]]
        $let[lck;$advancedTextSplit[$httpResult;operationName:"TweetResultByRestId";1;featureSwitches:;1;,field;0]]
        $let[lcf;$advancedTextSplit[$httpResult;operationName:"TweetResultByRestId";1;fieldToggles:;1;};0]]
        $jsonLoad[oiang;$get[lck]]
        $jsonLoad[oiang_res;{}]
        $arrayForEach[oiang;oiasg;$!jsonSet[oiang_res;$env[oiasg];false]]
        $if[$env[oiang_res]!={};
        $let[xts_ft;$encodeURI[$jsonStringify[oiang_res]]]
        ]
        $jsonLoad[oiangt;$get[lcf]]
        $jsonLoad[oiangt_res;{}]
        $arrayForEach[oiangt;oiangt;$!jsonSet[oiangt_res;$env[oiangt];false]]
        $if[$env[oiangt_res]!={};
        $let[xts_fs;$encodeURI[$jsonStringify[oiangt_res]]]
        ]
        $if[$get[xts_ot]!=;$setCache[authmusic_twitter;$get[xts_ot]]]
        $if[$get[xts_qi]!=;$setCache[authmusic_twitter_qid;$get[xts_qi]]]
        $if[$get[xts_ft]!=;$setCache[authmusic_twitter_features;$get[xts_ft]]]
        $if[$get[xts_fs]!=;$setCache[authmusic_twitter_toggles;$get[xts_fs]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ot]!=;$cropText[$get[xts_ot];0;12;...];Failed to Retrieve] | Twitter / Token]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_qi]!=;$cropText[$get[xts_qi];0;12;...];Failed to Retrieve] | Twitter / QueryID]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ft]!=;$cropText[$get[xts_ft];0;12;...];Failed to Retrieve] | Twitter / Features]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_fs]!=;$cropText[$get[xts_fs];0;12;...];Failed to Retrieve] | Twitter / Toggles]]
        ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$or[$get[xts_ot]==;$get[xts_qi]==;$get[xts_ft]==;$get[xts_fs]==];$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter;;true]]
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
        $let[xts_rg;$env[oas;guest_token]]
        $let[xts_ry;$deflate[$arrayJoin[oalvm;\\; ];base64]]
        ]
        $if[$get[xts_ry]!=;$setCache[authmusic_twitter_cookies;$get[xts_ry]]]
        $if[$get[xts_rg]!=;$setCache[authmusic_twitter_token;"$get[xts_rg]"]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ry]!=;$cropText[$get[xts_ry];0;12;...];Failed to Retrieve] | Twitter / Cookies]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_rg]!=;$cropText[$get[xts_rg];0;12;...];Failed to Retrieve] | Twitter / Guest Token]]
    ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$or[$get[xts_rg]==;$get[xts_ry]==];$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter_cookies;;true]]
    ]
    $return
    `
}
