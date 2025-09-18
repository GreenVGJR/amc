module.exports = [{
    type: "playerTrigger",
    code: `
    $if[$and[$getVar[radioplayer_data;$guildID_playerstatus;false]==false;$callFunction[configMusic;autodelete_nextmessage]];
    $if[$env[reason]!=filters;
    $wait[500]
    $onlyIf[$or[$hasMusicNode==false;$if[$hasMusicNode==true;$isPlaying;false]==false]!=true;]
    $async[$!deleteMessage[$getVar[musicplayer_message;$guildID_channelid];$getVar[musicplayer_message;$guildID_messageid]]]
    $setVar[musicplayer_message;$guildID_channelid;$channelID]
    $setVar[musicplayer_message;$guildID_messageid;$sendMessage[$channelID;_ _;true]]
    ]]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $if[$callFunction[configMusic;interval_message];
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$if[$env[reason]!=filters;0]]]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];false;intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]

    $if[$callFunction[configMusic;interval_message];
    $setInterval[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{ 
    type: "playerPause",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $try[$if[$callFunction[configMusic;interval_message];$!clearInterval[intervalmusicmessage_$guildID_$get[cid]]]]
    `
},
{
    type: "playerResume",
    code: `
    $onlyIf[$djsEval[(0, require("discord-player").useMainPlayer)().queues.get(ctx.client.guilds.cache.get("$guildID"))]!=null;]

    $if[$callFunction[configMusic;interval_message];
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$trackInfo[id]",
    "title": "$replace[$replace[$trackInfo[title];\\\\;];";\\\\"]",
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
    $let[nextmessage_time;16000]

    $setInterval[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage;0];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerFinish",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $if[$callFunction[configMusic;interval_message];
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    $try[$!disableComponentsOf[$get[cid];$get[mid]]]
    `
}]