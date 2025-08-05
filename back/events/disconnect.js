module.exports = {
    type: "connectionDestroyed" || "disconnect" || "emptyQueue",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $try[
    $if[$or[$and[$getVar[radioplayer_data;$guildID_playerstatus;false]==true;$getVar[radioplayer_data;$guildID_checkplayer;false]==true];$and[$getComponents[$get[cid];$get[mid];0]==;$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$getVar[radioplayer_data;$guildID_checkplayer;false]==false];$and[$getComponents[$get[cid];$get[mid];1;0;style]==Secondary;$getComponents[$get[cid];$get[mid];3;1;disabled]!=false;$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$getVar[radioplayer_data;$guildID_checkplayer;false]==false]];
    $!editMessage[$get[cid];$get[mid];
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrackEvents]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    $!deleteVar[radioplayer_data;$guildID_playerstatus]
    $!deleteVar[radioplayer_data;$guildID_metadata]
    `
}