module.exports = {
    type: "playerStart",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;12000]

    $jsonLoad[currenttrack;$currentTrackInfo[$guildID]]
    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$channelID",
    "title": "$env[currenttrack;info;title]",
    "description": "",
    "author": "$env[currenttrack;info;author]",
    "url": "$env[currenttrack;info;uri]",
    "thumbnail": "$env[currenttrack;info;artworkUrl]",
    "duration": "$round[$divide[$env[currenttrack;info;length];1000];0]",
    "durationMS": $env[currenttrack;info;length],
    "views": null,
    "requestedBy": null,
    "playlist": null
    }]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];0]]
    $if[$messageExists[$get[cid];$get[mid]];
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]
    ;
    $let[secmid;$sendMessage[$channelID;$callFunction[useCustomMusicMessage;config_errorIntervalMessage];true]]
    $setVar[musicplayer_message;$guildID_channelid;$channelID]
    $setVar[musicplayer_message;$guildID_messageid;$get[secmid]]
    $callFunction[musicPlayerMessage;$channelID;$get[secmid];$env[testmessage];false;intervalmusicmessage_$guildID_$channelID;$guildID;;$callFunction[configMusic;interval_message]]
    ]

    $if[$callFunction[configMusic;interval_message];
    $setInterval[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $if[$queueLength[$guildID]==0;
    $!destroyPlayer[$guildID]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $stop
    ]

    $if[$callFunction[configMusic;interval_message];

    $jsonLoad[currenttrack;$currentTrackInfo[$guildID]]
    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$channelID",
    "title": "$env[currenttrack;info;title]",
    "description": "",
    "author": "$env[currenttrack;info;author]",
    "url": "$env[currenttrack;info;uri]",
    "thumbnail": "$env[currenttrack;info;artworkUrl]",
    "duration": "$round[$divide[$env[currenttrack;info;length];1000];0]",
    "durationMS": $env[currenttrack;info;length],
    "views": null,
    "requestedBy": null,
    "playlist": null
    }]

    $let[calculatetime;$sum[$playerElapsedTime[$guildID];$get[interval_time]]]
    $let[elapsedtime;$if[$hasPlayer[$guildID];$playerElapsedTime[$guildID];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[currenttrack;info;length]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
}