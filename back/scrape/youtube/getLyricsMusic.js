module.exports = {
    name: "getYTLyricsMusic",
    params: [{
        name: "videoId", // string
        description: "VideoID",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof client",
        required: false
    },
    {
       name: "line", // bool
       description: "Get line synced version",
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
    $if[$env[line]==true;
    $httpSetBody[{"browseId":"$get[browseid]","context":{"client":{"clientName":"ANDROID_MUSIC","clientVersion":"8.01","visitorData":"$getGlobalVar[authmusic_youtube_visitor]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://music.youtube.com/youtubei/v1/browse?prettyPrint=false&fields=contents.elementRenderer.newElement.type.componentType.model.timedLyricsModel.lyricsData(timedLyricsData);POST]
    $jsonLoad[er;$httpResult[contents;elementRenderer;newElement;type;componentType;model;timedLyricsModel;lyricsData;timedLyricsData]]
    $arrayMap[er;ers;$return[\\[$djsEval[new Date($if[$env[ers;cueRange;startTimeMilliseconds]==;0;$env[ers;cueRange;startTimeMilliseconds]]).toISOString().slice(14,19) + '.' + new Date($if[$env[ers;cueRange;startTimeMilliseconds]==;0;$env[ers;cueRange;startTimeMilliseconds]]).toISOString().slice(20,22)]\\] $env[ers;lyricLine]];er]
    $let[finalyric;$arrayJoin[er;
]]
    ;
    $httpSetBody[{"browseId":"$get[browseid]","context":{"client":{"clientName":"WEB_REMIX","clientVersion":"1.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","hl":"en","gl":"US"}}}]
    $httpSetContentType[Json]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://music.youtube.com/youtubei/v1/browse?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=contents.sectionListRenderer.contents.musicDescriptionShelfRenderer;POST;res2]
    ]]
    $return[$if[$env[line]==true;$get[finalyric];$env[res2;contents;sectionListRenderer;contents;0;musicDescriptionShelfRenderer;description;runs;0;text]]]
    `
}