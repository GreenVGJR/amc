module.exports = {
  data: {
  "name": "radio",
  "description": "Show list of station digital radio",
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
  "integration_types": [
    0
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
    $let[country;$if[$option[country]==;Global;$option[country]]]
    $localFunction[loadinteraction;
    $if[$env[typela]==1;
    $interactionReply[
    $if[$or[$option[country]!=;$option[query]!=];
    $addField[Country;$get[country]$if[$option[country]==;\n-# DEFAULT];true]
    ]
    $if[$option[query]!=;
    $addField[Query;$codeBlock[$toLowercase[$option[query]]];true]
    ]
    $footer[Fetching;$callFunction[useIcon;loading]]
    $color[$callFunction[useIcon;color_embed]]
    ]
    ]
    $if[$env[typela]==2;
    $interactionReply[$callFunction[useCustomMusicMessage;config_errorNoResult]]
    $setTimeout[$async[$!interactionDelete];3s]
    ]
    $if[$env[typela]==3;
    $interactionReply[
    $author[List Stations;https://cdn.onlineradiobox.com/img/android-chrome-192x192.png]
    $thumbnail[$if[$env[loadstate;0;thumbnail]!=;$env[loadstate;0;thumbnail];$userDefaultAvatar[$clientID]]?c=$advancedTextSplit[$env[result2;0;1];/;1]&query=$if[$option[query]!=;$deflate[$option[query];base64]]]
    $if[$get[store2]==;
    $description[$get[store]]
    ;
    $addField[> \`Page 1\`;$get[store];true]
    $addField[> \`Page 2\`;$get[store2];true]
    ]
    $color[$callFunction[useIcon;color_embed]]
    $if[$env[passthr];$footer[Still Fetching;$callFunction[useIcon;loading]]]
    $addActionRow
    $addStringSelectMenu[radioplayertoplay_$authorID;List Stations;$or[$arrayLength[loadstate]==0;$env[passthr]];1;1]
    $if[$arrayLength[loadstate]==0;
    $addOption[null;;null]
    ;
    $arrayForEach[loadstate;res;
    $addOption[$env[res;radioName];$env[res;radioName] - $env[res;radioId];1|1|$env[res;radioId]]
    ]]
    $addActionRow
    $addButton[radioplayerpage_1_$authorID_1;Back;Secondary;◀️;true]
    $addButton[radioplayerpage_null;Page $if[$get[store2]==;1;1-2];Secondary;;true]
    $addButton[radioplayerpage_2_$authorID_3;Next;Secondary;▶️;$or[$arrayLength[loadstate]!=20;$env[passthr]]]
    ]
    ]
    ;typela;passthr]
    $if[$option[country]!=;
    $jsonLoad[result;$getCache[initclientmusic;system_file-listRadio]]
    $arrayMap[result;rest;$if[$checkContains[$toLowercase[$env[rest]];$toLowercase[$option[country]]];$return[$env[rest]]];result2]
    ]
    $let[checkfirstdb;$getRecord[global;;cachesearch_global-radio_$md5[$toLowercase[$option[query]]$advancedTextSplit[$env[result2;0;1];/;1]0]]]
    $if[$get[checkfirstdb]=={};
    $callLocalFunction[loadinteraction;1;false]
    $jsonLoad[loadstate;$callFunction[scrapeOnlineRadio;$toLowercase[$option[query]];$if[$option[country]!=;$advancedTextSplit[$env[result2;0;1];/;1]];0;$guildID;false;false]]
    $onlyIf[$env[loadstate;0]!=;$callLocalFunction[loadinteraction;2;false]]
    ;
    $jsonLoad[loadstate;$getRecord[global;;cachesearch_global-radio_$md5[$toLowercase[$option[query]]$advancedTextSplit[$env[result2;0;1];/;1]0]]]
    $jsonLoad[loadstate;$env[loadstate;list_radio]]
    ]
    $let[store;]
    $let[store2;]
    $let[count;1]
    $arrayForEach[loadstate;res;
    $if[$get[count]>10;
    $let[store2;$get[store2]-# $get[count]. $hyperlink[$bold[$env[res;radioName]];$env[res;url]]\n]
    ;
    $let[store;$get[store]-# $get[count]. $hyperlink[$bold[$env[res;radioName]];$env[res;url]]\n]
    ]
    $letSum[count;1]
    ]
    $let[checkdb;$callFunction[scrapeOnlineRadio;$toLowercase[$option[query]];$if[$option[country]!=;$advancedTextSplit[$env[result2;0;1];/;1]];1;$guildID;true;false]]

    $callLocalFunction[loadinteraction;3;$and[$arrayLength[loadstate]==20;$get[checkdb]==]]
    $if[$and[$arrayLength[loadstate]==20;$get[checkdb]==];
    $let[passtr;false]
    $loop[10;
    $let[chtoa;$callFunction[scrapeOnlineRadio;$toLowercase[$option[query]];$if[$option[country]!=;$advancedTextSplit[$env[result2;0;1];/;1]];$env[loopcountertest];$guildID;false;false]]
    $if[$and[$get[passtr]==false;$env[loopcountertest]>5];$let[passtr;true] $callLocalFunction[loadinteraction;3;false]]
    $if[$charCount[$get[chtoa]]==2;$break]
    ;loopcountertest;true]
    $if[$get[passtr]==false;$callLocalFunction[loadinteraction;3;false]]
    ]
  `
}