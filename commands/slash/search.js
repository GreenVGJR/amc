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
          "name": "Deezer",
          "value": "deezer"
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
  $let[check;$getVar[cachesearch_global-query;$deflate[$option[provider]$toLowercase[$option[query]];hex];null]]
  $if[$get[check]==null;
  $async[$interactionReply[$addTextDisplay[Fetching.]]]
  $jsonLoad[loadser;$callFunction[searchSomeTrack;$option[query];$option[provider]]]
  $let[currentping;$round[$executionTime;0]]
  $if[$env[loadser;0]==;
  $setTimeout[$interactionReply[$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoResultSearch]]];$get[currentping]]
  $stop
  ]
  ;
  $jsonLoad[loadser;$inflate[$get[check];base64]]
  $let[currentping;$round[$executionTime;0]]
  $async[$setVar[storecachesearchusersfetch-q;$djsEval[ctx.interaction.id];$option[query]]
  $setVar[storecachesearchusersfetch-p;$djsEval[ctx.interaction.id];$option[provider]]]
  ]
  $arraySlice[loadser;loadser;0;10]
  $arrayReverse[loadser;loadser]
  $setTimeout[$interactionReply[
  $addContainer[$addTextDisplay[-# Query:\n\`$option[query]\`\n-# Provider:\n\`$option[provider]\`\n-# Ping:\n\`$get[currentping]ms$if[$get[check]!=null; - Cached]\`]
  $addSeparator[Large;true]
  $arrayForEach[loadser;result;
  $addSection[
  $addTextDisplay[
  > ### $replace[$env[result;title];#;\\\\#]
  > -# ### $env[result;url]
  > -# $if[$and[$advancedTextSplit[$env[result;duration];:;1]==;$advancedTextSplit[$env[result;duration];:;2]==];$advancedTextSplit[$env[result;duration];:;0];$if[$advancedTextSplit[$env[result;duration];:;0]==00;$advancedTextSplit[$env[result;duration];:;1]:$advancedTextSplit[$env[result;duration];:;2];$env[result;duration]]]
  ]
  $addThumbnail[$if[$or[$env[result;thumbnail]==null;$env[result;thumbnail]==];$userDefaultAvatar[$authorID];$env[result;thumbnail]]]
  ]
  ]
  $if[$get[check]!=null;
  $addSeparator[Large;true]
  $addActionRow
  $addButton[refreshsearchnoca_$authorID;Force Refresh;Secondary;🔄]
  ]
  ;aa$randomBytes[2]]];$get[currentping]]
  `
}