module.exports = {
  data: {
  "name": "stop",
  "description": "Stop a track",
  "options": [
    {
      "type": 5,
      "name": "destroy",
      "description": "Destroy the music player?"
    }
  ],
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
    $onlyIf[$voiceID!=;You must join a voice channel.]
    $onlyIf[$voiceID[$guildID;$clientID]!=;Already disconnect.]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]
    $defer
    $!clearInterval[intervalmusicmessage_$guildID_$getVar[musicplayer_message;$guildID_channelid]]
    $if[$option[destroy];$leaveVoiceChannel;$!stopTrack]
    $!interactionFollowUp[OK]
    `
}