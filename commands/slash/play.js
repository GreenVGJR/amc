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
            "name": "YouTube Music",
            "value": "youtubemusic"
          },
          {
            "name": "Soundcloud",
            "value": "soundcloud"
          },
          {
            "name": "Spotify",
            "value": "spotify"
          },
          {
            "name": "Apple Music",
            "value": "applemusic"
          },
        ]
      },
      {
        "type": 5,
        "name": "force_skip",
        "description": "Skip current track playing after adding track",
        "required": false,
      }
    ],
    "integration_types": [
      0
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
  $onlyIf[$option[query]!=__infointer-$authorID__;$ephemeral $defer $!interactionDelete]
  $let[filquery;$decodeURIComponent[$option[query]]]
  $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
  $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
  $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
  $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
  $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
  $if[$get[crdjcs_0f]==false;
  $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
  ;
  $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
  $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
  ]

  $onlyIf[$or[$channelUserLimit[$voiceID]==0;$sum[$channelVoiceMemberCount[$voiceID];$if[$voiceID[$guildID;$clientID]==;1;0]]<=$channelUserLimit[$voiceID]];$ephemeral $callFunction[useCustomMusicMessage;config_errorIsLimitVC]]
  $onlyIf[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

  $let[iscreatedfirst;$or[$hasMusicNode==false;$if[$hasMusicNode;$isPlaying;false]==false]]

  $silent

  $localFunction[loadinteraction;
  $if[$env[typesload]==1-1;
  $let[mid;$interactionReply[
  $author[» Searching\n$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $footer[none;$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  ;$get[iscreatedfirst]]]
  $if[$or[$and[$getCache[musicplayer_message_$guildID_is247music]!=true;$get[iscreatedfirst]];$getCache[musicplayer_message_$guildID_channelid]==;$voiceID[$guildID;$clientID]==];
  $setCache[musicplayer_message_$guildID_channelid;"$channelID"]
  $setCache[musicplayer_message_$guildID_messageid;"$get[mid]"]
  ]
  ]
  $if[$env[typesload]==1-2;
  $let[mid;$interactionReply[
  $author[» Fetching\n$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[Query;$codeBlock[$cropText[$get[filquery];0;1000]]]
  $footer[none$if[$and[$get[iscreatedfirst]==false;$option[force_skip]==true]; - $callFunction[useCustomMusicMessage;config_generalForceSkipTrack]];$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  ;$get[iscreatedfirst]]]
  $if[$or[$and[$getCache[musicplayer_message_$guildID_is247music]!=true;$get[iscreatedfirst]];$getCache[musicplayer_message_$guildID_channelid]==;$voiceID[$guildID;$clientID]==];
  $setCache[musicplayer_message_$guildID_channelid;"$channelID"]
  $setCache[musicplayer_message_$guildID_messageid;"$get[mid]"]
  ]
  ]
  $if[$env[typesload]==2;
  $interactionReply[
  $author[» Fetching\n$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[$get[music_title];-# $if[$get[music_duration]==0;LIVE;$if[$advancedTextSplit[$parseDigital[$get[music_duration]];:;0]==00;$cropText[$parseDigital[$get[music_duration]];3;];$parseDigital[$get[music_duration]]]];true]
  $thumbnail[$get[music_thumbnail]]
  $color[$callFunction[useIcon;color_embed]]
  $footer[$toTitleCase[$advancedReplace[$get[use_provider];youtubemusic;youtube music;applemusic;apple music]]$if[$and[$get[iscreatedfirst]==false;$option[force_skip]==true]; - $callFunction[useCustomMusicMessage;config_generalForceSkipTrack]];$callFunction[useIcon;loading]]
  ]
  ]
  $if[$env[typesload]==3;
  $interactionReply[
  $if[$get[basic_type];
  $author[$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[$get[music_title];-# $if[$get[music_duration]==0;LIVE;$if[$advancedTextSplit[$parseDigital[$get[music_duration]];:;0]==00;$cropText[$parseDigital[$get[music_duration]];3;];$parseDigital[$get[music_duration]]]];true]
  $thumbnail[$if[$isValidLink[$get[music_thumbnail]];$get[music_thumbnail];$userAvatar[$authorID;1024]];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$toTitleCase[$advancedReplace[$get[use_provider];youtubemusic;youtube music;applemusic;apple music]];$callFunction[useIcon;$get[use_provider];0]]
  $author[Queue;;;1]
  $addField[Added Song;$sub[$get[currentqueuern];$get[queue_lengthtemp]];true;1]
  $addField[Total Song;$get[currentqueuern];true;1]
  $addField[Total Duration;$parseDigital[$queueEstimatedDuration];true;1]
  $if[$option[force_skip]==true;$footer[$callFunction[useCustomMusicMessage;config_generalForceSkipTrack];$callFunction[useIcon;loading];1]]
  $color[$callFunction[useIcon;color_embed];0]
  $color[$callFunction[useIcon;color_embed];1]
  ;
  $author[Queue;;;0]
  $addField[Added Song;$sub[$get[currentqueuern];$get[queue_lengthtemp]];true;0]
  $addField[Total Song;$get[currentqueuern];true;0]
  $addField[Total Duration;$parseDigital[$queueEstimatedDuration];true;0]
  $if[$option[force_skip]==true;$footer[$callFunction[useCustomMusicMessage;config_generalForceSkipTrack];$callFunction[useIcon;loading];0]]
  $color[$callFunction[useIcon;color_embed];0]
  ]]
  ]
  $if[$env[typesload]==error-1;
  $interactionReply[
  $description[$callFunction[useCustomMusicMessage;config_errorNoResult]]
  $color[$callFunction[useIcon;error_color_embed]]
  $footer[slash]
  $timestamp
  ]
  ]
  $if[$env[typesload]==error-2;
  $interactionReply[
  $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack] $codeBlock[$env[causeplayerror]]]
  $color[$callFunction[useIcon;error_color_embed]]
  $timestamp
  $footer[slash]
  ]
  ]
  ;typesload]
  
  $let[default_provider;$callFunction[configMusic;default_provider]]
  $let[fallback_provider;$callFunction[configMusic;fallback_provider]]
  $if[$isValidLink[$get[filquery]]==false;
  $let[basic_type;true]
  $let[fsearch;false]
  $async[
  $jsonLoad[result;$callFunction[fastMetadataTrack;$get[filquery];$if[$option[provider]!=;$option[provider];$get[default_provider]];null]]
  $let[tempstoreurl;$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtube;https://youtube.com/watch?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtubemusic;https://youtube.com/watch?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==soundcloud;https://soundcloud.com/$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==spotify;https://open.spotify.com/track/$env[result;id];$env[result;id]]]]]]
  $let[use_provider;$if[$option[provider]!=;$option[provider];$get[default_provider]]]
  $let[cac1;$env[result;id]]
  $if[$get[cac1]!=;$let[fsearch;true]]
  $if[$get[cac1]==;
  $jsonLoad[result;$callFunction[fastMetadataTrack;$get[filquery];$get[fallback_provider];null]]
  $let[tempstoreurl;$if[$or[$get[fallback_provider]==youtube;$get[fallback_provider]==youtubemusic];https://youtube.com/watch?v=$env[result;id];$if[$get[fallback_provider]==soundcloud;https://soundcloud.com/$env[result;id];$if[$get[fallback_provider]==spotify;https://open.spotify.com/track/$env[result;id];$env[result;id]]]]]
  $let[use_provider;$get[fallback_provider]]
  $let[cac2;$env[result;id]]
  $if[$get[cac2]!=;$let[fsearch;true]]
  $if[$and[$get[cac1]==;$get[cac2]==];
  $let[fsearch;null]
  ]
  ]
  ]
  $if[$get[iscreatedfirst];
  $let[ml;$try[$callFunction[joinVC]]]
  ]
  $callLocalFunction[loadinteraction;1-1]
  $loop[-1;
  $if[$get[fsearch]!=false;$break]
  $wait[5]
  ]
  $if[$get[fsearch]==null;
  $callLocalFunction[loadinteraction;error-1]
  $if[$get[iscreatedfirst]==false;$setTimeout[$async[$!interactionDelete];3s]]
  $stop
  ]
  $let[music_title;$env[result;title]]
  $let[music_id;$env[result;id]]
  $let[music_duration;$multi[$env[result;duration];1000]]
  $let[music_thumbnail;$default[$env[result;dynamic_thumbnail];$env[result;thumbnail]]]
  $let[music_thumbnail;$if[$isValidLink[$get[music_thumbnail]];$get[music_thumbnail];$userAvatar[$authorID;1024]]]
  $let[music_provider;$get[use_provider]]

  $let[music_playurl;$get[tempstoreurl]]
  ;
  $let[basic_type;false]
  
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[filquery]]]
  $let[music_playurl;$if[$env[whatmusictype;type]==youtubeplaylist;https://youtube.com/playlist?list=$env[whatmusictype;id];$if[$env[whatmusictype;type]==youtube;https://youtube.com/watch?v=$env[whatmusictype;id];$if[$env[whatmusictype;type]==soundcloud;https://soundcloud.com/$env[whatmusictype;id];$if[$env[whatmusictype;type]==spotify;https://open.spotify.com/$env[whatmusictype;id];$get[filquery]]]]]]
  ]

  $let[found;false]
  $let[attemptry;0]
  $let[donetry;5]
  $async[
  $let[queue_lengthtemp;$if[$hasMusicNode;$try[$queueLength;0];0]]
  $let[lockprovyt;youtubeVideo]

  $if[$get[basic_type];
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[music_playurl]]]
  ]

  $while[$and[$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $if[$env[whatmusictype;type]==youtube;
    $playTrack[$voiceID;$trimLines[$get[music_playurl]];$get[lockprovyt]]
    ;
    $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==applemusic;$env[whatmusictype;type]==soundcloud;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==youtubeplaylist]!=true;
    $playTrack[$voiceID;$trimLines[$get[music_playurl]];$env[whatmusictype;type]]
    ;
    $playTrack[$voiceID;$trimLines[$get[music_playurl]];auto]
    ]]
    $let[found;true]
    ;
    $if[$env[whatmusictype;type]==youtube;
    $if[$get[attemptry]==2;$let[lockprovyt;youtube]]
    ]
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $deleteCache[musicplayer_checkmessage_ytwarm_$guildID]
  ]

  $if[$get[basic_type];
  $if[$get[found]==false;
  $callLocalFunction[loadinteraction;2]
  ]
  ;
  $callLocalFunction[loadinteraction;1-2]
  ]

  $loop[-1;
  $if[$or[$get[attemptry]>=$get[donetry];$get[found]==true];$break]
  $wait[5]
  ]

  $let[currentqueuern;$if[$hasMusicNode;$try[$queueLength;0];0]]

  $if[$get[attemptry]>=$get[donetry];
  $if[$get[iscreatedfirst];
  $deleteCache[musicplayer_message_$guildID_messageid]
  $deleteCache[musicplayer_message_$guildID_channelid]
  ]
  $callLocalFunction[loadinteraction;error-2]
  $if[$get[iscreatedfirst]==false;$setTimeout[$async[$!interactionDelete];3s]]
  $stop
  ]

  $if[$and[$get[currentqueuern]!=0;$get[iscreatedfirst]==false];
  $async[$if[$option[force_skip]==true;
  $let[statusloop;$getLoopMode]
  $if[$get[statusloop]==TRACK;$setLoopMode[OFF] $wait[1s]]
  $!skipTo[$sub[$get[currentqueuern];1]]
  $if[$get[statusloop]==TRACK;$wait[1s] $setLoopMode[TRACK]]
  $!interactionDelete
  ]]
  $if[$option[force_skip]!=true;
  $callLocalFunction[loadinteraction;3]
  $setTimeout[$async[$!interactionDelete];1s]
  $callFunction[updateCurrentMusicPlayer;false]
  ]
  $stop
  ]
  
  $if[$getCache[musicplayer_message_$guildID_is247music]==true;
  $async[$!interactionDelete]
  ]
  `
}