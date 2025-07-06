module.exports = {
    type: "playerDestroy" || "playerClosed" || "playerEmpty",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $try[
    $if[$and[$getComponents[$get[cid];$get[mid];0;0;style]==Secondary;$getComponents[$get[cid];$get[mid];1;1;disabled]!=false];
    $!editMessage[$get[cid];$get[mid];
    $description[Can't process this.]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ]
    ]
    $if[$getComponents[$get[cid];$get[mid];1;1;disabled]==false;
    $!disableComponentsOf[$get[cid];$get[mid]]
    ]
    ]

    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!deleteVar[musicplayer_message;$guildID_isshuffle]
    `
}