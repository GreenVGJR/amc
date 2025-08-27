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
    $onlyIf[$isValidLink[$env[url]];$return[null]]
    $jsonLoad[whattype;$callFunction[filterMediaID;$env[url]]]
    $let[trycount;0]
    $localFunction[oncecode;
    $if[$get[trycount]>=3;$return[null] $stop]
    $if[$env[retry]==true;$letSum[trycount;1]]
    $if[$env[whattype;type]==youtube;

    $let[videoid;$env[whattype;id]]

    $try[
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"ANDROID_VR","clientVersion":"1.10.0","visitorData":"$getGlobalVar[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":true,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $httpAddHeader[Accept-Encoding;gzip]
    $if[$or[$env[types]==;$env[types]==v];
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=playabilityStatus,streamingData(adaptiveFormats(itag,url,contentLength));POST;reshttp]
    ]
    $if[$env[types]==va;
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=playabilityStatus,streamingData(formats(itag,url));POST;reshttp]
    ]]
    $if[$env[reshttp;playabilityStatus;status]==LOGIN_REQUIRED;$return[bot|$env[reshttp;playabilityStatus;reason] $stop]]
    $if[$or[$env[types]==;$env[types]==v];
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex140;$arrayFindIndex[afs;aaa;$env[aaa;itag]==140]]
    $onlyIf[$get[getindex140]!=-1;$return[null]]
    $let[getcdnytlength;$env[afs;$get[getindex140];contentLength]]
    $if[$get[getcdnytlength]>=10000000;
    $let[checkindex139;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $if[$get[checkindex139]!=-1;
    $let[getindex140;$arrayFindIndex[afs;aaa;$env[aaa;itag]==139]]
    $let[getcdnytlength;$env[afs;$get[getindex140];contentLength]]
    ]]
    $let[getcdnyt;$env[afs;$get[getindex140];url]]
    $onlyIf[$or[$get[getcdnytlength]==;$get[getcdnytlength]==0]!=true;$return[live]]
    $let[finalurl;$replace[$get[getcdnyt];&requiressl=yes;&requiressl=yes&ratebypass=true&range=0-$get[getcdnytlength];1]]
    ]
    $if[$env[types]==va;
    $jsonLoad[fts;$env[reshttp;streamingData;formats]]
    $let[getindex18;$arrayFindIndex[fts;aaa;$env[aaa;itag]==18]]
    $onlyIf[$get[getindex18]!=-1;$return[null]]
    $let[getcdnyt;$env[fts;$get[getindex18];url]]
    $try[$let[pullength;$httpRequest[$get[getcdnyt];HEAD]] $let[checklength;$if[$httpGetHeader[Content-Length]!=;$httpGetHeader[Content-Length];0]]]
    $let[finalurl;$get[getcdnyt]&cpn=$randomString[16]$if[$has[pullength];&range=0-$get[checklength]]]
    ]
    $let[checkat;false]
    $try[
    $let[httpcode;$httpRequest[$get[finalurl];HEAD]]
    $onlyIf[$get[httpcode]==200;$callLocalFunction[oncecode;true]]
    $let[checkat;true]
    ]
    $if[$get[checkat];$return[$trimLines[$get[finalurl]]]]
    $stop
    ;
    $if[$env[whattype;type]==soundcloud;
    $jsonLoad[test;$extractTrack[$env[url]]]
    $jsonLoad[loadres;$env[test;results]]
    $arrayMap[loadres;test2;$if[$env[test2;hydratable]==sound;$return[$env[test2]]];test3]
    $jsonLoad[test4;$env[test3;0;data;media;transcodings]]
    $arrayMap[test4;test5;$if[$env[test5;format;protocol]==progressive;$return[$env[test5]]];test6]
    $onlyIf[$env[test6;0;url]!=;$return[null]]
    $!httpRequest[$env[test6;0;url]&track_authorization=$env[test3;0;data;track_authorization];GET;rest]
    $let[finalurl;$env[rest;url]]
    $onlyIf[$get[finalurl]!=;$return[null]]
    $try[
    $onlyIf[$httpRequest[$get[finalurl];HEAD]==200;$callLocalFunction[oncecode;true]]
    ]
    $return[$trimLines[$get[finalurl]]]
    $stop
    ;
    $if[$env[whattype;type]==spotify;
    $jsonLoad[test;$extractTrack[$env[url]]]
    $onlyIf[$env[test;results;preview;0;file_id]!=;$callLocalFunction[oncecode;true]]
    $let[fileurl;https://p.scdn.co/mp3-preview/$env[test;results;preview;0;file_id]]
    $return[$trimLines[$get[fileurl]]]
    $stop
    ;
    $if[$or[$env[whattype;type]==tiktok;$env[whattype;type]==tiktokmob];
    $jsonLoad[test;$extractTrack[$env[url]]]
    $onlyIf[$env[test;results]!=null;$callLocalFunction[oncecode;true]]
    $jsonLoad[elindex;$env[test;results;video;bitrateInfo]]
    $let[findindex;$arrayFindIndex[elindex;ef;$or[$checkContains[$env[ef;GearName];adapt_lowest_1080];$checkContains[$env[ef;GearName];normal_720];$checkContains[$env[ef;GearName];normal_540];$checkContains[$env[ef;GearName];adapt_lower_];$checkContains[$env[ef;GearName];adapt_540];$checkContains[$env[ef;GearName];lowest_540]]]]
    $onlyIf[$env[test;results;video;bitrateInfo;0;PlayAddr;UrlList]!=;$return[null]]
    $jsonLoad[b;$env[test;results;video;bitrateInfo;$get[findindex];PlayAddr;UrlList]]
    $let[finalurl;$advancedReplace[$env[b;$arrayFindIndex[b;c;$checkContains[$env[c];tiktok.com/aweme]]];faid=1988;faid=1128;www.tiktok.com;api16-normal.tiktokv.com]]
    $return[$trimLines[$get[finalurl]]]
    $stop
    ;
    $if[$env[whattype;type]==tiktokmusic;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $onlyIf[$env[a;results]!=null;$callLocalFunction[oncecode;true]]
    $let[finalurl;$env[a;results;play_url;uri]]
    $onlyIf[$get[finalurl]!=;$return[null]]
    $return[$trimLines[$get[finalurl]]]
    $stop
    ]]]]]
    ;retry]
    $callLocalFunction[oncecode;false]
    `
}
