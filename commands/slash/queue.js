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

  $onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

  $let[nodes;$try[$checkCondition[$playerQueueLength[$guildID]>=0];false]]
  $ephemeral
  $onlyIf[$get[nodes];$callFunction[useCustomMusicMessage;config_errorNoQueue]]

  $jsonLoad[rest;$playerQueue[$guildID]]
  $jsonLoad[currenttrack;$env[rest;current]]
  $jsonLoad[rest;$env[rest;tracks]]
  $arraySlice[rest;rest;0;15]
  $arrayMap[rest;rest2;$if[$env[rest2]!=;$return[$env[rest2]]];rest]
  $let[count;1]
  $let[countsec;1]
  $while[$get[count]<=15;
  $if[$env[rest;$sub[$get[count];1]]!=;
  $let[contains;$get[contains]$get[countsec]. $env[rest;$sub[$get[count];1];info;title]\n]
  $letSum[countsec;1]
  ]
  $letSum[count;1]
  ]

  $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[currenttrack;info;uri]]]
  $let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]

  $author[Currently Playing;$callFunction[useIcon;$env[jsonmedia;type]];;0]
  $title[$cropText[$env[currenttrack;info;title];0;253;...];$env[currenttrack;info;uri];0]
  $addField[Owner;\`$env[currenttrack;info;author]\`;true;0]
  $addField[Duration;$if[$env[currenttrack;info;isStream];LIVE;$parseDigital[$env[currenttrack;info;duration]]];true;0]
  $thumbnail[$if[$or[$env[currenttrack;info;artworkUrl]==null;$env[currenttrack;info;artworkUrl]==];$userDefaultAvatar[$authorID];$env[currenttrack;info;artworkUrl]];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$username[$env[currenttrack;userData;requester;userId]];$userAvatar[$env[currenttrack;userData;requester;userId];1024];0]
  $author[Queue ($separateNumber[$playerQueueLength[$guildID];.]);;;1]
  $description[$if[$playerQueueLength[$guildID]==0;$callFunction[useCustomMusicMessage;config_errorNoQueueList];$get[contains]];1]
  $color[$callFunction[useIcon;color_embed];1]
  $if[$playerQueueLength[$guildID]!=0;$thumbnail[$if[$or[$env[rest;0;info;artworkUrl]==null;$env[rest;0;info;artworkUrl]==];$userDefaultAvatar[$authorID];$env[rest;0;info;artworkUrl]];1]]
  $timestamp[;1]
  $if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
  $addActionRow
  $addButton[musicplayerhidequeue_$authorID_1;Back;Primary;;true]
  $addButton[musicplayerhidequeue_$authorID_disabled;Page 1 / $advancedTextSplit[$sum[$divide[$playerQueueLength[$guildID];15];1];.;0];Secondary;;true]
  $addButton[musicplayerhidequeue_$authorID_2;Next;Primary;;$checkCondition[$playerQueueLength[$guildID]<=15]]
  ]
  `
}