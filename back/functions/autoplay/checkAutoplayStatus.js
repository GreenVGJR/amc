module.exports = {
    name: "checkAutoplayStatus",
    code: `
    $jsonLoad[ccjm;$default[$getCache[musicplayer_message_$guildID_isdynamicmusic];{}]]
    $return[$default[$env[ccjm;status];false]]
    `
}