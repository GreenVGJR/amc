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

    $let[lyric1;$getGlobalVar[authmusic_azlyrics]]

    $let[aa;$getGlobalVar[authmusic_youtube_key]]
    $let[b;$getGlobalVar[authmusic_soundcloud]]
    $let[c;$getGlobalVar[authmusic_spotify]]
    $let[c1;$getGlobalVar[authmusic_spotify_token]]
    $let[d;$getGlobalVar[authmusic_amazonmusic]]
    $let[e;$getGlobalVar[authmusic_deezer]]

    $if[$or[$get[lyric1]==;$env[type]==all;$env[type]==azlyrics];
    $try[
    $async[
        $if[$get[typedebug];$chalkLog[\\[LYRIC\\]  Generating AZLyrics            | Token;cyan]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://www.azlyrics.com/geo.js;GET;g1]
        $let[a1;$advancedTextSplit[$env[g1];"value",;1;";1;";0]]
        $if[$get[a1]!=;$!setGlobalVar[authmusic_azlyrics;$get[a1]]]
        $if[$env[successlog]==true;$log[$if[$get[a1]!=;OK - $cropText[$get[a1];0;12;...];Failed to Retrieve] - AZLyrics]]
    ]
    ;$log[Failed to Retrieve - AZLyrics]]
    ]
    $if[$or[$get[aa]==;$env[type]==all;$env[type]==youtube];
    $try[
    $async[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://www.youtube.com/embed;GET;g3]
        $let[a3;$advancedTextSplit[$env[g3];"INNERTUBE_API_KEY":";1;";0]]
        $let[a32;$advancedTextSplit[$env[g3];"visitorData":";1;";0]]
        $if[$get[a3]!=;$!setGlobalVar[authmusic_youtube_key;$get[a3]]]
        $if[$get[a32]!=;$!setGlobalVar[authmusic_youtube_visitor;$get[a32]]]
        $if[$env[successlog]==true;$log[$if[$get[a3]!=;OK - $cropText[$get[a3];0;12;...];Failed to Retrieve] - InnerTube (Youtube)]]
        $if[$env[successlog]==true;$log[$if[$get[a32]!=;OK - $cropText[$get[a32];0;12;...];Failed to Retrieve] - Visitor (Youtube)]]
    ]
    ;$log[Failed to Retrieve - InnerTube (Youtube)]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating InnerTube (Youtube) | Key;cyan]]
    ]
    $if[$or[$get[b]==;$env[type]==all;$env[type]==soundcloud];
    $try[
    $async[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://m.soundcloud.com;GET;g1]
        $let[a2;$advancedTextSplit[$env[g1];"clientId":";1;";0]]
        $if[$get[a2]!=;$!setGlobalVar[authmusic_soundcloud;$get[a2]]]
        $if[$env[successlog]==true;$log[$if[$get[a2]!=;OK - $cropText[$get[a2];0;12;...];Failed to Retrieve] - Soundcloud]]
    ]
    ;$log[Failed to Retrieve - Soundcloud]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Soundcloud          | ClientID;cyan]]
    ]
    $if[$or[$get[c]==;$get[c1]==;$env[type]==all;$env[type]==spotify];
    $try[
    $async[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://open.spotify.com/embed/track/$randomText[4PTG3Z6ehGkBFwjybzWkR8;2yR2sziCF4WEs3klW1F38d;0IuVhCflrQPMGRrOyoY5RW;2yWlGEgEfPot0lv3OAjuG3;4Xfp9BcKrKYmxJPxn68Yb8;7uuJqaRjSXzja6VGgDpWem;3BP1klbHxsOf6IxscNIX0r;6BYzwbWg1Z2EB6VUXTYnhm];GET]
        $let[spd;$advancedTextSplit[$httpGetHeader[Set-Cookie];sp_t=;1;\\;;0]]
        $let[token;$advancedTextSplit[$httpResult;"accessToken":";1;";0]]
        $if[$get[token]!=;$!setGlobalVar[authmusic_spotify;$get[token]]]
        $if[$env[successlog]==true;$log[$if[$get[token]!=;OK - $cropText[$get[token];0;12;...];Failed to Retrieve] - Spotify / Key]]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpSetBody[{"client_data":{"client_version":"1.0","client_id":"d8a5ed958d274c2e8ee717e6a4b0971d","js_sdk_data":{"device_id":"$get[spd]"}}}]
        $httpAddHeader[Accept;application/json]
        $httpAddHeader[Content-type;application/json]
        $httpAddHeader[Accept-Encoding;gzip]
        $httpAddHeader[Origin;https://open.spotify.com/]
        $!httpRequest[https://clienttoken.spotify.com/v1/clienttoken;POST]
        $if[$httpResult[granted_token]!=;$!setGlobalVar[authmusic_spotify_token;$httpResult[granted_token;token]]]
        $if[$env[successlog]==true;$log[$if[$httpResult[granted_token;token]!=;OK - $cropText[$httpResult[granted_token;token];0;12;...];Failed to Retrieve] - Spotify / Token]]
    ]
    ;$log[Failed to Retrieve - Spotify]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Key;cyan]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Spotify             | Token;cyan]]
    ]
    $if[$or[$get[d]==;$env[type]==all;$env[type]==amazonmusic];
    $try[
    $async[
        $httpAddHeader[Origin;https://music.amazon.com/]
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://music.amazon.com/config.json;GET;tokens]
        $if[$env[tokens;csrf;token]!=;$!setGlobalVar[authmusic_amazonmusic;$deflate[$env[tokens];base64]]]
        $if[$env[successlog]==true;$log[$if[$env[tokens;csrf;token]!=;OK - $cropText[$env[tokens;csrf;token];0;12;...];Failed to Retrieve] - Amazon Music]]
    ]
    ;$log[Failed to Retrieve - Amazon Music]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Amazon Music        | Config & Token;cyan]]
    ]
    $if[$or[$get[e]==;$env[type]==all;$env[type]==deezer];
    $try[
    $async[
        $httpAddHeader[User-Agent;$get[agent]]
        $httpAddHeader[Origin;https://www.deezer.com]
        $httpAddHeader[Accept-Encoding;gzip]
        $!httpRequest[https://auth.deezer.com/login/anonymous?jo=p;GET;dee]
        $jsonLoad[zer;$env[dee]]
        $if[$env[zer;jwt]!=;$!setGlobalVar[authmusic_deezer;$env[zer;jwt]]]
        $if[$env[successlog]==true;$log[$if[$env[zer;jwt]!=;OK - $cropText[$env[zer;jwt];0;12;...];Failed to Retrieve] - Deezer]]
    ]
    ;$log[Failed to Retrieve - Deezer]]
    $if[$get[typedebug];$chalkLog[\\[PLAYER\\] Generating Deezer              | Token;cyan]]
    ]
    $wait[1s]
    $return
    `
}