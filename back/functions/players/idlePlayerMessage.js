module.exports = {
    name: "idlePlayerMessage",
    code: `
    $author[🌙 Idle]
    $footer[$callFunction[useCustomMusicMessage;config_generalIdleTrack]]
    $color[$callFunction[useIcon;color_embed]]
    $addActionRow
    $callFunction[247Button;$messageID;$guildID;true]
    `
}