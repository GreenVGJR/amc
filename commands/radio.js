module.exports = {
  data: {
  "name": "radio",
  "description": "Show list of digital radio before playing",
  "options": [
    {
      "type": 3,
      "name": "query",
      "description": "Search a station",
      "required": false
    },
    {
      "type": 3,
      "name": "country",
      "description": "Filter to specific country",
      "required": false,
      "autocomplete": true
    },
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Putar radio digital"
  },
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
    $onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
    $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]

    $let[country;$if[$option[country]==;Global;$option[country]]]

    $interactionReply[
    $if[$or[$option[country]!=;$option[query]!=];
    $addField[Country;$get[country]$if[$option[country]==;\n-# DEFAULT];true]
    $thumbnail[$userAvatar[$clientID;1024]]
    ]
    $if[$option[query]!=;
    $addField[Query;$codeBlock[$option[query]];false]
    ]
    $footer[Fetching;$callFunction[useIcon;loading]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    ]

    $if[$option[country]!=;
    $jsonLoad[result;$readFile[./back/listRadioCountry.json]]
    $arrayMap[result;rest;$if[$checkContains[$toLowercase[$env[rest]];$toLowercase[$option[country]]];$return[$env[rest]]];result2]
    ]

    $jsonLoad[loadstate;$callFunction[scrapeOnlineRadio;$option[query];$if[$option[country]!=;$advancedTextSplit[$env[result2;0;1];/;1]];0;$guildID]]
    $onlyIf[$env[loadstate;0]!=;$!interactionUpdate[No results.]]
    $let[store;]
    $let[count;1]
    $arrayForEach[loadstate;res;
    $let[store;$get[store]$get[count]. $hyperlink[$env[res;radioName];$env[res;url]]\n]
    $letSum[count;1]
    ]
    $!interactionUpdate[
    
    $author[Showing $arrayLength[loadstate] results]
    $title[List Stations]
    $thumbnail[$env[loadstate;0;thumbnail]?c=$advancedTextSplit[$env[result2;0;1];/;1]&query=$if[$option[query]!=;$deflate[$option[query];base64]]]
    $description[$get[store]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    $addActionRow
    $addStringSelectMenu[radioplayertoplay_$authorID;List Stations;false;1;1]
    $arrayForEach[loadstate;res;
    $addOption[$env[res;radioName];$env[res;radioName] - $env[res;radioId];$env[res;radioId]]
    ]
    $addActionRow
    $addButton[radioplayerpage_1_$authorID;Back;Secondary;;true]
    $addButton[radioplayerpage_null;Page 1;Secondary;;true]
    $addButton[radioplayerpage_2_$authorID;Next;$if[$arrayLength[loadstate]==20;Primary;Secondary];;$if[$arrayLength[loadstate]==20;false;true]]
    ]
  `
}