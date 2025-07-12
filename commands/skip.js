module.exports = {
  data: {
  "name": "skip",
  "description": "Skip a track",
  "options": [
    {
      "type": 4,
      "name": "position",
      "description": "Skip to specific track",
      "min_value": 1,
      "required": false,
    },
  ],
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
    $onlyIf[$voiceID!=;You must join a voice channel.]
    $onlyIf[$voiceID[$guildID;$clientID]!=;Nothing is playing.]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]
    $let[nodes;$if[$hasMusicNode;$queueLength;0]]
    $onlyIf[$get[nodes]!=0;Nothing to skip track.]
    $onlyIf[$getLoopMode!=TRACK;Disable loop mode to skip.]

    $if[$option[position]!=;
    $onlyIf[$sub[$option[position];1]<$queueLength;Nothing to skip on position: \`$option[position]\`]
    ]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $defer
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $if[$option[position]!=;
    $let[test;$skipTo[$sub[$option[position];1]]]
    ;
    $let[test;$skipTrack]
  ]
    $if[$get[test];
    $!interactionFollowUp[Skipped.]
    ;
    $!interactionFollowUp[Failed to skip.]
    ]
    $setTimeout[$!interactionDelete;3s]
    `
}