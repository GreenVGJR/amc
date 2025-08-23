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
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;$callFunction[useCustomMusicMessage;config_errorStopTrack]]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    $!clearInterval[intervalmusicmessage_$guildID_$getVar[musicplayer_message;$guildID_channelid]]
    $if[$option[destroy];$async[$leaveVoiceChannel];$async[$!stopTrack]]
    $!interactionFollowUp[$callFunction[useCustomMusicMessage;config_generalStopTrack]]
    $setTimeout[$!interactionDelete;2s]
    $!deleteMemberVar[cachesearchistory_user_autocomplete;$authorID]
    `
}