module.exports = {
  data: {
  "name": "seek",
  "description": "Seek a track to specific duration",
  "options": [
    {
      "type": 3,
      "name": "duration",
      "description": "Seek a track to specific duration",
      "required": true
    }
  ],
  "description_localizations": {
    "id": "Pindah durasi lagu ke bagian tertentu"
  },
  "contexts": [
    0
  ]
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $ephemeral
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;$callFunction[useCustomMusicMessage;config_errorClientPlayer]]
    $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
    $if[$get[crdjcs_0f]==false;
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    ;
    $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
    $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
    ]

    $onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]
    $jsonLoad[curtrack;$try[$playerCurrentTrack[$guildID];{}]]
    $let[checkdurationms;$env[curtrack;isStream]]
    $onlyIf[$get[checkdurationms]!=true;$callFunction[useCustomMusicMessage;config_errorLiveBeforeSeek]]
    $onlyIf[$playerIsPaused[$guildID]!=true;$callFunction[useCustomMusicMessage;config_errorPauseBeforeSeek]]

    $if[$isNumber[$option[duration]];
    $let[pest;$multi[$if[$option[duration]<0;0;$option[duration]];1000]]
    ;
    $let[pest;$if[$parseString[$replace[$option[duration]; ;]]<0;0;$parseString[$replace[$option[duration]; ;]]]]
    ]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $async[$!playerSeek[$guildID;$get[pest]]]
    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[pest]]]
    $interactionReply[$callFunction[useCustomMusicMessage;config_generalSeekTrack] \`$parseDigital[$get[pest]]\`]
    $setTimeout[$!interactionDelete;3s]
  `
}