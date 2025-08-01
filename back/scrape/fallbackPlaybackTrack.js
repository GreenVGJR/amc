module.exports = {
    name: "fallbackPlaybackTrack",
    params: [{
        name: "url", // string
        description: "URL",
        required: true
    }],
    code: `
    $onlyIf[$isValidLink[$env[url]];$return[null]]
    $jsonLoad[whattype;$callFunction[filterMediaID;$env[url]]]
    $localFunction[oncecode;
    $let[trycount;0]
    $onlyIf[$get[trycount]<3;$return[null]]
    $if[$env[retry];$letSum[trycount;1]]
    $if[$env[whattype;type]==youtube;

    $let[videoid;$env[whattype;id]]

    $try[
    $httpSetBody[{"videoId":"$get[videoid]","context":{"client":{"hl":"en-US","gl":"US","clientName":"ANDROID_VR","clientVersion":"1.10.0","visitorData":"$getGlobalVar[authmusic_youtube_visitor]","clientScreen":"WATCH","clientFormFactor":"UNKNOWN_FORM_FACTOR"},"request":{"useSsl":true,"internalExperimentFlags":\\[\\],"consistencyTokenJars":\\[\\]}},"playbackContext":{"contentPlaybackContext":{"vis":0,"splay":false,"html5Preference":"HTML5_PREF_WANTS","lactMilliseconds":"-1"}},"attestationRequest":{"omitBotguardData":true},"racyCheckOk":true,"contentCheckOk":true}]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://www.youtube.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key]&prettyPrint=false&fields=streamingData(formats(itag,url,contentLength),adaptiveFormats(itag,url,contentLength));POST;reshttp]
    ]

    $jsonLoad[aa;$env[reshttp;streamingData;adaptiveFormats]]
    $jsonLoad[filter_aa;$arrayMap[aa;ab;$return[$replace[$env[ab];&requiressl=yes;&requiressl=yes&ratebypass=true&range=0-$env[ab;contentLength];1]]]]
    $let[getcdnyt;$env[filter_aa;$arrayFindIndex[filter_aa;filters_aa;$or[$env[filters_aa;itag]==251;$env[filters_aa;itag]==140;$env[filters_aa;itag]==18]];url]]
    $let[getcdnytlength;$env[filter_aa;$arrayFindIndex[filter_aa;filters_aa;$or[$env[filters_aa;itag]==251;$env[filters_aa;itag]==140;$env[filters_aa;itag]==18]];contentLength]]
    $onlyIf[$or[$get[getcdnytlength]==;$get[getcdnytlength]==0]!=true;$return[live]]
    $let[finalurl;$get[getcdnyt]&cpn=$toLowercase[$randomString[16]]]
    $try[
    $onlyIf[$httpRequest[$get[finalurl];HEAD]==200;$callLocalFunction[oncecode;true]]
    ;
    $callLocalFunction[oncecode;true]
    ]
    $return[$trimLines[$get[finalurl]]]
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
    ;
    $callLocalFunction[oncecode;true]
    ]
    $return[$trimLines[$get[finalurl]]]
    ;
    $if[$env[whattype;type]==spotify;
    $jsonLoad[test;$extractTrack[$env[url]]]
    $onlyIf[$env[test;results;preview;0;file_id]!=;$return[null]]
    $let[fileurl;https://p.scdn.co/mp3-preview/$env[test;results;preview;0;file_id]]
    $return[$trimLines[$get[fileurl]]]
    ]]]
    ;retry]
    $callLocalFunction[oncecode;false]
    `
}
