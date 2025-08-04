module.exports = {
  data: {
  "type": 1,
  "name": "queue",
  "description": "Show all tracks info",
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "List musik dalam antrian"
  }
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]

  $let[nodes;$hasPlayer[$guildID]]
  $ephemeral
  $onlyIf[$get[nodes];$callFunction[useCustomMusicMessage;config_errorNoQueue]]
  $defer

  $jsonLoad[rest;$queue[$guildID]]
  $jsonLoad[rest;$env[rest;tracks]]
  $arraySlice[rest;rest;0;15]
  $arrayMap[rest;rest2;$if[$env[rest2;trackTitle]!=;$return[$env[rest2;trackTitle]]];rest]

  $let[count;1]
  $let[countsec;1]
  $while[$get[count]<=15;
  $if[$env[rest;$sub[$get[count];1]]!=;
  $let[contains;$get[contains]$get[countsec]. $env[rest;$sub[$get[count];1]]\n]
  $letSum[countsec;1]
  ]
  $letSum[count;1]
  ]

  $jsonLoad[currenttrackinfo;$currentTrackInfo[$guildID]]

  $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[currenttrackinfo;info;uri]]]
  $let[provider;$env[jsonmedia;type]]

  $author[Currently Playing;;;0]
  $title[$cropText[$env[currenttrackinfo;info;title];0;253;...];$env[currenttrackinfo;info;uri];0]
  $addField[Owner;\`$env[currenttrackinfo;info;author]\`;true;0]
  $addField[Duration;$if[$env[currenttrackinfo;info;length]==0;LIVE;$parseDigital[$env[currenttrackinfo;info;length]]];true;0]
  $thumbnail[$if[$or[$env[currenttrackinfo;info;artworkUrl]==null;$env[currenttrackinfo;info;artworkUrl]==];$userDefaultAvatar[$authorID];$env[currenttrackinfo;info;artworkUrl]];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$toTitleCase[$if[$get[provider]==null;File;$get[provider]]];$callFunction[useIcon;$get[provider]];0]
  $author[Queue;;;1]
  $description[$if[$queueLength[$guildID]<=1;There's no track on this queue;$get[contains]];1]
  $color[$callFunction[useIcon;color_embed];1]
  $timestamp[;1]
  `
}