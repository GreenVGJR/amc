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
        },
        {
            name: "bypassEdit", // bool
            description: "Bypass Edit by using Interaction Update instead",
            required: false
        }
    ],
    code: `
    $if[$or[$isPlaying==;$isPlaying==false;$voiceID[$env[guildId];$clientID]==];
    $!clearInterval[$env[intervalName]]
    $return
    ]
    $if[$getCache[initclientmusic;musicplayer_checkmessage_ytwarm_$env[guildId]]==true;
    $!clearInterval[$env[intervalName]]
    ]
    $if[$or[$env[messageId]==;$channelExists[$env[channelId]]==false];
    $leaveVoiceChannel
    $return
    ]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$env[guildId];$env[channelId]];0]]
    $let[changeevery_time;8000]

    $if[$or[$getCache[initclientmusic;musicplayer_message_$env[guildId]_attemptseek]==true;$get[elapsedtime]==0;$modulo[$get[elapsedtime];$get[changeevery_time]]==0;$env[bypassRestrict]==true]==false;$return]
    $async[$if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_attemptseek]!=;$deleteCache[initclientmusic;musicplayer_message_$env[guildId]_attemptseek]]]
    $async[$if[$getCache[initclientmusic;radioplayer_data_$env[guildId]_checkplayer]!=;$deleteCache[initclientmusic;radioplayer_data_$env[guildId]_checkplayer]]]
    $if[$try[$messageExists[$env[channelId];$env[messageId]];false]==false;
    $let[secmid;$sendMessage[$channelID;$silent $callFunction[useCustomMusicMessage;config_errorIntervalMessage];true]]
    $setCache[initclientmusic;musicplayer_message_$env[guildId]_channelid;"$env[channelId]"]
    $setCache[initclientmusic;musicplayer_message_$env[guildId]_messageid;"$get[secmid]"]
    $callFunction[updateCurrentMusicPlayer;false]
    $stop
    ]

    $let[countVcMembers;$sub[$channelVoiceMemberCount[$voiceID[$env[guildId];$clientID]];2]]

    $if[$getCache[initclientmusic;radioplayer_data_$env[guildId]_playerstatus]!=true;

    $jsonLoad[jsonmusicdata;$env[musicInfo]]
    $let[checkautoplaystatus;$callFunction[checkAutoplayStatus]]
    $if[$get[checkautoplaystatus];
    $if[$or[$env[jsonmusicdata;requestedBy]==;$env[jsonmusicdata;requestedBy]==null];
    $!jsonDelete[jsonmusicdata;requestedBy]
    $!jsonSet[jsonmusicdata;requestedBy;{}]
    $!jsonSet[jsonmusicdata;requestedBy;id;"$clientID"]
    ;
    $if[$or[$env[jsonmusicdata;requestedBy;id]==;$env[jsonmusicdata;requestedBy;id]==null];
    $!jsonSet[jsonmusicdata;requestedBy;id;"$clientID"]
    ]]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[jsonmusicdata;url]]]

    $arrayload[rest;
;$queue[;23;{track.title};
]]

    $let[statusshuffle;$default[$getCache[initclientmusic;musicplayer_message_$env[guildId]_isshuffle];false]]

    $let[delayping;$checkCondition[$round[$executionTime;0]>=250]]
    $let[checkdurationms;$if[$hasMusicNode;$if[$isPlaying;$env[jsonmusicdata;durationMS];0];0]]
    $let[looknextsong;$and[$env[toggleInterval]==true;$env[showNext]==true;$queueLength!=0;$getLoopMode!=TRACK;$get[checkdurationms]!=0]]
    $if[$get[looknextsong];
    $jsonLoad[restnext;$try[$djsEval[JSON.stringify(require("discord-player").useQueue(ctx.client.guilds.cache.get("$env[guildId]")).tracks.data[0\\])];{}]]
    $let[requestedBy;$env[restnext;requestedBy]]
    $if[$or[$get[requestedBy]==;$get[requestedBy]==null];
    $let[requestedBy;$clientID]
    ]
    $let[title;$env[restnext;title]]
    $let[url;$env[restnext;url]]
    $let[thumbnail;$env[restnext;thumbnail]]
    $let[owner;$env[restnext;author]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$get[url]]]
    ]
    $let[provider;$env[jsonmedia;type]]
    $localFunction[fetmusicmc;
    $if[$get[looknextsong];
    $author[» Next Playing$if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]==true; - 24/7 Mode]\n$get[owner];$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$get[title];0;253;...];$get[url];0]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]LIVE;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]$if[$advancedTextSplit[$parseDigital[$env[jsonmusicdata;durationMS]];:;0]==00;$cropText[$parseDigital[$env[jsonmusicdata;durationMS]];3;];$parseDigital[$env[jsonmusicdata;durationMS]]]];true;0]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;0]
    $if[$memberDisplayColor[$env[guildId];$get[requestedBy]]==#000000;
    $color[$callFunction[useIcon;color_embed];0]
    ;
    $color[$memberDisplayColor[$env[guildId];$get[requestedBy]];0]
    ]
    $thumbnail[$if[$isValidLink[$get[thumbnail]]==false;$userAvatar[$get[requestedBy];1024];$if[$endsWith[$get[owner]; - Topic];https://i.ytimg.com/vi/$advancedTextSplit[$get[thumbnail];/;4]/frame0.jpg;$if[$get[provider]==applemusic;$replace[$get[thumbnail];1200x630wp-60;1x1ss];$get[thumbnail]]]];0]
    $if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_ongoingdynamicmusic]==true;
    $footer[$callFunction[useCustomMusicMessage;config_generalDynamicQueue];$callFunction[useIcon;loading]]
    ;
    $footer[$userDisplayName[$get[requestedBy]]$if[$get[countVcMembers]>=1;  •  +$get[countVcMembers] more];$userAvatar[$get[requestedBy];1024];0]
    ]
    ;
    $author[» Now Playing$if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]==true; - 24/7 Mode]\n$env[jsonmusicdata;author];$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$env[jsonmusicdata;title];0;253;...];$env[jsonmusicdata;url];0]
    $if[$and[$get[delayping];$env[toggleInterval]];$description[Bad connection.\nThe current music playing may be sound robotic.;0]]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]LIVE;$if[$env[toggleInterval];$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]] - ]$if[$advancedTextSplit[$parseDigital[$env[jsonmusicdata;durationMS]];:;0]==00;$cropText[$parseDigital[$env[jsonmusicdata;durationMS]];3;];$parseDigital[$env[jsonmusicdata;durationMS]]]];true;0]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;0]
    $thumbnail[$if[$isValidLink[$env[jsonmusicdata;thumbnail]]==false;$userAvatar[$env[jsonmusicdata;requestedBy;id];1024];$if[$endsWith[$env[jsonmusicdata;author]; - Topic];https://i.ytimg.com/vi/$advancedTextSplit[$env[jsonmusicdata;thumbnail];/;4]/frame0.jpg;$if[$get[provider]==applemusic;$replace[$env[jsonmusicdata;thumbnail];1200x630wp-60;1x1ss];$env[jsonmusicdata;thumbnail]]]];0]
    $if[$memberDisplayColor[$env[guildId];$env[jsonmusicdata;requestedBy;id]]==#000000;
    $color[$callFunction[useIcon;color_embed];0]
    ;
    $color[$memberDisplayColor[$env[guildId];$env[jsonmusicdata;requestedBy;id]];0]
    ]
    $if[$getCache[initclientmusic;musicplayer_checkmessage_ytwarm_$env[guildId]]==true;
    $footer[$callFunction[useCustomMusicMessage;config_generalRefreshYoutubeTrack];$callFunction[useIcon;loading]]
    ;
    $if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_ongoingdynamicmusic]==true;
    $footer[$callFunction[useCustomMusicMessage;config_generalDynamicQueue];$callFunction[useIcon;loading]]
    ;
    $footer[$userDisplayName[$env[jsonmusicdata;requestedBy;id]]$if[$get[countVcMembers]>=1;  •  +$get[countVcMembers] more];$userAvatar[$env[jsonmusicdata;requestedBy;id];1024];0]
    ]
    ]
    ]
    $addActionRow
    $let[ttrktitle;$env[jsonmusicdata;title]]
    $addStringSelectMenu[musicplayer_nodequeue_$env[messageId];$cropText[Queue | $djsEval[require("entities").decodeHTML(ctx.getKeyword("ttrktitle"))];0;50;...];$or[$queueLength==0;$getLoopMode==TRACK];1;1]

    $let[countqueue;0]
    $if[$queueLength!=0;
    $arrayForEach[rest;yesnt;
    $let[ttrknt;$cropText[$env[yesnt];0;97;...]]
    $addOption[$djsEval[require("entities").decodeHTML(ctx.getKeyword("ttrknt"))];;$get[countqueue]]
    $letSum[countqueue;1]
    ]
    ;
    $addOption[null;null;null]
    ]
    $addActionRow
    $addButton[musicplayer_loop_$env[messageId];$toTitleCase[$getLoopMode];$if[$getLoopMode==OFF;Secondary;Primary];🔁;false]
    $addButton[musicplayer_shuffle_$env[messageId];$if[$get[statusshuffle];On;Off];$if[$get[statusshuffle];Primary;Secondary];🔀;false]
    $addButton[musicplayer_lyrics_$env[messageId];Lyrics;Secondary;🎶;$or[$env[jsonmusicdata;durationMS]==0;$get[provider]==null]]
    $addButton[musicplayer_lastfm_$env[messageId];Last.FM;Secondary;1413865849307267112;$or[$get[provider]==null]]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume==0]]
    $addButton[null0;$getVolume%;Secondary;🔈;true]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume>=150]]
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume==0;Unmute;Mute];Secondary;🔈;false]
    $addActionRow
    $addButton[musicplayer_seekdown_$env[messageId];-10s;Secondary;⏪;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_seekup_$env[messageId];+10s;Secondary;⏩;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_actionplayer_$env[messageId];$if[$isPaused;Resume;Pause];Secondary;$if[$isPaused;▶️;⏸️];$checkCondition[$env[jsonmusicdata;durationMS]==0]]
    $addActionRow
    $addButton[musicplayer_dynamic_$env[messageId];Dynamic Queue: $if[$get[checkautoplaystatus]!=true;Off;On];$if[$get[checkautoplaystatus]!=true;Secondary;Success];🎼;$checkCondition[$getCache[initclientmusic;musicplayer_message_$env[guildId]_ongoingdynamicmusic]==true]]
    $addButton[musicplayer_247music_$env[messageId];24/7: $if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]!=true;Off;On];Secondary;$if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]!=true;🌇;🌃];false]
    ]
    ;
    $jsonLoad[aradio;$default[$getCache[initclientmusic;radioplayer_data_$env[guildId]_metadata];{}]]
    
    $localFunction[fetmusicmc;
    $author[Streaming Radio;https://cdn.onlineradiobox.com/img/android-chrome-192x192.png;;0]
    $title[$cropText[$env[aradio;title];0;253;...];$env[aradio;url];0]
    $if[$env[toggleInterval];$addField[Session Duration;$if[$advancedTextSplit[$parseDigital[$get[elapsedtime]];:;0]==00;$cropText[$parseDigital[$get[elapsedtime]];3;];$parseDigital[$get[elapsedtime]]]]]
    $thumbnail[$if[$isValidLink[$env[aradio;thumbnail]]==false;$userAvatar[$env[aradio;requestedBy;id];1024];$env[aradio;thumbnail]];0]
    $footer[$userDisplayName[$env[aradio;requestedBy;id]]$if[$get[countVcMembers]>=1;  •  +$get[countVcMembers] more];$userAvatar[$env[aradio;requestedBy;id];1024];0]
    $color[$default[$memberDisplayColor[$env[guildId];$env[aradio;requestedBy;id]];$callFunction[useIcon;color_embed]];0]
    $addActionRow
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume==0;Unmute;Mute];Secondary;🔈;false]
    $addButton[null0;$getVolume%;Secondary;🔈;true]
    $addButton[musicplayer_247music_$env[messageId];24/7: $if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]!=true;Off;On];Secondary;$if[$getCache[initclientmusic;musicplayer_message_$env[guildId]_is247music]!=true;🌇;🌃];false]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume==0]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume>=150]]
    ]
    ]
    
    $if[$env[bypassEdit]==true;
    $try[$interactionUpdate[
        $callLocalFunction[fetmusicmc]
        $if[$getCache[initclientmusic;musicplayer_checkmessage_ytwarm_$env[guildId]]==true;$disableComponents]
    ]]
    ;
    $try[$!editMessage[$env[channelId];$env[messageId];
        $callLocalFunction[fetmusicmc]
        $if[$getCache[initclientmusic;musicplayer_checkmessage_ytwarm_$env[guildId]]==true;$disableComponents]
    ]]
    ]
    $return
    `,
};
