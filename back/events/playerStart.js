const cf = require("../config.json");

module.exports = [{
    type: cf.interval_message ? "linkedPlayerUpdate" : "linkedTrackStart",
    code: `
    $let[cachevid;$voiceID[$guildID;$clientID]]
    $onlyIf[$playerIsPaused[$guildID]!=true]
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $jsonLoad[currenttrack;$playerCurrentTrack[$guildID]]
    $jsonLoad[kltrack;{}]
    $!jsonSet[kltrack;title;$env[currenttrack;title]]
    $!jsonSet[kltrack;author;$env[currenttrack;author]]
    $!jsonSet[kltrack;url;$env[currenttrack;uri]]
    $!jsonSet[kltrack;thumbnail;$env[currenttrack;artworkUrl]]
    $!jsonSet[kltrack;duration;"$round[$divide[$env[currenttrack;duration];1000];0]"]
    $!jsonSet[kltrack;durationMS;"$env[currenttrack;duration]"]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$jsonStringify[kltrack];$checkCondition[$sum[$playerElapsedTime[$guildID];$get[nextmessage_time]]>=$env[currenttrack;duration]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]
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