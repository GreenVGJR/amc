module.exports = {
  data: {
  "type": 1,
  "name": "skip",
  "description": "Skip a track",
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
    $defer
    $let[cacinfo;$queue[0;1;{track.title}]]
    $let[test;$skipTrack]
    $if[$get[test];
    $!interactionFollowUp[
    Skipped to:$codeBlock[$get[cacinfo]]
    ]
    ;
    $!interactionFollowUp[Failed to skip.]]
    `
}