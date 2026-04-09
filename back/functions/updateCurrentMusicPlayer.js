module.exports = {
    name: "updateCurrentMusicPlayer",
    params: [
    {
        name: "bypassEdit", // bool
        description: "Bypass Edit by using Interaction Update instead",
        required: false,
    }],
    code: `
    $let[bypassEdit;$if[$or[$env[bypassEdit]==null;$env[bypassEdit]==];false;$env[bypassEdit]]]
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $jsonLoad[currenttrack;$playerCurrentTrack[$guildID]]
    $jsonLoad[testmessage;{}]
    $!jsonSet[testmessage;title;$env[currenttrack;title]]
    $!jsonSet[testmessage;author;$env[currenttrack;author]]
    $!jsonSet[testmessage;url;$env[currenttrack;uri]]
    $!jsonSet[testmessage;thumbnail;$env[currenttrack;artworkUrl]]
    $!jsonSet[testmessage;duration;"$round[$divide[$env[currenttrack;duration];1000];0]"]
    $!jsonSet[testmessage;durationMS;"$env[currenttrack;duration]"]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$jsonStringify[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true;$callFunction[configMusic;interval_message];$get[bypassEdit]]
    `
}