import type { IForgeFunction } from "@tryforge/forgescript";
export default {
    name: "bannerYoutube",
    params: [{
        name: "trackLVMTL",
        required: true
    }, 
    {
        name: "trackLVUTL",
        required: true
    }, {
        name: "doReturnKKL",
        required: true
    }],
    code: `
    $let[md5urlmv;$md5[banner|$toTitleCase[$advancedTextSplit[$env[trackLVMTL]; - Topic;0]]]]
    $let[checkcachebannerksl;$getCache[initclientmusic;musicplayer_cache-bannermusic-$get[md5urlmv]]]
    $jsonLoad[mcbjsbq;$callFunction[filterMediaID;$env[trackLVUTL]]]
    $if[$or[$and[$env[mcbjsbq;type]!=youtube;$env[mcbjsbq;type]!=soundcloud;$env[mcbjsbq;type]!=spotify;$env[mcbjsbq;type]!=applemusic]==true;$get[checkcachebannerksl]==null];$return]
    $if[$get[checkcachebannerksl]!=;
    $let[bannerchannelurl;$get[checkcachebannerksl]]
    ;
    $setCache[initclientmusic;musicplayer_cache-bannermusic-$get[md5urlmv];null]
    $localFunction[rtrytbn;
    $jsonLoad[findindexch;$callFunction[getYoutubeChannel;$env[trackLVMTL]]]
    $if[$env[findindexch;0;channelId]==;$wait[350] $callLocalFunction[rtrytbn]]
    $return
    ]
    $callLocalFunction[rtrytbn]
    $let[mrinyt;$arrayFindIndex[findindexch;p;$checkCondition[$env[p;ownerBadges;0]!=]]]
    $let[mrinytrr;$arrayFindIndex[findindexch;p;$checkCondition[$env[p;tvBanner;thumbnails;0;url]!=]]]
    $let[mrinyt;$if[$get[mrinyt]==-1;$if[$get[mrinytrr]==-1;0;$get[mrinytrr]];$get[mrinyt]]]
    $let[checkbannerexistyt;$env[findindexch;$get[mrinyt];tvBanner;thumbnails;0;url]]
    $if[$get[checkbannerexistyt]!=;
    $let[bannerchannelurl;$advancedTextSplit[$env[findindexch;$get[mrinyt];tvBanner;thumbnails;0;url];=;0]=s0-fcrop64=1,00005a57ffffa5a8]
    $setCache[initclientmusic;musicplayer_cache-bannermusic-$get[md5urlmv];$get[bannerchannelurl]]
    ]]
    $if[$env[doReturnKKL]==true;$return[$get[bannerchannelurl]];$return]
    `
} satisfies IForgeFunction;
