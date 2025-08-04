module.exports = {
    name: "getYoutubeVideo",
    params: [{
        name: "query", // string
        description: "Query",
        required: true
    },
    {
        name: "userAgent",
        description: "Spoof client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $httpSetBody[{"query":"$replace[$replace[$env[query];\\\\;];";\\\\"]","context":{"client":{"clientName":"WEB","clientVersion":"2.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpRequest[https://www.youtube.com/youtubei/v1/search?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,title,thumbnail,richThumbnail,lengthText);POST;res]
    $jsonLoad[dofetch;$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    $arrayForEach[dofetch;getfetch;
    $if[$env[getfetch;videoRenderer]!=;
    $arrayPushJSON[results;{
        "title": "$replace[$replace[$env[getfetch;videoRenderer;title;runs;0;text];\\\\;];";\\\\"]",
        "duration": "$round[$divide[$unparseDigital[$env[getfetch;videoRenderer;lengthText;simpleText]];1000];0]",
        "thumbnail": "$if[$env[getfetch;videoRenderer;richThumbnail;movingThumbnailRenderer;movingThumbnailDetails;thumbnails;0;url]!=;$env[getfetch;videoRenderer;richThumbnail;movingThumbnailRenderer;movingThumbnailDetails;thumbnails;0;url];https://i.ytimg.com/vi_webp/$env[getfetch;videoRenderer;videoId]/hq720.webp]",
        "url": "https://youtube.com/watch?v=$env[getfetch;videoRenderer;videoId]"
    }]]
    ]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
}