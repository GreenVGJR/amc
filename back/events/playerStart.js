const cf = require("../config.json");

module.exports = [{
    type: cf.interval_message ? "linkedPlayerUpdate" : "linkedTrackStart",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $jsonLoad[currenttrack;$playerCurrentTrack[$guildID]]
    $let[kltrack;{
    "title": "$advancedReplace[$env[currenttrack;title];\\\\;;";\\\\"]",
    "author": "$env[currenttrack;author]",
    "url": "$env[currenttrack;uri]",
    "thumbnail": "$env[currenttrack;artworkUrl]",
    "duration": "$round[$divide[$env[currenttrack;duration];1000];0]",
    "durationMS": "$env[currenttrack;duration]"
    }]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$get[kltrack];$checkCondition[$sum[$playerElapsedTime[$guildID];$get[nextmessage_time]]>=$env[currenttrack;duration]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]
    `
},
{
    type: "linkedTrackEnd",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $if[$callFunction[configMusic;interval_message]==true;
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    $try[$!disableComponentsOf[$get[cid];$get[mid]]]
    `
}]