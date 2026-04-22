module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==musicplayerhidequeue]
$onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]

$let[nodes;$if[$hasMusicNode;$isPlaying;false]]
$onlyIf[$get[nodes];$!deferUpdate $!interactionDelete]

$if[$advancedTextSplit[$customID;_;2]>15;
$!deferUpdate
]

$jsonLoad[rest;$try[$djsEval[JSON.stringify(require("discord-player").useQueue(ctx.interaction.guild).tracks.data)];{}]]
$arrayMap[rest;rest2;$if[$env[rest2;id]!=;$return[$env[rest2]]];rest]
$let[countFinal;$multi[9;$sub[$advancedTextSplit[$customID;_;2];1]]]
$arraySlice[rest;rest;$get[countFinal];$sum[$get[countFinal];9]]

$jsonLoad[jsonmedia;$callFunction[filterMediaID;$trackInfo[url]]]
$let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]

$!interactionUpdate[
$addContainer[
$addSection[
$addTextDisplay[### » Currently Playing
$hyperlink[$trackInfo[title];$trackInfo[url]]
-# $bold[Requested by:] <@$trackInfo[requestedBy;id]>
]
$addThumbnail[$if[$isValidLink[$trackInfo[thumbnail]]==false;$userAvatar[$trackInfo[requestedBy;id];1024];$trackInfo[thumbnail]]]
]
$addTextDisplay[-# $bold[Duration:] $if[$trackInfo[durationMS]==0;LIVE;$parseDigital[$trackInfo[durationMS]]] | $bold[Source:] $toTitlecase[$get[provider]] | $bold[Songs:] $separateNumber[$sum[$queueLength;1];.]]
;$callFunction[useIcon;color_embed]]

$addContainer[
$if[$arrayLength[rest]!=0;
$arrayForEach[rest;lf;
$addSection[
$addTextDisplay[> ### $cropText[$env[lf;title];0;100;]
> -# $if[$env[lf;durationMS]==0;LIVE;$parseDigital[$env[lf;durationMS]]] - <@$env[lf;requestedBy]>
]
$addThumbnail[$if[$isValidLink[$env[lf;thumbnail]];$env[lf;thumbnail];$userAvatar[$env[lf;requestedBy];1024]]]
]]
;
$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoQueueList]]
]
;$callFunction[useIcon;color_embed]]

$if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
$let[countPage;$divide[$queueLength;9]]
$addContainer[
$addActionRow
$addButton[musicplayerhidequeue_$authorID_1_0;;Secondary;⏪;$checkCondition[$advancedTextSplit[$customID;_;2]==1]]
$addButton[musicplayerhidequeue_$authorID_$sub[$advancedTextSplit[$customID;_;2];1]_1;;Secondary;◀️;$checkCondition[$advancedTextSplit[$customID;_;2]==1]]
$addButton[musicplayerhidequeue_$authorID_disabled;Page $advancedTextSplit[$customID;_;2] / $if[$or[$queueLength==0;$advancedTextSplit[$get[countPage];.;1]!=];$sum[$advancedTextSplit[$get[countPage];.;0];1];$advancedTextSplit[$get[countPage];.;0]];Secondary;;true]
$addButton[musicplayerhidequeue_$authorID_$sum[$advancedTextSplit[$customID;_;2];1]_0;;Secondary;▶️;$or[$queueLength<=9;$advancedTextSplit[$customID;_;2]>=$advancedTextSplit[$sum[$divide[$queueLength;9];1];.;0]]]
$addButton[musicplayerhidequeue_$authorID_$if[$or[$queueLength==0;$advancedTextSplit[$get[countPage];.;1]!=];$sum[$advancedTextSplit[$get[countPage];.;0];1];$advancedTextSplit[$get[countPage];.;0]]_2;;Secondary;⏩;$or[$queueLength<=9;$advancedTextSplit[$customID;_;2]>=$advancedTextSplit[$sum[$divide[$queueLength;9];1];.;0]]]
]]
]
`
}