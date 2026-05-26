module.exports = {
  data: {
    "type": 1,
    "name": "queue",
    "description": "Show all tracks info",
    "integration_types": [
      0
    ],
    "contexts": [
      0
    ],
    "description_localizations": {
      "id": "List musik dalam antrian"
    }
  },
  type: 0,
  code: `
$onlyIf[$guildID!=;]

$onlyIf[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]

$let[nodes;$if[$hasMusicNode;$isPlaying;false]]
$ephemeral
$onlyIf[$get[nodes];$callFunction[useCustomMusicMessage;config_errorNoQueue]]

$jsonLoad[rest;$try[$djsEval[JSON.stringify(require("discord-player").useQueue(ctx.interaction.guild).tracks.data)];{}]]
$arrayMap[rest;rest2;$if[$env[rest2;id]!=;$return[$env[rest2]]];rest]
$arraySlice[rest;rest;0;9]

$jsonLoad[jsonmedia;$callFunction[filterMediaID;$trackInfo[url]]]
$let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]
$let[requestedBy;$if[$or[$trackInfo[requestedBy;id]==;$trackInfo[requestedBy;id]==null;$trackInfo[requestedBy]==;$trackInfo[requestedBy]==null];$clientID;$trackInfo[requestedBy;id]]]

$interactionReply[
$silent
$addContainer[
$addSection[
$addTextDisplay[### » Currently Playing
$hyperlink[$trackInfo[title];$trackInfo[url]]
-# $bold[Requested by:] <@$get[requestedBy]>
]
$addThumbnail[$if[$isValidLink[$trackInfo[thumbnail]]==false;$userAvatar[$get[requestedBy];1024];$trackInfo[thumbnail]]]
]
$addTextDisplay[-# $bold[Duration:] $if[$trackInfo[durationMS]==0;LIVE;$parseDigital[$trackInfo[durationMS]]] | $bold[Source:] $toTitlecase[$get[provider]] | $bold[Songs:] $separateNumber[$sum[$queueLength;1];.]]
;$callFunction[useIcon;color_embed]]

$addContainer[
$if[$queueLength!=0;
$arrayForEach[rest;lf;
$let[onSpecificRequest;$if[$or[$env[lf;requestedBy]==;$env[lf;requestedBy]==null;$env[lf;requestedBy;id]==;$env[lf;requestedBy;id]==null];$clientID;$env[lf;requestedBy]]]
$addSection[
$addTextDisplay[> ### $cropText[$env[lf;title];0;100;]
> -# $if[$env[lf;durationMS]==0;LIVE;$parseDigital[$env[lf;durationMS]]] - <@$get[onSpecificRequest]>
]
$addThumbnail[$if[$isValidLink[$env[lf;thumbnail]];$env[lf;thumbnail];$userAvatar[$get[onSpecificRequest];1024]]]
]]
;
$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoQueueList]]
]
;$callFunction[useIcon;color_embed]]

$if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
$let[countPage;$divide[$queueLength;9]]
$addContainer[
$addActionRow
$addButton[musicplayerhidequeue_$authorID_1_0;;Secondary;⏪;true]
$addButton[musicplayerhidequeue_$authorID_1_1;;Secondary;◀️;true]
$addButton[musicplayerhidequeue_$authorID_disabled;Page 1 / $if[$or[$queueLength==0;$advancedTextSplit[$get[countPage];.;1]!=];$sum[$advancedTextSplit[$get[countPage];.;0];1];$advancedTextSplit[$get[countPage];.;0]];Secondary;;true]
$addButton[musicplayerhidequeue_$authorID_2_0;;Secondary;▶️;$checkCondition[$queueLength<=9]]
$addButton[musicplayerhidequeue_$authorID_$if[$or[$queueLength==0;$advancedTextSplit[$get[countPage];.;1]!=];$sum[$advancedTextSplit[$get[countPage];.;0];1];$advancedTextSplit[$get[countPage];.;0]]_2;;Secondary;⏩;$checkCondition[$queueLength<=9]]
]]
]
`
}