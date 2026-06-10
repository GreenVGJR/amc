module.exports = {
    type: "emptyQueue",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $if[$getCache[musicplayer_message_$guildID_is247music]!=true;
    $async[
    $leaveVoiceChannel
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ;
    $deleteCache[musicplayer_message_$guildID_isdynamicmusic]
    $deleteCache[musicplayer_message_$guildID_isshuffle]
    $deleteCache[musicplayer_message_$guildID_attemptseek]
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $deleteCache[radioplayer_data_$guildID_playerstatus]
    $deleteCache[radioplayer_data_$guildID_metadata]
    $deleteCache[musicplayer_message_$guildID_waitloadmsg]
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