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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $let[tryattempt;0]
    $localFunction[refreshing;
    $if[$env[refresh]==true;
    $onlyIf[$get[tryattempt]<3;$return]
    $letSum[tryattempt;1]
    ]
    $if[$env[provider]==youtube;
    $httpSetBody[{"query":"$replace[$replace[$env[query];\\\\;];";\\\\"]","context":{"client":{"clientName":"WEB","clientVersion":"2.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://youtubei.googleapis.com/youtubei/v1/search?prettyPrint=false&fields=contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,title,richThumbnail,lengthText);POST;res]
    $jsonLoad[toindex;$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    $let[findindex;$arrayFindIndex[toindex;checkindex;$checkCondition[$env[checkindex;videoRenderer]!=]]]
    $let[rest2;{"id": "$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[findindex];videoRenderer;videoId]","dynamic_thumbnail":"$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[findindex];videoRenderer;richThumbnail;movingThumbnailRenderer;movingThumbnailDetails;thumbnails;0;url]","thumbnail":"https://i.ytimg.com/vi/$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[findindex];videoRenderer;videoId]/hq720.jpg","duration":"$round[$divide[$unparseDigital[$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[findindex];videoRenderer;lengthText;simpleText]];1000];0]","title":"$deflate[$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[findindex];videoRenderer;title;runs;0;text];base64]"}]
    ]
    $if[$env[provider]==youtubemusic;
    $jsonLoad[a;$getYoutubeMusic[$env[query]]]
    $onlyIf[$env[a;results;0]!=;$return]
    $let[rest2;{"id":"$advancedTextSplit[$env[a;results;0;url];watch?v=;1]","dynamic_thumbnail":"","thumbnail":"$env[a;results;0;thumbnail]","duration":"$env[a;results;0;duration]","title":"$deflate[$env[a;results;0;title];base64]"}]
    ]
    $if[$env[provider]==soundcloud;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $let[http;$httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getGlobalVar[authmusic_soundcloud]&limit=1;GET;res]]
    $onlyIf[$get[http]!=401;
    $callFunction[generateAuthKeys;soundcloud;;false]
    $callLocalFunction[refreshing;true]]
    $onlyIf[$get[http]!=429;$return]
    ]
    $let[rest2;{"id":"$advancedTextSplit[$env[res;collection;0;permalink_url];soundcloud.com/;1]","dynamic_thumbnail":"","thumbnail":"$env[res;collection;0;artwork_url]","duration":$round[$divide[$env[res;collection;0;full_duration];1000];0],"title":"$deflate[$env[res;collection;0;title];base64]"}]
    ]
    $if[$env[provider]==spotify;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Authorization;Bearer $getGlobalVar[authmusic_spotify]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[App-platform;WebPlayer]
    $let[httpspo;$httpRequest[https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=1;GET;jsonres]]
    $onlyIf[$or[$get[httpspo]==401;$get[httpspo]==400]!=true;
    $callFunction[generateAuthKeys;spotify;;false]
    $callLocalFunction[refreshing;true]
    ]
    $onlyIf[$get[httpspo]!=429;$return]
    ]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $let[rest2;{"id":"$advancedTextSplit[$env[res1;0;external_urls;spotify];/;4]","dynamic_thumbnail":"","thumbnail":"$env[res1;0;album;images;0;url]","duration":$round[$divide[$env[res1;0;duration_ms];1000];0],"title":"$deflate[$env[res1;0;name];base64]"}]
    ]
    $if[$env[provider]==applemusic;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpSetContentType[Text]
    $!httpRequest[https://itunes.apple.com/search?media=music&limit=1&country=US&term=$env[query];GET;res]
    ]
    $onlyIf[$env[res]!=;$callLocalFunction[refreshing;true]]
    $jsonLoad[res;$env[res]]
    $let[rest2;{"id":"$advancedTextSplit[$env[res;results;0;trackViewUrl];&;0]","dynamic_thumbnail":"","thumbnail":"$replace[$env[res;results;0;artworkUrl100];100x100bb;1x1ss]","duration":$round[$divide[$env[res;results;0;trackTimeMillis];1000];0],"title":"$deflate[$env[res;results;0;trackName];base64]"}]
    ]
    ;refresh]
    $callLocalFunction[refreshing;false]
    $return[$get[rest2]]
    `
}