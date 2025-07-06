module.exports = {
  data: {
  "name": "stop",
  "description": "Stop a track",
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Berhenti lagu yang dimainkan"
  }
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $ephemeral
    $defer
    $onlyIf[$voiceID!=;You must join a voice channel.]
    $onlyIf[$voiceID[$guildID;$clientID]!=;Already disconnect.]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]
    $!clearInterval[intervalmusicmessage_$guildID_$getVar[musicplayer_message;$guildID_channelid]]
    $!disableComponentsOf[$getVar[musicplayer_message;$guildID_channelid];$getVar[musicplayer_message;$guildID_messageid]]
    $!destroyPlayer[$guildID]
    $!deleteVar[musicplayer_message;$guildID_messageid]
    $!deleteVar[musicplayer_message;$guildID_channelid]
    $!interactionFollowUp[OK]
    `
}