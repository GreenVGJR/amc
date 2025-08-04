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
    "type": 3,
    "name": "provider",
    "description": "Provider to use for searching track",
    "required": false,
    "choices": [
      {
        "name": "YouTube",
        "value": "youtube"
      },
      {
        "name": "Soundcloud",
        "value": "soundcloud"
      },
      {
        "name": "Spotify",
        "value": "spotify"
      }
    ]
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
  $onlyIf[$guildID!=;]
  $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
  $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
  $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
  $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
  $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]

  $let[iscreatedfirst;$checkCondition[$hasPlayer[$guildID]==false]]

  $let[mid;$interactionReply[
  $addField[Query;$codeBlock[$cropText[$option[query];0;1000]]]
  $footer[Fetching;$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  $timestamp
  ;true]]
  $let[default_provider;$callFunction[configMusic;default_provider]]
  $let[fallback_provider;$callFunction[configMusic;fallback_provider]]
  $if[$isValidLink[$option[query]]==false;
  $let[basic_type;true]
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$if[$option[provider]!=;$option[provider];$get[default_provider]];null]]
  $let[tempstoreurl;$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtube;https://youtube.com/watch/?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==soundcloud;https://soundcloud.com/$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==spotify;https://open.spotify.com/track/$env[result;id]]]]]
  $let[use_provider;$if[$option[provider]!=;$option[provider];$get[default_provider]]]
  $let[cac1;$env[result;id]]
  $if[$get[cac1]==;
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$get[fallback_provider];null]]
  $let[tempstoreurl;$if[$get[fallback_provider]==youtube;https://youtube.com/watch/?v=$env[result;id];$if[$get[fallback_provider]==soundcloud;https://soundcloud.com/$env[result;id];$if[$get[fallback_provider]==spotify;https://open.spotify.com/track/$env[result;id]]]]]
  $let[use_provider;$get[fallback_provider]]
  $let[cac2;$env[result;id]]
  $onlyIf[$and[$get[cac1]!=;$get[cac2]!=];
  $interactionUpdate[
  $description[$callFunction[useCustomMusicMessage;config_errorNoResult]]
  $color[$callFunction[useIcon;error_color_embed]]
  $footer[slash]
  $timestamp
  ]]]
  $let[music_requestedBy;<@$authorID>]
  $let[music_title;$inflate[$env[result;title];base64]]
  $let[music_id;$env[result;id]]
  $let[music_duration;$multi[$env[result;duration];1000]]
  $let[music_thumbnail;$if[$env[result;dynamic_thumbnail]==;$env[result;thumbnail];$env[result;dynamic_thumbnail]]]
  $let[music_provider;$get[use_provider]]

  $if[$get[iscreatedfirst];
  $async[
    $!interactionUpdate[
        $addField[Requested By;$get[music_requestedBy];false]
        $addField[Title;$get[music_title];true]
        $addField[Duration;$if[$get[music_duration]==0;LIVE;$parseDigital[$get[music_duration]]];true]
        $thumbnail[$get[music_thumbnail]]
        $author[Fetching;$callFunction[useIcon;loading]]
        $timestamp
        $color[$callFunction[useIcon;color_embed]]
        $footer[$toTitleCase[$get[music_provider]];$callFunction[useIcon;$get[music_provider]]]
    ]
  ]]
  $let[music_playurl;$get[tempstoreurl]]
  ;
  $let[basic_type;false]
  $let[music_playurl;$option[query]]
  ]

  $let[queue_lengthtemp;$if[$hasPlayer[$guildID];$queueLength[$guildID];0]]
  $if[$or[$getVar[musicplayer_message;$guildID_channelid;null]==null;$voiceID[$guildID;$clientID]==];
  $setVar[musicplayer_message;$guildID_channelid;$channelID]
  $setVar[musicplayer_message;$guildID_messageid;$get[mid]]
  ]

  $let[attemptry;0]
  $let[donetry;3]
  $let[found;false]
  $try[
  $!createPlayer[$guildID;$voiceID[$guildID;$authorID];$channelID]
  $!addTrack[$guildID;$get[music_playurl]]
  ;
  $letSum[attemptry;1]
  ]

  $while[$and[$get[attemptry]!=0;$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $!createPlayer[$guildID;$voiceID[$guildID;$authorID];$channelID]
    $!addTrack[$guildID;$get[music_playurl]]
    $let[found;true]
    ;
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $if[$get[attemptry]>=$get[donetry];
  $!editMessage[$channelID;$get[mid];
  $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack] $codeBlock[$env[causeplayerror]]]
  $color[$callFunction[useIcon;error_color_embed]]
  $timestamp
  $footer[slash]
  $if[$get[iscreatedfirst]==true;$!destroyPlayer[$guildID]]
  $setTimeout[
  $if[$get[iscreatedfirst]==false;$!interactionDelete]
  ;5s]
  ]
  $!deleteVar[musicplayer_message;$guildID_messageid]
  $!deleteVar[musicplayer_message;$guildID_channelid]
  $stop
  ]

  $if[$and[$queueLength[$guildID]!=0;$get[iscreatedfirst]==false];
  $!interactionUpdate[
  $if[$get[basic_type];
  $author[Add to Track;;;0]
  $addField[Requested By;$get[music_requestedBy];false;0]
  $addField[Title;$get[music_title];true;0]
  $addField[Duration;$if[$get[music_duration]==0;LIVE;$parseDigital[$get[music_duration]]];true;0]
  $thumbnail[$get[music_thumbnail];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$toTitleCase[$get[music_provider]];$callFunction[useIcon;$get[music_provider];0]]
  $author[Queue;;;1]
  $addField[Added Song;$sub[$queueLength[$guildID];$get[queue_lengthtemp]];true;1]
  $addField[Total Song;$queueLength[$guildID];true;1]
  $addField[Total Duration;$parseDigital[$playerQueueTime[$guildID]];true;1]
  $color[$callFunction[useIcon;color_embed];1]
  $timestamp[;1]
  ;
  $author[Queue;;;0]
  $addField[Added Song;$sub[$queueLength;$get[queue_lengthtemp]];true;0]
  $addField[Total Song;$queueLength;true;0]
  $addField[Total Duration;$parseDigital[$queueEstimatedDuration];true;0]
  $if[$option[force_skip]==true;$footer[$callFunction[useCustomMusicMessage;config_generalForceSkipTrack];$callFunction[useIcon;loading];0]]
  $color[$callFunction[useIcon;color_embed];0]
  ]]
  $setTimeout[
  $if[$messageExists[$channelID;$get[mid]];$!deleteMessage[$channelID;$get[mid]]]
  ;5s]
  $stop
  ]`
}