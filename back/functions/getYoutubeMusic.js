module.exports = {
    name: "getYoutubeMusic",
    params: [{
        name: "query", // string
        description: "Query",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $httpSetBody[{"query":"$replace[$replace[$env[query];\\\\;];";\\\\"]","params":"EgWKAQIIAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D", "context":{"client":{"clientName":"WEB_REMIX","clientVersion":"1.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpRequest[https://music.youtube.com/youtubei/v1/search?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=contents.tabbedSearchResultsRenderer.tabs.tabRenderer.content.sectionListRenderer.contents.musicShelfRenderer.contents(musicResponsiveListItemRenderer(thumbnail,flexColumns));POST;res]

    $jsonLoad[testfetch;$env[res;contents;tabbedSearchResultsRenderer;tabs;0;tabRenderer;content;sectionListRenderer;contents]]
    $jsonLoad[dofetch;$env[res;contents;tabbedSearchResultsRenderer;tabs;0;tabRenderer;content;sectionListRenderer;contents;$arrayFindIndex[testfetch;resfetch;$checkCondition[$env[resfetch;musicShelfRenderer]!=]];musicShelfRenderer;contents]]
    $arrayForEach[dofetch;getfetch;
    $jsonLoad[a;$env[getfetch;musicResponsiveListItemRenderer;flexColumns;1;musicResponsiveListItemFlexColumnRenderer;text;runs]]
    $let[finduration;$sub[$arrayLength[a];1]]
    $arrayPushJSON[results;{
        "title": "$replace[$replace[$env[getfetch;musicResponsiveListItemRenderer;flexColumns;0;musicResponsiveListItemFlexColumnRenderer;text;runs;0;text];\\\\;];";\\\\"]",
        "duration": "$round[$divide[$unparseDigital[$env[getfetch;musicResponsiveListItemRenderer;flexColumns;1;musicResponsiveListItemFlexColumnRenderer;text;runs;$get[finduration];text]];1000];0]",
        "thumbnail": "$advancedTextSplit[$env[getfetch;musicResponsiveListItemRenderer;thumbnail;musicThumbnailRenderer;thumbnail;thumbnails;0;url];=;0]=w2160-h2160-l100",
        "url": "https://music.youtube.com/watch?v=$env[getfetch;musicResponsiveListItemRenderer;flexColumns;0;musicResponsiveListItemFlexColumnRenderer;text;runs;0;navigationEndpoint;watchEndpoint;videoId]"
    }]
    ]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
}