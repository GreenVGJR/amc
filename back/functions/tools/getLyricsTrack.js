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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $let[time;$getTimestamp]
    $let[usePlayerLyrics;$and[$callFunction[configMusic;usePlayerForFetchLyrics]==true;$env[isExclude]!=true]]
    
    $jsonLoad[results;{}]
    
    $if[$get[usePlayerLyrics];
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$trackInfo[url]]]
    ;
    $jsonLoad[pullyt;$try[$getYoutubeMusic[$env[query]];{}]]
    $jsonLoad[pulltrack;$callFunction[filterMediaID;$env[pullyt;results;0;url]]]
    ]
    $let[checkcachelyric;$getCache[initclientmusic;cachelyricsdata-$env[line]-$md5[youtube_$env[pulltrack;id]]]]
    $if[$get[checkcachelyric]!=;
    $let[ytmusic;$get[checkcachelyric]]
    ;
    $let[ytmusic;$try[$getYTLyricsMusic[$env[pulltrack;id];;$env[line]]]]
    ]
    $if[$and[$env[pulltrack;type]==youtube;$get[ytmusic]!=];
    $!jsonSet[results;status_1;null]
    $!jsonSet[results;status_2;null]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;youtube_$env[pulltrack;id]]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;youtube]
    $!jsonSet[results;results;thumbnail;$if[$get[usePlayerLyrics];$trackInfo[thumbnail];$env[pullyt;results;0;thumbnail]]]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;$if[$get[usePlayerLyrics];$trackInfo[url];$env[pullyt;results;0;url]]]
    $!jsonSet[results;results;autocomplete;$encodeURI[$if[$get[usePlayerLyrics];$trackInfo[title];$env[pullyt;results;0;title]]]]
    $!jsonSet[results;results;lyric;$get[ytmusic]]
    ;
    $let[cusspoaborterls;false]
    $localFunction[spsrh;
    $if[$env[refauth]==true;$callFunction[generateAuth;spotify;;false] $callFunction[generateAuth;spotify_token;;false]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[App-Platform;WebPlayer]
    $httpAddHeader[Authorization;Bearer $getCache[initclientmusic;authmusic_spotify]]
    $let[spschcode;$httpRequest[https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=1;GET;spsch]]
    $if[$and[$or[$get[spschcode]==401;$get[spschcode]==400];$env[refauth]!=true];$callLocalFunction[spsrh;true] $return]
    ;refauth]
    $callLocalFunction[spsrh;false]
    $jsonLoad[spsch;$env[spsch]]
    $let[sptid;$advancedTextSplit[$env[spsch;tracks;items;0;external_urls;spotify];/;4]]
    $let[spthumb;$env[spsch;tracks;items;0;album;images;0;url]]
    $let[sptitle;$env[spsch;tracks;items;0;name]]
    $if[$get[sptid]==;$let[cusspoaborterls;true]]
    $if[$get[cusspoaborterls]==false;
    $let[checkcachelyric;$getCache[initclientmusic;cachelyricsdata-$env[line]-$md5[spotify_$get[sptid]]]]
    $if[$get[checkcachelyric]!=;
    $let[splyric;$get[checkcachelyric]]
    ;
    $localFunction[splyf;
    $if[$env[refauth]==true;$callFunction[generateAuth;spotify_player;;false]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[App-Platform;WebPlayer]
    $httpAddHeader[Authorization;Bearer $getCache[initclientmusic;authmusic_spotify_lyrics]]
    $httpAddHeader[Client-Token;$getCache[initclientmusic;authmusic_spotify_token]]
    $let[splycode;$httpRequest[https://spclient.wg.spotify.com/color-lyrics/v2/track/$get[sptid]?format=json&vnext=true;GET;sply]]
    $if[$and[$get[splycode]==401;$env[refauth]!=true];$callLocalFunction[splyf;true] $return]
    ;refauth]
    $callLocalFunction[splyf;false]
    $jsonLoad[sply;$env[sply]]
    $if[$env[sply;lyrics;lines;0]!=;
    $jsonLoad[splines;$env[sply;lyrics;lines]]
    $arrayMap[splines;e;$return[$env[e;words]];splines]
    $let[spplain;$arrayJoin[splines;
]]
    $let[spplain;$advancedReplace[$get[spplain];♪;]]
    $if[$env[line]==true;
    $if[$env[sply;lyrics;syncType]==LINE_SYNCED;
    $jsonLoad[splines;$env[sply;lyrics;lines]]
    $arrayLoad[spout]
    $arrayForEach[splines;sp;
    $let[spms;$sum[$env[sp;startTimeMs];0]]
    $let[spms3;$cropText[00$get[spms];$sub[$charCount[00$get[spms]];3];$charCount[00$get[spms]]]]
    $let[finalsp;\\[$cropText[$parseDate[$get[spms];ISO];14;19].$cropText[$get[spms3];0;2]\\] $env[sp;words]]
    $arrayPushJSON[spout;$get[finalsp]]
    ]
    $let[splyric;$arrayJoin[spout;
]]
    ]
    ;
    $let[splyric;$get[spplain]]
    ]
    ]
    ]
    $if[$or[$get[splyric]==;$get[splyric]==undefined];$let[cusspoaborterls;true]]
    ]
    $if[$get[cusspoaborterls]==false;
    $!jsonSet[results;status_1;$get[spschcode]]
    $!jsonSet[results;status_2;$get[splycode]]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;spotify_$get[sptid]]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;spotify]
    $!jsonSet[results;results;thumbnail;$get[spthumb]]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;https://open.spotify.com/track/$get[sptid]]
    $!jsonSet[results;results;autocomplete;$encodeURI[$get[sptitle]]]
    $!jsonSet[results;results;lyric;$get[splyric]]
    ;
    $let[custtslmgt;false]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[X-Tidal-Token;$getCache[initclientmusic;authmusic_tidal]]
    $!httpRequest[https://api.tidal.com/v1/search/tracks?countryCode=US&locale=en_US&limit=1&offset=0&query=$env[query];GET;restt]
    $if[$env[restt;items;0;id]==;$let[custtslmgt;true]]
    $if[$get[custtslmgt]==false;
    $let[checkcachelyric;$getCache[initclientmusic;cachelyricsdata-$env[line]-$md5[tidal_$env[restt;items;0;id]]]]
    $if[$get[checkcachelyric]!=;
    $let[finallyric2;$get[checkcachelyric]]
    ;
    $localFunction[nttuf;
    $if[$env[refauth]==true;$generateAuth[tidal_token;;false]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Accept;application/vnd.api+json]
    $httpAddHeader[Origin;https://tidal.com]
    $httpAddHeader[Authorization;Bearer $getCache[initclientmusic;authmusic_tidal_token]]
    $httpSetContentType[Text]
    $let[http_1;$httpRequest[https://openapi.tidal.com/v2/tracks/$env[restt;items;0;id]?include=lyrics;GET;ttklr]]
    $if[$or[$get[http_1]==401;$get[http_1]==400];$callLocalFunction[nttuf;true] $return]
    $jsonLoad[ttklr;$env[ttklr]]
    ;refauth]
    $callLocalFunction[nttuf;false]
    $if[$env[line]==true;
    $if[$or[$env[ttklr;included;0;attributes;lrcText]==;$env[ttklr;included;0;attributes;lrcText]==null];$let[custtslmgt;true];$let[finallyric2;$env[ttklr;included;0;attributes;lrcText]]]
    ;
    $if[$or[$env[ttklr;included;0;attributes;text]==;$env[ttklr;included;0;attributes;text]==null];$let[custtslmgt;true];$let[finallyric2;$env[ttklr;included;0;attributes;text]]]
    ]
    ]
    ]
    $if[$get[custtslmgt]==false;
    $!jsonSet[results;status_1;null]
    $!jsonSet[results;status_2;null]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;tidal_$env[restt;items;0;id]]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;tidal]
    $!jsonSet[results;results;thumbnail;https://resources.tidal.com/images/$replace[$env[restt;items;0;album;cover];-;/]/1280x1280.jpg]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;https://tidal.com/browse/track/$env[restt;items;0;id]/u]
    $!jsonSet[results;results;autocomplete;$encodeURI[$env[restt;items;0;title]]]
    $!jsonSet[results;results;lyric;$get[finallyric2]]
    ;
    $let[cusdezaborterls;false]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Accept;application/json]
    $!httpRequest[https://api.deezer.com/search?limit=5&q=$env[query];GET;drtcp]
    $if[$env[drtcp;data;0;id]==;$let[cusdezaborterls;true]]
    $if[$get[cusdezaborterls]==false;
    $let[drtcp_count;0]
    $generateAuth[deezer;;false]
    $localFunction[lyrde;
    $if[$env[refresh]==true;$generateAuth[deezer;;false]]
    $if[$env[sumCount]==true;$letSum[drtcp_count;1]]
    $if[$env[drtcp;data;$get[drtcp_count];id]==;$jsonLoad[res;{}] $return]
    $let[checkcachelyric;$getCache[initclientmusic;cachelyricsdata-$env[line]-$md5[deezer_$env[drtcp;data;$get[drtcp_count];id]]]]
    $if[$get[checkcachelyric]!=;
    $jsonLoad[res;{}]
    $let[cachedeezerlyric;$get[checkcachelyric]]
    ;
    $try[
    $httpSetBody[{"operationName":"GetLyrics","variables":{"trackId":"$env[drtcp;data;$get[drtcp_count];id]"},"query":"$inflate[789c2b2c4d2daa54704f2df1a92cca4c2ed65029294a4ccef64cb152082e29cacc4b57d454a88ec953008b6ac0e560aa20923960ad1075a9152531790ac59579c91945f9799955a9293e9979a910c99ca2e490ccdcd4e292c4dc021037332f35264fa116816b01498b33f5;hex]"}]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Authorization;Bearer $getCache[initclientmusic;authmusic_deezer]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Content-Type;application/json]
    $httpSetContentType[Text]
    $let[http_3;$httpRequest[https://pipe.deezer.com/api;POST;ges9]]
    ]
    $if[$env[ges9]==;$callLocalFunction[lyrde;true;false]]
    $jsonLoad[res;$env[ges9]]
    $if[$env[res;data;track;lyrics;text]==null;$callLocalFunction[lyrde;false;true]]
    ]
    ;refresh;sumCount]
    $callLocalFunction[lyrde;false;false]
    $if[$and[$get[http_3]==200;$env[drtcp;data;$get[drtcp_count];id]!=;$or[$env[res;data;track;lyrics;text]!=null;$env[res;data;track;lyrics;synchronizedLines]!=null]];
    $if[$and[$env[line]==true;$env[res;data;track;lyrics;synchronizedLines]!=null];
    $jsonLoad[syncLyDe;$if[$env[res;data;track;lyrics;synchronizedLines]==null;{};$env[res;data;track;lyrics;synchronizedLines]]]
    $arrayMap[syncLyDe;e;$return[$env[e;lrcTimestamp] $env[e;line]];syncLyDe]
    $let[finallyde;$arrayJoin[syncLyDe;
]]
    ]]]
    $if[$and[$env[drtcp;data;$get[drtcp_count];id]!=;$get[cusdezaborterls]==false];
    $!jsonSet[results;status_1;$get[http_3]]
    $!jsonSet[results;status_2;null]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;deezer_$env[drtcp;data;$get[drtcp_count];id]]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;deezer]
    $!jsonSet[results;results;thumbnail;$env[drtcp;data;$get[drtcp_count];album;cover_xl]]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;https://www.deezer.com/track/$env[drtcp;data;$get[drtcp_count];id]]
    $!jsonSet[results;results;autocomplete;$encodeURI[$env[drtcp;data;$get[drtcp_count];title]]]
    $!jsonSet[results;results;lyric;$default[$get[cachedeezerlyric];$if[$and[$env[line]==true;$env[res;data;track;lyrics;synchronizedLines]!=null];$get[finallyde];$env[res;data;track;lyrics;text]]]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpSetContentType[Text]
    $let[http_2;$httpRequest[https://lrclib.net/api/search?q=$env[query];GET;ges1]]
    $jsonLoad[ges1;$env[ges1]]
    $onlyIf[$and[$env[line]==true;$or[$env[ges1;0;syncedLyrics]==;$env[ges1;0;syncedLyrics]==null]]!=true;$return[{}]]
    $if[$env[ges1;0;id]!=;
    $!jsonSet[results;status_1;$get[http_2]]
    $!jsonSet[results;status_2;null]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;null]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;lrclib]
    $!jsonSet[results;results;thumbnail;$callFunction[useIcon;lrclib]]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;https://lrclib.net/api/get/$env[ges1;0;id]]
    $!jsonSet[results;results;autocomplete;$encodeURI[$env[ges1;0;name]]]
    $!jsonSet[results;results;lyric;$if[$and[$env[line]==true;$env[ges1;0;syncedLyrics]!=];$env[ges1;0;syncedLyrics];$if[$env[ges1;0;instrumental];\\[Instrumental\\];$env[ges1;0;plainLyrics]]]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpSetContentType[Text]
    $let[http_1;$httpRequest[https://genius.com/api/search/song?&per_page=1&q=$env[query];GET;ges]]
    $jsonLoad[ges;$env[ges]]
    $if[$env[ges;response;sections;0;hits;0]!=;
    $let[checkcachelyric;$getCache[initclientmusic;cachelyricsdata-$env[line]-$md5[$env[ges;response;sections;0;hits;0;result;api_path]]]]
    $if[$get[checkcachelyric]!=;
    $let[a2_filtering;$get[checkcachelyric]]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
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
    ]
    $!jsonSet[results;status_1;$get[http_1]]
    $!jsonSet[results;status_2;$get[http2_1]]
    $!jsonSet[results;response_time;$sub[$getTimestamp;$get[time]]]
    $!jsonSet[results;id;genius_$env[ges;response;sections;0;hits;0;result;api_path]]
    $!jsonSet[results;results;{}]
    $!jsonSet[results;results;provider;genius]
    $!jsonSet[results;results;thumbnail;$callFunction[useIcon;genius]]
    $!jsonSet[results;results;query;$encodeURI[$env[query]]]
    $!jsonSet[results;results;url;$env[ges;response;sections;0;hits;0;result;url]]
    $!jsonSet[results;results;autocomplete;$encodeURI[$env[ges;response;sections;0;hits;0;result;title_with_featured]]]
    $!jsonSet[results;results;lyric;$get[a2_filtering]]
    ]]]]]]
    $async[
    $if[$env[results;results;autocomplete]!=;
    $setCache[initclientmusic;cachelyricsdata-$env[line]-$md5[$env[results;id]];$env[results;results;lyric]]
    ]]
    $return[$env[results]]
    `
}