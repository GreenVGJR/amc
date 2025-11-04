module.exports = {
    type: "linkedPlayerDestroy",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $jsonLoad[comp;$try[$getComponents[$get[cid];$get[mid]];{}]]

    $try[
    $if[$or[$env[comp;0;0]==;$and[$getCache[radioplayer_data_$guildID_playerstatus]==true;$getCache[radioplayer_data_$guildID_checkplayer]==true];$and[$env[comp;1;1;disabled]==true;$getCache[radioplayer_data_$guildID_playerstatus]==true;$getCache[radioplayer_data_$guildID_checkplayer]==false];$and[$env[comp;3;1;disabled]==true;$getCache[radioplayer_data_$guildID_playerstatus]==false;$getCache[radioplayer_data_$guildID_checkplayer]==false]];
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

    $!deleteCache[musicplayer_message_$guildID_messageid]
    $!deleteCache[musicplayer_message_$guildID_channelid]
    $!deleteCache[musicplayer_message_$guildID_attemptseek]
    $!deleteCache[radioplayer_data_$guildID_playerstatus]
    $!deleteCache[radioplayer_data_$guildID_metadata]
    `
}