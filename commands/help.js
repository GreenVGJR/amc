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
  
  $author[Help]
  $title[Available Commands]
  $addField[Music;\`/play /stop /seek /queue /skip /volume\`;false]
  $addField[Other;\`/bot-info /search /lyrics\`;false]
  $thumbnail[$userAvatar[$clientID;2048]]
  $color[$callFunction[useIcon;color_embed]]
  $timestamp
  `
}