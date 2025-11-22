module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==musicplayerhidequeue]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]

    $let[nodes;$try[$checkCondition[$playerQueueLength[$guildID]>=0];false]]
    $onlyIf[$get[nodes];$!interactionDelete]

    $if[$advancedTextSplit[$customID;_;2]>15;
    $!deferUpdate
    ]
    
    $jsonLoad[rest;$playerQueue[$guildID]]
    $jsonLoad[currenttrack;$env[rest;current]]
    $jsonLoad[rest;$env[rest;tracks]]
    $arraySlice[rest;rest;$multi[15;$sub[$advancedTextSplit[$customID;_;2];1]]]
    $arrayMap[rest;rest2;$if[$env[rest2]!=;$return[$env[rest2]]];rest]
    $let[count;1]
    $let[countsec;$sum[1;$multi[15;$sub[$advancedTextSplit[$customID;_;2];1]]]]
    $while[$get[count]<=15;
    $if[$env[rest;$sub[$get[count];1]]!=;
    $let[contains;$get[contains]$get[countsec]. $env[rest;$sub[$get[count];1];info;title]\n]
    $letSum[countsec;1]
    ]
    $letSum[count;1]
    ]

    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[currenttrack;info;uri]]]
    $let[provider;$replace[$env[jsonmedia;type];applemusic;apple music]]

    $!interactionUpdate[
    $author[Currently Playing;$callFunction[useIcon;$env[jsonmedia;type]];;0]
    $title[$cropText[$env[currenttrack;info;title];0;253;...];$env[currenttrack;info;uri];0]
    $addField[Owner;\`$env[currenttrack;info;author]\`;true;0]
    $addField[Duration;$if[$env[currenttrack;info;isStream];LIVE;$parseDigital[$env[currenttrack;info;duration]]];true;0]
    $thumbnail[$if[$isValidLink[$env[currenttrack;info;artworkUrl]]==false;$userAvatar[$env[currenttrack;userData;requester;userId];1024];$env[currenttrack;info;artworkUrl]];0]
    $color[$callFunction[useIcon;color_embed];0]
    $footer[$userDisplayName[$env[currenttrack;userData;requester;userId]];$userAvatar[$env[currenttrack;userData;requester;userId];1024];0]
    $author[Queue ($separateNumber[$playerQueueLength[$guildID];.]);;;1]
    $description[$if[$playerQueueLength[$guildID]==0;$callFunction[useCustomMusicMessage;config_errorNoQueueList];$get[contains]];1]
    $color[$callFunction[useIcon;color_embed];1]
    $if[$playerQueueLength[$guildID]!=0;$thumbnail[$if[$or[$env[rest;0;info;artworkUrl]==null;$env[rest;0;info;artworkUrl]==];$userAvatar[$clientID;1024];$env[rest;0;info;artworkUrl]];1]]
    $timestamp[;1]
    $if[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;
    $addActionRow
    $addButton[musicplayerhidequeue_$authorID_$sub[$advancedTextSplit[$customID;_;2];1];Back;Primary;;$checkCondition[$advancedTextSplit[$customID;_;2]==1]]
    $addButton[musicplayerhidequeue_$authorID_disabled;Page $advancedTextSplit[$customID;_;2] / $advancedTextSplit[$sum[$divide[$playerQueueLength[$guildID];15];1];.;0];Secondary;;true]
    $addButton[musicplayerhidequeue_$authorID_$sum[$advancedTextSplit[$customID;_;2];1];Next;Primary;;$or[$playerQueueLength[$guildID]<=15;$advancedTextSplit[$customID;_;2]>=$advancedTextSplit[$sum[$divide[$playerQueueLength[$guildID];15];1];.;0]]]
    ]
    ]
    `
}