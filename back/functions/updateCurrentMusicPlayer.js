module.exports = {
    name: "updateCurrentMusicPlayer",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[testmessage;{
    "id": "$trackInfo[id]",
    "title": "$advancedReplace[$trackInfo[title];\\\\;;";\\\\"]",
    "author": "$trackInfo[author]",
    "url": "$trackInfo[url]",
    "thumbnail": "$trackInfo[thumbnail]",
    "duration": "$trackInfo[duration]",
    "durationMS": "$trackInfo[durationMS]",
    "requestedBy": {"id":"$trackInfo[requestedBy;id]"}
    }]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$get[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true;$callFunction[configMusic;interval_message]]
    `
}