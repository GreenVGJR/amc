module.exports = {
    name: "checkRadioPlayer",
    params: [{
        name: "secTargetGuildId",
        required: false
    }],
    code: `
    $let[secTargetGuildId;$if[$or[$env[secTargetGuildId]==;$env[secTargetGuildId]==null];$guildID;$env[secTargetGuildId]]]
    $let[iiovknjndj;$getCache[initclientmusic;radioplayer_data_$get[secTargetGuildId]_playerstatus]]
    $if[$get[iiovknjndj]==true;
    $if[$voiceID[$get[secTargetGuildId];$clientID]==;
    $c[Force destroy player]
    $callFunction[bulkMusicPlayer;false]
    $let[nhbmk;$callFunction[destroyPlayer;$get[secTargetGuildId]]]
    $let[iiovknjndj;false]
    ]]
    $return[$default[$get[iiovknjndj];false]]
    `
}