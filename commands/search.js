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
    }
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

  $ephemeral
  $defer

  $jsonLoad[loadser;$callFunction[searchSomeTrack;$option[query];$option[provider]]]
  $onlyIf[$env[loadser;0]!=;No result.]
  $arrayLoad[results]
  $arraySlice[loadser;loadser;0;9]
  $arrayReverse[loadser;loadser]
  $let[count;0]
  $!interactionFollowUp[
  $arrayForEach[loadser;result;
  $author[$env[result;title];;;$get[count]]
  $addField[URL;$env[result;url];true;$get[count]]
  $addField[Duration;$env[result;duration];true;$get[count]]
  $thumbnail[$if[$or[$env[result;thumbnail]==null;$env[result;thumbnail]==];$userDefaultAvatar[$authorID];$env[result;thumbnail]];$get[count]]
  $color[aa$randomBytes[2];$get[count]]
  $letSum[count;1]
  ]
  ]
  `
}