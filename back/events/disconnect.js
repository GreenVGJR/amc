module.exports = {
    type: "playerDestroy" || "playerClosed" || "playerEmpty",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $if[$or[$and[$getVar[radioplayer_data;$guildID_playerstatus;false]==true;$getVar[radioplayer_data;$guildID_checkplayer;false]==true];$and[$getComponents[$get[cid];$get[mid];0]==;$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$getVar[radioplayer_data;$guildID_checkplayer;false]==false];$and[$getComponents[$get[cid];$get[mid];1;0;style]==Secondary;$getComponents[$get[cid];$get[mid];2;1;disabled]!=false;$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$getVar[radioplayer_data;$guildID_checkplayer;false]==false]];
    $!editMessage[$get[cid];$get[mid];
    $description[Can't process this.]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    $if[$or[$getComponents[$get[cid];$get[mid];2;1;disabled]==false;$and[$getVar[radioplayer_data;$guildID_playerstatus;false]==true;$getComponents[$get[cid];$get[mid];1;1;disabled]==false]];
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    $!deleteVar[musicplayer_message;$guildID_attemptseek]
    $!deleteVar[musicplayer_message;$guildID_isloop]
    `
}