module.exports = {
    name: "fallbackPlaybackTrack",
    params: [{
        name: "url", // string
        description: "URL",
        required: true
    },
    {
        name: "types", // enum
        description: "Changes quality",
        required: true
    },
    {
        name: "tempobject", // object
        description: "Replacement of objects http response",
        required: false
    },
    {
        name: "size_limit", // number
        description: "Limit size before downgrade quality",
        type: "Number",
        required: false
    }],
    code: `
    $if[$isValidLink[$env[url]]==false;$return]
    $jsonLoad[whattype;$callFunction[filterMediaID;$env[url]]]
    $let[trycount;0]
    $localFunction[oncecode;
    $if[$get[trycount]>=3;$return]
    $if[$env[retry]==true;$letSum[trycount;1]]
    $if[$env[whattype;type]==youtube;

    $let[videoid;$env[whattype;id]]
    $let[ytinitcookies;$djsEval[process.env.YOUTUBE_COOKIES]]

    $try[
    $if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;
    $let[ytinitauth;$callFunction[generateBearerYt;$get[ytinitcookies];]]
    $httpAddHeader[Authorization;$get[ytinitauth]]
    $httpAddHeader[Cookie;$get[ytinitcookies]]
    $httpAddHeader[Origin;https://www.youtube.com]
    $httpAddHeader[X-Origin;https://www.youtube.com]
    $httpAddHeader[Alt-Used;www.youtube.com]
    $httpAddHeader[X-Goog-Visitor-Id;$getCache[authmusic_youtube_visitor]]
    $httpAddHeader[X-Youtube-Bootstrap-Logged-In;true]
    ]
    $if[$or[$env[types]==;$env[types]==v];
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":101,"clientVersion":"0.1","visitorData":"$getCache[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://$if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;www.youtube.com;m.youtube.com]/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,streamingData(adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent);POST;reshttp]
    ]
    $if[$env[types]==va;
    $httpAddHeader[Accept-Encoding;]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":28,"clientVersion":"1.00.0","visitorData":"$getCache[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://$if[$or[$get[ytinitcookies]==;$get[ytinitcookies]==undefined]==false;www.youtube.com;m.youtube.com]/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,streamingData(formats(itag,url)),videoDetails(isLiveContent);POST;reshttp]
    ]]
    $if[$env[reshttp;playabilityStatus;status]!=OK;$return[$let[finalurl;bot|$default[$env[reshttp;playabilityStatus;reason];Precondition check failed]]]]
    $if[$env[reshttp;videoDetails;isLiveContent];$return[$let[finalurl;live]]]
    $if[$or[$env[types]==;$env[types]==v];
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==251]]
    $if[$get[getindex251]==-1;$return[$let[finalurl;null]]]
    $let[getcdnytlength;$env[afs;$get[getindex251];contentLength]]
    $if[$get[getcdnytlength]>=$env[size_limit];
    $let[checkindex139;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $if[$get[checkindex139]!=-1;
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $let[getcdnytlength;$env[afs;$get[getindex251];contentLength]]
    ]]
    $let[getcdnyt;$env[afs;$get[getindex251];url]]
    $if[$get[getcdnytlength]>=10000000;
    $arrayLoad[las]
    $let[trackytlength;0]
    $loop[-1;
    $arrayPush[las;$replace[$get[getcdnyt];&requiressl=yes;&requiressl=yes&ratebypass=true&range=$get[trackytlength]-$if[$sum[$get[trackytlength];10000000]>=$get[getcdnytlength];$get[getcdnytlength];$sum[$get[trackytlength];10000000]];1]]
    $letSum[trackytlength;10000000]
    $if[$get[trackytlength]>=$get[getcdnytlength];
    $break
    ]]
    $let[finalurl;{"length":"$get[getcdnytlength]","container":$jsonStringify[las],"original":"$replace[$get[getcdnyt];&requiressl=yes;&requiressl=yes&ratebypass=true&range=0-$get[getcdnytlength];1]&cpn=$randomString[16]&alr=no"}]
    ;
    $let[finalurl;$replace[$get[getcdnyt];&requiressl=yes;&requiressl=yes&ratebypass=true&range=0-$get[getcdnytlength];1]&cpn=$randomString[16]&alr=no]
    ]]
    $if[$env[types]==va;
    $jsonLoad[fts;$env[reshttp;streamingData;formats]]
    $let[getindex18;$arrayFindIndex[fts;aaa;$env[aaa;itag]==18]]
    $if[$get[getindex18]==-1;$return[$let[finalurl;null]]]
    $let[getcdnyt;$env[fts;$get[getindex18];url]]
    $let[finalurl;$get[getcdnyt]&cpn=$randomString[16]&alr=no]
    ]
    ]
    $if[$env[whattype;type]==soundcloud;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results]==null;$return[$let[finalurl;bot|Track not available]]]
    $jsonLoad[loadres;$env[test;results]]
    $jsonLoad[test4;$env[loadres;media;transcodings]]
    $arrayMap[test4;test5;$if[$env[test5;format;protocol]==progressive;$return[$env[test5]]];test6]
    $if[$env[test6;0;url]==;$return[$let[finalurl;bot|DASH Audio is not available]]]
    $!httpRequest[$env[test6;0;url]&track_authorization=$env[loadres;track_authorization];GET;rest]
    $let[finalurl;$env[rest;url]]
    $if[$get[finalurl]==;$return[$let[finalurl;null]]]
    ;
    $if[$env[whattype;type]==spotify;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results;props]!=;
    $let[retpreview;$env[test;results;props;pageProps;state;data;entity;audioPreview;url]]
    ;
    $let[retpreview;$if[$env[test;results;preview_url]!=null;$env[test;results;preview_url]]]
    ]
    $if[$get[retpreview]==;$return[$let[finalurl;null]]]
    $let[finalurl;$get[retpreview]]
    ]
    $if[$env[whattype;type]==tiktokmob;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results;error]!=;$return[$let[finalurl;bot|$env[test;results;error]]]]
    $if[$env[test;results]==null;$callLocalFunction[oncecode;true] $stop]
    $jsonLoad[whattype;$callFunction[filterMediaID;$if[$or[$env[test;results;video;id]!=;$env[test;results;music_info]!=];https://www.tiktok.com/@/video/$env[test;results;video;id];https://www.tiktok.com/music/-$env[test;results;mid]]]]
    ]
    $if[$env[whattype;type]==tiktok;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results;error]!=;$return[$let[finalurl;bot|$env[test;results;error]]]]
    $if[$env[test;results]==null;$callLocalFunction[oncecode;true] $stop]
    $if[$env[test;results;video_info;url_list;0]!=;
    $let[finalurl;$env[test;results;video_info;url_list;0]]
    $return
    ]
    $if[$env[test;results;video;bitrateInfo;0;PlayAddr;UrlList]==;
    $jsonLoad[b;$env[test;results;video;PlayAddrStruct;UrlList]]
    ;
    $jsonLoad[elindex;$env[test;results;video;bitrateInfo]]
    $let[ad1;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_lowest_]]]
    $let[findindex;$get[ad1]]
    $if[$get[ad1]==-1;
    $let[ad2;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_lower_]]]
    $let[findindex;$get[ad2]]
    $if[$get[ad2]==-1;
    $let[ad3;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];normal_]]]
    $let[findindex;$get[ad3]]
    $if[$get[ad3]==-1;
    $let[ad4;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_]]]
    $let[findindex;$get[ad4]]
    $if[$get[ad4]==-1;
    $let[ad5;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];lowest_]]]
    $let[findindex;$get[ad5]]
    $if[$get[ad5]==-1;
    $let[ad6;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];lower_]]]
    $if[$get[ad6]==-1;$return[$let[finalurl;null]]]
    $let[findindex;$get[ad6]]
    ]]]]]
    $jsonLoad[b;$env[test;results;video;bitrateInfo;$get[findindex];PlayAddr;UrlList]]
    ]
    $if[$env[b;0]==;$return[$let[finalurl;null]]]
    $let[finalurl;$advancedReplace[$env[b;$arrayFindIndex[b;c;$checkContains[$env[c];tiktok.com/aweme]]];faid=1988;faid=1233;www.tiktok.com;api2.musical.ly]]
    $let[finalurl;$djsEval[require("undici").request(ctx.getKeyword("finalurl"),{method:"GET"}).then(a => a.headers.location).catch()]]
    ]
    $if[$env[whattype;type]==tiktokmusic;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$callLocalFunction[oncecode;true] $stop]
    $if[$env[a;results;play_url;uri]==;
    $jsonLoad[b;$env[a;results;extra]]
    $let[finalurl;$env[b;original_song_url]]
    ;
    $let[finalurl;$env[a;results;play_url;uri]]
    ]
    $if[$get[finalurl]==;$return[$let[finalurl;null]]]
    ]
    $if[$env[whattype;type]==applemusic;
    $try[
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetContentType[Text]
    $!httpRequest[$env[url];GET;a]
    ]
    $if[$env[a]==;$callLocalFunction[oncecode;true] $stop]
    $let[finalurl;$advancedTextSplit[$env[a];"contentUrl":";1;";0]]
    ]]
    $if[$env[whattype;type]==facebook;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$or[$env[a;results]==;$env[a;results;is_live_stream]==true;$env[a;results;is_hls]==true];$return[$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]]
    $if[$env[a;results;hd_src]!=null;
    $let[finalurl;$env[a;results;hd_src]]
    ;
    $let[finalurl;$env[a;results;sd_src]]
    ]]
    $if[$env[whattype;type]==instagram;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$return[$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]]
    $let[finalurl;$default[$env[a;results;video_versions;0;url];$env[a;results;video_url]]]
    ]
    $if[$env[whattype;type]==instagramaudio;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $if[$and[$env[a;results;metadata;original_sound_info]==null;$env[a;results;metadata;music_info]==null];
    $let[finalurl;$djsEval[require("entities").decodeHTML("$advancedTextSplit[$env[a;results;items;0;media;video_dash_manifest];mimeType="audio/mp4";1;<BaseURL>;1;</BaseURL>;0]")]]
    ;
    $if[$env[a;results;metadata;original_sound_info;progressive_download_url]==null;
    $let[finalurl;$env[a;results;metadata;music_info;music_asset_info;progressive_download_url]]
    ;
    $let[finalurl;$env[a;results;metadata;original_sound_info;progressive_download_url]]
    ]]]
    $if[$env[whattype;type]==bandcamp;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $let[finalurl;$env[a;results;file;mp3-128]]
    ]
    $if[$env[whattype;type]==twitter;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $if[$env[a;results;quoted_status_result;result;legacy;entities;media;0;video_info]!=;
    $jsonLoad[b;$env[a;results;quoted_status_result;result;legacy;entities;media;0;video_info;variants]]
    ;
    $jsonLoad[b;$env[a;results;legacy;entities;media;0;video_info;variants]]
    ]
    $arrayMap[b;c;$if[$env[c;bitrate]!=;$return[$env[c]]];b]
    $let[finalurl;$env[b;$sub[$arrayLength[b];1];url]]
    ]
    ;retry]
    $callLocalFunction[oncecode;false]
    $return[$get[finalurl]]
    `
}
