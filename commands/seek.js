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
    $onlyIf[$voiceID!=;You must join a voice channel.]
    $onlyIf[$voiceID[$guildID;$clientID]!=;Nothing is playing.]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]
    $onlyIf[$hasPlayer[$guildID];Nothing is playing.]

    $jsonLoad[currenttrackinfo;$currentTrackInfo[$guildID]]

    $let[checkdurationms;$env[currenttrackinfo;info;length]]
    $onlyIf[$get[checkdurationms]!=0;This track is LIVE.]
    $onlyIf[$isPaused[$guildID]!=true;You can't seek while it's paused.]
    $onlyIf[$getVar[musicplayer_message;$guildID_attemptseek;false]==false;It's still processing.]
    
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