module.exports = {
    name: "setAutoplay",
    code: `
    $jsonLoad[ccjm;$default[$getCache[initclientmusic;musicplayer_message_$guildID_isdynamicmusic];{}]]
    $let[lookStatus;$checkCondition[$default[$env[ccjm;status];false]!=true]]
    $if[$default[$env[ccjm;status];false]==false;
    $!jsonSet[ccjm;tracks;[\\]]
    ]
    $if[$get[lookStatus]==false;
    $jsonLoad[clvk;$default[$env[ccjm;tracks];[\\]]]
    $loop[$arrayLength[clvk];
    $let[klvb;$sub[$env[klvb];1]]
    $if[$or[$isPlaying==;$isPlaying==false]==false;$!removeTrack[$get[klvb]]]
    ;klvb;false]
    ]
    $!jsonSet[ccjm;status;$get[lookStatus]]
    $setCache[initclientmusic;musicplayer_message_$guildID_isdynamicmusic;$jsonStringify[ccjm]]
    $if[$get[lookStatus]==true;$async[$callFunction[dynamicQueue]]]
    $return
    `
}