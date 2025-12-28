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
    $jsonLoad[reslac;{}]
    $localFunction[refreshing;
    $if[$env[refresh]==true;
    $onlyIf[$get[tryattempt]<3;$return]
    $letSum[tryattempt;1]
    ]
    $if[$env[provider]==youtube;
    $jsonLoad[a;$getYoutubeVideo[$env[query]]]
    $onlyIf[$env[a;results;0]!=;$return]
    $!jsonSet[reslac;id;$advancedTextSplit[$env[a;results;0;url];watch?v=;1]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$env[a;results;0;thumbnail]]
    $!jsonSet[reslac;duration;$env[a;results;0;duration]]
    $!jsonSet[reslac;title;$env[a;results;0;title]]
    ]
    $if[$env[provider]==youtubemusic;
    $jsonLoad[a;$getYoutubeMusic[$env[query]]]
    $onlyIf[$env[a;results;0]!=;$return]
    $!jsonSet[reslac;id;$advancedTextSplit[$env[a;results;0;url];watch?v=;1]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$env[a;results;0;thumbnail]]
    $!jsonSet[reslac;duration;$env[a;results;0;duration]]
    $!jsonSet[reslac;title;$env[a;results;0;title]]
    ]
    $if[$env[provider]==soundcloud;
    $try[
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $let[http;$httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getCache[authmusic_soundcloud]&limit=1;GET;res]]
    $onlyIf[$get[http]!=401;
    $callFunction[generateAuthKeys;soundcloud;;false]
    $callLocalFunction[refreshing;true]]
    $onlyIf[$get[http]!=429;$return]
    ]
    $jsonLoad[res;$env[res]]
    $!jsonSet[reslac;id;$advancedTextSplit[$env[res;collection;0;permalink_url];soundcloud.com/;1]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$replace[$env[res;collection;0;artwork_url];-large;-original]]
    $!jsonSet[reslac;duration;$round[$divide[$env[res;collection;0;duration];1000];0]]
    $!jsonSet[reslac;title;$env[res;collection;0;title]]
    ]
    $if[$env[provider]==spotify;
    $try[
    $let[mdhedroute_spotify;{
    "Accept": "application/json",
    "Accept-Language": "en",
    "App-Platform": "WebPlayer",
    "Authorization": "Bearer $getCache[authmusic_spotify]",
    "User-Agent": "$get[agent]"
    }]
    $let[mdquery;https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=1]
    $let[jsonres;$djsEval[const { request, Agent } = require("undici")\\; request(ctx.getKeyword("mdquery"), { dispatcher: new Agent({ connect: { family: 4 } }), headers: JSON.parse(ctx.getKeyword("mdhedroute_spotify")), method: "GET" }).then(a => { ctx.setKeyword('httpspo', a.statusCode)\\; return a.body.text() }).catch()]]
    $onlyIf[$or[$get[httpspo]==401;$get[httpspo]==400]!=true;
    $callFunction[generateAuthKeys;spotify;;false]
    $callLocalFunction[refreshing;true]
    ]
    $onlyIf[$or[$get[httpspo]==429;$get[httpspo]==403]!=true;$return]
    ]
    $jsonLoad[jsonres;$get[jsonres]]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $!jsonSet[reslac;id;$advancedTextSplit[$env[res1;0;external_urls;spotify];/;4]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$env[res1;0;album;images;0;url]]
    $!jsonSet[reslac;duration;$round[$divide[$env[res1;0;duration_ms];1000];0]]
    $!jsonSet[reslac;title;$env[res1;0;name]]
    ]
    $if[$env[provider]==applemusic;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpSetContentType[Text]
    $!httpRequest[https://itunes.apple.com/search?media=music&entity=musicTrack&limit=1&country=US&lang=en-US&version=2&term=$env[query];GET;res]
    ]
    $onlyIf[$env[res]!=;$callLocalFunction[refreshing;true]]
    $jsonLoad[res;$env[res]]
    $!jsonSet[reslac;id;$advancedTextSplit[$env[res;results;0;trackViewUrl];&;0]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$replace[$env[res;results;0;artworkUrl100];100x100bb;1x1ss]]
    $!jsonSet[reslac;duration;$round[$divide[$env[res;results;0;trackTimeMillis];1000];0]]
    $!jsonSet[reslac;title;$env[res;results;0;trackName]]
    ]
    $if[$env[provider]==deezer;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $let[status;$httpRequest[https://api.deezer.com/search?limit=1&q=$env[query];GET;res]]
    $onlyIf[$env[res]!=;$callLocalFunction[refreshing;true]]
    $jsonLoad[res;$env[res]]
    $onlyIf[$and[$get[status]==200;$env[res;data;0]!=];$return]
    $!jsonSet[reslac;id;$env[res;data;0;id]]
    $!jsonSet[reslac;dynamic_thumbnail;]
    $!jsonSet[reslac;thumbnail;$env[res;data;0;album;cover]]
    $!jsonSet[reslac;duration;$env[res;data;0;duration]]
    $!jsonSet[reslac;title;$env[res;data;0;title]]
    ]
    ;refresh]
    $callLocalFunction[refreshing;false]
    $return[$jsonStringify[reslac]]
    `
}