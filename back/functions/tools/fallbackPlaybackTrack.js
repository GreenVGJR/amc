const { androidVrClientYT } = require('../helpers/clientYoutube.js');

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
    $let[ytinitauth;$djsEval[process.env.YOUTUBE_AUTH]]
    $jsonLoad[listclient;${androidVrClientYT()}]
    $let[defytdomain;$env[listclient;targetDomain]]
    $let[tempclientid;$env[listclient;client_id]]
    $let[tempclientsecret;$env[listclient;client_secret]]
    $!jsonDelete[listclient;targetDomain]
    $!jsonDelete[listclient;client_id]
    $!jsonDelete[listclient;client_secret]
    $!jsonSet[listclient;visitorData;$getCache[initclientmusic;authmusic_youtube_visitor]]
    $!jsonSet[listclient;hl;en]
    $!jsonSet[listclient;gl;US]

    $try[
    $if[$or[$get[ytinitauth]==;$get[ytinitauth]==undefined]==false;
    $let[supportAuth;$or[$get[tempclientid]==null;$get[tempclientsecret]==null]]
    $if[$and[$callFunction[configMusic;useBearer]==true;$get[supportAuth]==false];
    $try[$jsonLoad[youtubeAuth;$get[ytinitauth]]]
    $httpAddHeader[Authorization;Bearer $env[youtubeAuth;token]]
    $httpAddHeader[X-Goog-AuthUser;0]
    ]
    ;
    $httpAddHeader[Cookie;$getCache[initclientmusic;authmusic_youtube_tempcookies]]
    ]

    $httpAddHeader[X-Youtube-Client-Name;$env[listclient;clientName]]
    $httpAddHeader[X-Youtube-Client-Version;$env[listclient;clientVersion]]
    $httpAddHeader[Origin;https://$get[defytdomain]]
    $httpAddHeader[X-Origin;https://$get[defytdomain]]
    $httpAddHeader[User-Agent;$default[$env[listclient;userAgent];$callFunction[configMusic;default_userAgent_desktop]]]
    $httpSetBody[{"videoId":"$get[videoid]","contentCheckOk":true,"racyCheckOk":true,"cpn":"$toLowercase[$randomString[16]]","context":{"client":$jsonStringify[listclient]},"serviceIntegrityDimensions":{"poToken":"$getCache[initclientmusic;authmusic_youtube_pot]"},"attestationRequest":{"omitBotguardData":false}}]
    $!httpRequest[https://$get[defytdomain]/youtubei/v1/player?prettyPrint=false&fields=responseContext(visitorData),playabilityStatus,streamingData(formats(itag,url),adaptiveFormats(itag,url,contentLength)),videoDetails(lengthSeconds,isLiveContent);POST;reshttpm]
    $jsonLoad[reshttp;$env[reshttpm]]
    ]

    $if[$env[reshttp;playabilityStatus;status]!=OK;$return[$let[finalurl;bot|$default[$default[$env[reshttp;playabilityStatus;reason];$env[reshttpm;responseContext;status]];Precondition check failed]]]]
    $if[$and[$env[reshttp;videoDetails;lengthSeconds]==0;$default[$env[reshttp;videoDetails;isLiveContent];false]];$return[$let[finalurl;live]]]
    $if[$env[reshttpm;responseContext;visitorData]!=;$setCache[initclientmusic;authmusic_youtube_visitor;$env[reshttpm;responseContext;visitorData]]]
    $if[$or[$env[types]==;$env[types]==v];
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==140]]
    $if[$get[getindex251]==-1;$return[$let[finalurl;bot|Format is not available]]]
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
    $if[$env[types]==vs;
    $jsonLoad[afs;$env[reshttp;streamingData;adaptiveFormats]]
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==251]]
    $if[$get[getindex251]==-1;$return[$let[finalurl;bot|Format is not available]]]
    $let[getcdnytlength;$env[afs;$get[getindex251];contentLength]]
    $if[$get[getcdnytlength]>=$env[size_limit];
    $let[checkindex139;$arrayFindIndex[afs;aaa;$env[aaa;itag]==249]]
    $if[$get[checkindex139]!=-1;
    $let[getindex251;$arrayFindIndex[afs;aaa;$env[aaa;itag]==249]]
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
    $if[$get[getindex18]==-1;$return[$let[finalurl;bot|Format is not available]]]
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
    $!httpRequest[$env[test6;0;url]?client_id=$getCache[initclientmusic;authmusic_soundcloud_fall]&track_authorization=$env[loadres;track_authorization];GET;rest]
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
    $if[$env[test;results;error]!=;$let[finalurl;bot|$env[test;results;error]] $return]
    $if[$env[test;results]==null;$callLocalFunction[oncecode;true] $return]
    $jsonLoad[whattype;$callFunction[filterMediaID;$if[$or[$env[test;results;video;id]!=;$env[test;results;music_info]!=];https://www.tiktok.com/@/video/$env[test;results;video;id];https://www.tiktok.com/music/-$env[test;results;mid]]]]
    ]
    $if[$env[whattype;type]==tiktok;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[test;results;error]!=;$let[finalurl;bot|$env[test;results;error]] $return]
    $if[$env[test;results]==null;$callLocalFunction[oncecode;true] $return]
    $c[Embed]
    $if[$env[test;results;itemInfos;video;urls;0]!=;
    $let[finalurl;$env[test;results;itemInfos;video;urls;0]]
    $return
    ]
    $c[Webpage (Legacy format)]
    $if[$env[test;results;video_info;url_list;0]!=;
    $let[finalurl;$env[test;results;video_info;url_list;0]]
    $return
    ]
    $c[Webpage (Adaptive formats)]
    $if[$env[test;results;video;bitrateInfo;0;PlayAddr;UrlList;0]==;
    $jsonLoad[b;$env[test;results;video;PlayAddrStruct;UrlList]]
    ;
    $jsonLoad[elindex;$default[$env[test;results;video;bitrateInfo];{}]]
    $jsonLoad[elmindex;$default[$env[test;results;video;bitrateAudioInfo];{}]]
    $let[ad0;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];original_]]]
    $let[findindex;$get[ad0]]
    $if[$get[ad0]==-1;
    $let[jfg1;$arrayFindIndex[elmindex;ef;$startsWith[$env[ef;AudioQualityString];adapt_lowest]]]
    $let[ad1;$if[$get[jfg1]!=-1;-1;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_lowest_]]]]
    $let[findindex;$get[ad1]]
    $if[$get[ad1]==-1;
    $let[jfg2;$arrayFindIndex[elmindex;ef;$startsWith[$env[ef;AudioQualityString];adapt_lower]]]
    $let[ad2;$if[$get[jfg2]!=-1;-1;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_lower_]]]]
    $let[findindex;$get[ad2]]
    $if[$get[ad2]==-1;
    $let[ad3;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];normal_]]]
    $let[findindex;$get[ad3]]
    $if[$get[ad3]==-1;
    $let[jfg3;$arrayFindIndex[elmindex;ef;$startsWith[$env[ef;AudioQualityString];adapt]]]
    $let[ad4;$if[$get[jfg3]!=-1;-1;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];adapt_]]]]
    $let[findindex;$get[ad4]]
    $if[$get[ad4]==-1;
    $let[ad5;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];lowest_]]]
    $let[findindex;$get[ad5]]
    $if[$get[ad5]==-1;
    $let[ad6;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];lower_]]]
    $let[findindex;$get[ad6]]
    $if[$get[ad6]==-1;
    $let[jfg4;$arrayFindIndex[elmindex;ef;$startsWith[$env[ef;AudioQualityString];comet]]]
    $let[jfg5;$arrayFindIndex[elmindex;ef;$startsWith[$env[ef;AudioQualityString];comet_adapt]]]
    $let[ad7;$if[$or[$get[jfg4]!=-1;$get[jfg5]!=-1];-1;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];comet_]]]]
    $let[findindex;$get[ad7]]
    $if[$get[ad7]==-1;
    $let[ad8;$arrayFindIndex[elindex;ef;$startsWith[$env[ef;GearName];group_]]]
    $if[$get[ad8]==-1;$return[$let[finalurl;null]]]
    $let[findindex;$get[ad8]]
    ]]]]]]]]
    $jsonLoad[b;$env[test;results;video;bitrateInfo;$get[findindex];PlayAddr;UrlList]]
    ]
    $if[$env[b;0]==;$return[$let[finalurl;null]]]
    $let[finalurl;$advancedReplace[$env[b;$arrayFindIndex[b;c;$checkContains[$env[c];tiktok.com/aweme]]];faid=1988;faid=1180]]
    $let[finalurl;$djsEval[fetch(ctx.getKeyword("finalurl"), { method: "GET" }).then(a => a.url).catch(() => ctx.getKeyword("finalurl"))]]
    ]
    $if[$env[whattype;type]==tiktokmusic;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$callLocalFunction[oncecode;true] $return]
    $if[$env[a;results;play_url;uri]==;
    $jsonLoad[b;$env[a;results;extra]]
    $let[finalurl;$env[b;original_song_url]]
    ;
    $let[finalurl;$env[a;results;play_url;uri]]
    ]
    $if[$get[finalurl]==;$return[$let[finalurl;null]]]
    ]
    $if[$env[whattype;type]==applemusic;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$callLocalFunction[oncecode;true] $return]
    $let[finalurl;$env[a;results;previewUrl]]
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
    $if[$env[a;results;error]!=;$return[$let[finalurl;bot|$env[a;results;error]]]]
    $if[$env[a;results]==null;$return[$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]]
    $if[$env[a;results;shortcode_media]!=;
    $if[$env[a;results;shortcode_media;video_url]!=;
    $let[finalurl;$env[a;results;shortcode_media;video_url]]
    ;
    $jsonLoad[jysv;$default[$env[a;results;shortcode_media;edge_sidecar_to_children;edges];{}]]
    $let[finalurl;$env[jysv;$arrayFindIndex[jysv;iuy;$checkCondition[$env[iuy;node;video_url]!=]];node;video_url]]
    ]
    ;
    $if[$env[a;results;video_versions;0;url]!=;
    $let[finalurl;$env[a;results;video_versions;0;url]]
    ;
    $jsonLoad[jysv;$default[$env[a;results;carousel_media];{}]]
    $let[finalurl;$env[jysv;$arrayFindIndex[jysv;iuy;$checkCondition[$env[iuy;video_versions;0;url]!=]];video_versions;0;url]]
    ]]]
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
    $if[$env[a;results;video]!=;
    $jsonLoad[b;$env[a;results;video;variants]]
    ;
    $if[$env[a;results;entities;card_legacy;0;value;string_value]!=;
    $jsonLoad[b1;$env[a;results;entities;card_legacy;0;value;string_value]]
    $jsonLoad[b1;$env[b1;mediaDetails]]
    $jsonLoad[b1;$jsonEntries[b1]]
    $jsonLoad[b;$env[b1;0;1;video;variants]]
    ;
    $jsonLoad[b;$env[a;results;quoted_tweet;video;variants]]
    ]]
    $let[finalurl;$default[$env[b;$sub[$arrayLength[b];1];src];$env[b;$sub[$arrayLength[b];1];url]]]
    $if[$or[$get[finalurl]==null;$get[finalurl]==;$get[finalurl]==undefined];$return[$let[finalurl;bot|Video not available]]]
    ]
    $if[$env[whattype;type]==threads;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $if[$env[a;results;error]!=;$return[$let[finalurl;bot|$env[a;results;error]]]]
    $let[finalurl;$env[a;results;media]]
    $if[$or[$get[finalurl]==null;$get[finalurl]==;$get[finalurl]==undefined];$return[$let[finalurl;bot|Video not available]]]
    ]
    ;retry]
    $callLocalFunction[oncecode;false]
    $return[$get[finalurl]]
    `
}
