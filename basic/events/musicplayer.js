module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==musicplayer;]
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $onlyIf[$get[mid]==$messageID;$!disableComponentsOf[$channelID;$messageID]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;]

    $if[$advancedTextSplit[$customID;_;1]==nodequeue;
    $!deferUpdate
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!disableComponentsOf[$get[cid];$get[mid]]
    $!skipTo[$selectMenuValues[0]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==loop;
    $!deferUpdate
    $if[$getLoopMode==OFF;$setLoopMode[TRACK];
    $if[$getLoopMode==TRACK;$setLoopMode[QUEUE];$setLoopMode[OFF]
    ]]]
    $if[$advancedTextSplit[$customID;_;1]==shuffle;
    $!deferUpdate
    $let[statusshuffle;$getVar[musicplayer_message;$guildID_isshuffle;false]]
    $if[$get[statusshuffle];
    $!unShuffleQueue
    $setVar[musicplayer_message;$guildID_isshuffle;false]
    ;
    $!shuffleQueue
    $setVar[musicplayer_message;$guildID_isshuffle;true]
    ]]
    $if[$advancedTextSplit[$customID;_;1]==lyrics;
    $ephemeral
    $defer
    $jsonLoad[result;$callFunction[getLyricsTrack;$if[$charCount[$trackInfo[title];-]==0;$advancedTextSplit[$trackInfo[author];-;0] - $advancedTextSplit[$trackInfo[title];(;0];$advancedTextSplit[$trackInfo[title];(;0]]]]
    $onlyIf[$env[result;results]!=;No lyrics for this track.]
    $if[$charCount[$env[result;results;lyric]]>3900;$attachment[$env[result;results;lyric];lyrics-$getTimestamp.txt;true]]
    $!interactionUpdate[
    $title[$env[result;results;autocomplete];$env[result;results;url]]
    $description[$codeBlock[$cropText[$env[result;results;lyric];0;3900;\n\n(Unfortunately, i can't show the rest of them.)]]]
    $footer[$env[result;results;provider];$callFunction[useIcon;$env[result;results;provider]]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    ]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumedown;
    $!deferUpdate
    $!setVolume[$if[$sub[$getVolume;10]>=0;$sub[$getVolume;10];0]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumeup;
    $!deferUpdate
    $!setVolume[$if[$sum[$getVolume;10]<=150;$sum[$getVolume;10];150]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumemute;
    $!deferUpdate
    $!setVolume[$if[$getVolume==0;100;0]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==stopplayer;
    $ephemeral
    $defer
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!stopTrack
    $!interactionFollowUp[OK]
    ]
    $if[$advancedTextSplit[$customID;_;1]==actionplayer;
    $!deferUpdate
    $if[$isPaused;$!resumeTrack;$!pauseTrack]
    ]
    $if[$advancedTextSplit[$customID;_;1]==seekdown;
    $if[$getVar[musicplayer_message;$guildID_attemptseek;false]==true;$ephemeral $interactionReply[It's still processing.] $stop]
    $!deferUpdate
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $async[
    $!editMessage[$get[cid];$get[mid];
    $fetchResponse[$get[cid];$get[mid]]
    $footer[Re-Downloading;$callFunction[useIcon;loading]]
    $timestamp
    ]
    ]
    $let[curduration;$callFunction[musicVirtualDuration;$guildID;$get[cid]]]
    $let[seeks;10000]
    $let[tests;$callFunction[musicVirtualDuration;$guildID;$get[cid];$sub[$get[curduration];$get[seeks]]]]
    $setVar[musicplayer_message;$guildID_attemptseek;true]
    $let[resseek;$if[$sub[$get[curduration];$get[seeks]]<0;0;$sub[$get[curduration];$get[seeks]]]]
    $!seekTrack[$get[resseek]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==seekup;
    $if[$getVar[musicplayer_message;$guildID_attemptseek;false]==true;$ephemeral $interactionReply[It's still processing.] $stop]
    $!deferUpdate
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $async[
    $!editMessage[$get[cid];$get[mid];
    $fetchResponse[$get[cid];$get[mid]]
    $footer[Re-Downloading;$callFunction[useIcon;loading]]
    $timestamp
    ]
    ]
    $let[curduration;$callFunction[musicVirtualDuration;$guildID;$get[cid]]]
    $let[seeks;10000]
    $let[tests;$callFunction[musicVirtualDuration;$guildID;$get[cid];$sum[$get[curduration];$get[seeks]]]]
    $setVar[musicplayer_message;$guildID_attemptseek;true]
    $let[resseek;$if[$sum[$get[curduration];$get[seeks]]<0;0;$sum[$get[curduration];$get[seeks]]]]
    $!seekTrack[$get[resseek]]
    ]
    
    $onlyIf[$checkContains[$advancedTextSplit[$customID;_;1];stopplayer;lyrics;nodequeue;seekup;seekdown]!=true;]

    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$trackInfo[id]",
    "title": "$trackInfo[title]",
    "description": "$trackInfo[description]",
    "author": "$trackInfo[author]",
    "url": "$trackInfo[url]",
    "thumbnail": "$trackInfo[thumbnail]",
    "duration": "$trackInfo[duration]",
    "durationMS": $trackInfo[durationMS],
    "views": $trackInfo[views],
    "requestedBy": {"id":"$advancedTextSplit[$trackInfo[requestedBy];@;1;>;0]"},
    "playlist": null
    }]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage;0];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true]
    `
}