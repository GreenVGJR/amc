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
    }
  ],
  code: `
    $if[$hasPlayer[$env[guildId]]==false;
    $!clearInterval[$env[intervalName]]
    $stop
    ]
    $let[elapsedtime;$if[$hasPlayer[$env[guildId]];$playerElapsedTime[$env[guildId]];0]]
    $let[changeevery_time;6000]
    $let[expectsecond;$multi[$second;1000]]

    $if[$or[$getVar[musicplayer_message;$env[guildId]_attemptseek]==true;$get[elapsedtime]==0;$modulo[$get[expectsecond];$get[changeevery_time]]==0;$env[bypassRestrict]==true]==false;$stop]
    $if[$getVar[musicplayer_message;$env[guildId]_attemptseek]!=;$!deleteVar[musicplayer_message;$env[guildId]_attemptseek]]
    $if[$messageExists[$env[channelId];$env[messageId]]==false;
    $let[secmid;$sendMessage[$env[channelId];Seems like the current message wasn't exist. This will be use to continue interval.;true]]
    $setVar[musicplayer_message;$env[guildId]_channelid;$env[channelId]]
    $setVar[musicplayer_message;$env[guildId]_messageid;$get[secmid]]
    $stop
    ]
    $jsonLoad[jsonmusicdata;$env[musicInfo]]
    $jsonLoad[jsonmedia;$callFunction[filterMediaID;$env[jsonmusicdata;0;url]]]
    $let[provider;$env[jsonmedia;type]]

    $jsonLoad[currenttrack;$currentTrackInfo[$env[guildId]]]

    $let[statusshuffle;$getVar[musicplayer_message;$env[guildId]_isshuffle;false]]

    $let[delayping;$checkCondition[$round[$executionTime;0]>=250]]
    $let[checkdurationms;$if[$hasPlayer[$env[guildId]];$env[currenttrack;info;length];0]]
    $jsonLoad[rest;$queue[$env[guildId]]]

    $try[
    $!editMessage[$env[channelId];$env[messageId];
    $if[$and[$env[showNext]==true;$queueLength[$env[guildId]]!=1;$get[checkdurationms]!=0];
    $let[title;$env[rest;tracks;1;trackTitle]]
    $let[url;$env[rest;tracks;1;trackUri]]
    $let[duration;$env[rest;tracks;1;length]]
    $let[owner;$env[rest;tracks;1;trackAuthor]]

    $author[Next Playing;;;0]
    $title[$cropText[$get[title];0;253;...];$get[url];0]
    $addField[Duration;$if[$get[duration]==0;LIVE;$parseDigital[$get[duration]]];true;0]
    $color[$callFunction[useIcon;color_embed];0]
    $author[Now Playing;;;1]
    $title[$cropText[$env[jsonmusicdata;0;title];0;253;...];$env[jsonmusicdata;0;url];1]
    $if[$get[delayping];$description[Bad connection.\nThe current music playing may be sound robotic.;1]]
    $addField[Owner;\`$env[jsonmusicdata;0;author]\`;true;1]
    $addField[Duration;$if[$env[jsonmusicdata;0;durationMS]==0;$parseDigital[$get[elapsedtime]] - LIVE;$parseDigital[$get[elapsedtime]] - $parseDigital[$env[jsonmusicdata;0;durationMS]]];true;1]
    $addField[Songs;$separateNumber[$queueLength;.];true;1]
    $timestamp[;1]
    $thumbnail[$env[jsonmusicdata;0;thumbnail];1]
    $color[$callFunction[useIcon;color_embed];1]
    $footer[$toTitleCase[$if[$get[provider]==null;File;$get[provider]]];$callFunction[useIcon;$get[provider]];1]
    ;
    $author[Now Playing;;;0]
    $title[$cropText[$env[jsonmusicdata;0;title];0;253;...];$env[jsonmusicdata;0;url];0]
    $if[$get[delayping];$description[Bad connection.\nThe current music playing may be sound robotic.;0]]
    $addField[Owner;\`$env[jsonmusicdata;0;author]\`;true;0]
    $addField[Duration;$if[$env[jsonmusicdata;0;durationMS]==0;$parseDigital[$get[elapsedtime]] - LIVE;$parseDigital[$get[elapsedtime]] - $parseDigital[$env[jsonmusicdata;0;durationMS]]];true;0]
    $addField[Songs;$separateNumber[$queueLength;.];true;0]
    $timestamp[;0]
    $thumbnail[$env[jsonmusicdata;0;thumbnail];0]
    $color[$callFunction[useIcon;color_embed];0]
    $footer[$toTitleCase[$if[$get[provider]==null;File;$get[provider]]];$callFunction[useIcon;$get[provider]];0]
    ]
    $addActionRow
    $addButton[musicplayer_loop_$env[messageId];Loop: $toTitleCase[$getVar[musicplayer_message;$env[guildId]_isloop;none]];$if[$getVar[musicplayer_message;$env[guildId]_isloop;none]==none;Secondary;Primary];🔁;false]
    $addActionRow
    $addButton[musicplayer_volumedown_$env[messageId];-10%;Secondary;🔉;$checkCondition[$getVolume[$env[guildId]]==0]]
    $addButton[null0;Volume: $getVolume[$env[guildId]]%;Secondary;;true]
    $addButton[musicplayer_volumeup_$env[messageId];+10%;Secondary;🔉;$checkCondition[$getVolume[$env[guildId]]==150]]
    $addButton[musicplayer_volumemute_$env[messageId];$if[$getVolume[$env[guildId]]==0;Unmute;Mute];Secondary;🔈;false]
    $addActionRow
    $addButton[musicplayer_actionplayer_$env[messageId];$if[$isPaused[$env[guildId]];Resume;Pause];Secondary;$if[$isPaused[$env[guildId]];▶️;⏸️];$checkCondition[$env[jsonmusicdata;0;durationMS]==0]]
    $addButton[musicplayer_stopplayer_$env[messageId];Stop;Danger;⏹️;false]
    $addButton[musicplayer_skipplayer_$env[messageId];Skip;Primary;⏭️;$checkCondition[$skipExists[$env[guildId]]==false]]
    $addButton[musicplayer_lyrics_$env[messageId];Lyrics;Primary;🎶;$or[$env[jsonmusicdata;0;durationMS]==0;$get[provider]==null]]
    ]
    ]
    `,
};
