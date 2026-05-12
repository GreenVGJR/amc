module.exports = {
  data: {
    "name": "stop",
    "description": "Stop a track",
    "integration_types": [
      0
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
    $onlyIf[$try[$isPlaying;false];$callFunction[useCustomMusicMessage;config_errorStopTrack]]
    $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
    $if[$get[crdjcs_0f]==false;
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    ;
    $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
    $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
    ]
    $!clearInterval[intervalmusicmessage_$guildID_$getCache[musicplayer_message_$guildID_channelid]]
    $deleteCache[cachesearchistory_user_autocomplete_$authorID]
    $deleteCache[musicplayer_message_$guildID_isdynamicmusic]
    $if[$getCache[musicplayer_message_$guildID_is247music]!=true;
    $async[$leaveVoiceChannel]
    ;
    $async[
    $if[$getCache[musicplayer_message_$guildID_ongoingdynamicmusic]==true;
    $defer
    $loop[-1;
    $let[cf-fetch;$getCache[musicplayer_message_$guildID_ongoingdynamicmusic]]
    $if[$get[cf-fetch]!=true;$break]
    $wait[10]
    ]]
    $!stopTrack
    ]]
    $interactionReply[$callFunction[useCustomMusicMessage;config_generalStopTrack]]
    $setTimeout[$async[$!interactionDelete];1s]
    `
}