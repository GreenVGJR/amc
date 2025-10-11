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
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $let[typedebug;$callFunction[configMusic;debug_auth]]

    $if[$or[$env[type]==all;$env[type]==youtube];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Youtube             | Key & Visitor;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://www.youtube.com/embed?html5=1;GET;g3]
        $let[a3;$advancedTextSplit[$env[g3];"INNERTUBE_API_KEY":";1;";0]]
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $if[$get[a3]!=;$!setGlobalVar[authmusic_youtube_key;$get[a3]]]
        $if[$get[a32]!=;$!setGlobalVar[authmusic_youtube_visitor;$get[a32]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a3]!=;$cropText[$get[a3];0;12;...];Failed to Retrieve] | Youtube / Key]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a32]!=;$cropText[$get[a32];0;12;...];Failed to Retrieve] | Youtube / Visitor]]
    ;$logger[Info;Failed to Retrieve - Youtube]]
    $if[$and[$get[a3]==;$get[a32]==];$logger[Warn;Re-trying - Youtube] $callFunction[generateAuthKeys;youtube;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==soundcloud];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://w.soundcloud.com/player/;GET]
        $arrayLoad[storeclientid]
        $arrayLoad[conres;widget.sndcdn.com;$httpResult]
        $arrayMap[conres;conrest;$if[$checkContains[$env[conrest];.js];$return[https://widget.sndcdn.com$advancedTextSplit[$env[conrest];</script>;0;";0]]];conres2]
        $arrayForEach[conres2;conres3;
        $try[$!httpRequest[$env[conres3];GET]]
        $if[$charCount[$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";1]]==32;
        $arrayPushJSON[storeclientid;$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";1]]
        $arrayPushJSON[storeclientid;$advancedTextSplit[$httpResult;location.search;1;AlwaysAllowSeekStrategy;0;client_id;1;";3]]
        ]]
    $if[$env[storeclientid;0]!=;$!setGlobalVar[authmusic_soundcloud;$env[storeclientid;0]]]
    $if[$env[storeclientid;1]!=;$!setGlobalVar[authmusic_soundcloud_fall;$env[storeclientid;1]]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;0]!=;$cropText[$env[storeclientid;0];0;12;...];Failed to Retrieve] | Soundcloud / Player]]
    $if[$env[successlog]==true;$logger[Info;$if[$env[storeclientid;1]!=;$cropText[$env[storeclientid;1];0;12;...];Failed to Retrieve] | Soundcloud / Stream]]
    ;$logger[Info;Failed to Retrieve - Soundcloud]]
    $if[$and[$env[storeclientid;0]==;$env[storeclientid;1]==];$logger[Warn;Re-trying - Soundcloud] $callFunction[generateAuthKeys;soundcloud;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Key;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
        $let[token;$advancedTextSplit[$httpResult;"accessToken":";1;";0]]
        $if[$get[token]!=;$!setGlobalVar[authmusic_spotify;$get[token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[token]!=;$cropText[$get[token];0;12;...];Failed to Retrieve] | Spotify / Key]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==spotify_token];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpSetBody[{"client_data":{"client_version":"5.0","client_id":"d8a5ed958d274c2e8ee717e6a4b0971d","js_sdk_data":{}}}]
        $httpAddHeader[Accept;application/json]
        $httpAddHeader[Content-type;application/json]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpAddHeader[Origin;https://open.spotify.com/]
        $!httpRequest[https://clienttoken.spotify.com/v1/clienttoken;POST]
        $let[granted_token;$httpResult[granted_token;token]]
        $if[$get[granted_token]!=;$!setGlobalVar[authmusic_spotify_token;$get[granted_token]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[granted_token]!=;$cropText[$get[granted_token];0;12;...];Failed to Retrieve] | Spotify / Token]]
    ;$logger[Info;Failed to Retrieve - Spotify]]
    $if[$get[granted_token]==;$logger[Warn;Re-trying - Spotify] $callFunction[generateAuthKeys;spotify_token;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==amazonmusic];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Amazon Music        | Config & Token;cyan]]
    $try[
        $httpAddHeader[Origin;https://music.amazon.com/]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://music.amazon.com/config.json;GET;tokens]
        $if[$env[tokens;csrf;token]!=;$!setGlobalVar[authmusic_amazonmusic;$deflate[$env[tokens];base64]]]
        $if[$env[successlog]==true;$logger[Info;$if[$env[tokens;csrf;token]!=;$cropText[$env[tokens;csrf;token];0;12;...];Failed to Retrieve] | Amazon Music]]
    ;$logger[Info;Failed to Retrieve - Amazon Music]]
    $if[$env[tokens;csrf;token]==;$logger[Warn;Re-trying - Amazon Music] $callFunction[generateAuthKeys;amazonmusic;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tidal];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Tidal               | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com/tracks/$randomText[230917825;432597859;355309145;416356151;434875762];GET;tokens]
        $let[embti;$advancedTextSplit[$env[tokens];type="module";0;script src=";1;";0]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Content-Type;application/javascript]
        $httpAddHeader[Origin;https://embed.tidal.com]
        $httpSetContentType[Text]
        $!httpRequest[https://embed.tidal.com$get[embti];GET;rettokens]
        $let[finaltoken;$advancedTextSplit[$env[rettokens];.append("X-Tidal-Token";1;";1]]
        $if[$get[finaltoken]!=;$!setGlobalVar[authmusic_tidal;$get[finaltoken]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[finaltoken]!=;$cropText[$get[finaltoken];0;12;...];Failed to Retrieve] | Tidal]]
    ;$logger[Info;Failed to Retrieve - Tidal]]
    $if[$get[finaltoken]==;$logger[Warn;Re-trying - Tidal] $callFunction[generateAuthKeys;tidal;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==qobuz];
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Qobuz               | Cookie;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://www.qobuz.com/;HEAD;lskort]
        $let[a30;$httpGetHeader[Set-Cookie]]
        $if[$get[a30]!=;$!setGlobalVar[authmusic_qobuz;$deflate[$get[a30];base64]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a30]!=;$cropText[$deflate[$get[a30];base64];0;12;...];Failed to Retrieve] | Qobuz]]
    ;$logger[Info;Failed to Retrieve - Qobuz]]
    $if[$get[a30]==;$logger[Warn;Re-trying - Qobuz] $callFunction[generateAuthKeys;qobuz;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==tiktok];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Tiktok              | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Content-Type;application/json]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://www.tiktok.com/node/common/location;GET]
        $let[a13;$httpGetHeader[Set-Cookie]]
        $jsonLoad[runtik;$httpResult]
        $let[a12;$env[runtik;body;webId]]
        $if[$get[a13]!=;$!setGlobalVar[authmusic_tiktok;$deflate[$get[a13];base64]]]
        $if[$get[a12]!=;$!setGlobalVar[authmusic_tiktok_did;$get[a12]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a13]!=;$cropText[$deflate[$get[a13];base64];0;12;...];Failed to Retrieve] | Tiktok / Cookie]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a12]!=;$cropText[$get[a12];0;12;...];Failed to Retrieve] | Tiktok / Device ID]]
    ;$logger[Info;Failed to Retrieve - Tiktok]]
    $if[$and[$get[a12]==;$get[a13]==];$logger[Warn;Re-trying - Tiktok] $callFunction[generateAuthKeys;tiktok;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==applemusic];
    $if[$get[typedebug];$chalkLog[\\[SEARCH\\] Generating Apple Music         | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://music.apple.com/us/new;GET]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://music.apple.com$advancedTextSplit[$httpResult;script type="module" cross;1;";1;";0];GET;a14s]
        $let[a14;$advancedTextSplit[$env[a14s];ote="x-apple;0;throw gd("cl;1;const;1;=";1;";0]]
        $if[$get[a14]!=;$!setGlobalVar[authmusic_applemusic;$get[a14]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[a14]!=;$cropText[$get[a14];0;12;...];Failed to Retrieve] | Apple Music]]
    ;$logger[Info;Failed to Retrieve - Apple Music]]
    $if[$get[a14]==;$logger[Warn;Re-trying - Apple Music] $callFunction[generateAuthKeys;applemusic;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==deezer];
    $if[$get[typedebug];$chalkLog[\\[LYRIC\\] Generating Deezer               | Token;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpAddHeader[Accept;application/json]
        $httpSetContentType[Text]
        $!httpRequest[https://auth.deezer.com/login/anonymous?jo=p&rto=p;GET]
        $let[hgk;$advancedTextSplit[$httpResult;"jwt":";1;";0]]
        $if[$get[hgk]!=;$!setGlobalVar[authmusic_deezer;$get[hgk]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[hgk]!=;$cropText[$get[hgk];0;12;...];Failed to Retrieve] | Deezer]]
    ;$logger[Info;Failed to Retrieve - Deezer]]
    $if[$get[hgk]==;$logger[Warn;Re-trying - Deezer] $callFunction[generateAuthKeys;deezer;;true]]
    ]
    $if[$or[$env[type]==all;$env[type]==twitter];
    $if[$get[typedebug];$chalkLog[\\[OTHER\\] Generating Twitter              | Token & ID;cyan]]
    $try[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[https://x.com;GET]
        $arrayLoad[a;crossorigin="anonymous";$httpResult]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpSetContentType[Text]
        $!httpRequest[$advancedTextSplit[$env[a;$arrayFindIndex[a;b;$checkCondition[$advancedTextSplit[$env[b];client-web/main;1]!=]]];href=";1;";0];GET]
        $let[ts;$advancedTextSplit[$httpResult;operationName:"TweetResultByRestId";0]]
        $let[xts_ot;$advancedTextSplit[$httpResult;return"Bearer ;1;";0]]
        $let[xts_qi;$advancedTextSplit[$get[ts];queryId:;$charCount[$get[ts];queryId:];";1]]
        $if[$get[xts_ot]!=;$!setGlobalVar[authmusic_twitter;$get[xts_ot]]]
        $if[$get[xts_qi]!=;$!setGlobalVar[authmusic_twitter_qid;$get[xts_qi]]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_ot]!=;$cropText[$get[xts_ot];0;12;...];Failed to Retrieve] | Twitter / Token]]
        $if[$env[successlog]==true;$logger[Info;$if[$get[xts_qi]!=;$cropText[$get[xts_qi];0;12;...];Failed to Retrieve] | Twitter / QueryID]]
    ;$logger[Info;Failed to Retrieve - Twitter]]
    $if[$and[$get[xts_ot]==;$get[xts_qi]==];$logger[Warn;Re-trying - Twitter] $callFunction[generateAuthKeys;twitter;;true]]
    ]
    $return
    `
}