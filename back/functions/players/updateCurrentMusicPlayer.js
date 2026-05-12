module.exports = {
    name: "updateCurrentMusicPlayer",
    params: [
    {
        name: "bypassEdit", // bool
        description: "Bypass Edit by using Interaction Update instead",
        required: false,
    }],
    code: `
    $if[$try[$queueLength;-1]==-1;$return]
    $if[$callFunction[configMusic;interval_message];
    $setCache[musicplayer_message_$guildID_waitinterval;false]
    ]
    $let[bypassEdit;$if[$or[$env[bypassEdit]==null;$env[bypassEdit]==];false;$env[bypassEdit]]]
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $jsonLoad[testmessage;{}]
    $!jsonSet[testmessage;id;$trackInfo[id]]
    $!jsonSet[testmessage;title;$trackInfo[title]]
    $!jsonSet[testmessage;author;$trackInfo[author]]
    $!jsonSet[testmessage;url;$trackInfo[url]]
    $!jsonSet[testmessage;thumbnail;$trackInfo[thumbnail]]
    $!jsonSet[testmessage;duration;$trackInfo[duration]]
    $!jsonSet[testmessage;durationMS;"$trackInfo[durationMS]"]
    $!jsonSet[testmessage;requestedBy;{}]
    $!jsonSet[testmessage;requestedBy;id;"$trackInfo[requestedBy;id]"]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$jsonStringify[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true;$callFunction[configMusic;interval_message];$get[bypassEdit]]

    $if[$callFunction[configMusic;interval_message];
    $setCache[musicplayer_message_$guildID_waitinterval;true]
    ]
    `
}