module.exports = {
    type: "connectionDestroyed",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $let[vid;$getCache[musicplayer_message_$guildID_voiceid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $if[$getCache[musicplayer_message_$guildID_is247music]==true;
    $if[$and[$channelExists[$get[vid]];$messageExists[$get[cid];$get[mid]]];
    $wait[1s]
    $let[checkvccount;$channelVoiceMemberCount[$get[vid]]]
    $let[ml;$callFunction[joinVC;$get[vid]]]
    $if[$callFunction[configMusic;statusvc_message];
    $if[$get[checkvccount]<1;
    $async[
    $wait[100]
    $let[mm;$callFunction[channelStatus;$get[vid];💤 Idling...]]
    ]]]
    $!editMessage[$get[cid];$get[mid];
    $fetchComponents[$get[cid];$get[mid]]
    $disableComponents
    $callFunction[idlePlayerMessage]
    ]
    ]
    ;
    $async[
    $if[$callFunction[configMusic;statusvc_message];
    $let[mm;$callFunction[channelStatus;$voiceID[$guildID;$clientID];]]
    ]]
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
    ]

    $if[$getCache[musicplayer_message_$guildID_is247music]!=true;
    $deleteCache[musicplayer_message_$guildID_messageid]
    $deleteCache[musicplayer_message_$guildID_channelid]
    ]
    $deleteCache[musicplayer_message_$guildID_isdynamicmusic]
    $deleteCache[musicplayer_message_$guildID_isshuffle]
    $deleteCache[musicplayer_message_$guildID_attemptseek]
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $deleteCache[radioplayer_data_$guildID_playerstatus]
    $deleteCache[radioplayer_data_$guildID_metadata]
    $deleteCache[musicplayer_message_$guildID_waitloadmsg]
    `
}