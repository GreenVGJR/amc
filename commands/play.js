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
  $onlyIf[$option[query]!=__infointer-$authorID__;$ephemeral $defer $!interactionDelete]
  $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
  $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
  $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
  $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
  $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]

  $onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

  $let[iscreatedfirst;$or[$hasMusicNode==false;$if[$hasMusicNode;$isPlaying;false]==false]]
  
  $defer
  $async[
  $let[mid;$djsEval[ctx.interaction.channel.messages.fetch({ limit: 5 }).then(a => a?.map(b => { if( b.interactionMetadata?.user.id == $authorID ) { return b.id }}).filter(Boolean)\\[0\\])]]
  $if[$or[$getVar[musicplayer_message;$guildID_channelid;null]==null;$voiceID[$guildID;$clientID]==];
  $setVar[musicplayer_message;$guildID_channelid;$channelID]
  $setVar[musicplayer_message;$guildID_messageid;$get[mid]]
  ]]
  
  $let[default_provider;$callFunction[configMusic;default_provider]]
  $let[fallback_provider;$callFunction[configMusic;fallback_provider]]
  $if[$isValidLink[$option[query]]==false;
  $let[basic_type;true]
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$if[$option[provider]!=;$option[provider];$get[default_provider]];null]]
  $let[tempstoreurl;$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==youtube;https://youtube.com/watch?v=$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==soundcloud;https://soundcloud.com/$env[result;id];$if[$if[$option[provider]!=;$option[provider];$get[default_provider]]==spotify;https://open.spotify.com/track/$env[result;id]]]]]
  $let[use_provider;$if[$option[provider]!=;$option[provider];$get[default_provider]]]
  $let[cac1;$env[result;id]]
  $if[$get[cac1]==;
  $jsonLoad[result;$callFunction[fastMetadataTrack;$option[query];$get[fallback_provider];null]]
  $let[tempstoreurl;$if[$get[fallback_provider]==youtube;https://youtube.com/watch?v=$env[result;id];$if[$get[fallback_provider]==soundcloud;https://soundcloud.com/$env[result;id];$if[$get[fallback_provider]==spotify;https://open.spotify.com/track/$env[result;id]]]]]
  $let[use_provider;$get[fallback_provider]]
  $let[cac2;$env[result;id]]
  $if[$and[$get[cac1]==;$get[cac2]==];
  $interactionReply[
  $description[$callFunction[useCustomMusicMessage;config_errorNoResult]]
  $color[$callFunction[useIcon;error_color_embed]]
  $footer[slash]
  $timestamp
  ]
  $stop
  ]]
  $let[music_requestedBy;<@$authorID>]
  $let[music_title;$inflate[$env[result;title];base64]]
  $let[music_id;$env[result;id]]
  $let[music_duration;$multi[$env[result;duration];1000]]
  $let[music_thumbnail;$if[$env[result;dynamic_thumbnail]==;$env[result;thumbnail];$env[result;dynamic_thumbnail]]]
  $let[music_provider;$get[use_provider]]

  $let[isforcedirect;$option[direct_cdn]]

  $if[$get[isforcedirect]==true;
  $let[music_playurl;$trimLines[$callFunction[fallbackPlaybackTrack;$get[tempstoreurl];va]]]
  $if[$or[$get[music_playurl]==live;$get[music_playurl]==null;$advancedTextSplit[$get[music_playurl];|;0]==bot]==true;$let[music_playurl;$get[tempstoreurl]] $let[isforcedirect;false]]
  ;
  $let[music_playurl;$if[$or[$get[use_provider]==youtube;$get[use_provider]==soundcloud];$get[music_title];$get[tempstoreurl]]]
  ]

  $if[$get[iscreatedfirst];
    $async[
    $interactionReply[
        $addField[Requested By;$get[music_requestedBy];false]
        $addField[Title;$get[music_title];true]
        $addField[Duration;$if[$get[music_duration]==0;LIVE;$parseDigital[$get[music_duration]]];true]
        $thumbnail[$get[music_thumbnail]]
        $author[Fetching;$callFunction[useIcon;loading]]
        $timestamp
        $color[$callFunction[useIcon;color_embed]]
        $footer[$if[$get[isforcedirect]==true;DIRECT CDN - ]$toTitleCase[$get[music_provider]];$callFunction[useIcon;$get[music_provider]]]
    ]]
  ]
  ;
  $if[$get[iscreatedfirst];
    $async[
      $interactionReply[
      $addField[Query;$codeBlock[$cropText[$option[query];0;1000]]]
      $author[Fetching;$callFunction[useIcon;loading]]
      $color[$callFunction[useIcon;color_embed]]
      $timestamp
    ]]
  ]
  $let[basic_type;false]
  
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$option[query]]]
  $let[music_playurl;$if[$env[whatmusictype;type]==youtubeplaylist;https://youtube.com/playlist?list=$env[whatmusictype;id];$if[$env[whatmusictype;type]==youtube;https://youtube.com/watch?v=$env[whatmusictype;id];$if[$env[whatmusictype;type]==soundcloud;https://soundcloud.com/$env[whatmusictype;id];$if[$env[whatmusictype;type]==spotify;https://open.spotify.com/$env[whatmusictype;id];$option[query]]]]]]
  ]

  $let[queue_lengthtemp;$if[$hasMusicNode;$queueLength;0]]

  $if[$get[basic_type];
  $if[$get[isforcedirect]!=true;
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[tempstoreurl]]]
  ;
  $jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[music_playurl]]]
  ]]

  $let[attemptry;0]
  $let[donetry;5]
  $let[found;false]
  $try[
  $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==youtubeplaylist]!=true;
  $playTrack[$voiceID;$get[music_playurl];$env[whatmusictype;type]]
  ;
  $playTrack[$voiceID;$get[music_playurl];auto]
  ]
  ;
  $letSum[attemptry;1]
  ]

  $while[$and[$get[attemptry]!=0;$get[attemptry]<=$get[donetry];$get[found]==false];
    $try[
    $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==soundcloud;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==youtubeplaylist]!=true;
    $playTrack[$voiceID;$get[music_playurl];$env[whatmusictype;type]]
    ;
    $playTrack[$voiceID;$get[music_playurl];auto]
    ]
    $let[found;true]
    ;
    $letSum[attemptry;1]
    ;causeplayerror]
  ]

  $let[currentqueuern;$if[$hasMusicNode;$queueLength;0]]

  $if[$get[attemptry]>=$get[donetry];
  $if[$get[iscreatedfirst];
  $!deleteVar[musicplayer_message;$guildID_messageid]
  $!deleteVar[musicplayer_message;$guildID_channelid]
  ]
  $async[
  $interactionUpdate[
  $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack] $codeBlock[$env[causeplayerror]]]
  $color[$callFunction[useIcon;error_color_embed]]
  $timestamp
  $footer[slash]
  ]]
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
  $!interactionUpdate[
  $if[$get[basic_type];
  $author[Add to Track;;;0]
  $addField[Requested By;$get[music_requestedBy];false;0]
  $addField[Title;$get[music_title];true;0]
  $addField[Duration;$if[$get[music_duration]==0;LIVE;$parseDigital[$get[music_duration]]];true;0]
  $thumbnail[$get[music_thumbnail];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$if[$get[isforcedirect]==true;DIRECT CDN - ]$toTitleCase[$get[music_provider]];$callFunction[useIcon;$get[music_provider];0]]
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
  $setTimeout[$!interactionDelete;2s]
  ]`
}