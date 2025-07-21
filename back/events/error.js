module.exports = {
    type: "error" || "playerError",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $!editMessage[$get[cid];$get[mid];
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack]$codeBlock[$env[error]]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    
    $try[
    $if[$voiceID[$guildID;$clientID]!=;$!leaveVoiceChannel]
    ]
    
    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    $!deleteVar[radioplayer_data;$guildID_playerstatus]
    $!deleteVar[radioplayer_data;$guildID_metadata]
    `
}