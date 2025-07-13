module.exports = {
    type: "connectionDestroyed" || "disconnect" || "emptyQueue",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $if[$and[$getComponents[$get[cid];$get[mid];1;0;style]==Secondary;$getComponents[$get[cid];$get[mid];3;1;disabled]!=false];
    $!editMessage[$get[cid];$get[mid];
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrackEvents]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    $if[$getComponents[$get[cid];$get[mid];3;1;disabled]==false;
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    `
}