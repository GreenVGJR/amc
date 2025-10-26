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
  
  $let[a;$getCache[listcommands-help]]
  $ephemeral
  $if[$get[a]==;
  $defer
  $updateApplicationCommands
  $setCache[listcommands-help;$applicationCommands]
  ]
  
  $jsonLoad[test;$get[a]]
  $arrayMap[test;t1;$if[$env[t1;integrationTypes;1]==1;$return[</$env[t1;name]:$env[t1;id]>]];testuser]
  $arrayMap[test;t1;$return[</$env[t1;name]:$env[t1;id]>];testguild]
  
  $author[Hello, $username[$authorID];$userAvatar[$authorID;512];;0]
  $footer[Apps - Available Commands;;0]
  $description[$arrayJoin[testuser;, ];0]
  $footer[Guild - Available Commands;;1]
  $description[$arrayJoin[testguild;, ];1]
  $color[$callFunction[useIcon;color_embed];0]
  $color[$callFunction[useIcon;color_embed];1]
  `
}