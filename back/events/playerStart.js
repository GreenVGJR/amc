module.exports = [{
    type: "playerTrigger",
    code: `
    $if[$and[$default[$getCache[radioplayer_data_$guildID_playerstatus];false]==false;$callFunction[configMusic;autodelete_nextmessage]];
    $if[$env[reason]!=filters;
    $wait[500]
    $onlyIf[$or[$hasMusicNode==false;$if[$hasMusicNode==true;$isPlaying;false]==false]!=true;]
    $async[$!deleteMessage[$getCache[musicplayer_message_$guildID_channelid];$getCache[musicplayer_message_$guildID_messageid]]]
    $setCache[musicplayer_message_$guildID_channelid;$channelID]
    $setCache[musicplayer_message_$guildID_messageid;$sendMessage[$channelID;_ _;true]]
    ]]

    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$if[$env[reason]!=filters;0]]]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];false;intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]

    $if[$callFunction[configMusic;interval_message];
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $setInterval[
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerPause",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $if[$callFunction[configMusic;interval_message]==true;
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerResume",
    code: `
    $onlyIf[$djsEval[(0, require("discord-player").useMainPlayer)().queues.get(ctx.client.guilds.cache.get("$guildID"))]!=null;]

    $if[$callFunction[configMusic;interval_message];
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[testmessage;{
    "id": "$trackInfo[id]",
    "title": "$replace[$replace[$trackInfo[title];\\\\;];";\\\\"]",
    "author": "$trackInfo[author]",
    "url": "$trackInfo[url]",
    "thumbnail": "$trackInfo[thumbnail]",
    "duration": "$trackInfo[duration]",
    "durationMS": "$trackInfo[durationMS]",
    "requestedBy": {"id":"$trackInfo[requestedBy;id]"}
    }]
    
    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $setInterval[
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$get[testmessage];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]];$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerFinish",
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