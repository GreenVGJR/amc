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
    },
    {
      "type": 5,
      "name": "direct_cdn",
      "description": "Use Direct CDN after search track to play",
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

  $localFunction[loadinteraction;
  $if[$env[typesload]==1-1;
  $let[mid;$interactionReply[
  $author[$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $footer[Searching;$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  ;$get[iscreatedfirst]]]
  $if[$or[$getCache[musicplayer_message_$guildID_channelid]==;$voiceID[$guildID;$clientID]==];
  $setCache[musicplayer_message_$guildID_channelid;$channelID]
  $setCache[musicplayer_message_$guildID_messageid;$get[mid]]
  ]
  ]
  $if[$env[typesload]==1-2;
  $let[mid;$interactionReply[
  $author[$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[Query;$codeBlock[$cropText[$option[query];0;1000]]]
  $footer[Fetching;$callFunction[useIcon;loading]]
  $color[$callFunction[useIcon;color_embed]]
  ;$get[iscreatedfirst]]]
  $if[$or[$getCache[musicplayer_message_$guildID_channelid]==;$voiceID[$guildID;$clientID]==];
  $setCache[musicplayer_message_$guildID_channelid;$channelID]
  $setCache[musicplayer_message_$guildID_messageid;$get[mid]]
  ]
  ]
  $if[$env[typesload]==2;
  $interactionReply[
  $author[$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[$get[music_title];-# $if[$get[music_duration]==0;LIVE;$if[$advancedTextSplit[$parseDigital[$get[music_duration]];:;0]==00;$cropText[$parseDigital[$get[music_duration]];3;];$parseDigital[$get[music_duration]]]];true]
  $thumbnail[$get[music_thumbnail]]
  $color[$callFunction[useIcon;color_embed]]
  $footer[Fetching | $if[$get[isforcedirect]==true;DIRECT CDN - ]$toTitleCase[$advancedReplace[$get[use_provider];youtubemusic;youtube music;applemusic;apple music]];$callFunction[useIcon;loading]]
  ]
  ]
  $if[$env[typesload]==3;
  $interactionReply[
  $if[$get[basic_type];
  $author[$userDisplayName[$authorID];$userAvatar[$authorID;1024];;0]
  $addField[$get[music_title];-# $if[$get[music_duration]==0;LIVE;$if[$advancedTextSplit[$parseDigital[$get[music_duration]];:;0]==00;$cropText[$parseDigital[$get[music_duration]];3;];$parseDigital[$get[music_duration]]]];true]
  $thumbnail[$if[$isValidLink[$get[music_thumbnail]];$get[music_thumbnail];$userAvatar[$authorID;1024]];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$if[$get[isforcedirect]==true;DIRECT CDN - ]$toTitleCase[$advancedReplace[$get[use_provider];youtubemusic;youtube music;applemusic;apple music]];$callFunction[useIcon;$get[use_provider];0]]
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

  $if[$isValidLink[$option[query]];$callLocalFunction[loadinteraction;1-2]]
  
  $let[default_provider;$callFunction[configMusic;default_provider]]
  $let[fallback_provider;$callFunction[configMusic;fallback_provider]]
  $if[$isValidLink[$option[query]]==false;
  $let[basic_type;true]
  $let[fsearch;false]
  $async[
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$if[$option[provider]!=;$option[provider];$get[default_provider]];null]]
  $let[tempstoreurl;$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtube;https://youtube.com/watch?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtubemusic;https://youtube.com/watch?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==soundcloud;https://soundcloud.com/$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==spotify;https://open.spotify.com/track/$env[result;id];$env[result;id]]]]]]
  $let[use_provider;$if[$option[provider]!=;$option[provider];$get[default_provider]]]
  $let[cac1;$env[result;id]]
  $if[$get[cac1]!=;$let[fsearch;true]]
  $if[$get[cac1]==;
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$get[fallback_provider];null]]
  $let[tempstoreurl;$if[$or[$get[fallback_provider]==youtube;$get[fallback_provider]==youtubemusic];https://youtube.com/watch?v=$env[result;id];$if[$get[fallback_provider]==soundcloud;https://soundcloud.com/$env[result;id];$if[$get[fallback_provider]==spotify;https://open.spotify.com/track/$env[result;id];$env[result;id]]]]]
  $let[use_provider;$get[fallback_provider]]
  $let[cac2;$env[result;id]]
  $if[$get[cac2]!=;$let[fsearch;true]]
  $if[$and[$get[cac1]==;$get[cac2]==];
  $let[fsearch;null]
  ]
  ]
  ]
  $callLocalFunction[loadinteraction;1-1]
  $loop[-1;
  $if[$get[fsearch]!=false;$break]
  $wait[5]
  ]
  $if[$get[fsearch]==null;
  $callLocalFunction[loadinteraction;error-1]
  $stop
  ]
  $let[music_title;$inflate[$env[result;title];base64]]
  $let[music_id;$env[result;id]]
  $let[music_duration;$multi[$env[result;duration];1000]]
  $let[music_thumbnail;$if[$env[result;dynamic_thumbnail]==;$env[result;thumbnail];$env[result;dynamic_thumbnail]]]
  $let[music_thumbnail;$if[$isValidLink[$get[music_thumbnail]];$get[music_thumbnail];$userAvatar[$authorID;1024]]]
  $let[music_provider;$get[use_provider]]

  $let[isforcedirect;$option[direct_cdn]]
  $if[$get[iscreatedfirst];$callLocalFunction[loadinteraction;2]]

  $if[$get[isforcedirect]==true;
  $let[music_playurl;$callFunction[fallbackPlaybackTrack;$get[tempstoreurl];va]]
  $if[$or[$get[music_playurl]==live;$get[music_playurl]==null;$advancedTextSplit[$get[music_playurl];|;0]==bot]==true;$let[music_playurl;$get[tempstoreurl]] $let[isforcedirect;false]]
  ;
  $let[music_playurl;$get[tempstoreurl]]
  ]
  ;
  $let[basic_type;false]
  
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$option[query]]]
  $let[music_playurl;$if[$env[whatmusictype;type]==youtubeplaylist;https://youtube.com/playlist?list=$env[whatmusictype;id];$if[$env[whatmusictype;type]==youtube;https://youtube.com/watch?v=$env[whatmusictype;id];$if[$env[whatmusictype;type]==soundcloud;https://soundcloud.com/$env[whatmusictype;id];$if[$env[whatmusictype;type]==spotify;https://open.spotify.com/$env[whatmusictype;id];$option[query]]]]]]
  ]

  $let[queue_lengthtemp;$if[$hasMusicNode;$try[$queueLength;0];0]]

  $if[$get[basic_type];
  $if[$get[isforcedirect]!=true;
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[tempstoreurl]]]
  ;
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[music_playurl]]]
  ]]

  $let[attemptry;0]
  $let[donetry;5]
  $let[found;false]

  $while[$and[$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==applemusic;$env[whatmusictype;type]==soundcloud;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==youtubeplaylist]!=true;
    $playTrack[$voiceID;$trimLines[$get[music_playurl]];$env[whatmusictype;type]]
    ;
    $playTrack[$voiceID;$trimLines[$get[music_playurl]];auto]
    ]
    $let[found;true]
    ;
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $let[currentqueuern;$if[$hasMusicNode;$try[$queueLength;0];0]]

  $if[$get[attemptry]>=$get[donetry];
  $if[$get[iscreatedfirst];
  $!deleteCache[musicplayer_message_$guildID_messageid]
  $!deleteCache[musicplayer_message_$guildID_channelid]
  ]
  $callLocalFunction[loadinteraction;error-2]
  $setTimeout[
  $if[$get[iscreatedfirst]==false;$!interactionDelete]
  ;5s]
  $stop
  ]

  $if[$and[$get[currentqueuern]!=0;$get[iscreatedfirst]==false];
  $async[$if[$option[force_skip]==true;
  $let[statusloop;$getLoopMode]
  $if[$get[statusloop]==TRACK;$setLoopMode[OFF] $wait[1s]]
  $!skipTo[$sub[$get[currentqueuern];1]]
  $wait[1s]
  $if[$get[statusloop]==TRACK;$setLoopMode[TRACK]]
  ]]
  $callLocalFunction[loadinteraction;3]
  $setTimeout[$!interactionDelete;2s]
  $if[$option[force_skip]!=true;$callFunction[updateCurrentMusicPlayer]]
  ]`
}