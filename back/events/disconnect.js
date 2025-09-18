module.exports = {
    type: "connectionDestroyed",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $jsonLoad[comp;$try[$getComponents[$get[cid];$get[mid]];{}]]

    $try[
    $if[$or[$env[comp;0;0]==;$and[$getVar[radioplayer_data;$guildID_playerstatus;false]==true;$getVar[radioplayer_data;$guildID_checkplayer;false]==true];$and[$env[comp;1;1;disabled]==true;$getVar[radioplayer_data;$guildID_playerstatus;false]==true;$getVar[radioplayer_data;$guildID_checkplayer;false]==false];$and[$env[comp;3;1;disabled]==true;$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$getVar[radioplayer_data;$guildID_checkplayer;false]==false]];
    $!editMessage[$get[cid];$get[mid];
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrackEvents]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    $let[errormsgstatus;true]
    ]
    $if[$and[$callFunction[configMusic;autodelete_nextmessage];$get[errormsgstatus]!=true];
    $!deleteMessage[$get[cid];$get[mid]]
    ;
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    $!deleteVar[radioplayer_data;$guildID_playerstatus]
    $!deleteVar[radioplayer_data;$guildID_metadata]
    `
}