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
    $if[$or[$hasMusicNode==false;$if[$hasMusicNode==true;$isPlaying;false]==false];
    $!clearInterval[$env[intervalName]]
    $return
    ]
    $if[$or[$env[messageId]==;$env[channelId]==];
    $leaveVoiceChannel
    $return
    ]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$env[guildId];$env[channelId]];0]]
    $let[changeevery_time;5000]

    $if[$or[$getVar[musicplayer_message;$env[guildId]_attemptseek]==true;$get[elapsedtime]==0;$modulo[$get[elapsedtime];$get[changeevery_time]]==0;$env[bypassRestrict]==true]==false;$return]
    $async[$if[$getVar[musicplayer_message;$env[guildId]_attemptseek]!=;$!deleteVar[musicplayer_message;$env[guildId]_attemptseek]]]
    $async[$if[$getVar[radioplayer_data;$env[guildId]_checkplayer]!=;$!deleteVar[radioplayer_data;$env[guildId]_checkplayer]]]
    $if[$try[$messageExists[$env[channelId];$env[messageId]];false]==false;
    $let[secmid;$sendMessage[$channelID;$callFunction[useCustomMusicMessage;config_errorIntervalMessage];true]]
    $setVar[musicplayer_message;$env[guildId]_channelid;$env[channelId]]
    $setVar[musicplayer_message;$env[guildId]_messageid;$get[secmid]]
    ]

    $if[$getVar[radioplayer_data;$env[guildId]_playerstatus;false]==false;

    $jsonLoad[jsonmusicdata;$env[musicInfo]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[jsonmusicdata;url]]]

    $arrayload[rest;
;$queue[;23;{track.title};
]]

    $let[statusshuffle;$getVar[musicplayer_message;$env[guildId]_isshuffle;false]]

    $let[delayping;$checkCondition[$round[$executionTime;0]>=250]]
    $let[checkdurationms;$if[$hasMusicNode;$if[$isPlaying;$trackInfo[durationMS];0];0]]
    $let[looknextsong;$and[$env[toggleInterval]==true;$env[showNext]==true;$queueLength!=0;$getLoopMode!=TRACK;$get[checkdurationms]!=0]]
    $if[$get[looknextsong];
    $let[requestedBy;$queue[0;1;{track.requestedBy.id}]]
    $let[title;$queue[0;1;{track.title}]]
    $let[url;$queue[0;1;{track.url}]]
    $let[thumbnail;$queue[0;1;{track.thumbnail}]]
    $let[owner;$queue[0;1;{track.author}]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$get[url]]]
    ]
    $let[provider;$env[jsonmedia;type]]
    $try[$!#editMessage[$env[channelId];$env[messageId];
    $if[$get[looknextsong];
    $author[Next Playing;$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$get[title];0;253;...];$get[url];0]
    $thumbnail[$if[$or[$get[thumbnail]==null;$get[thumbnail]==];$userDefaultAvatar[$clientID];$get[thumbnail]]]
    $addField[Owner;\`$get[owner]\`;true;0]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]LIVE;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]$parseDigital[$env[jsonmusicdata;durationMS]]];true;0]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;0]
    $color[$callFunction[useIcon;color_embed];0]
    $thumbnail[$if[$or[$get[thumbnail]==null;$get[thumbnail]==];$userDefaultAvatar[$clientID];$get[thumbnail]];0]
    $footer[$username[$get[requestedBy]];$userAvatar[$get[requestedBy];1024];0]
    ;
    $author[Now Playing;$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$env[jsonmusicdata;title];0;253;...];$env[jsonmusicdata;url];0]
    $if[$and[$get[delayping];$env[toggleInterval]];$description[Bad connection.\nThe current music playing may be sound robotic.;0]]
    $addField[Owner;\`$env[jsonmusicdata;author]\`;true;0]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]LIVE;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]$parseDigital[$env[jsonmusicdata;durationMS]]];true;0]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;0]
    $thumbnail[$if[$or[$env[jsonmusicdata;thumbnail]==null;$env[jsonmusicdata;thumbnail]==];$userDefaultAvatar[$clientID];$env[jsonmusicdata;thumbnail]];0]
    $color[$callFunction[useIcon;color_embed];0]
    $footer[$username[$env[jsonmusicdata;requestedBy;id]];$userAvatar[$env[jsonmusicdata;requestedBy;id];1024];0]
    ]
    $addActionRow
    $addStringSelectMenu[musicplayer_nodequeue_$env[messageId];$cropText[Queue | $djsEval[require("entities").decodeHTML("$replace[$trackInfo[title];";\\\\"]")];0;61;...];$or[$queueLength==0;$getLoopMode==TRACK];1;1]

    $let[countqueue;0]
    $if[$queueLength!=0;
    $arrayForEach[rest;yesnt;
    $addOption[$djsEval[require("entities").decodeHTML("$replace[$cropText[$env[yesnt];0;97;...];";\\\\"]")];;$get[countqueue]]
    $letSum[countqueue;1]
    ]
    ;
    $addOption[null;null;null]
    ]
    $addActionRow
    $addButton[musicplayer_loop_$env[messageId];$toTitleCase[$getLoopMode];$if[$getLoopMode==OFF;Secondary;Primary];🔁;false]
    $addButton[musicplayer_shuffle_$env[messageId];$if[$get[statusshuffle];On;Off];$if[$get[statusshuffle];Primary;Secondary];🔀;false]
    $addButton[musicplayer_lyrics_$env[messageId];Lyrics;Secondary;🎶;$or[$env[jsonmusicdata;durationMS]==0;$get[provider]==null]]
    $addButton[musicplayer_lastfm_$env[messageId];Last.FM;Secondary;1413865849307267112;$or[$get[provider]==null;$get[provider]==applemusic]]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume==0]]
    $addButton[null0;$getVolume%;Secondary;🔈;true]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume==150]]
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume==0;Unmute;Mute];Secondary;🔈;false]
    $addActionRow
    $addButton[musicplayer_seekdown_$env[messageId];-10s;Secondary;⏪;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_seekup_$env[messageId];+10s;Secondary;⏩;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_actionplayer_$env[messageId];$if[$isPaused;Resume;Pause];Secondary;$if[$isPaused;▶️;⏸️];$checkCondition[$env[jsonmusicdata;durationMS]==0]]
    ]
    ]
    ;
    $jsonLoad[aradio;$getVar[radioplayer_data;$guildID_metadata;{}]]
    
    $try[
    $!#editMessage[$env[channelId];$env[messageId];
    $author[Streaming Radio;https://cdn.onlineradiobox.com/img/android-chrome-192x192.png;;0]
    $title[$cropText[$env[aradio;title];0;253;...];$env[aradio;url];0]
    $if[$callFunction[configMusic;interval_message];$addField[Session Duration;$parseDigital[$get[elapsedtime]]]]
    $thumbnail[$if[$or[$env[aradio;thumbnail]==null;$env[aradio;thumbnail]==];$userDefaultAvatar[$clientID];$env[aradio;thumbnail]];0]
    $footer[$username[$env[aradio;requestedBy;id]];$userAvatar[$env[aradio;requestedBy;id];1024];0]
    $color[$callFunction[useIcon;color_embed];0]
    $addActionRow
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume==0;Unmute;Mute];Secondary;🔈;false]
    $addButton[null0;$getVolume%;Secondary;🔈;true]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume==0]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume==150]]
    ]
    ]
    ]
    $return
    `,
};
