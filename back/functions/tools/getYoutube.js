module.exports = [{
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $jsonLoad[inputhttpquery;{"params":"EgWKAQIIAWoQEAMQCRAFEAQQChAVEBAQEQ%3D%3D","context":{"client":{"clientName":67,"clientVersion":"1.20261231","hl":"en","gl":"US"}}}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://music.youtube.com/youtubei/v1/search?prettyPrint=false&fields=contents.tabbedSearchResultsRenderer.tabs.tabRenderer.content.sectionListRenderer.contents.musicShelfRenderer.contents.musicResponsiveListItemRenderer(flexColumns(musicResponsiveListItemFlexColumnRenderer(text(runs(text,navigationEndpoint(watchEndpoint/videoId))))),thumbnail(musicThumbnailRenderer(thumbnail(thumbnails(url)))));POST;res]
    $jsonLoad[res;$env[res]]
    $jsonLoad[testfetch;$env[res;contents;tabbedSearchResultsRenderer;tabs;0;tabRenderer;content;sectionListRenderer;contents]]
    $jsonLoad[dofetch;$env[res;contents;tabbedSearchResultsRenderer;tabs;0;tabRenderer;content;sectionListRenderer;contents;$arrayFindIndex[testfetch;resfetch;$checkCondition[$env[resfetch;musicShelfRenderer]!=]];musicShelfRenderer;contents]]
    $if[$env[dofetch]==;
    $jsonLoad[inputhttpquery;{"context":{"client":{"clientName":1,"clientVersion":"2.20261231","hl":"en","gl":"US"}}}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://m.youtube.com/youtubei/v1/search?prettyPrint=false&fields=contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,detailedMetadataSnippets,title(runs/text),lengthText(simpleText));POST;res]
    $jsonLoad[res;$env[res]]
    $jsonLoad[dofetch;$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    $arrayForEach[dofetch;getfetch;
    $if[$and[$env[getfetch;videoRenderer;videoId]!=;$startsWith[$env[getfetch;videoRenderer;detailedMetadataSnippets;0;snippetText;runs;0;text];Provided to YouTube by]];
    $jsonLoad[tempres;{}]
    $!jsonSet[tempres;title;$env[getfetch;videoRenderer;title;runs;0;text]]
    $!jsonSet[tempres;duration;"$round[$divide[$unparseDigital[$env[getfetch;videoRenderer;lengthText;simpleText]];1000];0]"]
    $!jsonSet[tempres;thumbnail;https://i.ytimg.com/vi/$env[getfetch;videoRenderer;videoId]/maxres1.jpg]
    $!jsonSet[tempres;url;https://music.youtube.com/watch?v=$env[getfetch;videoRenderer;videoId]]
    $arrayPushJSON[results;$env[tempres]]
    ]]
    ;
    $arrayForEach[dofetch;getfetch;
    $if[$env[getfetch;musicResponsiveListItemRenderer;flexColumns;0;musicResponsiveListItemFlexColumnRenderer;text;runs;0;navigationEndpoint;watchEndpoint;videoId]!=;
    $jsonLoad[a;$env[getfetch;musicResponsiveListItemRenderer;flexColumns;1;musicResponsiveListItemFlexColumnRenderer;text;runs]]
    $let[finduration;$sub[$arrayLength[a];1]]
    $jsonLoad[cleanytmusictitle;$env[getfetch;musicResponsiveListItemRenderer;flexColumns;1;musicResponsiveListItemFlexColumnRenderer;text;runs]]
    $arraySlice[cleanytmusictitle;cleanytmusictitle;0;-4]
    $arrayMap[cleanytmusictitle;yt;$return[$env[yt;text]];cleanytmusictitle]
    $jsonLoad[tempres;{}]
    $!jsonSet[tempres;title;$arrayJoin[cleanytmusictitle;] - $env[getfetch;musicResponsiveListItemRenderer;flexColumns;0;musicResponsiveListItemFlexColumnRenderer;text;runs;0;text]]
    $!jsonSet[tempres;duration;"$round[$divide[$unparseDigital[$env[getfetch;musicResponsiveListItemRenderer;flexColumns;1;musicResponsiveListItemFlexColumnRenderer;text;runs;$get[finduration];text]];1000];0]"]
    $!jsonSet[tempres;thumbnail;$advancedTextSplit[$env[getfetch;musicResponsiveListItemRenderer;thumbnail;musicThumbnailRenderer;thumbnail;thumbnails;0;url];=;0]=s0]
    $!jsonSet[tempres;url;https://music.youtube.com/watch?v=$env[getfetch;musicResponsiveListItemRenderer;flexColumns;0;musicResponsiveListItemFlexColumnRenderer;text;runs;0;navigationEndpoint;watchEndpoint;videoId]]
    $arrayPushJSON[results;$env[tempres]]
    ]]]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
},
{
    name: "getYoutubeShorts",
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $jsonLoad[inputhttpquery;{"context":{"client":{"clientName":1,"clientVersion":"2.20261231","hl":"en","gl":"US"}}}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $httpSetContentType[Text]
    $!httpRequest[https://m.youtube.com/youtubei/v1/search?prettyPrint=false&fields=contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,title(runs/text),richThumbnail(movingThumbnailRenderer/movingThumbnailDetails/thumbnails/url),lengthText(simpleText),navigationEndpoint(commandMetadata/webCommandMetadata(webPageType))),header.searchHeaderRenderer.chipBar.chipCloudRenderer.chips.chipCloudChipRenderer(text,navigationEndpoint/continuationCommand/token);POST]
    $let[tokens;$advancedTextSplit[$httpResult;"Shorts";1;"token":";1;";0]]
    $jsonLoad[res;$httpResult]
    $if[$get[tokens]==;
    $jsonLoad[dofetch;$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    $arrayMap[dofetch;docatch;$if[$env[docatch;videoRenderer;navigationEndpoint;commandMetadata;webCommandMetadata;webPageType]==WEB_PAGE_TYPE_SHORTS;$return[$env[docatch]]];dofetch]
    ;
    $httpSetBody[{"continuation": "$get[tokens]","context":{"client":{"clientName":1,"clientVersion":"2.20261231","hl":"en","gl":"US"}}}]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $httpSetContentType[Text]
    $!httpRequest[https://m.youtube.com/youtubei/v1/search?prettyPrint=false&fields=onResponseReceivedCommands.reloadContinuationItemsCommand.continuationItems.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,title(runs/text),richThumbnail(movingThumbnailRenderer/movingThumbnailDetails/thumbnails/url),lengthText(simpleText));POST;res]
    $jsonLoad[res;$env[res]]
    $jsonLoad[dofetch;$env[res;onResponseReceivedCommands;0;reloadContinuationItemsCommand;continuationItems;0;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    ]
    $arrayForEach[dofetch;getfetch;
    $if[$env[getfetch;videoRenderer]!=;
    $jsonLoad[tempres;{}]
    $!jsonSet[tempres;title;$env[getfetch;videoRenderer;title;runs;0;text]]
    $!jsonSet[tempres;duration;"$round[$divide[$unparseDigital[$env[getfetch;videoRenderer;lengthText;simpleText]];1000];0]"]
    $!jsonSet[tempres;thumbnail;$default[$env[getfetch;videoRenderer;richThumbnail;movingThumbnailRenderer;movingThumbnailDetails;thumbnails;0;url];https://i.ytimg.com/vi_webp/$env[getfetch;videoRenderer;videoId]/oardefault.webp]]
    $!jsonSet[tempres;url;https://youtube.com/shorts/$env[getfetch;videoRenderer;videoId]]
    $arrayPushJSON[results;$env[tempres]]]
    ]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
},
{
    name: "getYoutubeVideo",
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $jsonLoad[inputhttpquery;{"context":{"client":{"clientName":1,"clientVersion":"2.20261231","hl":"en","gl":"US"}}}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://m.youtube.com/youtubei/v1/search?prettyPrint=false&fields=contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.itemSectionRenderer.contents.videoRenderer(videoId,detailedMetadataSnippets,title(runs/text),richThumbnail(movingThumbnailRenderer/movingThumbnailDetails/thumbnails/url),lengthText(simpleText));POST;res]
    $jsonLoad[res;$env[res]]
    $jsonLoad[dofetch;$env[res;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
    $arrayForEach[dofetch;getfetch;
    $if[$and[$env[getfetch;videoRenderer;videoId]!=;$startsWith[$env[getfetch;videoRenderer;detailedMetadataSnippets;0;snippetText;runs;0;text];Provided to YouTube by]==false];
    $jsonLoad[tempres;{}]
    $!jsonSet[tempres;title;$env[getfetch;videoRenderer;title;runs;0;text]]
    $!jsonSet[tempres;duration;"$round[$divide[$unparseDigital[$env[getfetch;videoRenderer;lengthText;simpleText]];1000];0]"]
    $!jsonSet[tempres;thumbnail;$default[$env[getfetch;videoRenderer;richThumbnail;movingThumbnailRenderer;movingThumbnailDetails;thumbnails;0;url];https://i.ytimg.com/vi_webp/$env[getfetch;videoRenderer;videoId]/hq720.webp]]
    $!jsonSet[tempres;url;https://youtube.com/watch?v=$env[getfetch;videoRenderer;videoId]]
    $arrayPushJSON[results;$env[tempres]]]
    ]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
},
{
    name: "getYoutubeVideoLite",
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $jsonLoad[inputhttpquery;{"context":{"client":{"clientName":7,"clientVersion":"7.20261231","visitorData":"$getCache[authmusic_youtube_visitor]","hl":"en","gl":"US"}}}]
    $!jsonSet[inputhttpquery;query;$env[query]]
    $httpSetBody[$jsonStringify[inputhttpquery]]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://m.youtube.com/youtubei/v1/search?prettyPrint=false&fields=contents.sectionListRenderer.contents.shelfRenderer.content.horizontalListRenderer.items(tileRenderer(contentType,header,onLongPressCommand(showMenuCommand)));POST;res]
    $jsonLoad[res;$env[res]]
    $jsonLoad[dofetch;$env[res;contents;sectionListRenderer;contents;0;shelfRenderer;content;horizontalListRenderer;items]]
    $arrayForEach[dofetch;getfetch;
    $if[$and[$env[getfetch;tileRenderer;contentType]==TILE_CONTENT_TYPE_VIDEO;$env[getfetch;tileRenderer;onLongPressCommand;showMenuCommand;contentId]!=];
    $jsonLoad[tempres;{}]
    $!jsonSet[tempres;title;$env[getfetch;tileRenderer;onLongPressCommand;showMenuCommand;subtitle;simpleText] - $env[getfetch;tileRenderer;onLongPressCommand;showMenuCommand;title;simpleText]]
    $!jsonSet[tempres;duration;"$if[$and[$env[getfetch;tileRenderer;header;tileHeaderRenderer;thumbnailOverlays;0;thumbnailOverlayTimeStatusRenderer;text;simpleText]==;$env[getfetch;tileRenderer;header;tileHeaderRenderer;thumbnailOverlays;1;thumbnailOverlayTimeStatusRenderer;style]!=LIVE];-1;$round[$divide[$unparseDigital[$env[getfetch;tileRenderer;header;tileHeaderRenderer;thumbnailOverlays;0;thumbnailOverlayTimeStatusRenderer;text;simpleText]];1000];0]]"]
    $!jsonSet[tempres;thumbnail;$if[$env[getfetch;tileRenderer;header;tileHeaderRenderer;thumbnailOverlays]!=;https://i.ytimg.com/vi_webp/$env[getfetch;tileRenderer;onLongPressCommand;showMenuCommand;contentId]/hq720.webp;$advancedTextSplit[$env[getfetch;tileRenderer;header;tileHeaderRenderer;thumbnail;thumbnails;0;url];=;0]=s0]]
    $!jsonSet[tempres;url;https://youtube.com/watch?v=$env[getfetch;tileRenderer;onLongPressCommand;showMenuCommand;contentId]]
    $arrayPushJSON[results;$env[tempres]]]
    ]]
    $return[{"ping":"$httpPing", "results":$env[results]}]
    `
},
{
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
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $try[
    $httpSetBody[{"videoId":"$env[videoId]","context":{"client":{"clientName":67,"clientVersion":"1.20261231","visitorData":"$getCache[authmusic_youtube_visitor]","hl":"en"}}}]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://music.youtube.com/youtubei/v1/next?prettyPrint=false&fields=contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer(tabs.tabRenderer.endpoint.browseEndpoint.browseId);POST;res]
    $let[browseid;$advancedTextSplit[$env[res];"browseId":";1;";0]]
    $if[$env[line]==true;
    $httpSetBody[{"browseId":"$get[browseid]","context":{"client":{"clientName":21,"clientVersion":"8.47","visitorData":"$getCache[authmusic_youtube_visitor]","hl":"en"}}}]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://music.youtube.com/youtubei/v1/browse?prettyPrint=false&fields=responseContext(visitorData),contents.elementRenderer.newElement.type.componentType.model.timedLyricsModel.lyricsData(timedLyricsData(lyricLine,cueRange(startTimeMilliseconds)));POST;pers]
    $jsonLoad[pers;$env[pers]]
    $if[$env[pers;responseContext;visitorData]!=;$setCache[authmusic_youtube_visitor;$env[pers;responseContext;visitorData]]]
    $jsonLoad[er;$env[pers;contents;elementRenderer;newElement;type;componentType;model;timedLyricsModel;lyricsData;timedLyricsData]]
    $arrayMap[er;ers;$return[\\[$cropText[$parseDate[$default[$env[ers;cueRange;startTimeMilliseconds];0];ISO];14;19].$cropText[$parseDate[$default[$env[ers;cueRange;startTimeMilliseconds];0];ISO];20;22]\\] $env[ers;lyricLine]];er]
    $let[finalyric;$arrayJoin[er;
]]
    ;
    $httpSetBody[{"browseId":"$get[browseid]","context":{"client":{"clientName":67,"clientVersion":"1.20261231","visitorData":"$getCache[authmusic_youtube_visitor]","hl":"en"}}}]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $!httpRequest[https://music.youtube.com/youtubei/v1/browse?prettyPrint=false&fields=responseContext(visitorData),contents.sectionListRenderer.contents.musicDescriptionShelfRenderer.description(runs/text);POST;res2]
    $jsonLoad[res2;$env[res2]]
    $if[$env[res2;responseContext;visitorData]!=;$setCache[authmusic_youtube_visitor;$env[res2;responseContext;visitorData]]]
    ]]
    $return[$if[$env[line]==true;$get[finalyric];$env[res2;contents;sectionListRenderer;contents;0;musicDescriptionShelfRenderer;description;runs;0;text]]]
    `
},
{
    name: "slicePlaylistYT",
    params: [{
        name: "playlistId", // string
        description: "PlaylistID",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $localFunction[runfuncytpl;
    $let[checktoken;$or[$env[lotoken]==;$env[lotoken]==null]]
    $httpSetBody[{"context":{"client":{"hl":"en","gl":"US","clientName":1,"clientVersion":"2.20261231","visitorData":"$getCache[authmusic_youtube_visitor]"}},$if[$get[checktoken];"browseId":"VL$env[playlistId]";"continuation":"$env[lotoken]"]}]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Language;en]
    $httpSetContentType[Text]
    $if[$get[checktoken];
    $!httpRequest[https://m.youtube.com/youtubei/v1/browse?prettyPrint=false&fields=contents.twoColumnBrowseResultsRenderer.tabs.tabRenderer.content.sectionListRenderer.contents(itemSectionRenderer(contents(playlistVideoListRenderer(contents(playlistVideoRenderer(videoId,title(runs(text)),lengthText(simpleText)),continuationItemRenderer(continuationEndpoint(commandExecutorCommand(commands/continuationCommand/token))))))));POST;a]
    ;
    $!httpRequest[https://m.youtube.com/youtubei/v1/browse?prettyPrint=false&fields=onResponseReceivedActions.appendContinuationItemsAction.continuationItems(playlistVideoRenderer(videoId,title(runs(text)),lengthText(simpleText)),continuationItemRenderer(continuationEndpoint(continuationCommand(token))));POST;a]
    ]
    $jsonLoad[a;$env[a]]
    $jsonLoad[la;$if[$get[checktoken];$env[a;contents;twoColumnBrowseResultsRenderer;tabs;0;tabRenderer;content;sectionListRenderer;contents;0;itemSectionRenderer;contents;0;playlistVideoListRenderer;contents];$env[a;onResponseReceivedActions;0;appendContinuationItemsAction;continuationItems]]]
    $let[tokenindex;$arrayFindIndex[la;lk;$checkCondition[$env[lk;continuationItemRenderer]!=]]]
    $let[tokens;$default[$env[la;$get[tokenindex];continuationItemRenderer;continuationEndpoint;commandExecutorCommand;commands;1;continuationCommand;token];$default[$env[la;$get[tokenindex];continuationItemRenderer;continuationEndpoint;continuationCommand;token];null]]]
    $arrayForEach[la;ls;
    $if[$env[ls;playlistVideoRenderer;videoId]!=;
    $arrayPushJSON[results;{"url":"https://youtube.com/watch?v=$env[ls;playlistVideoRenderer;videoId]","title":"$deflate[$env[ls;playlistVideoRenderer;title;runs;0;text];base64]","duration":"$round[$divide[$unparseDigital[$env[ls;playlistVideoRenderer;lengthText;simpleText]];1000]]"}]
    ]]
    $if[$get[tokens]!=null;$callLocalFunction[runfuncytpl;$get[tokens]]]
    ;lotoken]
    $callLocalFunction[runfuncytpl;]
    $return[$env[results]]
    `
},
{
    name: "getYoutubeFeed",
    params: [{
        name: "videoId", // string
        description: "VideoID",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $let[ytinitcookietest1;$getCache[authmusic_youtube_tempcookies]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[Accept-Language;en]
    $httpAddHeader[Cookie;$get[ytinitcookietest1]]
    $httpSetContentType[Text]
    $!httpRequest[https://www.youtube.com/watch?v=$env[videoId];GET;oisdn]
    $try[$jsonLoad[outputhtyt;$advancedTextSplit[$env[oisdn];var ytInitialData =;1;\\;;0]]]
    $if[$env[outputhtyt]==;$return[{}]]
    $jsonLoad[oisdn;$default[$env[outputhtyt;contents;twoColumnWatchNextResults;secondaryResults;secondaryResults;results;0;itemSectionRenderer;contents];{}]]
    $arrayMap[oisdn;pulllockview;$if[$and[$env[pulllockview;lockupViewModel]!=;$endsWith[$env[pulllockview;lockupViewModel;contentType];_VIDEO]];$return[$env[pulllockview;lockupViewModel]]];oisdn]

    $return[$default[$jsonStringify[oisdn];{}]]
    `
}]