module.exports = [{
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==radioplayerpage]
    $onlyIf[$advancedTextSplit[$customID;_;2]==$authorID]
    $let[mid;$messageID]
    $localFunction[loadinteraction;
    $if[$env[typela]==1;
    $interactionUpdate[
    $footer[Fetching;$callFunction[useIcon;loading]]
    $color[$callFunction[useIcon;color_embed]]
    ]
    ]
    $if[$env[typela]==2;
    $let[page1;$advancedTextSplit[$customID;_;3]]
    $let[page2;$sum[$advancedTextSplit[$customID;_;3];1]]
    $interactionUpdate[
    $author[List Stations;https://cdn.onlineradiobox.com/img/android-chrome-192x192.png]
    $thumbnail[$if[$env[loadstate;0;thumbnail]!=;$env[loadstate;0;thumbnail];$userDefaultAvatar[$clientID]]?c=$get[co1]&query=$get[co2]]
    $if[$get[store2]==;
    $description[$get[store]]
    ;
    $addField[> \`Page $get[page1]\`;$get[store];true]
    $addField[> \`Page $get[page2]\`;$get[store2];true]
    ]
    $color[$callFunction[useIcon;color_embed]]
    $if[$env[passthr];$footer[Fetching;$callFunction[useIcon;loading]]]
    $addActionRow
    $addStringSelectMenu[radioplayertoplay_$authorID;List Stations;$or[$arrayLength[loadstate]==0;$env[passthr]];1;1]
    $if[$arrayLength[loadstate]==0;
    $addOption[null;;null]
    ;
    $arrayForEach[loadstate;res;
    $addOption[$env[res;radioName];$env[res;radioName] - $env[res;radioId];$advancedTextSplit[$customID;_;1]|$advancedTextSplit[$customID;_;3]|$env[res;radioId]]
    ]]
    $addActionRow
    $addButton[radioplayerpage_$sub[$advancedTextSplit[$customID;_;1];1]_$authorID_$sub[$advancedTextSplit[$customID;_;3];2];Back;Secondary;◀️;$or[$advancedTextSplit[$customID;_;1]==1;$env[passthr]]]
    $addButton[radioplayerpage_null;Page $if[$get[store2]==;$get[page1];$get[page1]-$get[page2]];Secondary;;true]
    $addButton[radioplayerpage_$sum[$advancedTextSplit[$customID;_;1];1]_$authorID_$sum[$advancedTextSplit[$customID;_;3];2];Next;Secondary;▶️;$if[$or[$arrayLength[loadstate]!=20;$env[passthr]];true;false]]
    ]
    ]
    ;typela;passthr]
    $let[thumbnail;$getEmbeds[$channelID;$get[mid];0;thumbnail]]
    $let[co1;$advancedTextSplit[$get[thumbnail];?c=;1;&;0]]
    $let[co2;$advancedTextSplit[$get[thumbnail];&query=;1]]
    
    $jsonLoad[loadstate;$default[$callFunction[scrapeOnlineRadio;$if[$get[co2]!=;$inflate[$get[co2];base64]];$get[co1];$sub[$advancedTextSplit[$customID;_;1];1];$guildID;true;false];$callFunction[scrapeOnlineRadio;$if[$get[co2]!=;$inflate[$get[co2];base64]];$get[co1];$sub[$advancedTextSplit[$customID;_;1];1];$guildID;false;false]]]
    $let[store;]
    $let[store2;]
    $let[count;$sum[1;$multi[$sub[$advancedTextSplit[$customID;_;1];1];20]]]
    $let[countper;1]
    $arrayForEach[loadstate;res;
    $if[$get[countper]>10;
    $let[store2;$get[store2]-# $get[count]. $hyperlink[$bold[$env[res;radioName]];$env[res;url]]\n]
    ;
    $let[store;$get[store]-# $get[count]. $hyperlink[$bold[$env[res;radioName]];$env[res;url]]\n]
    ]
    $letSum[count;1]
    $letSum[countper;1]
    ]
    $let[currentpage;$advancedTextSplit[$customID;_;1]]
    $let[checkdb;$callFunction[scrapeOnlineRadio;$if[$get[co2]!=;$inflate[$get[co2];base64]];$get[co1];$get[currentpage];$guildID;true;false]]
    $callLocalFunction[loadinteraction;2;$and[$arrayLength[loadstate]==20;$get[checkdb]==]]
    $if[$and[$arrayLength[loadstate]==20;$get[checkdb]==];
    $let[passtr;false]
    $loop[20;
    $let[chtoa;$callFunction[scrapeOnlineRadio;$if[$get[co2]!=;$inflate[$get[co2];base64]];$get[co1];$sum[$env[loopcountertest];$get[currentpage]];$guildID;false;false]]
    $if[$and[$get[passtr]==false;$env[loopcountertest]>5];$let[passtr;true] $callLocalFunction[loadinteraction;2;false]]
    $if[$charCount[$get[chtoa]]==2;$break]
    ;loopcountertest;true]
    $if[$get[passtr]==false;$callLocalFunction[loadinteraction;2;false]]
    ]
    `
},
{
    type: "interactionCreate",
    allowedInteractionTypes: ["selectMenu"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==radioplayertoplay]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]
    $localFunction[loadinteraction;
    $if[$env[typela]==1;
    $interactionUpdate[
    $fetchResponse[$channelID;$messageID]
    $!disableComponents
    $footer[Fetching;$callFunction[useIcon;loading]]
    ]
    ]
    $if[$env[typela]==2;
    $interactionReply[
    $title[$get[name];https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/]
    $if[$get[description]!=;$description[$cropText[$djsEval[require("entities").decodeHTML(ctx.getKeyword("description"))];0;253;...]]]
    $addField[Region;:flag_$advancedTextSplit[$get[code];.;0]: $toUppercase[$advancedTextSplit[$get[code];.;0]];true]
    $addField[Tags;$djsEval[require("entities").decodeHTML(ctx.getKeyword("storetags"))];true]
    $addField[Rating;$get[rating] / 5.0;true]
    $addField[Current Track;$if[$get[current_track]==;Not available;$codeBlock[$djsEval[require("entities").decodeHTML(ctx.getKeyword("current_track"))]]];true]
    $color[$callFunction[useIcon;color_embed]]
    $thumbnail[$if[$get[validthumbnail]!=;$get[thumbnail];$userDefaultAvatar[$clientID]]$get[codethumbnail]]
    $addActionRow
    $addButton[radioplayerpage_$get[currentpage]_$authorID_$get[indexpage];Back to List;Secondary;↩️]
    $addActionRow
    $if[$get[stream]!=;
    $addButton[radioplayerplay_$authorID;Stream;Secondary;▶️]
    ;
    $addButton[radioplayerplay_null;Not available;Secondary;;true]
    ]
    $if[$get[stream]!=;$addButton[$get[stream];Stream Link;Link]]
    $addButton[https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/;Link;Link]
    ]
    ]
    ;typela]
    $let[currentpage;$advancedTextSplit[$selectMenuValues[0];|;0]]
    $let[indexpage;$advancedTextSplit[$selectMenuValues[0];|;1]]
    $let[code;$advancedTextSplit[$selectMenuValues[0];|;2]]
    $let[codethumbnail;?$advancedTextSplit[$getEmbeds[$channelID;$messageID;0;thumbnail];?;1]]
    $callLocalFunction[loadinteraction;1]

    $try[
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://onlineradiobox.com/$advancedTextSplit[$get[code];.;0]/$advancedTextSplit[$get[code];.;1]/;GET]
    ]
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
    $callLocalFunction[loadinteraction;2]
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
    $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
    $if[$get[crdjcs_0f]==false;
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    ;
    $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
    $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$ephemeral $replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
    ]
    $onlyIf[$or[$channelUserLimit[$voiceID[$guildID;$authorID]]==0;$sum[$channelVoiceMemberCount[$voiceID[$guildID;$authorID]];$if[$voiceID[$guildID;$clientID]==;1;0]]<=$channelUserLimit[$voiceID[$guildID;$authorID]]];$ephemeral $callFunction[useCustomMusicMessage;config_errorIsLimitVC]]
    
    $localFunction[loadinteraction;
    $if[$env[typela]==1;
    $interactionUpdate[
    $fetchResponse[$channelID;$messageID]
    $!disableComponents
    $footer[Fetching;$callFunction[useIcon;radioplayerload]]
    ]
    ]
    $if[$env[typela]==2;
    $interactionReply[
    $fetchResponse[$channelID;$messageID]
    $!disableComponents
    $footer[Attempting to Skip;$callFunction[useIcon;radioplayerload]]
    ]
    ]
    $if[$env[typela]==3;
    $interactionReply[
    $loadEmbeds[$get[tempembed]]
    $loadComponents[$get[tempcomponent]]
    ]
    ]
    ;typela]

    $let[tempembed;$getEmbeds[$channelID;$messageID]]
    $let[tempcomponent;$getComponents[$channelID;$messageID]]

    $let[stream;$getComponents[$channelID;$messageID;1;1;url]]
    $let[title;$getEmbeds[$channelID;$messageID;0;title]]
    $let[url;$getEmbeds[$channelID;$messageID;0;titleURL]]
    $let[thumbnail;$getEmbeds[$channelID;$messageID;0;thumbnail]]
    $callLocalFunction[loadinteraction;1]

    $try[
    $let[testmessage;{
    "title": "$replace[$replace[$get[title];\\\\;];";\\\\"]",
    "url": "$get[url]",
    "thumbnail": "$get[thumbnail]",
    "durationMS": 0,
    "requestedBy": {"id":"$authorID"}
    }]

    $let[iscreatedfirst;$checkCondition[$try[$checkCondition[$playerQueueLength[$guildID]>=0];false]==false]]
    $!playerCreate[$guildID;$voiceID;$channelID;100;true]
    $disableConsoleErrors
    $if[$get[iscreatedfirst];
    $setVar[musicplayer_message;$guildID_channelid;$channelID]
    $setVar[musicplayer_message;$guildID_messageid;$messageID]
    $setVar[radioplayer_data;$guildID_checkplayer;true]
    $setVar[radioplayer_data;$guildID_playerstatus;true]
    $!playerAddTrack[$guildID;$trimLines[$get[stream]]]
    $setVar[radioplayer_data;$guildID_metadata;$get[testmessage]]
    ;
    $callLocalFunction[loadinteraction;2]
    $!playerAddTrack[$guildID;$trimLines[$get[stream]]]
    $if[$playerLoopStatus[$guildID]!=off;$!playerToggleLoop[$guildID;OFF] $wait[1s]]
    $setVar[radioplayer_data;$guildID_metadata;$get[testmessage]]
    $!playerSkip[$guildID;$playerQueueLength[$guildID]]
    $setVar[radioplayer_data;$guildID_checkplayer;true]
    $!interactionDelete
    ]
    $enableConsoleErrors
    ;
    $callLocalFunction[loadinteraction;3]
    $let[mid2;$sendMessage[$channelID;
    $reply[$channelID;$messageID;true]
    $description[$callFunction[useCustomMusicMessage;config_errorPlayTrack]$codeBlock[$env[whaterrorlog]]]
    $color[$callFunction[useIcon;error_color_embed]]
    $footer[event]
    $timestamp
    ;true]]
    $wait[3s]
    $if[$messageExists[$channelID;$get[mid2]];$!deleteMessage[$channelID;$get[mid2]]]
    ;whaterrorlog]
    `
}]