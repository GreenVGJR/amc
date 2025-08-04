module.exports = {
    name: "getYTLyricsMusic",
    params: [{
        name: "videoId", // string
        description: "VideoID",
        required: true
    },
    {
        name: "userAgent",
        description: "Spoof client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $try[
    $httpSetBody[{"videoId":"$env[videoId]","context":{"client":{"clientName":"WEB_REMIX","clientVersion":"1.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpRequest[https://music.youtube.com/youtubei/v1/next?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer(tabs.tabRenderer.endpoint);POST;res]
    $let[browseid;$advancedTextSplit[$env[res];"browseId":";1;";0]]
    $httpSetBody[{"browseId":"$get[browseid]","context":{"client":{"clientName":"WEB_REMIX","clientVersion":"1.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpRequest[https://music.youtube.com/youtubei/v1/browse?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=contents.sectionListRenderer.contents.musicDescriptionShelfRenderer;POST;res2]
    ]
    $return[$env[res2;contents;sectionListRenderer;contents;0;musicDescriptionShelfRenderer;description;runs;0;text]]
    `
}