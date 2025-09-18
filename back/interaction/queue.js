module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==musicplayerhidequeue]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]

    $let[nodes;$if[$hasMusicNode;$isPlaying;false]]
    $onlyIf[$get[nodes];$!interactionDelete]

    $if[$advancedTextSplit[$customID;_;2]>15;
    $!deferUpdate
    ]
    
    $arrayload[rest;
;$queue[;$multi[16;$advancedTextSplit[$customID;_;2]];{track.title} - <@{track.requestedBy.id}>;
]]
    $arraySlice[rest;rest;$multi[15;$sub[$advancedTextSplit[$customID;_;2];1]]]
    $arrayMap[rest;rest2;$if[$env[rest2]!=;$return[$env[rest2]]];rest]
    $let[count;1]
    $let[countsec;$sum[1;$multi[15;$sub[$advancedTextSplit[$customID;_;2];1]]]]
    $while[$get[count]<=15;
    $if[$env[rest;$sub[$get[count];1]]!=;
    $let[contains;$get[contains]$get[countsec]. $env[rest;$sub[$get[count];1]]\n]
    $letSum[countsec;1]
    ]
    $letSum[count;1]
    ]

    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$trackInfo[url]]]
    $let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]

    $!interactionUpdate[
    $author[Currently Playing;$callFunction[useIcon;$env[jsonmedia;type]];;0]
    $title[$cropText[$trackInfo[title];0;253;...];$trackInfo[url];0]
    $addField[Owner;\`$trackInfo[author]\`;true;0]
    $addField[Duration;$if[$trackInfo[durationMS]==0;LIVE;$parseDigital[$trackInfo[durationMS]]];true;0]
    $thumbnail[$if[$or[$trackInfo[thumbnail]==null;$trackInfo[thumbnail]==];$userDefaultAvatar[$authorID];$trackInfo[thumbnail]];0]
    $color[$callFunction[useIcon;color_embed];0]
    $footer[$username[$trackInfo[requestedBy;id]];$userAvatar[$trackInfo[requestedBy;id];1024];0]
    $author[Queue ($separateNumber[$queueLength;.]);;;1]
    $description[$if[$queueLength==0;There's no track on this queue;$get[contains]];1]
    $color[$callFunction[useIcon;color_embed];1]
    $if[$queueLength!=0;$thumbnail[$if[$or[$queue[0;1;{track.thumbnail}]==null;$queue[0;1;{track.thumbnail}]==];$userDefaultAvatar[$authorID];$queue[0;1;{track.thumbnail}]];1]]
    $timestamp[;1]
    $if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
    $addActionRow
    $addButton[musicplayerhidequeue_$authorID_$sub[$advancedTextSplit[$customID;_;2];1];Back;Primary;;$checkCondition[$advancedTextSplit[$customID;_;2]==1]]
    $addButton[musicplayerhidequeue_$authorID_disabled;Page $advancedTextSplit[$customID;_;2] / $advancedTextSplit[$sum[$divide[$queueLength;15];1];.;0];Secondary;;true]
    $addButton[musicplayerhidequeue_$authorID_$sum[$advancedTextSplit[$customID;_;2];1];Next;Primary;;$or[$queueLength<=15;$advancedTextSplit[$customID;_;2]>=$advancedTextSplit[$sum[$divide[$queueLength;15];1];.;0]]]
    ]
    ]
    `
}