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

    $let[checkdurationms;$if[$hasMusicNode;$if[$isPlaying;$trackInfo[durationMS];0];0]]
    $onlyIf[$get[checkdurationms]!=0;This track is LIVE.]
    $onlyIf[$isPaused!=true;You can't seek while it's paused.]
    $onlyIf[$getVar[musicplayer_message;$guildID_attemptseek;false]==false;It's still processing.]
    
    $defer

    $if[$isNumber[$option[duration]];
    $let[pest;$multi[$if[$option[duration]<0;0;$option[duration]];1000]]
    ;
    $let[pest;$if[$parseString[$replace[$option[duration]; ;]]<0;0;$parseString[$replace[$option[duration]; ;]]]]
    ]
    $async[
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!editMessage[$get[cid];$get[mid];
    $fetchResponse[$get[cid];$get[mid]]
    $footer[Re-Downloading;$callFunction[useIcon;loading]]
    $timestamp
    ]
    ]
    $setVar[musicplayer_message;$guildID_attemptseek;true]
    $let[test;$seekTrack[$get[pest]]]
    $if[$get[test];
    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[pest]]]
    $!interactionFollowUp[Seek to \`$parseDigital[$get[pest]]\`]
    ;
    $!interactionFollowUp[Failed to seek.]
    ]
  `
}