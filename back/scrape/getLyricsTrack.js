module.exports = {
    name: "getLyricsTrack",
    params: [{
        name: "query", // string
        description: "To get a Lyrics",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    },
    {
        name: "isExclude", // bool
        description: "Bypass player music only",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $let[time;$getTimestamp]
    $if[$env[isExclude]!=true;
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$trackInfo[url]]]
    $let[ytmusic;$try[$getYTLyricsMusic[$env[pulltrack;id]]]]
    ;
    $jsonLoad[pullyt;$try[$getYoutubeMusic[$env[query]];{}]]
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$env[pullyt;results;0;url]]]
    $let[ytmusic;$try[$getYTLyricsMusic[$env[pulltrack;id]]]]
    ]
    $if[$and[$env[pulltrack;type]==youtube;$get[ytmusic]!=];
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":null,"status_2":null,"response_time":"$env[pullyt;ping]","results":{"provider":"youtube","query":"$encodeURI[$env[query]]","url":"$if[$env[isExclude]!=true;$trackInfo[url];$env[pullyt;results;0;url]]","autocomplete":"$if[$env[isExclude]!=true;$decodeURI[$env[query]];$env[pullyt;results;0;title]]","lyric":"$deflate[$get[ytmusic];hex]"}}]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http_2;$httpRequest[https://lrclib.net/api/search?q=$env[query];GET;ges1]]
    $if[$env[ges1;0;id]!=;
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http_2],"status_2":null,"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"lrclib","query":"$encodeURI[$env[query]]","url":"https://lrclib.net/api/get/$env[ges1;0;id]","autocomplete":"$env[ges1;0;name]","lyric":"$deflate[$if[$env[ges1;0;instrumental];\\[Instrumental\\];$env[ges1;0;plainLyrics]];hex]"}}]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http_1;$httpRequest[https://genius.com/api/search/song?&per_page=1&q=$env[query];GET;ges]]
    $if[$env[ges;response;sections;0;hits;0]!=;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http2_1;$httpRequest[https://genius.com$env[ges;response;sections;0;hits;0;result;api_path]/embed.js;GET;ges2]]
    $let[a2;$advancedTextSplit[$replace[$replace[$env[ges2];\\\\;];<br>;];<p>;1;</p>;0]]
    $if[$advancedTextSplit[$get[a2];<a href=";1]!=;
    $arrayLoad[a2_rest;<a href=";$get[a2]]
    $let[r1;$advancedTextSplit[$get[a2];<a href=";0]]
    $arrayForEach[a2_rest;restore_a2;$let[r1;$get[r1]$advancedTextSplit[$env[restore_a2];https://;1;">;1]]]
    $let[a2;$get[r1]]
    ]
    $let[a2_filtering;$trimLines[$replace[$replace[$replace[$replace[$replace[$replace[$replace[$get[a2];<a>;];</a>;];<i>;];</i>;];<b>;];</b>;];";\\\\"]]]
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http_1],"status_2":$get[http2_1],"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"genius","query":"$encodeURI[$env[query]]","url":"$env[ges;response;sections;0;hits;0;result;url]","autocomplete":"$env[ges;response;sections;0;hits;0;result;title_with_featured]","lyric":"$deflate[$get[a2_filtering];hex]"}}]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http;$httpRequest[https://search.azlyrics.com/suggest.php?q=$encodeURI[$env[query]]&x=$getGlobalVar[authmusic_azlyrics];GET;res]]
    $let[cacsongs;$advancedTextSplit[$env[res];"songs":;1;\\[;1;\\];0]]
    $onlyIf[$get[cacsongs]!=;$return[{}]]
    $jsonLoad[cacheres;$replace[$env[res];\\\\;\\\\\\\\\\\\\\\\\\\\\\\\\\\\]]
    $let[a;$replace[$env[cacheres;songs;0;url];\\\\;]]
    $let[b;$env[cacheres;songs;0;autocomplete]]

    $httpAddHeader[User-Agent;$get[agent]]
    $let[http2;$httpRequest[$get[a];GET;res2]]
    $let[a1;$replace[$advancedTextSplit[$env[res2];class="lyricsh";1;<div>;1;</div>;0;-->;1];<br>;]]
    $let[a1;$trimLines[$replace[$replace[$replace[$replace[$replace[$replace[$replace[$get[a1];<a>;];</a>;];<i>;];</i>;];<b>;];</b>;];";\\\\"]]]
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http],"status_2":$get[http2],"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"azlyrics","query":"$encodeURI[$env[query]]","url":"$get[a]","autocomplete":"$get[b]","lyric":"$deflate[$get[a1];hex]"}}]]
    ]
    ]
    ]
    $return[$env[results;0]]
    `
}