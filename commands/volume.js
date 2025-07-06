module.exports = {
  data: {
  "name": "volume",
  "description": "Set the volume of the music player",
  "options": [
    {
      "name": "value",
      "description": "Set the volume of the music player",
      "type": 4,
      "min_value": 0,
      "max_value": 150,
      "required": true
    }
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Ganti volume lagu"
  }
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $ephemeral
    $onlyIf[$voiceID!=;You must join a voice channel.]
    $onlyIf[$voiceID[$guildID;$clientID]!=;Nothing is playing.]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]
    $defer
    $setVolume[$option[value]]
    $!interactionFollowUp[Volume changed to: \`$getVolume%\`]
    `
}