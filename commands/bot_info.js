module.exports = {
  data: {
  "type": 1,
  "name": "bot-info",
  "description": "Show the bot info",
  "description_localizations": {
    "id": "Lihat informasi bot"
  },
  "contexts": [
    0
  ]
},
  type: 0,
  code: `
  $onlyIf[$guildID!=;]
  $ephemeral
  $defer

  $arrayLoad[guild;,;$guildIDs[,]]
  $let[countnode;0]
  $arrayForEach[guild;guilds;
  $try[
  $if[$hasPlayer[$env[guilds]];$letSum[countnode;1]]
  ]]

  $let[owner_banner;$userBanner[$botOwnerID;2048]]

  $author[$username[$authorID] / $botOwnerID;;;0]
  $title[Owner;;0]
  $thumbnail[$userAvatar[$botOwnerID];0]
  $color[$randomBytes[3];0]
  $addField[Created At;<t:$cropText[$userCreatedAt[$authorID];0;10]:F>;true;0]
  $if[$get[owner_banner]!=;$addField[Banner;\\[Image\\]($get[owner_banner]);true;0]]
  $author[$username[$clientID] / $clientID;;;1]
  $title[Client;;1]
  $color[$callFunction[useIcon;color_embed];1]
  $thumbnail[$userAvatar[$clientID];1]
  $addField[Created At;<t:$cropText[$userCreatedAt[$clientID];0;10]:F>;true;1]
  $addField[Joined At;<t:$cropText[$memberJoinedAt[$guildID;$clientID];0;10]:F>;true;1]
  $addField[Server Count;\`$guildCount\`;true;1]
  $addField[Uptime;<t:$sub[$cropText[$getTimestamp;0;10];$round[$divide[$uptime;1000]]]:F>\n-# $parseMS[$uptime];false;1]
  $addField[OS Uptime ($os);<t:$sub[$cropText[$getTimestamp;0;10];$round[$osUptime]]:F>\n-# $parseMS[$multi[$osUptime;1000]];false;1]
  $addField[Ping;\`$pingms / $round[$executionTime]ms\`;true;1]
  $addField[DB Ping;\`$round[$dbPing]ms\`;true;1]
  $addField[Total Connections;\`$get[countnode] / $guildCount\`;true;1]
  $addField[Player Type;\`Lavalink\`;true;1]
  $addField[Version;\`v$version\`, \`v$djsVersion\`, \`$nodeVersion\`;true;1]
  $footer[CPU: $round[$math[$cpu/($cpuCores*100)];2]% | RAM: $round[$ram;2]MB;;1]
  $timestamp[;1]
  `
}