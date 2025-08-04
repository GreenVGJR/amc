module.exports = {
  data: {
  "type": 1,
  "name": "skip",
  "description": "Skip a track",
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Ganti lagu ke selanjutnya"
  }
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $ephemeral
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;$callFunction[useCustomMusicMessage;config_errorClientPlayer]]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    $let[nodes;$if[$hasPlayer[$guildID];$queueLength[$guildID];0]]
    $onlyIf[$get[nodes]>1;$callFunction[useCustomMusicMessage;config_errorNoTrackBeforeSeek]]
    $onlyIf[$getVar[musicplayer_message;$guildID_isloop;none]!=track;$callFunction[useCustomMusicMessage;config_errorPlayerBeforeSeek]]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $defer
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $async[$!disableComponentsOf[$get[cid];$get[mid]]]
    $skipTrack[$guildID]
    $!interactionFollowUp[$callFunction[useCustomMusicMessage;config_generalSkipTrack]]
    `
}