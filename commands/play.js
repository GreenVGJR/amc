module.exports = {
  data: {
  "name": "play",
  "description": "Play a track",
  "options": [
    {
      "type": 3,
      "name": "query",
      "description": "Search a track to play",
      "required": true,
      "autocomplete": true
    }
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Mencari lagu untuk dimainkan"
  },
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]
  $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral Missing Permission, **Send Messages** - <@$clientID>]
  $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral Missing Permission, **Connect** - <@$clientID>]
  $onlyIf[$voiceID!=;$ephemeral You must join a voice channel.]
  $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral Can't join to voice channel.\nReason: Missing Permission, **Connect** - <@$clientID> (<#$voiceID>)]
  $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]

  $defer
 
  $let[default_provider;$callFunction[configMusic;default_provider]]
  $let[fallback_provider;$callFunction[configMusic;fallback_provider]]
  $if[$isValidLink[$option[query]]==false;
  $let[basic_type;true]
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$get[default_provider];null]]
  $let[cac1;$env[result;id]]
  $if[$get[cac1]==;
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$get[fallback_provider];null]]
  $let[cac2;$env[result;id]]
  $onlyIf[$and[$get[cac1]!=;$get[cac2]!=];
  $interactionFollowUp[
  $description[No results found.]
  $color[$callFunction[useIcon;error_color_embed]]
  $footer[slash]
  $timestamp
  ]]]
  $let[music_requestedBy;<@$authorID>]
  $let[music_title;$env[result;title]]
  $let[music_id;$env[result;id]]
  $let[music_duration;$multi[$env[result;duration];1000]]
  $let[music_thumbnail;$if[$env[result;dynamic_thumbnail]==;$env[result;thumbnail];$env[result;dynamic_thumbnail]]]
  $let[music_provider;$get[default_provider]]

  $let[music_playurl;$if[$get[default_provider]==youtube;https://music.youtube.com/watch?v=$env[result;id];$if[$get[default_provider]==soundcloud;https://soundcloud.com/$env[result;id]]]]
  ;
  $let[basic_type;false]
  $let[music_playurl;$option[query]]
  ]

  $if[$get[basic_type]==true;
  $let[mid;$interactionFollowUp[
  $addField[Requested By;$get[music_requestedBy];false]
  $addField[Title;$get[music_title];true]
  $addField[Duration;$if[$get[music_duration]==0;LIVE;$parseDigital[$get[music_duration]]];true]
  $thumbnail[$get[music_thumbnail]]
  $author[Fetching;$callFunction[useIcon;loading]]
  $timestamp
  $color[$callFunction[useIcon;color_embed]]
  $footer[$toTitleCase[$get[music_provider]];$callFunction[useIcon;$get[music_provider]]]
  ;true]]
  ;
  $let[mid;$interactionFollowUp[
  $addField[Requested By;<@$authorID>;false]
  $addField[Query;$codeBlock[$cropText[$option[query];0;1016]];false]
  $author[Fetching;$callFunction[useIcon;loading]]
  $thumbnail[$userAvatar[$authorID;1024]]
  $timestamp
  $color[$callFunction[useIcon;color_embed]]
  ;true]]
  ]

  $let[queue_lengthtemp;$if[$hasMusicNode;$queueLength;0]]
  $if[$or[$getVar[musicplayer_message;$guildID_channelid;null]==null;$voiceID[$guildID;$clientID]==];
  $setVar[musicplayer_message;$guildID_channelid;$channelID]
  $setVar[musicplayer_message;$guildID_messageid;$get[mid]]
  ]

  $let[iscreatedfirst;$or[$hasMusicNode==false;$if[$hasMusicNode;$isPlaying;false]==false]]
  $let[attemptry;0]
  $let[donetry;3]
  $let[found;false]
  $try[
  $playTrack[$voiceID;$get[music_playurl]]
  ;
  $letSum[attemptry;1]
  ]

  $while[$and[$get[attemptry]!=0;$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $playTrack[$voiceID;$get[music_playurl]]
    $let[found;true]
    ;
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $if[$get[attemptry]>=$get[donetry];
  $!interactionUpdate[
  $description[Can't process this.\nError: $codeBlock[$env[causeplayerror]]]
  $color[$callFunction[useIcon;error_color_embed]]
  $timestamp
  $footer[slash]
  ]
  $stop
  ]

  $if[$and[$queueLength!=0;$get[iscreatedfirst]==false];
  $!interactionUpdate[
  $author[Queue;;;0]
  $addField[Added Song;$sub[$queueLength;$get[queue_lengthtemp]];true;0]
  $addField[Total Song;$queueLength;true;0]
  $addField[Total Duration;$parseDigital[$queueEstimatedDuration];true;0]
  $color[$callFunction[useIcon;color_embed];0]
  $timestamp[;0]
  ]
  $setTimeout[
  $if[$messageExists[$channelID;$get[mid]];$!deleteMessage[$channelID;$get[mid]]]
  ;5s]
  ]`
}