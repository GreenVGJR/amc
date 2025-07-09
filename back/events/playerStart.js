module.exports = [{
    type: "playerTrigger",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;12000]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$if[$env[reason]!=filters;0]]]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];false;intervalmusicmessage_$guildID_$get[cid];$guildID]

    $setInterval[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    `
},
{ 
    type: "playerPause",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    `
},
{
    type: "playerResume",
    code: `

    $onlyIf[$djsEval[(0, require("discord-player").useMainPlayer)().queues.get(ctx.client.guilds.cache.get("$guildID"))]!=null;]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$trackInfo[id]",
    "title": "$replace[$trackInfo[title];\\\\;\\\\\\\\]",
    "author": "$trackInfo[author]",
    "url": "$trackInfo[url]",
    "thumbnail": "$trackInfo[thumbnail]",
    "duration": "$trackInfo[duration]",
    "durationMS": $trackInfo[durationMS],
    "views": $trackInfo[views],
    "requestedBy": {"id":"$advancedTextSplit[$trackInfo[requestedBy];@;1;>;0]"},
    "playlist": null
    }]
    
    $let[interval_time;1000]
    $let[nextmessage_time;12000]

    $setInterval[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage;0];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    `
},
{
    type: "playerFinish",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!disableComponentsOf[$get[cid];$get[mid]]
    `
}]