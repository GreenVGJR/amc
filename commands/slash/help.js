module.exports = {
  data: {
  "type": 1,
  "name": "help",
  "description": "List all commands",
  "integration_types": [
    0
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "List semua commands"
  }
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]
  
  $let[a;$getCache[initclientmusic;listcommands-help]]
  $ephemeral
  $if[$get[a]==;
  $defer
  $updateApplicationCommands
  $setCache[initclientmusic;listcommands-help;$applicationCommands]
  ]
  
  $jsonLoad[test;$get[a]]
  $arrayMap[test;t1;$if[$env[t1;integrationTypes;1]==1;$return[</$env[t1;name]:$env[t1;id]>]];testuser]
  $arrayMap[test;t1;$return[</$env[t1;name]:$env[t1;id]>];testguild]
  
  $author[List Commands;$userAvatar[$clientID;1024];;0]
  $addField[Apps;-# $arrayJoin[testuser;, ];false;0]
  $addField[Guild;-# $arrayJoin[testguild;, ];false;0]
  $color[$callFunction[useIcon;color_embed];0]
  $footer[$userDisplayName[$authorID];$userAvatar[$authorID;1024];0]
  `
}