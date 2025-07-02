module.exports = {
    name: "searchSomeTrack",
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
    $try[
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $if[$env[provider]==youtube;
    $jsonLoad[loadser;$try[$youtubeVideoSearch[$env[query];10];{}]]
    $jsonLoad[loadser2;$env[loadser;results]]
    $arrayLoad[results]
    $arrayForEach[loadser2;result;
    $arrayPushJSON[results;{"title":"$replace[$env[result;title];";\\\\"]","duration":"$if[$env[result;durationSeconds]==0;LIVE;$parseDigital[$multi[$env[result;durationSeconds];1000]]]","thumbnail":"$if[$env[result;animatedThumbnail;0;url]==;$env[result;thumbnail;0;url];$env[result;animatedThumbnail;0;url]]","url":"$env[result;url]"}]
    ]
    ;
    $if[$env[provider]==youtubemusic;
    $jsonLoad[ser;$try[$ytMusicSearch[$env[query];10];{}]]
    $arrayLoad[results]
    $arrayForEach[ser;result;
    $arrayPushJSON[results;{"title":"$replace[$env[result;name];";\\\\"]","duration":"Unknown","thumbnail":"https://i.ytimg.com/vi_webp/$env[result;id]/sddefault.webp","url":"$env[result;url]"}]
    ]
    ;
    $if[$env[provider]==soundcloud;
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getGlobalVar[authmusic_soundcloud]&limit=10;GET;tests]
    $jsonLoad[res;$env[tests;collection]]
    $arrayLoad[results]
    $arrayForEach[res;result;
    $arrayPushJSON[results;{"title":"$replace[$env[result;title];";\\\\"]","duration":"$parseDigital[$env[result;full_duration]]$if[$env[result;duration]==30000;\\\\n-# REGION LOCK]","thumbnail":"$env[result;artwork_url]","url":"$env[result;permalink_url]"}]
    ]
    ;
    $if[$env[provider]==spotify;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Authorization;Bearer $getGlobalVar[authmusic_spotify]]
    $httpAddHeader[App-platform;WebPlayer]
    $!httpRequest[https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=10;GET;jsonres]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $arrayLoad[results]
    $arrayForEach[res1;res2;$arrayPushJSON[results;{"title":"$replace[$env[res2;name];";\\\\"]","duration":"$parseDigital[$env[res2;duration_ms]]","thumbnail":"$env[res2;album;images;0;url]","url":"$env[res2;external_urls;spotify]"}]]
    ;
    $if[$env[provider]==applemusic;
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://music.apple.com/us/search?term=$env[query];GET]
    $jsonLoad[res;$advancedTextSplit[$httpResult;type="application/json";1;data">;1;</script>;0]]
    $jsonLoad[res2;$env[res;0;data;sections]]
    $jsonLoad[res3;$env[res2;$arrayFindIndex[res2;result;$checkContains[$env[result;id];song]]]]
    $jsonLoad[res4;$env[res3;items]]
    $arraySlice[res4;res4;0;10]

    $arrayLoad[results]
    $arrayForEach[res4;res5;$arrayPushJSON[results;{"title":"$replace[$env[res5;title];";\\\\"]","duration":"Unknown","thumbnail":"$replace[$env[res5;artwork;dictionary;url];{w}x{h}bb.{f};1080x1080bb.webp]","url":"$advancedTextSplit[$env[res5;contentDescriptor;url];?;0]"}]]
    ]]]]]
    ;
    $arrayLoad[results]
    ]
    $return[$env[results]]
    `
}