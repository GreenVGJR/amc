module.exports = {
    name: "bulkMusicPlayer",
    params: [{
        name: "dothis247ornot",
        required: false
    },
    {
        name: "targetGuildIdMusic",
        required: false
    }],
    code: `
    $let[targetGuildIdMusic;$if[$or[$env[targetGuildIdMusic]==;$env[targetGuildIdMusic]==null];$guildID;$env[targetGuildIdMusic]]]
    $if[$env[dothis247ornot]!=true;
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_is247music]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_messageid]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_channelid]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_voiceid]
    ]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_isdynamicmusic]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_isshuffle]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_attemptseek]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_waitinterval]
    $deleteCache[initclientmusic;radioplayer_data_$get[targetGuildIdMusic]_playerstatus]
    $deleteCache[initclientmusic;radioplayer_data_$get[targetGuildIdMusic]_metadata]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_waitloadmsg]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_ongoingdynamicmusic]
    $deleteCache[initclientmusic;musicplayer_message_$get[targetGuildIdMusic]_ongoingplaylistmusic]
    $return
    `
}