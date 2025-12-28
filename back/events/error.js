module.exports = [{
    type: "error",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

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
    $if[$voiceID[$guildID;$clientID]!=;$try[$!playerDestroy[$guildID]]]
    ]
    
    $deleteCache[musicplayer_message_$guildID_messageid]
    $deleteCache[musicplayer_message_$guildID_channelid]
    $deleteCache[musicplayer_message_$guildID_attemptseek]
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $deleteCache[radioplayer_data_$guildID_playerstatus]
    $deleteCache[radioplayer_data_$guildID_metadata]
    `
},
{
    type: "linkedTrackError",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

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
    $if[$voiceID[$guildID;$clientID]!=;$try[$!playerDestroy[$guildID]]]
    ]
    
    $deleteCache[musicplayer_message_$guildID_messageid]
    $deleteCache[musicplayer_message_$guildID_channelid]
    $deleteCache[musicplayer_message_$guildID_attemptseek]
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $deleteCache[radioplayer_data_$guildID_playerstatus]
    $deleteCache[radioplayer_data_$guildID_metadata]
    `
}]