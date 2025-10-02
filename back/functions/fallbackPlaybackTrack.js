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

    $try[
    $if[$env[types]==hls;
    $httpAddHeader[User-Agent;Mozilla/5.0 (Macintosh\\; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15,gzip(gfe)]
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"WEB","clientVersion":"2.$djsEval[new Date().toISOString().slice(0,10).replace(/-/g,'')]","visitorData":"$getGlobalVar[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $!httpRequest[https://youtubei.googleapis.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=playabilityStatus,videoDetails.lengthSeconds,streamingData.hlsManifestUrl;POST;reshttp]
    ;
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"VISIONOS","clientVersion":"0.1","visitorData":"$getGlobalVar[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $httpAddHeader[Accept-Encoding;gzip]
    $if[$or[$env[types]==;$env[types]==v];
    $!httpRequest[https://youtubei.googleapis.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=playabilityStatus,streamingData(adaptiveFormats(itag,url,contentLength));POST;reshttp]
    ]
    $if[$env[types]==va;
    $!httpRequest[https://youtubei.googleapis.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=playabilityStatus,streamingData(formats(itag,url));POST;reshttp]
    ]]]
    $onlyIf[$env[reshttp;playabilityStatus;status]!=LOGIN_REQUIRED;$let[finalurl;bot|$env[reshttp;playabilityStatus;reason]]]
    $onlyIf[$env[reshttp;playabilityStatus;liveStreamability]==;$let[finalurl;live]]
    $if[$or[$env[types]==;$env[types]==v];
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex140;$arrayFindIndex[afs;aaa;$env[aaa;itag]==140]]
    $onlyIf[$get[getindex140]!=-1;$let[finalurl;null]]
    $let[getcdnytlength;$env[afs;$get[getindex140];contentLength]]
    $if[$get[getcdnytlength]>=10000000;
    $let[checkindex139;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $if[$get[checkindex139]!=-1;
    $let[getindex140;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $let[getcdnytlength;$env[afs;$get[getindex140];contentLength]]
    ]]
    $let[getcdnyt;$env[afs;$get[getindex140];url]]
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
    $jsonLoad[test;$extractTrack[$env[url]]]
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
    $jsonLoad[test;$extractTrack[$env[url]]]
    $onlyIf[$env[test;results;preview;0;file_id]!=;$callLocalFunction[oncecode;true]]
    $let[finalurl;https://p.scdn.co/mp3-preview/$env[test;results;preview;0;file_id]]
    ]
    $if[$or[$env[whattype;type]==tiktok;$env[whattype;type]==tiktokmob];
    $jsonLoad[test;$extractTrack[$env[url]]]
    $onlyIf[$env[test;results]!=null;$callLocalFunction[oncecode;true]]
    $if[$env[test;results;video;bitrateInfo;0;PlayAddr;UrlList]==;
    $jsonLoad[b;$env[test;results;video;PlayAddrStruct;UrlList]]
    ;
    $jsonLoad[elindex;$env[test;results;video;bitrateInfo]]
    $let[ad1;$arrayFindIndex[elindex;ef;$checkContains[$env[ef;GearName];adapt_lowest_1080]]]
    $let[findindex;$get[ad1]]
    $if[$get[ad1]==-1;
    $let[ad2;$arrayFindIndex[elindex;ef;$checkContains[$env[ef;GearName];adapt_lower_]]]
    $let[findindex;$get[ad2]]
    $if[$get[ad2]==-1;
    $let[ad3;$arrayFindIndex[elindex;ef;$checkContains[$env[ef;GearName];normal_]]]
    $let[findindex;$get[ad3]]
    $if[$get[ad3]==-1;
    $let[ad4;$arrayFindIndex[elindex;ef;$checkContains[$env[ef;GearName];adapt_540]]]
    $let[findindex;$get[ad4]]
    $if[$get[ad4]==-1;
    $let[ad5;$arrayFindIndex[elindex;ef;$checkContains[$env[ef;GearName];lowest_540]]]
    $onlyIf[$get[ad5]!=-1;$let[finalurl;null]]
    $let[findindex;$get[ad5]]
    ]]]]
    $jsonLoad[b;$env[test;results;video;bitrateInfo;$get[findindex];PlayAddr;UrlList]]
    ]
    $onlyIf[$env[b;0]!=;$let[finalurl;null]]
    $let[finalurl;$advancedReplace[$env[b;$arrayFindIndex[b;c;$checkContains[$env[c];tiktok.com/aweme]]];faid=1988;faid=1322;www.tiktok.com;api16-normal.tiktokv.com]]
    ]
    $if[$env[whattype;type]==tiktokmusic;
    $jsonLoad[a;$extractTrack[$env[url]]]
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
    $httpAddHeader[Accept-Encoding;gzip]
    $httpSetContentType[Text]
    $!httpRequest[$env[url];GET;a]
    ]
    $onlyIf[$env[a]!=;$callLocalFunction[oncecode;true]]
    $let[finalurl;$advancedTextSplit[$env[a];"contentUrl":";1;";0]]
    ]]
    ;retry]
    $callLocalFunction[oncecode;false]
    $return[$get[finalurl]]
    `
}
