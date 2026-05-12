module.exports = {
name: "loadPlaylistUser",
params: [{
    name: "page",
    description: "Page for idk",
    type: "number",
    required: true
},
{
    name: "filter",
    description: "Filter to show playlist",
    type: "string",
    required: false
},
{
    name: "useToggle",
    description: "Use config playlist version",
    required: false
}],
code: `
$if[$env[useToggle]==true;
$jsonLoad[confplaylistdb;$getRecord[user;;configplaylistuser_vgjra9f_$authorID]]
$let[0;$default[$env[confplaylistdb;title];false]]
$let[1;$default[$env[confplaylistdb;slice];false]]
$let[2;$default[$env[confplaylistdb;confirm];true]]
$author[Config Playlist;$userAvatar[$authorID;1024]]
$addField[\`$if[$get[0];✅;❌]\` | Fetch Music;-# Retrieve title or url music;true]
$addField[\`$if[$get[1];✅;❌]\` | Slice Playlist;-# **(Youtube only)**\n-# Fetch playlist and put one by one;true]
$addField[\`$if[$get[2];✅;❌]\` | Show Confirm;-# Show any confirmation before do action;true]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[listplaylistuserall;Back;Secondary;↩️]
$addButton[toggleplaylistuser_fm;Fetch Music;$if[$get[0];Success;Secondary]]
$addButton[toggleplaylistuser_fp;Slice Playlist;$if[$get[1];Success;Secondary]]
$addButton[toggleplaylistuser_sc;Show Confirm;$if[$get[2];Success;Secondary]]
$return
]
$jsonLoad[a;$searchDB[user]]
$arrayMap[a;ah;$if[$and[$endsWith[$env[ah;key];$authorID];$startsWith[$env[ah;key];storeplaylist_user-]];$return[$env[ah]]];a]
$arrayMap[a;b;$if[$isJSON[$env[b;value]];$return[$env[b;value]]];b]
$let[lastvar;$arrayLength[b]]
$let[curpage;$advancedTextSplit[$divide[$arrayLength[b];25];.;0]]
$if[$or[$env[filter]==null;$env[filter]==]==false;
$arrayMap[b;c;$if[$checkContains[$toLowercase[$env[c]];$toLowercase[$env[filter]]];$return[$env[c]]];b]
]
$arraySlice[b;b;$multi[25;$env[page]];$multi[25;$sum[$env[page];1]]]
$let[storetext;]
$let[counter;$sum[1;$multi[25;$env[page]]]]
$let[perpage;$env[page]]
$arrayForEach[b;l;
$let[storetext;$get[storetext]$get[counter]. $env[l;title]\n]
$letSum[counter;1]
]
$author[List Playlist;$userAvatar[$authorID;1024]]
$description[$if[$arrayLength[b]==0;You don't have playlist. When create?;$get[storetext]]]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addStringSelectMenu[listplaylistuser;Select Playlist | $arrayLength[b] Results ($sum[$get[perpage];1] / $sum[$get[curpage];1]);$checkCondition[$arrayLength[b]==0];1;1]
$if[$arrayLength[b]==0;
$addOption[null;;null]
;
$let[counter;$sum[1;$multi[25;$env[page]]]]
$arrayForEach[b;l;
$addOption[$get[counter]. $cropText[$env[l;title];0;80;...];$cropText[$env[l;description];0;80;...];$advancedTextSplit[$env[a;$sub[$get[counter];1];key];storeplaylist_user-;1;_;0]]
$letSum[counter;1]
]
]
$addActionRow
$addButton[pageplaylistusertell_$sub[$get[perpage];1];;Secondary;◀️;$checkCondition[$get[perpage]==0]]
$addButton[createplaylistuserbutton;Create;Secondary;📂]
$addButton[configplaylistuserbutton;Config;Secondary;🛠️]
$addButton[listplaylistuserall;Refresh;Secondary;🔄]
$addButton[pageplaylistusertell_$sum[$get[perpage];1];;Secondary;▶️;$if[$get[perpage]==0;true;$checkCondition[$multi[25;$get[perpage]]>$get[lastvar]]]]
`
}