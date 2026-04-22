module.exports = {
    type: "emptyQueue",
    code: `
    $async[
    $if[$callFunction[configMusic;statusvc_message];$let[mm;$callFunction[channelStatus;$voiceID[$guildID;$clientID];]]]
    ]
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $async[
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    `
}