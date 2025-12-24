module.exports = {
  data: {
  "type": 1,
  "name": "bot-info",
  "description": "Show the bot info",
  "description_localizations": {
    "id": "Lihat informasi bot"
  },
  "integration_types": [
    0
  ],
  "contexts": [
    0
  ]
},
  type: 0,
  code: `
  $let[time;$getTimestamp]
  $let[currentping;$round[$sum[$divide[$advancedTextSplit[$interactionRawData;"id":;1;";1];4194304];1420070400000]]]
  $let[currentping;$sub[$get[time];$get[currentping]]]
  $onlyIf[$guildID!=;]
  $ephemeral
  $defer
  $localFunction[abcd;
  $interactionReply[
  $title[Owner;;0]
  $color[aa$randomBytes[2];0]
  $if[$env[connections]!=;
  $author[$username[$botOwnerID] / $botOwnerID;$get[av1];;0]
  $addField[Created At;<t:$cropText[$userCreatedAt[$authorID];0;10]:f>;true;0]
  $if[$get[owner_banner]!=;$addField[Banner;\\[Image\\]($get[owner_banner]);true;0]]
  ]
  $title[Client;;1]
  $if[$env[connections]!=;$author[$username[$clientID] / $clientID;$get[av2];;1]]
  $addField[Server Count;\`$guildCount\`;true;1]
  $addField[Auth Count;\`$botUserAuthorizationCount\`;true;1]
  $addField[Guild Auth Count;\`$botUserInstallCount\`;true;1]
  $addField[Created At;$if[$env[connections]==;\`Loading\`;<t:$cropText[$userCreatedAt[$clientID];0;10]:f>];true;1]
  $addField[Joined At;$if[$env[connections]==;\`Loading\`;<t:$cropText[$memberJoinedAt[$guildID;$clientID];0;10]:f>];true;1]
  $addField[Versions;- ForgeScript.js: \`v$version\`\n- Discord.js: \`v$djsVersion\`\n- Node.js: \`$nodeVersion\`;false;1]
  $addField[Uptime;<t:$sub[$cropText[$getTimestamp;0;10];$round[$divide[$uptime;1000]]]:F>\n-# $parseMS[$uptime;4;, ];false;1]
  $addField[OS Uptime ($os);<t:$sub[$cropText[$getTimestamp;0;10];$round[$osUptime]]:F>\n-# $parseMS[$multi[$osUptime;1000];4;, ];false;1]
  $addField[Ping;\`$pingms / $round[$get[currentping]]ms\`;true;1]
  $addField[DB Ping;\`$round[$pingDB[global]]ms\`;true;1]
  $addField[Player Ping;\`$round[$try[$djsEval[(0, require("discord-player").useQueue)(ctx.interaction.guild).ping];0]]ms\`;true;1]
  $addField[Total Connections;\`$if[$env[connections]==;Loading;$env[connections] / $guildCount]\`;true;1]
  $addField[Player Type;\`Local\`;true;1]
  $if[$get[client_banner]!=;$image[$get[client_banner];1]]
  $if[$env[connections]!=;
  $footer[CPU: $round[$divide[$cpu;$cpuCores];1]% :: RAM: $round[$ram;2]MB;;1]
  ;
  $footer[Loading;$callFunction[useIcon;loading];1]
  ]
  $color[$callFunction[useIcon;color_embed];1]
  $addActionRow
  $addButton[https://discord.com/api/oauth2/authorize?client_id=$clientID&scope=bot+applications.commands&permissions=3263488;Invite Bot;Link]
  $addButton[https://discord.com/oauth2/authorize?client_id=$clientID&integration_type=1&scope=applications.commands;Install Apps;Link]
  $if[$botOwnerID==$authorID;
  $addActionRow
  $addButton[nulloptdonot;-- Developer Options --;Success;;true]
  $addActionRow
  $addButton[botinfoclearcache;Clear /search Cache;Secondary;]
  $addButton[botinfoclearcacheradio;Clear /radio Cache;Secondary;]
  ]]
  ;connections]
  $let[owner_banner;$try[$userBanner[$botOwnerID;2048]]]
  $let[client_banner;$try[$userBanner[$clientID;2048]]]
  $let[av1;$userAvatar[$botOwnerID;2048]]
  $let[av2;$userAvatar[$clientID;2048]]
  $arrayLoad[guild;,;$guildIDs[,]]
  $let[countnode;0]
  $arrayForEach[guild;guilds;
  $try[
  $if[$djsEval[(0, require("discord-player").useMainPlayer)().nodes.has(ctx.client.guilds.cache.get("$env[guilds]"))];$letSum[countnode;1]]
  ]]
  $callLocalFunction[abcd;$get[countnode]]
  `
}