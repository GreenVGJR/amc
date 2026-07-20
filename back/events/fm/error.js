module.exports = {
    type: "playerError",
    code: `
    $let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    
    $if[$try[$isPlaying;]!=;$async[$!leaveVoiceChannel]]

    $callFunction[bulkMusicPlayer;false]

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