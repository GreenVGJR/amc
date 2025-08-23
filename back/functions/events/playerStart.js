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
        name: "musicInfo", // object
        description: "Object data",
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
        name: "toggleInterval",
        description: "For interval message",
        required: false
    }
  ],
  code: `
    $if[$or[$hasMusicNode==false;$if[$hasMusicNode==true;$isPlaying;false]==false];
    $!clearInterval[$env[intervalName]]
    $stop
    ]
    $if[$or[$env[messageId]==;$env[channelId]==];
    $!stopTrack
    $stop
    ]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$env[guildId];$env[channelId]];0]]
    $let[changeevery_time;8000]
    $let[expectsecond;$multi[$second;1000]]

    $if[$or[$getVar[musicplayer_message;$env[guildId]_attemptseek]==true;$get[elapsedtime]==0;$modulo[$get[expectsecond];$get[changeevery_time]]==0;$env[bypassRestrict]==true]==false;$stop]
    $if[$getVar[musicplayer_message;$env[guildId]_attemptseek]!=;$!deleteVar[musicplayer_message;$env[guildId]_attemptseek]]
    $if[$getVar[radioplayer_data;$env[guildId]_checkplayer]!=;$!deleteVar[radioplayer_data;$env[guildId]_checkplayer]]
    $if[$try[$messageExists[$env[channelId];$env[messageId]];false]==false;
    $let[secmid;$sendMessage[$env[channelId];$callFunction[useCustomMusicMessage;config_errorIntervalMessage];true]]
    $setVar[musicplayer_message;$env[guildId]_channelid;$env[channelId]]
    $setVar[musicplayer_message;$env[guildId]_messageid;$get[secmid]]
    $stop
    ]

    $if[$getVar[radioplayer_data;$env[guildId]_playerstatus;false]==false;

    $jsonLoad[jsonmusicdata;$env[musicInfo]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[jsonmusicdata;url]]]
    $let[provider;$env[jsonmedia;type]]

    $arrayload[rest;
;$queue[;23;{track.title};
]]

    $let[statusshuffle;$getVar[musicplayer_message;$env[guildId]_isshuffle;false]]

    $let[delayping;$checkCondition[$round[$executionTime;0]>=250]]
    $let[checkdurationms;$if[$hasMusicNode;$if[$isPlaying;$trackInfo[durationMS];0];0]]

    $try[
    $!#editMessage[$env[channelId];$env[messageId];
    $if[$and[$env[showNext]==true;$queueLength!=0;$getLoopMode!=TRACK;$get[checkdurationms]!=0];
    $let[requestedBy;$queue[0;1;{track.requestedBy.id}]]
    $let[title;$queue[0;1;{track.title}]]
    $let[url;$queue[0;1;{track.url}]]
    $let[duration;$queue[0;1;{track.durationMS}]]
    $let[thumbnail;$queue[0;1;{track.thumbnail}]]
    $let[owner;$queue[0;1;{track.author}]]

    $author[Next Playing;$userAvatar[$get[requestedBy];512];;0]
    $title[$cropText[$get[title];0;253;...];$get[url];0]
    $thumbnail[$if[$or[$get[thumbnail]==null;$get[thumbnail]==];$userDefaultAvatar[$clientID];$get[thumbnail]]]
    $addField[Duration;$if[$get[duration]==0;LIVE;$parseDigital[$get[duration]]];true;0]
    $color[$callFunction[useIcon;color_embed];0]
    $author[Now Playing;$callFunction[useIcon;$get[provider]];;1]
    $title[$cropText[$env[jsonmusicdata;title];0;253;...];$env[jsonmusicdata;url];1]
    $if[$and[$get[delayping];$env[toggleInterval]];$description[Bad connection.\nThe current music playing may be sound robotic.;1]]
    $addField[Requested By;<@$env[jsonmusicdata;requestedBy;id]>;false;1]
    $addField[Owner;\`$env[jsonmusicdata;author]\`;true;1]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]LIVE;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]$parseDigital[$env[jsonmusicdata;durationMS]]];true;1]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;1]
    $thumbnail[$if[$or[$env[jsonmusicdata;thumbnail]==null;$env[jsonmusicdata;thumbnail]==];$userDefaultAvatar[$clientID];$env[jsonmusicdata;thumbnail]];1]
    $color[$callFunction[useIcon;color_embed];1]
    ;
    $author[Now Playing;$callFunction[useIcon;$get[provider]];;0]
    $title[$cropText[$env[jsonmusicdata;title];0;253;...];$env[jsonmusicdata;url];0]
    $if[$and[$get[delayping];$env[toggleInterval]];$description[Bad connection.\nThe current music playing may be sound robotic.;0]]
    $addField[Requested By;<@$env[jsonmusicdata;requestedBy;id]>;false;0]
    $addField[Owner;\`$env[jsonmusicdata;author]\`;true;0]
    $addField[Duration;$if[$env[jsonmusicdata;durationMS]==0;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]LIVE;$if[$env[toggleInterval];$parseDigital[$get[elapsedtime]] - ]$parseDigital[$env[jsonmusicdata;durationMS]]];true;0]
    $addField[Songs;$separateNumber[$sum[$queueLength;1];.];true;0]
    $thumbnail[$if[$or[$env[jsonmusicdata;thumbnail]==null;$env[jsonmusicdata;thumbnail]==];$userDefaultAvatar[$clientID];$env[jsonmusicdata;thumbnail]];0]
    $color[$callFunction[useIcon;color_embed];0]
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
    $addButton[musicplayer_loop_$env[messageId];Loop: $toTitleCase[$getLoopMode];$if[$getLoopMode==OFF;Secondary;Primary];🔁;false]
    $addButton[musicplayer_shuffle_$env[messageId];Shuffle: $if[$get[statusshuffle];On;Off];$if[$get[statusshuffle];Primary;Secondary];🔀;false]
    $addButton[musicplayer_lyrics_$env[messageId];Lyrics;Secondary;🎶;$or[$env[jsonmusicdata;durationMS]==0;$get[provider]==null]]    
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume==0]]
    $addButton[null0;$getVolume%;Secondary;🔈;true]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume==150]]
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume==0;Unmute;Mute];Secondary;🔈;false]
    $addActionRow
    $addButton[musicplayer_seekdown_$env[messageId];-10s;Primary;⏪;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_seekup_$env[messageId];+10s;Primary;⏩;$or[$env[jsonmusicdata;durationMS]==0;$isPaused]]
    $addButton[musicplayer_actionplayer_$env[messageId];$if[$isPaused;Resume;Pause];Secondary;$if[$isPaused;▶️;⏸️];$checkCondition[$env[jsonmusicdata;durationMS]==0]]
    ]
    ]
    ;
    $jsonLoad[aradio;$getVar[radioplayer_data;$guildID_metadata;{}]]
    
    $try[
    $!#editMessage[$env[channelId];$env[messageId];
    $author[Streaming Radio;;;0]
    $title[$cropText[$env[aradio;title];0;253;...];$env[aradio;url];0]
    $if[$callFunction[configMusic;interval_message];
    $addField[Session Duration;$parseDigital[$get[elapsedtime]]]
    ]
    $thumbnail[$if[$or[$env[aradio;thumbnail]==null;$env[aradio;thumbnail]==];$userDefaultAvatar[$clientID];$env[aradio;thumbnail]];0]
    $color[$callFunction[useIcon;color_embed];0]
    $timestamp
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
    `,
};
