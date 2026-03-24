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
          { "name": "YouTube", "value": "youtube" },
          { "name": "YouTube Shorts", "value": "youtubeshorts" },
          { "name": "YouTube Music", "value": "youtubemusic" },
          { "name": "Soundcloud", "value": "soundcloud" },
          { "name": "Spotify", "value": "spotify" },
          { "name": "Apple Music", "value": "applemusic" },
          { "name": "Shazam", "value": "shazam" },
          { "name": "ITunes", "value": "itunes" },
          { "name": "Amazon Music", "value": "amazonmusic" },
          { "name": "Bandcamp", "value": "bandcamp" },
          { "name": "Deezer", "value": "deezer" },
          { "name": "Tidal", "value": "tidal" },
          { "name": "Qobuz", "value": "qobuz" },
          { "name": "JioSaavn", "value": "jiosaavn" },
          { "name": "BiliBili.tv", "value": "bilibili" },
          { "name": "Twitch", "value": "twitch" },
          { "name": "Facebook Reels", "value": "facebookreels" },
          { "name": "Tiktok", "value": "tiktok" },
          { "name": "Tiktok Music", "value": "tiktokmusic" },
          { "name": "Tiktok Sound", "value": "tiktoksound" },
          { "name": "NCS", "value": "ncs" },
          { "name": "Capcut - Templates", "value": "capcut" },
          { "name": "Roblox Music", "value": "robloxmusic" }
        ]
      },
      {
        "type": 3,
        "name": "query",
        "description": "Search a media",
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
  $if[$or[$option[ephemeral]==;$option[ephemeral]==true;$option[provider]==bilibili];$ephemeral]
  $let[colors;aa$randomBytes[2]]
  $let[check;$getRecord[global;;cachesearch_global-query_$deflate[$option[provider]$toLowercase[$option[query]];hex]]]
  $localFunction[loadinteraction;
  $if[$env[typela]==1;
  $defer
  ]
  $if[$env[typela]==2;
  $interactionReply[
  $addContainer[$addTextDisplay[-# Provider:\n\`$option[provider]\`\n-# Ping:\n\`$get[currentping]ms$if[$get[check]!={}; - Cached]\`]
  $addSeparator[Large;true]
  $arrayForEach[loadser;result;
  $addSection[
  $addTextDisplay[
  > ### $cropText[$replace[$env[result;title];#;\\\\#];0;197;...]
  > $env[result;url]
  > -# $if[$and[$advancedTextSplit[$env[result;duration];:;1]==;$advancedTextSplit[$env[result;duration];:;2]==];$advancedTextSplit[$env[result;duration];:;0];$if[$advancedTextSplit[$env[result;duration];:;0]==00;$advancedTextSplit[$env[result;duration];:;1]:$advancedTextSplit[$env[result;duration];:;2];$env[result;duration]]]
  ]
  $addThumbnail[$if[$isValidLink[$env[result;thumbnail]]==false;$userDefaultAvatar[$authorID];$env[result;thumbnail]]]
  ]
  ]
  $if[$get[check]!={};
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
  $onlyIf[$isValidLink[$option[query]]!=true;$callLocalFunction[loadinteraction;3]]
  $let[fsearch;false]
  $if[$get[check]=={};
  $async[
  $let[a;$callFunction[searchSomeTrack;$option[query];$option[provider]]]
  $let[currentping;$round[$executionTime;0]]
  $jsonLoad[loadser;$get[a]]
  $if[$env[loadser;0]==;$let[fsearch;null];$let[fsearch;true]]
  ]
  $callLocalFunction[loadinteraction;1]
  $loop[-1;
  $if[$get[fsearch]!=false;$break]
  $wait[5]
  ]
  $if[$get[fsearch]==null;
  $callLocalFunction[loadinteraction;3]
  $stop
  ]
  ;
  $let[currentping;$round[$executionTime;0]]
  $jsonLoad[loadser;$get[check]]
  $jsonLoad[loadser;$env[loadser;playlist]]
  ]
  $arraySlice[loadser;loadser;0;10]
  $arrayReverse[loadser;loadser]
  $callLocalFunction[loadinteraction;2]
  $if[$get[check]!={};
  $setCache[storecachesearchusersfetch-q_$djsEval[ctx.interaction.id];$option[query]]
  $setCache[storecachesearchusersfetch-p_$djsEval[ctx.interaction.id];$option[provider]]
  ]
  `
}