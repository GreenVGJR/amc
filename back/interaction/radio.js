module.exports = [{
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==radioplayerpage]
    $onlyIf[$advancedTextSplit[$customID;_;2]==$authorID]
    $let[mid;$messageID]

    $let[thumbnail;$getEmbeds[$channelID;$get[mid];0;thumbnail]]
    $let[co1;$advancedTextSplit[$get[thumbnail];?c=;1;&;0]]
    $let[co2;$advancedTextSplit[$get[thumbnail];&query=;1]]

    $!clearTimeout[checkadt_pta-cv_$get[mid]]
    $!deferUpdate

    $jsonLoad[loadstate;$callFunction[scrapeOnlineRadio;$if[$get[co2]!=;$inflate[$get[co2];base64]];$get[co1];$sub[$advancedTextSplit[$customID;_;1];1];$guildID]]
    $let[store;]
    $let[count;$sum[1;$multi[$sub[$advancedTextSplit[$customID;_;1];1];20]]]
    $arrayForEach[loadstate;res;
    $let[store;$get[store]$get[count]. $hyperlink[$env[res;radioName];$env[res;url]]\n]
    $letSum[count;1]
    ]
    $!interactionUpdate[
    $author[Showing $arrayLength[loadstate] results]
    $title[List Stations]
    $thumbnail[$if[$env[loadstate;0;thumbnail]!=;$env[loadstate;0;thumbnail];$userDefaultAvatar[$clientID]]?c=$get[co1]&query=$get[co2]]
    $description[$get[store]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    $addActionRow
    $addStringSelectMenu[radioplayertoplay_$authorID;List Stations;false;1;1]
    $arrayForEach[loadstate;res;
    $addOption[$env[res;radioName];$env[res;radioName] - $env[res;radioId];$advancedTextSplit[$customID;_;1]|$env[res;radioId]]
    ]
    $addActionRow
    $addButton[radioplayerpage_$sub[$advancedTextSplit[$customID;_;1];1]_$authorID;Back;$if[$advancedTextSplit[$customID;_;1]==1;Secondary;Primary];;$checkCondition[$advancedTextSplit[$customID;_;1]==1]]
    $addButton[radioplayerpage_null;Page $advancedTextSplit[$customID;_;1];Secondary;;true]
    $addButton[radioplayerpage_$sum[$advancedTextSplit[$customID;_;1];1]_$authorID;Next;$if[$or[$arrayLength[loadstate]==20;$arrayLength[loadstate]==0];Primary;Secondary];;$if[$or[$arrayLength[loadstate]==20;$arrayLength[loadstate]==0];false;true]]
    ]
    $setTimeout[$try[$!disableComponentsOf[$channelID;$get[mid]]];1m;checkadt_pta-cv_$get[mid]]
    `
},
{
    type: "interactionCreate",
    allowedInteractionTypes: ["selectMenu"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==radioplayertoplay]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]
    $!deferUpdate
    $!clearTimeout[checkadt_pta-cv_$messageID]
    $let[currentpage;$advancedTextSplit[$selectMenuValues[0];|;0]]
    $let[code;$advancedTextSplit[$selectMenuValues[0];|;1]]
    $let[codethumbnail;?$advancedTextSplit[$getEmbeds[$channelID;$messageID;0;thumbnail];?;1]]

    $try[
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/;GET]
    
    $let[current_track;$replace[$replace[$replace[$replace[$replace[$replace[$replace[$advancedTextSplit[$httpResult;class="station-onair";1;class="track_history_item";1;class="ajax">;1;</a>;0];<a>;];</a>;];<i>;];</i>;];<b>;];</b>;];";\\\\"]]
    
    $let[thumbnail;https:$advancedTextSplit[$httpResult;class="station";1;src=";1;";0]]
    $let[validthumbnail;$advancedTextSplit[$httpResult;class="station";1;src=";1;";0]]
    $let[name;$advancedTextSplit[$httpResult;class="station";1;radioName=";1;";0]]
    $let[stream;$advancedTextSplit[$httpResult;class="station";1;stream=";1;";0]]
    $let[description;$trimLines[$advancedTextSplit[$httpResult;station__description;1;">;1;</div>;0;<a href=";0]]]
    $let[rating;$advancedTextSplit[$httpResult;class="stars-rating";1;data-rating=";1;";0]]

    $let[tags;$advancedTextSplit[$httpResult;class="station__tags";1;</ul>;0]]
    $arrayLoad[tags;<li>;$get[tags]]
    $arrayMap[tags;tag;
    $if[$advancedTextSplit[$env[tag];class="ajax">;1;</a>;0]!=;
    $return[$toTitleCase[$advancedTextSplit[$env[tag];class="ajax">;1;</a>;0]]]
    ]
    ;tags2]

    $let[storetags;$arrayJoin[tags2;, ]]
    
    $!interactionUpdate[
    $title[$get[name];https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/]
    $description[$djsEval[require("entities").decodeHTML(ctx.getKeyword("description"))]]
    $addField[Region;:flag_$advancedTextSplit[$get[code];.;0]: $toUppercase[$advancedTextSplit[$get[code];.;0]];true]
    $addField[Tags;$djsEval[require("entities").decodeHTML(ctx.getKeyword("storetags"))];true]
    $addField[Rating;$get[rating] / 5.0;true]
    $addField[Current Track;$if[$get[current_track]==;Not available;$codeBlock[$djsEval[require("entities").decodeHTML(ctx.getKeyword("current_track"))]]];true]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    $thumbnail[$if[$get[validthumbnail]!=;$get[thumbnail];$userDefaultAvatar[$clientID]]$get[codethumbnail]]
    $addActionRow
    $addButton[radioplayerpage_$get[currentpage]_$authorID;Back to List;Secondary;↩️]
    $addActionRow
    $if[$get[stream]!=;
    $addButton[radioplayerplay_$authorID;Stream;Primary;▶️]
    ;
    $addButton[radioplayerplay_null;Not available;Secondary;;true]
    ]
    $if[$get[stream]!=;$addButton[$get[stream];Stream Link;Link]]
    $addButton[https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/;Link;Link]
    ]
    ]
    `
},
{
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==radioplayerplay]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]

    $onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    
    $let[tempembed;$getEmbeds[$channelID;$messageID]]
    $let[tempcomponent;$getComponents[$channelID;$messageID]]

    $let[stream;$getComponents[$channelID;$messageID;1;1;url]]
    $let[title;$getEmbeds[$channelID;$messageID;0;title]]
    $let[url;$getEmbeds[$channelID;$messageID;0;titleURL]]
    $let[thumbnail;$getEmbeds[$channelID;$messageID;0;thumbnail]]

    $try[
    $!interactionUpdate[
    $fetchEmbeds[$channelID;$messageID;0]
    $footer[Fetching;$callFunction[useIcon;loading]]
    ]

    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "title": "$replace[$replace[$get[title];\\\\;];";\\\\"]",
    "url": "$get[url]",
    "thumbnail": "$get[thumbnail]",
    "durationMS": 0,
    "requestedBy": {"id":"$authorID"}
    }]

    $setVar[radioplayer_data;$guildID_metadata;$env[testmessage;0]]
    $let[iscreatedfirst;$or[$hasMusicNode==false;$if[$hasMusicNode;$isPlaying;false]==false]]
    $if[$get[iscreatedfirst];
    $setVar[musicplayer_message;$guildID_channelid;$channelID]
    $setVar[musicplayer_message;$guildID_messageid;$messageID]
    ]
    $setVar[radioplayer_data;$guildID_playerstatus;true]
    $setVar[radioplayer_data;$guildID_checkplayer;true]

    $playTrack[$voiceID;$get[stream]]
    $if[$get[iscreatedfirst]==false;
    $!interactionUpdate[
    $fetchEmbeds[$channelID;$messageID;0]
    $footer[Attempting to Skip;$callFunction[useIcon;loading]]
    ]
    $if[$getLoopMode!=OFF;$setLoopMode[OFF] $wait[1s]]
    $!skipTo[$sub[$queueLength;1]]
    $!interactionDelete
    ]
    ;
    $!interactionUpdate[
    $loadEmbeds[$get[tempembed]]
    $loadComponents[$get[tempcomponent]]
    ]

    $let[mid2;$sendMessage[$channelID;
    $reply[$channelID;$messageID;true]
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack]$codeBlock[$env[whaterrorlog]]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ;true]]

    $setTimeout[$!deleteMessage[$channelID;$get[mid2]];2s]
    ;whaterrorlog]
    `
}]