module.exports = {
    type: "emptyQueue",
    code: `
    $let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $deleteCache[initclientmusic;musicplayer_message_$guildID_waitloadmsg]

    $if[$getCache[initclientmusic;musicplayer_message_$guildID_is247music]!=true;
    $async[
    $leaveVoiceChannel
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ;
    $deleteCache[initclientmusic;musicplayer_message_$guildID_isdynamicmusic]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_isshuffle]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_attemptseek]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_waitinterval]
    $deleteCache[initclientmusic;radioplayer_data_$guildID_playerstatus]
    $deleteCache[initclientmusic;radioplayer_data_$guildID_metadata]
    $async[
    $if[$callFunction[configMusic;statusvc_message];
    $let[mm;$callFunction[channelStatus;$voiceID[$guildID;$clientID];💤 Idling...]]
    ]]
    $try[$!editMessage[$get[cid];$get[mid];
    $fetchComponents[$get[cid];$get[mid]]
    $disableComponents
    $callFunction[idlePlayerMessage]
    ]]]
    `
}