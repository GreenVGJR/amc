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
  $defer
  
  $jsonLoad[test;$applicationCommands]
  $let[container;]
  $arrayForEach[test;tests;$if[$env[tests;name]!=help;$let[container;$get[container]</$env[tests;name]:$env[tests;id]> ]]]
  
  $author[Help]
  $addField[Available Commands;$get[container];false]
  $thumbnail[$userAvatar[$clientID;2048]]
  $color[$callFunction[useIcon;color_embed]]
  $timestamp
  `
}