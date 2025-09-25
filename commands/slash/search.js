module.exports = {
  data: {
  "name": "search",
  "description": "Search a media",
  "options": [
    {
      "name": "provider",
      "type": 3,
      "description": "Provider to use for search",
      "required": true,
      "choices": [
        {
          "name": "YouTube",
          "value": "youtube"
        },
        {
          "name": "YouTube Shorts",
          "value": "youtubeshorts"
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
        {
          "name": "Amazon Music",
          "value": "amazonmusic"
        },
        {
          "name": "ITunes",
          "value": "itunes"
        },
        {
          "name": "Deezer",
          "value": "deezer"
        },
        {
          "name": "Tidal",
          "value": "tidal"
        },
        {
          "name": "Qobuz",
          "value": "qobuz"
        },
        {
          "name": "Tiktok Video",
          "value": "tiktokvideo"
        },
        {
          "name": "Tiktok Music",
          "value": "tiktokmusic"
        },
        {
          "name": "NCS",
          "value": "ncs"
        }
      ]
    },
    {
      "type": 3,
      "name": "query",
      "description": "Search a media",
      "autocomplete": true,
      "required": true
    },
    {
      "type": 5,
      "name": "ephemeral",
      "description": "Respond on ephemeral?",
      "required": false
    }
  ],
  "integration_types": [
    0,
    1
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Cari media"
  }
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]
  $if[$or[$option[ephemeral]==;$option[ephemeral]==true];$ephemeral]
  $let[colors;aa$randomBytes[2]]
  $let[check;$getVar[cachesearch_global-query;$deflate[$option[provider]$toLowercase[$option[query]];hex];null]]
  $localFunction[loadinteraction;
  $if[$env[typela]==1;
  $interactionReply[$addContainer[
    $addTextDisplay[-# Query:\n\`$option[query]\`\n-# Provider:\n\`$option[provider]\`\n-# Ping:\n\`Loading\`]
    $addSeparator[Large;true]
    ;$get[colors]]
  ]
  ]
  $if[$env[typela]==2;
  $interactionReply[
  $addContainer[$addTextDisplay[-# Query:\n\`$option[query]\`\n-# Provider:\n\`$option[provider]\`\n-# Ping:\n\`$get[currentping]ms$if[$get[check]!=null; - Cached]\`]
  $addSeparator[Large;true]
  $arrayForEach[loadser;result;
  $addSection[
  $addTextDisplay[
  > ### $cropText[$replace[$env[result;title];#;\\\\#];0;197;...]
  > $env[result;url]
  > -# $if[$and[$advancedTextSplit[$env[result;duration];:;1]==;$advancedTextSplit[$env[result;duration];:;2]==];$advancedTextSplit[$env[result;duration];:;0];$if[$advancedTextSplit[$env[result;duration];:;0]==00;$advancedTextSplit[$env[result;duration];:;1]:$advancedTextSplit[$env[result;duration];:;2];$env[result;duration]]]
  ]
  $addThumbnail[$if[$or[$env[result;thumbnail]==null;$env[result;thumbnail]==];$userDefaultAvatar[$authorID];$env[result;thumbnail]]]
  ]
  ]
  $if[$get[check]!=null;
  $addSeparator[Large;true]
  $addActionRow
  $addButton[refreshsearchnoca_$authorID;Force Refresh;Secondary;🔄]
  ];$get[colors]]]
  ]
  $if[$env[typela]==3;
  $interactionReply[$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoResultSearch]]]
  ]
  $return
  ;typela]
  $if[$get[check]==null;
  $callLocalFunction[loadinteraction;1]
  $let[a;$callFunction[searchSomeTrack;$option[query];$option[provider]]]
  $let[currentping;$round[$executionTime;0]]
  $jsonLoad[loadser;$get[a]]
  $if[$env[loadser;0]==;
  $callLocalFunction[loadinteraction;3]
  $stop
  ]
  ;
  $jsonLoad[loadser;$inflate[$get[check];base64]]
  $let[currentping;$round[$executionTime;0]]
  ]
  $arraySlice[loadser;loadser;0;10]
  $arrayReverse[loadser;loadser]
  $callLocalFunction[loadinteraction;2]
  $if[$get[check]!=null;
  $setVar[storecachesearchusersfetch-q;$djsEval[ctx.interaction.id];$option[query]]
  $setVar[storecachesearchusersfetch-p;$djsEval[ctx.interaction.id];$option[provider]]
  ]
  `
}