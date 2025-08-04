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
    $onlyIf[$hasPlayer[$guildID]!=false;$callFunction[useCustomMusicMessage;config_errorClientPlayer]]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    
    $jsonLoad[currenttrackinfo;$currentTrackInfo[$guildID]]

    $let[checkdurationms;$env[currenttrackinfo;info;length]]
    $let[checkstream;$env[currenttrackinfo;info;isStream]]
    $onlyIf[$get[checkstream]!=true;$callFunction[useCustomMusicMessage;config_errorLiveBeforeSeek]]
    $onlyIf[$isPaused[$guildID]!=true;$callFunction[useCustomMusicMessage;config_errorPauseBeforeSeek]]
    $onlyIf[$getVar[musicplayer_message;$guildID_attemptseek;false]==false;$callFunction[useCustomMusicMessage;config_errorProcessSeek]]
    
    $defer

    $if[$isNumber[$option[duration]];
    $let[pest;$multi[$if[$option[duration]<0;0;$option[duration]];1000]]
    ;
    $let[pest;$if[$parseString[$replace[$option[duration]; ;]]<0;0;$parseString[$replace[$option[duration]; ;]]]]
    ]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $setVar[musicplayer_message;$guildID_attemptseek;true]
    $seekTrack[$guildID;$get[pest]]
    $setVar[musicplayer_message;$guildID_attemptseek;false]
    $!interactionFollowUp[Seek to \`$parseDigital[$get[pest]]\`]
    $setTimeout[$!interactionDelete;3s]
  `
}