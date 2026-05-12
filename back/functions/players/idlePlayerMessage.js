module.exports = {
    name: "idlePlayerMessage",
    code: `
    $footer[$callFunction[useCustomMusicMessage;config_generalIdleTrack];$userAvatar[$clientID;2048]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    `
}