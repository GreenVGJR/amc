module.exports = {
    type: "connection",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $!editMessage[$get[cid];$get[mid];
    $loadEmbeds[$getEmbeds[$get[cid];$get[mid]]]
    $author[Now Playing]
    $footer[Downloading;$callFunction[useIcon;loading]]
    $timestamp
    $addActionRow
    $addStringSelectMenu[musicplayer_nodequeue;Loading;true;1;1]
    $addOption[null;null;null]
    $addActionRow
    $addButton[musicplayer_loop;Loop;Secondary;🔁;true]
    $addButton[musicplayer_shuffle;Shuffle;Secondary;🔀;true]
    $addButton[musicplayer_lyrics;Lyrics;Secondary;🎶;true]    
    $addActionRow
    $addButton[musicplayer_volumedown;-10%;Secondary;🔉;true]
    $addButton[null0;Volume;Secondary;;true]
    $addButton[musicplayer_volumeup;+10%;Secondary;🔉;true]
    $addButton[musicplayer_volumemute;;Secondary;🔈;true]
    $addActionRow
    $addButton[musicplayer_seekdown;-10s;Secondary;⏪;true]
    $addButton[musicplayer_stopplayer;Stop;Secondary;⏹️;true]
    $addButton[musicplayer_seekup;+10s;Secondary;⏩;true]
    $addButton[musicplayer_actionplayer;;Secondary;⏸️;true]
    ]
    ;
    $try[$!leaveVoiceChannel]
    $sendMessage[$channelID;
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrackEvents]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]]
    ]
    `
}