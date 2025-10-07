module.exports = [{
    type: "error",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $sendMessage[$channelID;
    $if[$messageExists[$channelID;$get[mid]];$reply[$get[cid];$get[mid];true]]
    
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
},
{
    type: "playerError",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $sendMessage[$channelID;
    $if[$messageExists[$channelID;$get[mid]];$reply[$get[cid];$get[mid];true]]
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
}]