module.exports = {
    type: "connectionDestroyed",
    code: `
    $let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]
    $let[vid;$getCache[initclientmusic;musicplayer_message_$guildID_voiceid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $if[$getCache[initclientmusic;musicplayer_message_$guildID_is247music]==true;
    $if[$and[$channelExists[$get[vid]];$messageExists[$get[cid];$get[mid]]];
    $wait[500]
    $let[ml;$callFunction[joinVC;$get[vid]]]
    $if[$callFunction[configMusic;statusvc_message];
    $let[checkvccount;$channelVoiceMemberCount[$get[vid]]]
    $if[$get[checkvccount]<1;
    $async[
    $wait[1s]
    $let[mm;$callFunction[channelStatus;$get[vid];💤 Idling...]]
    ]]]
    $let[issamefootertext;$getEmbeds[$get[cid];$get[mid];0;footerText]]
    $if[$get[issamefootertext]!=$callFunction[useCustomMusicMessage;config_generalIdleTrack];
    $try[$!editMessage[$get[cid];$get[mid];
    $callFunction[idlePlayerMessage]
    ]]]
    ]
    ;
    $async[
    $if[$callFunction[configMusic;statusvc_message];
    $let[mm;$callFunction[channelStatus;$voiceID[$guildID;$clientID];]]
    ]]
    $jsonLoad[comp;$try[$getComponents[$get[cid];$get[mid]];{}]]

    $try[
    $if[$or[$env[comp;0;0]==;$and[$getCache[initclientmusic;radioplayer_data_$guildID_playerstatus]==true;$getCache[initclientmusic;radioplayer_data_$guildID_checkplayer]==true];$and[$env[comp;1;1;disabled]==true;$getCache[initclientmusic;radioplayer_data_$guildID_playerstatus]==true;$getCache[initclientmusic;radioplayer_data_$guildID_checkplayer]==false];$and[$env[comp;3;1;disabled]==true;$getCache[initclientmusic;radioplayer_data_$guildID_playerstatus]==false;$getCache[initclientmusic;radioplayer_data_$guildID_checkplayer]==false]];
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

    $callFunction[bulkMusicPlayer;$getCache[initclientmusic;musicplayer_message_$guildID_is247music]]
    `
}