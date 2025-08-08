module.exports = {
  data: {
  "type": 1,
  "name": "help",
  "description": "List all commands",
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
  
  $ephemeral
  
  $jsonLoad[test;$applicationCommands]
  
  $author[Hello, $username[$authorID];$userAvatar[$authorID;512];;0]
  $title[Apps - Available Commands;;0]
  $arrayForEach[test;tests;
  $if[$env[tests;integrationTypes;1]==1;$addField[</$env[tests;name]:$env[tests;id]>;$advancedTextSplit[$env[tests;description];|;0];true;0]
  ]]
  $title[Guild - Available Commands;;1]
  $arrayForEach[test;tests;
  $if[$env[tests;name]!=help;$addField[</$env[tests;name]:$env[tests;id]>;$advancedTextSplit[$env[tests;description];|;0];true;1]
  ]]
  $color[$callFunction[useIcon;color_embed];0]
  $color[$callFunction[useIcon;color_embed];1]
  $timestamp[;1]
  `
}