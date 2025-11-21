module.exports = {
  data: {
  "type": 1,
  "name": "queue",
  "description": "Show all tracks info",
  "integration_types": [
    0
  ],
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

  $onlyIf[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

  $let[nodes;$if[$hasMusicNode;$isPlaying;false]]
  $ephemeral
  $onlyIf[$get[nodes];$callFunction[useCustomMusicMessage;config_errorNoQueue]]

  $arrayload[rest;
;$queue[;16;{track.title} - <@{track.requestedBy.id}>;
]]
  $arrayMap[rest;rest2;$if[$env[rest2]!=;$return[$env[rest2]]];rest]
  $let[count;1]
  $let[countsec;1]
  $while[$get[count]<=15;
  $if[$env[rest;$sub[$get[count];1]]!=;
  $let[contains;$get[contains]$get[countsec]. $env[rest;$sub[$get[count];1]]\n]
  $letSum[countsec;1]
  ]
  $letSum[count;1]
  ]

  $jsonLoad[jsonmedia;$callFunction[filterMediaID;$trackInfo[url]]]
  $let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]

  $author[Currently Playing;$callFunction[useIcon;$env[jsonmedia;type]];;0]
  $title[$cropText[$trackInfo[title];0;253;...];$trackInfo[url];0]
  $addField[Owner;\`$trackInfo[author]\`;true;0]
  $addField[Duration;$if[$trackInfo[durationMS]==0;LIVE;$parseDigital[$trackInfo[durationMS]]];true;0]
  $thumbnail[$if[$isValidLink[$trackInfo[thumbnail]]==false;$userAvatar[$trackInfo[requestedBy;id];1024];$trackInfo[thumbnail]];0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$userDisplayName[$trackInfo[requestedBy;id]];$userAvatar[$trackInfo[requestedBy;id];1024];0]
  $author[Queue ($separateNumber[$queueLength;.]);;;1]
  $description[$if[$queueLength==0;$callFunction[useCustomMusicMessage;config_errorNoQueueList];$get[contains]];1]
  $color[$callFunction[useIcon;color_embed];1]
  $if[$queueLength!=0;$thumbnail[$if[$isValidLink[$queue[0;1;{track.thumbnail}]]==false;$userAvatar[$clientID;1024];$queue[0;1;{track.thumbnail}]];1]]
  $timestamp[;1]
  $if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
  $addActionRow
  $addButton[musicplayerhidequeue_$authorID_1;Back;Primary;;true]
  $addButton[musicplayerhidequeue_$authorID_disabled;Page 1 / $advancedTextSplit[$sum[$divide[$queueLength;15];1];.;0];Secondary;;true]
  $addButton[musicplayerhidequeue_$authorID_2;Next;Primary;;$checkCondition[$queueLength<=15]]
  ]
  `
}