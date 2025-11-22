module.exports = {
  name: "musicPlayerMessage",
  params: [
    {
        name: "channelId", // int
        description: "channelId",
        required: true,
    },
    {
        name: "messageId", // int
        description: "messageId",
        required: true,
    },
    {
        name: "musicInfo", // object/json
        description: "Music Object data",
        required: true
    },
    {
        name: "showNext", // bool
        description: "Show a next track message",
        required: true
    },
    {
        name: "intervalName", // string
        description: "Interval name for clears later",
        required: true
    },
    {
        name: "guildId", // int
        description: "guildId",
        required: true
    },
    {
        name: "bypassRestrict", // bool
        description: "Bypass any restrict for known reason",
        required: false
    },
    {
        name: "toggleInterval", // bool
        description: "For interval message",
        required: false
    }
  ],
  code: `
    $if[$try[$checkCondition[$playerQueueLength[$env[guildId]]>=0];false]==false;
    $return
    ]
    $if[$or[$env[messageId]==;$env[channelId]==];
    $!playerDestroy[$env[guildId]]
    $return
    ]
    $let[elapsedtime;$try[$playerElapsedTime[$env[guildId]];0]]
    $let[changeevery_time;10]

    $if[$or[$get[elapsedtime]>$get[changeevery_time];$env[bypassRestrict]==true]==false;$return]
    $async[$if[$getCache[musicplayer_message_$env[guildId]_attemptseek]!=;$!deleteCache[musicplayer_message_$env[guildId]_attemptseek]]]
    $async[$if[$getCache[radioplayer_data_$env[guildId]_checkplayer]!=;$!deleteCache[radioplayer_data_$env[guildId]_checkplayer]]]
    $if[$try[$messageExists[$env[channelId];$env[messageId]];false]==false;
    $let[secmid;$sendMessage[$channelID;$callFunction[useCustomMusicMessage;config_errorIntervalMessage];true]]
    $setCache[musicplayer_message_$env[guildId]_channelid;$env[channelId]]
    $setCache[musicplayer_message_$env[guildId]_messageid;$get[secmid]]
    $callFunction[updateCurrentMusicPlayer]
    $stop
    ]

    $if[$getCache[radioplayer_data_$env[guildId]_playerstatus]!=true;

    $jsonLoad[jsonmusicdata;$env[musicInfo]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[jsonmusicdata;url]]]

    $jsonLoad[rest;$playerQueue[$env[guildId]]]
    $jsonLoad[currenttrack;$env[rest;current;info]]
    $jsonLoad[rest;$env[rest;tracks]]
    $arraySlice[rest;rest;0;25]

    $let[delayping;$checkCondition[$round[$executionTime;0]>=250]]
    $let[checkdurationms;$if[$playerExists[$env[guildId]];$env[currenttrack;duration];0]]
    $let[checkstream;$env[currenttrack;isStream]]
    $let[looknextsong;$and[$env[toggleInterval]==true;$env[showNext]==true;$playerQueueLength[$env[guildId]]!=0;$playerLoopStatus[$env[guildId]]!=TRACK;$get[checkstream]==false]]
    $if[$get[looknextsong];
    $let[title;$env[rest;0;info;title]]
    $let[url;$env[rest;0;info;uri]]
    $let[duration;$env[rest;0;info;duration]]
    $let[owner;$env[rest;0;info;author]]
    $let[requestedBy;$env[rest;0;userData;requester;userId]]
    $let[thumbnail;$env[rest;0;info;artworkUrl]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$get[url]]]
    ]
    $let[provider;$env[jsonmedia;type]]
    $try[$!editMessage[$env[channelId];$env[messageId];
    $if[$get[looknextsong];
    $author[» Next Playing\n$get[owner];$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$get[title];0;253;...];$get[url];0]
    $addField[Duration;$if[$get[checkstream];$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]LIVE;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]$if[$advancedTextSplit[$parseDigital[$env[jsonmusicdata;durationMS]];:;0]==00;$cropText[$parseDigital[$env[jsonmusicdata;durationMS]];3;];$parseDigital[$env[jsonmusicdata;durationMS]]]];true;0]
    $addField[Songs;$separateNumber[$sum[$playerQueueLength[$env[guildId]];1];.];true;0]
    $color[$default[$memberDisplayColor[$guildID;$get[requestedBy]];$callFunction[useIcon;color_embed]];0]
    $thumbnail[$if[$isValidLink[$get[thumbnail]]==false;$userAvatar[$get[requestedBy];1024];$get[thumbnail]];0]
    $footer[$userDisplayName[$get[requestedBy]];$userAvatar[$get[requestedBy];1024];0]
    ;
    $author[» Now Playing\n$env[jsonmusicdata;author];$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$env[jsonmusicdata;title];0;253;...];$env[jsonmusicdata;url];0]
    $if[$and[$get[delayping];$env[toggleInterval]];$description[Bad connection.\nThe current music playing may be sound robotic.;0]]
    $addField[Duration;$if[$get[checkstream];$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]LIVE;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]$if[$advancedTextSplit[$parseDigital[$env[jsonmusicdata;durationMS]];:;0]==00;$cropText[$parseDigital[$env[jsonmusicdata;durationMS]];3;];$parseDigital[$env[jsonmusicdata;durationMS]]]];true;0]
    $addField[Songs;$separateNumber[$sum[$playerQueueLength[$env[guildId]];1];.];true;0]
    $thumbnail[$if[$isValidLink[$env[jsonmusicdata;thumbnail]]==false;$userAvatar[$playerTrackRequester[$guildID];1024];$env[jsonmusicdata;thumbnail]];0]
    $footer[$userDisplayName[$playerTrackRequester[$guildID]];$userAvatar[$playerTrackRequester[$guildID];1024];0]
    $color[$default[$memberDisplayColor[$guildID;$playerTrackRequester[$guildID]];$callFunction[useIcon;color_embed]];0]
    ]
    $addActionRow
    $addStringSelectMenu[musicplayer_nodequeue_$env[messageId];$cropText[Queue | $djsEval[require("entities").decodeHTML(\\\`$replace[$env[currenttrack;title];";\\\\"]\\\`)];0;61;...];$or[$playerQueueLength[$env[guildId]]==0;$playerLoopStatus[$env[guildId]]==track];1;1]

    $let[countqueue;0]
    $if[$playerQueueLength[$env[guildId]]>=1;
    $arrayForEach[rest;yesnt;
    $addOption[$djsEval[require("entities").decodeHTML(\\\`$replace[$cropText[$env[yesnt;info;title];0;97;...];";\\\\"]\\\`)];;$get[countqueue]]
    $letSum[countqueue;1]
    ]
    ;
    $addOption[null;null;null]
    ]
    $addActionRow
    $addButton[musicplayer_loop_$env[messageId];$toTitleCase[$playerLoopStatus[$env[guildId]]];$if[$playerLoopStatus[$env[guildId]]==off;Secondary;Primary];🔁;false]
    $addButton[musicplayer_shuffle_$env[messageId];Shuffle;Secondary;🔀;false]
    $addButton[musicplayer_lyrics_$env[messageId];Lyrics;Secondary;🎶;$or[$get[checkstream];$get[provider]==null]]
    $addButton[musicplayer_lastfm_$env[messageId];Last.FM;Secondary;1413865849307267112;$or[$get[provider]==null]]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$playerGetVolume[$env[guildId]]==0]]
    $addButton[null0;$playerGetVolume[$env[guildId]]%;Secondary;🔈;true]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$playerGetVolume[$env[guildId]]==150]]
    $addButton[musicplayer_volumemute_$env[messageId];$if[$playerGetVolume[$env[guildId]]==0;Unmute;Mute];Secondary;🔈;false]
    $addActionRow
    $addButton[musicplayer_seekdown_$env[messageId];-10s;Secondary;⏪;$or[$get[checkstream];$playerIsPaused[$env[guildId]]]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_seekup_$env[messageId];+10s;Secondary;⏩;$or[$get[checkstream];$playerIsPaused[$env[guildId]]]]
    $addButton[musicplayer_actionplayer_$env[messageId];$if[$playerIsPaused[$env[guildId]];Resume;Pause];Secondary;$if[$playerIsPaused[$env[guildId]];▶️;⏸️];$get[checkstream]]
    ]
    ]
    ;
    $jsonLoad[aradio;$default[$getCache[radioplayer_data_$guildID_metadata];{}]]
    
    $try[
    $!#editMessage[$env[channelId];$env[messageId];
    $author[Streaming Radio;https://cdn.onlineradiobox.com/img/android-chrome-192x192.png;;0]
    $title[$cropText[$env[aradio;title];0;253;...];$env[aradio;url];0]
    $if[$callFunction[configMusic;interval_message];$addField[Session Duration;$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]]]]
    $thumbnail[$if[$isValidLink[$env[aradio;thumbnail]]==false;$userAvatar[$env[aradio;requestedBy;id];1024];$env[aradio;thumbnail]];0]
    $footer[$userDisplayName[$env[aradio;requestedBy;id]];$userAvatar[$env[aradio;requestedBy;id];1024];0]
    $color[$callFunction[useIcon;color_embed];0]
    $addActionRow
    $addButton[musicplayer_volumemute_$env[messageId];$if[$playerGetVolume[$env[guildId]]==0;Unmute;Mute];Secondary;🔈;false]
    $addButton[null0;$playerGetVolume[$env[guildId]]%;Secondary;🔈;true]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$playerGetVolume[$env[guildId]]==0]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$playerGetVolume[$env[guildId]]==150]]
    ]
    ]
    ]
    $return
    `,
};
