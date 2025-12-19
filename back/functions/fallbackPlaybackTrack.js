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
    }],
    code: `
    $onlyIf[$isValidLink[$env[url]];$return]
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
    $let[ytinitauth;$djsEval[const GTH = (sapisid = "$advancedTextSplit[$get[ytinitcookies];SAPISID=;1;\\;;0]", secure1psid = "$advancedTextSplit[$get[ytinitcookies];__Secure-1PAPISID=;1;\\;;0]", secure3psid = "$advancedTextSplit[$get[ytinitcookies];__Secure-3PAPISID=;1;\\;;0]", origin_url = "https://www.youtube.com") => { const t = Math.floor(Date.now() / 1000).toString()\\; return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"\\; }\\; GTH()]]
    $httpAddHeader[Authorization;$get[ytinitauth]]
    $httpAddHeader[Cookie;$get[ytinitcookies]]
    $httpAddHeader[X-Goog-Visitor-Id;$getCache[authmusic_youtube_visitor]]
    ]
    $if[$env[types]==hls;
    $httpAddHeader[User-Agent;Mozilla/5.0 (Macintosh\\; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15,gzip(gfe)]
    $httpRemoveHeader[Accept-Encoding]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"WEB","clientVersion":"2.$replace[$cropText[$parseDate[$getTimestamp;ISO];0;10];-;]","visitorData":"$getCache[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,videoDetails.lengthSeconds,streamingData.hlsManifestUrl;POST;reshttp]
    ;
    $if[$or[$env[types]==;$env[types]==v];
    $httpRemoveHeader[Accept-Encoding]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"VISIONOS","clientVersion":"0.1","visitorData":"$getCache[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,streamingData(adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent);POST;reshttp]
    ]
    $if[$env[types]==va;
    $httpRemoveHeader[Accept-Encoding]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"ANDROID_VR","clientVersion":"1.00.0","visitorData":"$getCache[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,streamingData(formats(itag,url)),videoDetails(isLiveContent);POST;reshttp]
    ]]]
    $onlyIf[$env[reshttp;playabilityStatus;status]==OK;$let[finalurl;bot|$env[reshttp;playabilityStatus;reason]]]
    $onlyIf[$env[reshttp;videoDetails;isLiveContent]!=true;$let[finalurl;live]]
    $if[$or[$env[types]==;$env[types]==v];
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==251]]
    $onlyIf[$get[getindex251]!=-1;$let[finalurl;null]]
    $let[getcdnytlength;$env[afs;$get[getindex251];contentLength]]
    $if[$get[getcdnytlength]>=10000000;
    $let[checkindex139;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $if[$get[checkindex139]!=-1;
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $let[getcdnytlength;$env[afs;$get[getindex251];contentLength]]
    ]]
    $let[getcdnyt;$env[afs;$get[getindex251];url]]
    $let[finalurl;$replace[$get[getcdnyt];&requiressl=yes;&requiressl=yes&ratebypass=true&range=0-$get[getcdnytlength];1]]
    ]
    $if[$env[types]==hls;
    $let[jaghttp;$httpRequest[$env[reshttp;streamingData;hlsManifestUrl];GET;jsbd]]
    $onlyIf[$get[jaghttp]==200;$let[finalurl;null]]
    $arrayLoad[jskd;#EXT-X-STREAM-INF:BANDWIDTH=;$env[jsbd]]
    $!arrayShift[jskd]
    $let[fskklsv;$arrayFindIndex[jskd;oasb;$checkCondition[$divide[$multi[$advancedTextSplit[$env[oasb];,;0];$env[reshttp;videoDetails;lengthSeconds]];8]>=10000000]]]
    $let[fsidlsv;$env[jskd;$if[$get[fskklsv]==-1;$sub[$arrayLength[jskd];1];$get[fskklsv]]]]
    $let[finalurl;$advancedTextSplit[$get[fsidlsv];
;1]]
    ]
    $if[$env[types]==va;
    $jsonLoad[fts;$env[reshttp;streamingData;formats]]
    $let[getindex18;$arrayFindIndex[fts;aaa;$env[aaa;itag]==18]]
    $onlyIf[$get[getindex18]!=-1;$let[finalurl;null]]
    $let[getcdnyt;$env[fts;$get[getindex18];url]]
    $try[$let[pullength;$httpRequest[$get[getcdnyt];HEAD]] $let[checklength;$if[$httpGetHeader[Content-Length]!=;$httpGetHeader[Content-Length];0]]]
    $let[finalurl;$get[getcdnyt]&cpn=$randomString[16]$if[$has[pullength];&range=0-$get[checklength]]]
    ]
    ]
    $if[$env[whattype;type]==soundcloud;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $jsonLoad[loadres;$env[test;results]]
    $arrayMap[loadres;test2;$if[$env[test2;hydratable]==sound;$return[$env[test2]]];test3]
    $jsonLoad[test4;$env[test3;0;data;media;transcodings]]
    $arrayMap[test4;test5;$if[$env[test5;format;protocol]==progressive;$return[$env[test5]]];test6]
    $onlyIf[$env[test6;0;url]!=;$let[finalurl;null]]
    $!httpRequest[$env[test6;0;url]&track_authorization=$env[test3;0;data;track_authorization];GET;rest]
    $let[finalurl;$env[rest;url]]
    $onlyIf[$get[finalurl]!=;$let[finalurl;null]]
    ;
    $if[$env[whattype;type]==spotify;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results;props]!=;
    $let[retpreview;$env[test;results;props;pageProps;state;data;entity;audioPreview;url]]
    ;
    $let[retpreview;$if[$env[test;results;preview_url]!=null;$env[test;results;preview_url]]]
    ]
    $onlyIf[$get[retpreview]!=;$let[finalurl;null]]
    $let[finalurl;$get[retpreview]]
    ]
    $if[$env[whattype;type]==tiktokmob;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[test;results]!=null;$callLocalFunction[oncecode;true]]
    $jsonLoad[whattype;$callFunction[filterMediaID;$if[$or[$env[test;results;video;id]!=;$env[test;results;music_info]!=];https://www.tiktok.com/@/video/$env[test;results;video;id];https://www.tiktok.com/music/-$env[test;results;mid]]]]
    ]
    $if[$env[whattype;type]==tiktok;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[test;results;error]==;$let[finalurl;bot|$env[test;results;error]]]
    $onlyIf[$env[test;results]!=null;$callLocalFunction[oncecode;true]]
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
    $onlyIf[$get[ad6]!=-1;$let[finalurl;null]]
    $let[findindex;$get[ad6]]
    ]]]]]
    $jsonLoad[b;$env[test;results;video;bitrateInfo;$get[findindex];PlayAddr;UrlList]]
    ]
    $onlyIf[$env[b;0]!=;$let[finalurl;null]]
    $let[finalurl;$advancedReplace[$env[b;$arrayFindIndex[b;c;$checkContains[$env[c];tiktok.com/aweme]]];faid=1988;faid=1180;www.tiktok.com;api2.musical.ly]]
    $let[finalurl;$djsEval[require("undici").request(ctx.getKeyword("finalurl"),{method:"GET"}).then(a => a.headers.location).catch()]]
    ]
    $if[$env[whattype;type]==tiktokmusic;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[a;results]!=null;$callLocalFunction[oncecode;true]]
    $if[$env[a;results;play_url;uri]==;
    $jsonLoad[b;$env[a;results;extra]]
    $let[finalurl;$env[b;original_song_url]]
    ;
    $let[finalurl;$env[a;results;play_url;uri]]
    ]
    $onlyIf[$get[finalurl]!=;$let[finalurl;null]]
    ]
    $if[$env[whattype;type]==applemusic;
    $try[
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
    $httpSetContentType[Text]
    $!httpRequest[$env[url];GET;a]
    ]
    $onlyIf[$env[a]!=;$callLocalFunction[oncecode;true]]
    $let[finalurl;$advancedTextSplit[$env[a];"contentUrl":";1;";0]]
    ]]
    $if[$env[whattype;type]==facebook;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$or[$env[a;results]==;$env[a;results;is_live_stream]==true;$env[a;results;is_hls]==true]!=true;$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]
    $let[finalurl;$default[$env[a;results;hd_src];$env[a;results;sd_src]]]
    ]
    $if[$env[whattype;type]==instagram;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[a;results]!=null;$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]
    $let[finalurl;$env[a;results;video_url]]
    ]
    $if[$env[whattype;type]==instagramaudio;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[a;results]!=null;$let[finalurl;null]]
    $if[$env[a;results;metadata;original_sound_info;progressive_download_url]==null;
    $let[finalurl;$env[a;results;metadata;music_info;music_asset_info;progressive_download_url]]
    ;
    $let[finalurl;$env[a;results;metadata;original_sound_info;progressive_download_url]]
    ]]
    $if[$env[whattype;type]==bandcamp;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[a;results]!=null;$let[finalurl;null]]
    $let[finalurl;$env[a;results;file;mp3-128]]
    ]
    $if[$env[whattype;type]==twitter;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $onlyIf[$env[a;results]!=null;$let[finalurl;null]]
    $jsonLoad[b;$env[a;results;legacy;entities;media;0;video_info;variants]]
    $arrayMap[b;c;$if[$env[c;bitrate]!=;$return[$env[c]]];b]
    $let[finalurl;$env[b;$sub[$arrayLength[b];1];url]]
    ]
    ;retry]
    $callLocalFunction[oncecode;false]
    $return[$get[finalurl]]
    `
}
