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
    },
    {
        name: "line", // bool
        description: "Get line synced version",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $let[time;$getTimestamp]
    $if[$env[isExclude]!=true;
    $jsonLoad[currenttrack;$playerCurrentTrack[$env[guildId]]]
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$env[currenttrack;uri]]]
    $let[ytmusic;$try[$getYTLyricsMusic[$env[pulltrack;id];;$env[line]]]]
    ;
    $jsonLoad[pullyt;$try[$getYoutubeMusic[$env[query]];{}]]
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$env[pullyt;results;0;url]]]
    $let[ytmusic;$try[$getYTLyricsMusic[$env[pulltrack;id];;$env[line]]]]
    ]
    $if[$and[$env[pulltrack;type]==youtube;$get[ytmusic]!=];
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":null,"status_2":null,"response_time":"$env[pullyt;ping]","results":{"provider":"youtube","thumbnail":"https://i.ytimg.com/vi/$advancedTextSplit[$if[$env[isExclude]!=true;$env[currenttrack;uri];$env[pullyt;results;0;url]];?v=;1;&;0]/frame0.jpg","query":"$encodeURI[$env[query]]","url":"$if[$env[isExclude]!=true;$env[currenttrack;uri];$env[pullyt;results;0;url]]","autocomplete":"$encodeURI[$if[$env[isExclude]!=true;$env[query];$env[pullyt;results;0;title]]]","lyric":"$deflate[$get[ytmusic];hex]"}}]]
    ;
    $jsonLoad[drtcp;$callFunction[fastMetadataTrack;$env[query];deezer]]
    $if[$env[drtcp;id]!=;
    $generateAuthKeys[deezer;;false]
    $localFunction[lyrde;
    $try[
    $httpSetBody[{"operationName":"GetLyrics","variables":{"trackId":"$env[drtcp;id]"},"query":"$inflate[789c2b2c4d2daa54704f2df1a92cca4c2ed65029294a4ccef64cb152082e29cacc4b57d454a88ec953008b6ac0e560aa20923960ad1075a9152531790ac59579c91945f9799955a9293e9979a910c99ca2e490ccdcd4e292c4dc021037332f35264fa116816b01498b33f5;hex]"}]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br, zstd]
    $httpAddHeader[Authorization;Bearer $getCache[authmusic_deezer]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Content-Type;application/json]
    $httpSetContentType[Text]
    $let[http_3;$httpRequest[https://pipe.deezer.com/api;POST;ges9]]
    ]
    $if[$env[ges9]==;$callLocalFunction[lyrde;true]]
    ;refresh]
    $callLocalFunction[lyrde;false]
    $jsonLoad[res;$env[ges9]]
    ]
    $if[$and[$get[http_3]==200;$or[$env[res;data;track;lyrics;text]!=null;$env[res;data;track;lyrics;synchronizedLines]!=null]];
    $if[$and[$env[line]==true;$env[res;data;track;lyrics;synchronizedLines]!=null];
    $jsonLoad[syncLyDe;$if[$env[res;data;track;lyrics;synchronizedLines]==null;{};$env[res;data;track;lyrics;synchronizedLines]]]
    $arrayMap[syncLyDe;e;$return[$env[e;lrcTimestamp] $env[e;line]];syncLyDe]
    $let[finallyde;$arrayJoin[syncLyDe;
]]
    ]
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http_3],"status_2":null,"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"deezer","thumbnail":"$env[drtcp;thumbnail]","query":"$encodeURI[$env[query]]","url":"https://www.deezer.com/track/$env[drtcp;id]","autocomplete":"$encodeURI[$inflate[$env[drtcp;title];base64]]","lyric":"$deflate[$if[$and[$env[line]==true;$env[res;data;track;lyrics;synchronizedLines]!=null];$get[finallyde];$env[res;data;track;lyrics;text]];hex]"}}]]
    ;
    $let[cusshazamaborterls;false]
    $try[
    $jsonLoad[r;$callFunction[fastMetadataTrack;$env[query];applemusic]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $let[cer_appleurlms;$env[r;id]]
    $let[rs_http;$httpRequest[https://www.shazam.com/song/$advancedTextSplit[$env[r;id];?i=;1]/$advancedTextSplit[$env[r;id];/;$sub[$charCount[$env[r;id];/];1]];GET;prgn]]
    ;
    $let[cusshazamaborterls;true]
    ]
    $arrayLoad[results;]
    $jsonLoad[rts;$default[$advancedTextSplit[$env[prgn];script type="application/ld+json">;1;</script>;0];{}]]
    $let[crthumb-shazam;$env[rts;thumbnailUrl]]
    $if[$env[line]==true;
    $jsonLoad[a;$djsEval[require("entities").decodeHTML(\\\`$advancedTextSplit[$env[prgn];<script>;$charCount[$advancedTextSplit[$env[prgn];songLyrics;1];<script>];</script>;0;"f0:;1;\\\\n;0]\\\`)]]
    $jsonLoad[a;$jsonEntries[a]]
    $jsonLoad[a;$env[a;$arrayFindIndex[a;b;$checkCondition[$env[b;1;dataTestId]==songLyrics]];1;children;3;children;3;children;1;0;3;children]]
    $arrayMap[a;c;$if[$env[c;3;lyrics]!=;$return[$env[c;3;lyrics;lyricLines]]];a]
    $jsonLoad[b;$env[a]]
    $arrayLoad[c]
    $arrayForEach[b;d;$arrayForEach[d;f;
    $let[abr_t;$try[$unparseDigital[$if[$charCount[$advancedTextSplit[$env[f;startTimeInSeconds];.;0];:]<2;00:]$advancedTextSplit[$env[f;startTimeInSeconds];.;0]];$advancedTextSplit[$env[f;startTimeInSeconds];.;0]]]
    $let[abr_mt;$advancedTextSplit[$env[f;startTimeInSeconds];.;1]]
    $let[finalres;\\[$cropText[$parseDate[$get[abr_t];ISO];14;19].$get[abr_mt]\\] $env[f;content]]
    $arrayPushJSON[c;$get[finalres]]
    ]]
    $let[finallyric;$arrayJoin[c;
]]
    ;
    $let[finallyric;$env[rts;recordingOf;lyrics;text]]
    ]
    $if[$get[finallyric]==;$let[cusshazamaborterls;true]]
    $if[$get[cusshazamaborterls]==false;
    $arrayPushJSON[results;$trimLines[{"status_1":$get[rs_http],"status_2":null,"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"shazam","thumbnail":"$get[crthumb-shazam]","query":"$encodeURI[$env[query]]","url":"$get[cer_appleurlms]","autocomplete":"$encodeURI[$inflate[$env[r;title];base64]]","lyric":"$deflate[$get[finallyric];hex]"}}]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br, zstd]
    $let[http_2;$httpRequest[https://lrclib.net/api/search?q=$env[query];GET;ges1]]
    $onlyIf[$and[$env[line]==true;$or[$env[ges1;0;syncedLyrics]==;$env[ges1;0;syncedLyrics]==null]]!=true;$return[{}]]
    $if[$env[ges1;0;id]!=;
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http_2],"status_2":null,"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"lrclib","thumbnail":"$callFunction[useIcon;lrclib]","query":"$encodeURI[$env[query]]","url":"https://lrclib.net/api/get/$env[ges1;0;id]","autocomplete":"$encodeURI[$env[ges1;0;name]]","lyric":"$deflate[$if[$and[$env[line]==true;$env[ges1;0;syncedLyrics]!=];$env[ges1;0;syncedLyrics];$if[$env[ges1;0;instrumental];\\[Instrumental\\];$env[ges1;0;plainLyrics]]];hex]"}}]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br, zstd]
    $let[http_1;$httpRequest[https://genius.com/api/search/song?&per_page=1&q=$env[query];GET;ges]]
    $if[$env[ges;response;sections;0;hits;0]!=;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br, zstd]
    $let[http2_1;$httpRequest[https://genius.com$env[ges;response;sections;0;hits;0;result;api_path]/embed.js;GET;ges2]]
    $let[a2;$advancedTextSplit[$advancedReplace[$env[ges2];\\\\n;
;\\\\;;<br>;];<p>;1;</p>;0]]
    $if[$advancedTextSplit[$get[a2];<a href=";1]!=;
    $arrayLoad[a2_rest;<a href=";$get[a2]]
    $let[r1;$advancedTextSplit[$get[a2];<a href=";0]]
    $arrayForEach[a2_rest;restore_a2;$let[r1;$get[r1]$advancedTextSplit[$env[restore_a2];https://;1;">;1]]]
    $let[a2;$get[r1]]
    ]
    $let[a2_filtering;$trimLines[$advancedReplace[$get[a2];<a>;;</a>;;<i>;;</i>;;<b>;;</b>;;";\\\\";\\\\n;
]]]
    $arrayLoad[results;]
    $arrayPushJSON[results;$trimLines[{"status_1":$get[http_1],"status_2":$get[http2_1],"response_time":"$sub[$getTimestamp;$get[time]]","results":{"provider":"genius","thumbnail":"$callFunction[useIcon;genius]","query":"$encodeURI[$env[query]]","url":"$env[ges;response;sections;0;hits;0;result;url]","autocomplete":"$encodeURI[$env[ges;response;sections;0;hits;0;result;title_with_featured]]","lyric":"$deflate[$get[a2_filtering];hex]"}}]]
    ]
    ]
    ]   
    ]
    ]
    $return[$env[results;0]]
    `
}