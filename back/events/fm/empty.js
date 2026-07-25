module.exports = {
    type: "emptyQueue",
    code: `
    $let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $if[$getCache[initclientmusic;musicplayer_message_$guildID_is247music]!=true;
    $async[
    $leaveVoiceChannel
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ;
    $callFunction[bulkMusicPlayer;true]
    $async[
    $if[$callFunction[configMusic;statusvc_message];
    $wait[1s]
    $let[mm;$callFunction[channelStatus;$voiceID[$guildID;$clientID];💤 Idling...]]
    ]]
    $try[$!editMessage[$get[cid];$get[mid];
    $callFunction[idlePlayerMessage]
    ]]]
    `
}