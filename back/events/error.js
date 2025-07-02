module.exports = {
    type: "error" || "playerError",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $!editMessage[$get[cid];$get[mid];
    $description[Can't process this.\nError:$codeBlock[$env[error]]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    
    $if[$voiceID[$guildID;$clientID]!=;$!leaveVoiceChannel]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_config_error]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    `
}