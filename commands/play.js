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
    },
    {
      "type": 5,
      "name": "force_skip",
      "description": "Instantly skip current track after adding track",
      "required": false,
    },
    {
      "type": 5,
      "name": "direct_cdn",
      "description": "Uses Direct CDN after searching track to play",
      "required": false,
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
  $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
  $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
  $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
  $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
  $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]

  $onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

  $let[mid;$interactionReply[
  $addField[Query;$codeBlock[$option[query]]]
  $footer[Fetching;$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  $timestamp
  ;true]]
 
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
  $description[$callFunction[useCustomMusicMessage;config_errorNoResult]]
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

  $let[isforcedirect;$option[direct_cdn]]
  $let[tempstoreurl;$if[$get[default_provider]==youtube;https://youtube.com/watch?v=$env[result;id];$if[$get[default_provider]==soundcloud;https://soundcloud.com/$env[result;id]]]]

  $if[$get[isforcedirect]==true;
  $let[music_playurl;$trimLines[$callFunction[fallbackPlaybackTrack;$get[tempstoreurl]]]]
  $if[$or[$get[music_playurl]==live;$get[music_playurl]==null]==true;$let[music_playurl;$get[tempstoreurl]] $let[isforcedirect;false]]
  ;
  $let[music_playurl;$get[tempstoreurl]]
  ]
  ;
  $let[basic_type;false]
  $let[music_playurl;$option[query]]
  ]

  $let[queue_lengthtemp;$if[$hasMusicNode;$queueLength;0]]
  $if[$or[$getVar[musicplayer_message;$guildID_channelid;null]==null;$voiceID[$guildID;$clientID]==];
  $setVar[musicplayer_message;$guildID_channelid;$channelID]
  $setVar[musicplayer_message;$guildID_messageid;$get[mid]]
  ]

  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[music_playurl]]]

  $let[iscreatedfirst;$or[$hasMusicNode==false;$if[$hasMusicNode;$isPlaying;false]==false]]
  $let[attemptry;0]
  $let[donetry;3]
  $let[found;false]
  $try[
  $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==soundcloud]!=true;
  $playTrack[$voiceID;$get[music_playurl];$env[whatmusictype;type]]
  ;
  $playTrack[$voiceID;$get[music_playurl];auto]
  ]
  ;
  $letSum[attemptry;1]
  ]

  $while[$and[$get[attemptry]!=0;$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==soundcloud]!=true;
    $playTrack[$voiceID;$get[music_playurl];$env[whatmusictype;type]]
    ;
    $playTrack[$voiceID;$get[music_playurl];auto]
    ]
    $let[found;true]
    ;
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $if[$get[attemptry]>=$get[donetry];
  $!interactionUpdate[
  $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack] $codeBlock[$env[causeplayerror]]]
  $color[$callFunction[useIcon;error_color_embed]]
  $timestamp
  $footer[slash]
  ]
  $setTimeout[
  $if[$get[iscreatedfirst]==false;$!interactionDelete]
  ;5s]
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
  $async[
  $setTimeout[
  $if[$messageExists[$channelID;$get[mid]];$!deleteMessage[$channelID;$get[mid]]]
  ;3s]
  ]
  $if[$option[force_skip]==true;
  $let[mid2;$sendMessage[$channelID;
    $reply[$channelID;$get[mid];true]
    $color[$callFunction[useIcon;color_embed]]
    $footer[$callFunction[useCustomMusicMessage;config_generalForceSkipTrack];$callFunction[useIcon;loading]]
  ;true]]
  $!skipTo[$sub[$queueLength;1]]
  $!deleteMessage[$channelID;$get[mid2]]
  ]
  ]`
}