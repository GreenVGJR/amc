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
    $let[nodes;$if[$hasPlayer[$guildID];$queueLength[$guildID];0]]
    $onlyIf[$get[nodes]>1;Nothing to skip track.]

    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]

    $defer
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $async[$!disableComponentsOf[$get[cid];$get[mid]]]
    $let[test;$skipTrack[$guildID]]
    $if[$get[test];
    $!interactionFollowUp[Skipped.]
    ;
    $!interactionFollowUp[Failed to skip.]]
    `
}