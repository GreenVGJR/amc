module.exports = {
  data: {
  "name": "search",
  "description": "Search a song",
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
        }
      ]
    },
    {
      "type": 3,
      "name": "query",
      "description": "Search a song",
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
    "id": "Cari lagu"
  }
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]
  $if[$option[ephemeral]==true;$ephemeral]

  $let[check;$getVar[cachesearch_global;$md5[$option[query]$option[provider]];null]]
  $if[$get[check]==null;
  $defer
  $jsonLoad[loadser;$callFunction[searchSomeTrack;$option[query];$option[provider]]]
  $onlyIf[$env[loadser;0]!=;$callFunction[useCustomMusicMessage;config_errorNoResultSearch]]
  ;
  $jsonLoad[loadser;$inflate[$get[check];base64]]
  ]
  $let[currentping;$round[$executionTime;0]]
  $interactionReply[
  $arraySlice[loadser;loadser;0;10]
  $arrayReverse[loadser;loadser]
  $addContainer[
  $addTextDisplay[-# Query:\n\`$option[query]\`\n-# Provider:\n\`$option[provider]\`\n-# Ping:\n\`$get[currentping]ms\`]
  $addSeparator[Large;true]
  $arrayForEach[loadser;result;
  $addSection[
  $addTextDisplay[
  > ### $replace[$env[result;title];#;\\\\#]
  > $env[result;url]

  Duration: \`$if[$and[$advancedTextSplit[$env[result;duration];:;1]==;$advancedTextSplit[$env[result;duration];:;2]==];$advancedTextSplit[$env[result;duration];:;0];$if[$advancedTextSplit[$env[result;duration];:;0]==00;$advancedTextSplit[$env[result;duration];:;1]:$advancedTextSplit[$env[result;duration];:;2];$env[result;duration]]]\`
  ]
  $addThumbnail[$if[$or[$env[result;thumbnail]==null;$env[result;thumbnail]==];$userDefaultAvatar[$authorID];$env[result;thumbnail]]]
  ]
  ]
  ;aa$randomBytes[2]]
  ]
  `
}