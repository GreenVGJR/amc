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
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;$callFunction[useCustomMusicMessage;config_errorClientPlayer]]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    $onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]
    $let[nodes;$if[$hasMusicNode;$queueLength;0]]
    $onlyIf[$get[nodes]!=0;$callFunction[useCustomMusicMessage;config_errorNoTrackBeforeSeek]]
    $onlyIf[$getLoopMode!=TRACK;$callFunction[useCustomMusicMessage;config_errorPlayerBeforeSeek]]

    $if[$option[position]!=;
    $onlyIf[$sub[$option[position];1]<$queueLength;$callFunction[useCustomMusicMessage;config_errorPositionBeforeSeek] \`$option[position]\`]
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
    $!interactionFollowUp[$callFunction[useCustomMusicMessage;config_generalSkipTrack]]
    ;
    $!interactionFollowUp[$callFunction[useCustomMusicMessage;config_generalFailSkipTrack]]
    ]
    $setTimeout[$!interactionDelete;3s]
    `
}