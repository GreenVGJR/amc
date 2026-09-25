import type { IForgeFunction } from "@tryforge/forgescript";
import { tarClient, tarClientYT } from "../helpers/clientYoutube";
export default {
    name: "fallbackPlaybackTrack",
    params: [{
        name: "url", // string
        description: "URL",
        required: true
    },
    {
        name: "types", // enum
        description: "Changes quality (v, vs, va) or image list (vi)",
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
    $let[agent;$callFunction[configMusic;default_userAgent_desktop]]
    $let[trycount;0]
    $if[$env[whattype;type]!=youtube;
    $jsonLoad[test;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $jsonLoad[a;$env[test]]
    ]
    $if[$env[types]==vi;$arrayLoad[imgurls]]
    $localFunction[oncecode;
    $if[$get[trycount]>=3;$return]
    $if[$env[retry]==true;$letSum[trycount;1]]
    $if[$env[whattype;type]==youtube;
    $if[$env[types]==vi;
    $let[vimq;https://i.ytimg.com/vi/$env[whattype;id]/maxresdefault.jpg]
    $let[vist;$httpRequest[$get[vimq];HEAD]]
    $arrayPush[imgurls;$if[$get[vist]==200;$get[vimq];https://i.ytimg.com/vi/$env[whattype;id]/hqdefault.jpg]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $let[videoid;$env[whattype;id]]
    $let[ytinitauth;$djsEval[process.env.YOUTUBE_AUTH]]
    $let[targetClientYT;${tarClient()}]
    $jsonLoad[listclient;${tarClientYT()}]

    $try[
    $httpAddHeader[Cookie;$getCache[initclientmusic;authmusic_youtube_tempcookies]]
    $try[$jsonLoad[youtubeAuth;$get[ytinitauth]]]
    $if[$and[$env[youtubeAuth;token]!=;$get[targetClientYT]==ANDROID_VR];
    $httpAddHeader[Authorization;Bearer $env[youtubeAuth;token]]
    $httpAddHeader[X-Goog-AuthUser;0]

    $let[defytdomain;$env[listclient;targetDomain]]
    $!jsonDelete[listclient;targetDomain]
    $!jsonDelete[listclient;client_id]
    $!jsonDelete[listclient;client_secret]
    ;
    $jsonLoad[listclient;{}]
    $let[defytdomain;youtubei.googleapis.com]
    $if[$env[types]!=va;
    $!jsonSet[listclient;clientName;"101"]
    $!jsonSet[listclient;clientVersion;"1.03"]
    ;
    $!jsonSet[listclient;clientName;"3"]
    $!jsonSet[listclient;clientVersion;"21.38.123"]
    ]]

    $!jsonSet[listclient;visitorData;$getCache[initclientmusic;authmusic_youtube_visitor]]
    $!jsonSet[listclient;hl;en]
    $!jsonSet[listclient;gl;US]

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
    ]
    $if[$env[whattype;type]==soundcloud;
    $if[$env[types]==vi;
    $arrayPush[imgurls;$replace[$env[test;results;artwork_url];-large;-original]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[test;results]==null;$return[$let[finalurl;bot|Track not available]]]
    $jsonLoad[loadres;$env[test;results]]
    $jsonLoad[test4;$env[loadres;media;transcodings]]
    $arrayMap[test4;test5;$if[$env[test5;format;protocol]==progressive;$return[$env[test5]]];test6]
    $if[$env[test6;0;url]==;$return[$let[finalurl;bot|DASH Audio is not available]]]
    $!httpRequest[$env[test6;0;url]?client_id=$getCache[initclientmusic;authmusic_soundcloud_fall]&track_authorization=$env[loadres;track_authorization];GET;rest]
    $let[finalurl;$env[rest;url]]
    $if[$get[finalurl]==;$return[$let[finalurl;null]]]
    ]
    ;
    $if[$env[whattype;type]==spotify;
    $if[$env[types]==vi;
    $if[$env[test;results;album;images;0;url]!=;
    $let[vispid;$advancedTextSplit[$env[test;results;album;images;0;url];/;4]]
    $let[visp82;https://i.scdn.co/image/$cropText[$get[vispid];0;12]82c1$cropText[$get[vispid];16]]
    $let[vist;$httpRequest[$get[visp82];HEAD]]
    $arrayPush[imgurls;$if[$get[vist]==200;$get[visp82];$env[test;results;album;images;0;url]]]
    ;
    $if[$env[test;results;props;pageProps;state;data;entity;image]!=;
    $arrayPush[imgurls;$env[test;results;props;pageProps;state;data;entity;image]]
    ;
    $let[visppid;$advancedTextSplit[$env[test;results;props;pageProps;state;data;entity;visualIdentity;image;0;url];/;4]]
    $let[visp82b;https://i.scdn.co/image/$cropText[$get[visppid];0;12]82c1$cropText[$get[visppid];16]]
    $let[vistb;$httpRequest[$get[visp82b];HEAD]]
    $arrayPush[imgurls;$if[$get[vistb]==200;$get[visp82b];$env[test;results;props;pageProps;state;data;entity;visualIdentity;image;0;url]]]
    ]
    ]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;

    $if[$env[test;results;props]!=;
    $let[retpreview;$env[test;results;props;pageProps;state;data;entity;audioPreview;url]]
    ;
    $let[retpreview;$if[$env[test;results;preview_url]!=null;$env[test;results;preview_url]]]
    ]
    $if[$get[retpreview]==;$return[$let[finalurl;null]]]
    $let[finalurl;$get[retpreview]]
    ]
    ]
    $if[$env[whattype;type]==tiktokmob;
    $if[$env[types]==vi;
    $let[viurl;$djsEval[fetch("https://vt.tiktok.com/$env[whattype;id]", { method: "HEAD" }).then(a => a.url).catch()]]
    $jsonLoad[test;$extractTrack[$get[viurl]]]
    $arrayPush[imgurls;$env[test;results;video;cover]]
    $arrayPush[imgurls;$env[test;results;music;cover_large]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[test;results;error]!=;$let[finalurl;bot|$env[test;results;error]] $return]
    $if[$env[test;results]==null;$callLocalFunction[oncecode;true] $return]
    $jsonLoad[whattype;$callFunction[filterMediaID;$if[$or[$env[test;results;video;id]!=;$env[test;results;music_info]!=];https://www.tiktok.com/@/video/$env[test;results;video;id];https://www.tiktok.com/music/-$env[test;results;mid]]]]
    ]
    ]
    $if[$env[whattype;type]==tiktok;
    $if[$env[types]==vi;
    $arrayPush[imgurls;$env[test;results;video;cover]]
    $arrayPush[imgurls;$env[test;results;music;cover_large]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
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
    ]
    $if[$env[whattype;type]==tiktokmusic;
    $if[$env[types]==vi;
    $arrayPush[imgurls;$default[$env[test;results;cover_large];$default[$env[test;results;cover_medium];$env[test;results;cover_thumb]]]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[a;results]==null;$callLocalFunction[oncecode;true] $return]
    $if[$env[a;results;play_url;uri]==;
    $jsonLoad[b;$env[a;results;extra]]
    $let[finalurl;$env[b;original_song_url]]
    ;
    $let[finalurl;$env[a;results;play_url;uri]]
    ]
    $if[$get[finalurl]==;$return[$let[finalurl;null]]]
    ]
    ]
    $if[$env[whattype;type]==applemusic;
    $if[$env[types]==vi;
    $arrayPush[imgurls;$replace[$env[test;results;artworkUrl100];100x100bb;1x1ss]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[a;results]==null;$callLocalFunction[oncecode;true] $return]
    $let[finalurl;$env[a;results;previewUrl]]
    ]
    ]]
    $if[$env[whattype;type]==facebook;
    $if[$env[types]==vi;
    $jsonLoad[fbmedia;$default[$env[a;results;data;currMedia];{}]]
    $if[$env[fbmedia;__typename]==Video;
    $arrayPush[imgurls;$env[fbmedia;preferred_thumbnail;image;uri]]
    ;
    $if[$env[fbmedia;__typename]==Photo;
    $arrayPush[imgurls;$env[fbmedia;image;uri]]
    ]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;

    $if[$or[$env[a;results;data]==;$env[a;results;data]==null];$return[$let[finalurl;bot|Facebook lookup failed, try again later]]]
    $jsonLoad[fbmedia;$default[$env[a;results;data;currMedia];{}]]
    $if[$or[$env[fbmedia]==;$env[fbmedia]==null;$env[fbmedia;is_live_streaming]==true];$return[$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]]
    $if[$env[fbmedia;__typename]==Video;
    $if[$env[fbmedia;is_playable]==false;$return[$let[finalurl;bot|This video may no longer exist, or you don't have permission to view it]]]
    $let[finalurl;$default[$env[fbmedia;videoDeliveryLegacyFields;browser_native_hd_url];$env[fbmedia;videoDeliveryLegacyFields;browser_native_sd_url]]]
    ;
    $return[$let[finalurl;bot|This post is a photo, use the Image option]]
    ]
    ]]
    $if[$env[whattype;type]==instagram;
    $if[$env[types]==vi;
    $jsonLoad[vicm;$default[$env[test;results;carousel_media];{}]]
    $if[$env[vicm;0]==;
    $if[$env[test;results;edge_sidecar_to_children;edges;0]==;
    $if[$env[test;results;display_url]!=;
    $arrayPush[imgurls;$env[test;results;display_url]]
    ;
    $if[$env[test;results;thumbnail_src]!=;
    $arrayPush[imgurls;$env[test;results;thumbnail_src]]
    ;
    $if[$env[test;results;image_versions2;candidates;0;url]!=;
    $arrayPush[imgurls;$env[test;results;image_versions2;candidates;0;url]]
    ;
    $if[$env[test;results;display_uri]!=;
    $arrayPush[imgurls;$env[test;results;display_uri]]
    ;
    $if[$env[test;results;shortcode_media;display_url]!=;
    $arrayPush[imgurls;$env[test;results;shortcode_media;display_url]]
    ;
    $arrayPush[imgurls;$env[test;results;shortcode_media;image_versions2;candidates;0;url]]
    ]]]]]
    ;
    $jsonLoad[viedges;$env[test;results;edge_sidecar_to_children;edges]]
    $arrayForEach[viedges;vied;$arrayPush[imgurls;$default[$env[vied;node;display_url];$env[vied;node;image_versions2;candidates;0;url]]]]
    $jsonLoad[viedges2;$default[$env[test;results;shortcode_media;edge_sidecar_to_children;edges];{}]]
    $arrayForEach[viedges2;vied;$arrayPush[imgurls;$default[$env[vied;node;display_url];$env[vied;node;image_versions2;candidates;0;url]]]]
    ]
    ;
    $arrayForEach[vicm;vic;$arrayPush[imgurls;$default[$env[vic;image_versions2;candidates;0;url];$env[vic;display_uri]]]]
    ]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;

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
    ]
    ]]]
    $if[$env[whattype;type]==instagramaudio;
    $if[$env[types]==vi;
    $arrayPush[imgurls;$env[test;results;items;0;media;image_versions2;candidates;0;url]]
    $arrayPush[imgurls;$env[test;results;music_info;music_asset_info;cover_artwork_uri]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $if[$and[$env[a;results;metadata;original_sound_info]==null;$env[a;results;metadata;music_info]==null];
    $let[finalurl;$djsEval[require("entities").decodeHTML("$advancedTextSplit[$env[a;results;items;0;media;video_dash_manifest];mimeType="audio/mp4";1;<BaseURL>;1;</BaseURL>;0]")]]
    ;
    $if[$env[a;results;metadata;original_sound_info;progressive_download_url]==null;
    $let[finalurl;$env[a;results;metadata;music_info;music_asset_info;progressive_download_url]]
    ;
    $let[finalurl;$env[a;results;metadata;original_sound_info;progressive_download_url]]
    ]
    ]]]
    $if[$env[whattype;type]==bandcamp;
    $if[$env[types]==vi;
    $if[$env[test;results;art_id]!=;
    $arrayPush[imgurls;https://f4.bcbits.com/img/a$env[test;results;art_id]_16.jpg]
    ;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Accept-Language;en]
    $httpSetContentType[Text]
    $!httpRequest[$env[whattype;id];GET]
    $arrayPush[imgurls;$advancedTextSplit[$httpResult;og:image" content=";1;";0]]
    ]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;

    $if[$env[a;results]==null;$return[$let[finalurl;null]]]
    $let[finalurl;$env[a;results;file;mp3-128]]
    ]
    ]
    $if[$env[whattype;type]==twitter;
    $if[$and[$env[test;results;error]!=;$env[types]==vi];$return]
    $if[$env[test;results;error]!=;$return[$let[finalurl;bot|$env[test;results;error]]]]
    $if[$env[types]==vi;
    $jsonLoad[twm;$default[$env[test;results;mediaDetails];{}]]
    $if[$env[twm;0;media_url_https]!=;
    $arrayForEach[twm;twmi;$arrayPush[imgurls;$if[$env[twmi;type]==photo;$env[twmi;media_url_https]?format=$advancedTextSplit[$env[twmi;media_url_https];.;$charCount[$env[twmi;media_url_https];.]]&name=orig;$env[twmi;media_url_https]]]]
    ;
    $jsonLoad[twp;$default[$env[test;results;photos];{}]]
    $if[$env[twp;0;url]!=;
    $arrayForEach[twp;twpi;$arrayPush[imgurls;$env[twpi;url]?format=$advancedTextSplit[$env[twpi;url];.;$charCount[$env[twpi;url];.]]&name=orig]]
    ;
    $arrayPush[imgurls;$env[test;results;video;poster]]
    $jsonLoad[twcard;$default[$env[test;results;card;binding_values];{}]]
    $jsonLoad[twcardents;$jsonEntries[twcard]]
    $arrayLoad[twcardimgs]
    $arrayForEach[twcardents;twce;$if[$checkContains[$env[twce;1;image_value;url];name=orig];$arrayPush[twcardimgs;$env[twce;1;image_value;url]]]]
    $if[$arrayLength[twcardimgs]==0;
    $arrayForEach[twcardents;twce;$if[$env[twce;1;image_value;url]!=;$arrayPush[twcardimgs;$env[twce;1;image_value;url]]]]
    ]
    $arrayForEach[twcardimgs;twci;$arrayPush[imgurls;$env[twci]]]
    ]
    ]
    $jsonLoad[twqm;$default[$env[test;results;quoted_tweet;mediaDetails];{}]]
    $if[$env[twqm;0;media_url_https]!=;
    $arrayForEach[twqm;twqmi;$arrayPush[imgurls;$if[$env[twqmi;type]==photo;$env[twqmi;media_url_https]?format=$advancedTextSplit[$env[twqmi;media_url_https];.;$charCount[$env[twqmi;media_url_https];.]]&name=orig;$env[twqmi;media_url_https]]]]
    ;
    $jsonLoad[twqp;$default[$env[test;results;quoted_tweet;photos];{}]]
    $if[$env[twqp;0;url]!=;
    $arrayForEach[twqp;twqpi;$arrayPush[imgurls;$env[twqpi;url]?format=$advancedTextSplit[$env[twqpi;url];.;$charCount[$env[twqpi;url];.]]&name=orig]]
    ;
    $arrayPush[imgurls;$env[test;results;quoted_tweet;video;poster]]
    $jsonLoad[twqcard;$default[$env[test;results;quoted_tweet;card;binding_values];{}]]
    $jsonLoad[twqcardents;$jsonEntries[twqcard]]
    $arrayLoad[twqcardimgs]
    $arrayForEach[twqcardents;twqce;$if[$checkContains[$env[twqce;1;image_value;url];name=orig];$arrayPush[twqcardimgs;$env[twqce;1;image_value;url]]]]
    $if[$arrayLength[twqcardimgs]==0;
    $arrayForEach[twqcardents;twqce;$if[$env[twqce;1;image_value;url]!=;$arrayPush[twqcardimgs;$env[twqce;1;image_value;url]]]]
    ]
    $arrayForEach[twqcardimgs;twqci;$arrayPush[imgurls;$env[twqci]]]
    ]
    ]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arrayUnique[imgurls;imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;

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
    $if[$or[$get[finalurl]==null;$get[finalurl]==;$get[finalurl]==undefined];$return[$let[finalurl;bot|Content is not available]]]
    ]
    ]
    $if[$env[whattype;type]==threads;
    $if[$env[types]==vi;
    $jsonLoad[thimgs;$default[$env[test;results;images];{}]]
    $arrayForEach[thimgs;thim;$arrayPush[imgurls;$env[thim]]]
    $arrayFilter[imgurls;im;$checkCondition[$env[im]!=];imgurls]
    $arraySlice[imgurls;imgurls;0;10]
    $let[finalurl;$arrayJoin[imgurls;
]]
    ;
    $if[$env[test;results]==null;$return[$let[finalurl;null]]]
    $if[$env[test;results;error]!=;$return[$let[finalurl;bot|$env[test;results;error]]]]
    $let[finalurl;$env[test;results;media]]
    $if[$or[$get[finalurl]==null;$get[finalurl]==;$get[finalurl]==undefined];$return[$let[finalurl;bot|Content is not available]]]
    ]
    ]
    ;retry]
    $callLocalFunction[oncecode;false]
    $return[$get[finalurl]]
    `
} satisfies IForgeFunction;
