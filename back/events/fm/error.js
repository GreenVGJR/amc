module.exports = {
    type: "playerError",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    
    $if[$try[$isPlaying;]!=;$async[$!leaveVoiceChannel]]
    
    $deleteCache[musicplayer_message_$guildID_messageid]
    $deleteCache[musicplayer_message_$guildID_channelid]
    $deleteCache[musicplayer_message_$guildID_isshuffle]
    $deleteCache[musicplayer_message_$guildID_attemptseek]
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $deleteCache[radioplayer_data_$guildID_playerstatus]
    $deleteCache[radioplayer_data_$guildID_metadata]
    $deleteCache[musicplayer_message_$guildID_waitloadmsg]
    $deleteCache[musicplayer_message_$guildID_ongoingdynamicmusic]
    $deleteCache[musicplayer_message_$guildID_ongoingplaylistmusic]

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