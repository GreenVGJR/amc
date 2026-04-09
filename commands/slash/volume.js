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
    "integration_types": [
      0
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
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;$callFunction[useCustomMusicMessage;config_errorStopTrack]]
    $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
    $if[$get[crdjcs_0f]==false;
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    ;
    $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
    $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
    ]
    $async[$!playerSetVolume[$guildID;$option[value]]]
    $interactionReply[$callFunction[useCustomMusicMessage;config_generalVolumeTrack] \`$playerGetVolume[$guildID]%\`]
    $setTimeout[$async[$!interactionDelete];1s]
    $callFunction[updateCurrentMusicPlayer;false]
    `
}