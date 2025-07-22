module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==musicplayer;]
    $let[cid;$getVar[musicplayer_message;$guildID_channelid]]
    $let[mid;$getVar[musicplayer_message;$guildID_messageid]]
    $onlyIf[$get[mid]==$messageID;$!disableComponentsOf[$channelID;$messageID]]
    $onlyIf[$voiceID[$guildID;$clientID]!=;]
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$ephemeral You must same with <@$clientID> in <#$voiceID[$guildID;$clientID]>.]

    $if[$advancedTextSplit[$customID;_;1]==lyrics;
    $ephemeral
    $defer
    $jsonLoad[currenttrack;$currentTrackInfo[$guildID]]
    $jsonLoad[result;$callFunction[getLyricsTrack;$if[$charCount[$env[currenttrack;info;title];-]==0;$advancedTextSplit[$env[currenttrack;info;author];-;0] - $advancedTextSplit[$env[currenttrack;info;title];(;0];$advancedTextSplit[$env[currenttrack;info;title];(;0]]]]
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
    $if[$advancedTextSplit[$customID;_;1]==loop;
    $!deferUpdate
    $let[isloop;$getVar[musicplayer_message;$guildID_isloop;none]]
    $let[dochangeloop;$if[$get[isloop]==none;track;$if[$get[isloop]==track;queue;none]]]
    $setLoopMode[$guildID;$get[dochangeloop]]
    $setVar[musicplayer_message;$guildID_isloop;$get[dochangeloop]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumedown;
    $!deferUpdate
    $!setVolume[$guildID;$if[$sub[$getVolume[$guildID];10]>=0;$sub[$getVolume[$guildID];10];0]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumeup;
    $!deferUpdate
    $!setVolume[$guildID;$if[$sum[$getVolume[$guildID];10]<=150;$sum[$getVolume[$guildID];10];150]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==volumemute;
    $!deferUpdate
    $!setVolume[$guildID;$if[$getVolume[$guildID]==0;100;0]]
    ]
    $if[$advancedTextSplit[$customID;_;1]==skipplayer;
    $!deferUpdate
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!skipTrack[$guildID]
    ]
    $if[$advancedTextSplit[$customID;_;1]==stopplayer;
    $!deferUpdate
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!destroyPlayer[$guildID]
    ]
    $if[$advancedTextSplit[$customID;_;1]==actionplayer;
    $!deferUpdate
    $if[$isPaused[$guildID];$!resume[$guildID];
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $!pause[$guildID]
    ]
    ]
    
    $onlyIf[$checkContains[$advancedTextSplit[$customID;_;1];stopplayer;skipplayer;lyrics]!=true;]

    $jsonLoad[currenttrack;$currentTrackInfo[$guildID]]
    $arrayLoad[testmessage;]
    $arrayPushJSON[testmessage;{
    "id": "$channelID",
    "title": "$env[currenttrack;info;title]",
    "description": "",
    "author": "$env[currenttrack;info;author]",
    "url": "$env[currenttrack;info;uri]",
    "thumbnail": "$env[currenttrack;info;artworkUrl]",
    "duration": "$round[$divide[$env[currenttrack;info;length];1000];0]",
    "durationMS": $env[currenttrack;info;length],
    "views": null,
    "requestedBy": null,
    "playlist": null
    }]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[testmessage];false;intervalmusicmessage_$guildID_$get[cid];$guildID;true]
    `
}