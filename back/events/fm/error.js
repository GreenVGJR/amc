module.exports = {
    type: "playerError",
    code: `
    $let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    
    $if[$try[$isPlaying;]!=;$async[$!leaveVoiceChannel]]
    
    $deleteCache[initclientmusic;musicplayer_message_$guildID_messageid]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_channelid]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_isshuffle]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_attemptseek]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_waitinterval]
    $deleteCache[initclientmusic;radioplayer_data_$guildID_playerstatus]
    $deleteCache[initclientmusic;radioplayer_data_$guildID_metadata]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_waitloadmsg]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_ongoingdynamicmusic]
    $deleteCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic]

    $try[
    $if[$messageExists[$get[cid];$get[mid]];
    $wait[100]
    $!editMessage[$get[cid];$get[mid];
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack]$codeBlock[$env[error]]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]]]
    `
}