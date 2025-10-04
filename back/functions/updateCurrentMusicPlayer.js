module.exports = {
    name: "updateCurrentMusicPlayer",
    code: `
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $jsonLoad[currenttrack;$playerCurrentTrack[$guildID]]
    $let[testmessage;{
    "title": "$replace[$env[currenttrack;title];";\\\\"]",
    "description": "",
    "author": "$env[currenttrack;author]",
    "url": "$env[currenttrack;uri]",
    "thumbnail": "$env[currenttrack;artworkUrl]",
    "duration": "$round[$divide[$env[currenttrack;duration];1000];0]",
    "durationMS": "$env[currenttrack;duration]"
    }]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$get[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true;$callFunction[configMusic;interval_message]]
    `
}