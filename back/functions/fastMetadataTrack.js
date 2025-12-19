module.exports = {
    name: "fastMetadataTrack",
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $let[tryattempt;0]
    $localFunction[refreshing;
    $if[$env[refresh]==true;
    $onlyIf[$get[tryattempt]<3;$return]
    $letSum[tryattempt;1]
    ]
    $if[$env[provider]==youtube;
    $jsonLoad[a;$getYoutubeVideo[$env[query]]]
    $onlyIf[$env[a;results;0]!=;$return]
    $let[rest2;{"id":"$advancedTextSplit[$env[a;results;0;url];watch?v=;1]","dynamic_thumbnail":"","thumbnail":"$env[a;results;0;thumbnail]","duration":"$env[a;results;0;duration]","title":"$deflate[$env[a;results;0;title];base64]"}]
    ]
    $if[$env[provider]==youtubemusic;
    $jsonLoad[a;$getYoutubeMusic[$env[query]]]
    $onlyIf[$env[a;results;0]!=;$return]
    $let[rest2;{"id":"$advancedTextSplit[$env[a;results;0;url];watch?v=;1]","dynamic_thumbnail":"","thumbnail":"$env[a;results;0;thumbnail]","duration":"$env[a;results;0;duration]","title":"$deflate[$env[a;results;0;title];base64]"}]
    ]
    $if[$env[provider]==soundcloud;
    $try[
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpRemoveHeader[Accept-Encoding]
    $let[http;$httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getCache[authmusic_soundcloud]&limit=1;GET;res]]
    $onlyIf[$get[http]!=401;
    $callFunction[generateAuthKeys;soundcloud;;false]
    $callLocalFunction[refreshing;true]]
    $onlyIf[$get[http]!=429;$return]
    ]
    $jsonLoad[res;$env[res]]
    $let[rest2;{"id":"$advancedTextSplit[$env[res;collection;0;permalink_url];soundcloud.com/;1]","dynamic_thumbnail":"","thumbnail":"$env[res;collection;0;artwork_url]","duration":$round[$divide[$env[res;collection;0;duration];1000];0],"title":"$deflate[$env[res;collection;0;title];base64]"}]
    ]
    $if[$env[provider]==spotify;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Authorization;Bearer $getCache[authmusic_spotify]]
    $httpRemoveHeader[Accept-Encoding]
    $httpAddHeader[App-platform;WebPlayer]
    $httpSetContentType[Text]
    $let[httpspo;$httpRequest[https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=1;GET;jsonres]]
    $onlyIf[$or[$get[httpspo]==401;$get[httpspo]==400]!=true;
    $callFunction[generateAuthKeys;spotify;;false]
    $callLocalFunction[refreshing;true]
    ]
    $onlyIf[$or[$get[httpspo]==429;$get[httpspo]==403]!=true;$return]
    ]
    $jsonLoad[jsonres;$env[jsonres]]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $let[rest2;{"id":"$advancedTextSplit[$env[res1;0;external_urls;spotify];/;4]","dynamic_thumbnail":"","thumbnail":"$env[res1;0;album;images;0;url]","duration":$round[$divide[$env[res1;0;duration_ms];1000];0],"title":"$deflate[$env[res1;0;name];base64]"}]
    ]
    $if[$env[provider]==applemusic;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpRemoveHeader[Accept-Encoding]
    $httpSetContentType[Text]
    $!httpRequest[https://itunes.apple.com/search?media=music&entity=musicTrack&limit=1&country=US&lang=en-US&version=2&term=$env[query];GET;res]
    ]
    $onlyIf[$env[res]!=;$callLocalFunction[refreshing;true]]
    $jsonLoad[res;$env[res]]
    $let[rest2;{"id":"$advancedTextSplit[$env[res;results;0;trackViewUrl];&;0]","dynamic_thumbnail":"","thumbnail":"$replace[$env[res;results;0;artworkUrl100];100x100bb;1x1ss]","duration":$round[$divide[$env[res;results;0;trackTimeMillis];1000];0],"title":"$deflate[$env[res;results;0;trackName];base64]"}]
    ]
    $if[$env[provider]==deezer;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpRemoveHeader[Accept-Encoding]
    $let[status;$httpRequest[https://api.deezer.com/search?limit=1&q=$env[query];GET;res]]
    $onlyIf[$env[res]!=;$callLocalFunction[refreshing;true]]
    $jsonLoad[res;$env[res]]
    $onlyIf[$and[$get[status]==200;$env[res;data;0]!=];$return]
    $let[rest2;{"id":"$env[res;data;0;id]","dynamic_thumbnail":"","thumbnail":"$env[res;data;0;album;cover]","duration":$env[res;data;0;duration],"title":"$deflate[$env[res;data;0;title];base64]"}]
    ]
    ;refresh]
    $callLocalFunction[refreshing;false]
    $return[$get[rest2]]
    `
}