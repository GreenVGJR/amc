module.exports = [{
    type: "playerTrigger",
    code: `
    $let[cachevid;$voiceID[$guildID;$clientID]]
    $setCache[musicplayer_message_$guildID_voiceid;"$get[cachevid]"]
    $if[$and[$default[$getCache[radioplayer_data_$guildID_playerstatus];false]==false;$callFunction[configMusic;autodelete_nextmessage]];
    $if[$env[reason]!=filters;
    $wait[500]
    $onlyIf[$or[$hasMusicNode==false;$if[$hasMusicNode==true;$isPlaying;false]==false]!=true;]
    $async[$!deleteMessage[$getCache[musicplayer_message_$guildID_channelid];$getCache[musicplayer_message_$guildID_messageid]]]
    $setCache[musicplayer_message_$guildID_channelid;"$channelID"]
    $setCache[musicplayer_message_$guildID_messageid;"$sendMessage[$channelID;_ _;true]"]
    ]]

    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $let[a;$callFunction[musicVirtualDuration;$guildID;$get[cid];$if[$env[reason]!=filters;0]]]
    $let[ytwarmc;$getCache[musicplayer_checkmessage_ytwarm_$guildID]]

    $if[$get[ytwarmc]==pending;
    $setCache[musicplayer_checkmessage_ytwarm_$guildID;true]
    ]

    $c[Dynamic Queue]
    $async[
    $if[$and[$env[reason]!=filters;$getCache[radioplayer_data_$env[guildId]_playerstatus]!=true;$callFunction[checkAutoplayStatus]==true;$get[ytwarmc]!=true];
    $callFunction[dynamicQueue]
    ]]

    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];false;intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]

    $c[Preload Lyrics Track]
    $if[$and[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$callFunction[configMusic;preloadLyricsPlayer]==true];
    $async[
        $let[md5urltk;$md5[$trackInfo[url]]]
        $let[kkvnm;$if[$checkContains[$toLowercase[$toCamelCase[$trackInfo[title]]];$toLowercase[$toCamelCase[$trim[$advancedTextSplit[$trackInfo[author];-;0]]]]]==false;$trim[$advancedTextSplit[$trackInfo[author];-;0]] - $advancedTextSplit[$trackInfo[title];(;0];$advancedTextSplit[$trackInfo[title];(;0]]]
        $let[lrkggn;$getCache[musicplayer_cache-lyrics-$get[md5urltk]]]
        $if[$get[lrkggn]==;
        $setCache[musicplayer_cache-lyrics-$get[md5urltk];undefined]
        $jsonLoad[rrmgv;$callFunction[getLyricsTrack;$get[kkvnm];;false;false]]
        $if[$env[rrmgv;results]==;
        $setCache[musicplayer_cache-lyrics-$get[md5urltk];"null"]
        ;
        $setCache[musicplayer_cache-lyrics-$get[md5urltk];$jsonStringify[rrmgv]]
        ]]
    ]]

    $c[Preload Last.FM Info]
    $if[$and[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$callFunction[configMusic;preloadLastFmPlayer]==true];
    $async[
        $let[kkcmr;$trim[$advancedTextSplit[$trackInfo[author];- Topic;0]]]
        $let[kkcmb;$md5[$get[kkcmr]]]
        $let[lrkggl;$getCache[musicplayer_cache-lastfm-$get[kkcmb]]]
        $if[$get[lrkggl]==;
        $setCache[musicplayer_cache-lastfm-$get[kkcmb];undefined]
        $let[knvmm;$callFunction[discoverArtistLastFm;$get[kkcmr];false]]
        $if[$or[$get[knvmm]==null;$get[knvmm]==];
        $setCache[musicplayer_cache-lastfm-$get[kkcmb];"null"]
        ]]
    ]]

    $c[Status VC]
    $async[
    $if[$and[$env[reason]!=filters;$callFunction[configMusic;statusvc_message];$get[ytwarmc]!=true];
    $if[$getCache[radioplayer_data_$env[guildId]_playerstatus]!=true;
    $let[mm;$callFunction[channelStatus;$get[cachevid];🎶 [$if[$env[track;durationMS]==0;LIVE;$if[$advancedTextSplit[$parseDigital[$env[track;durationMS]];:;0]==00;$cropText[$parseDigital[$env[track;durationMS]];3;];$parseDigital[$env[track;durationMS]]]]\\] $env[track;title]]]
    ;
    $jsonLoad[aradio;$default[$getCache[radioplayer_data_$guildID_metadata];{}]]
    $let[mm;$callFunction[channelStatus;$get[cachevid];📻 $env[aradio;title]]]
    ]]]

    $if[$callFunction[configMusic;interval_message];
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    $setInterval[
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $if[$getCache[musicplayer_message_$guildID_waitinterval]!=false;
    $setCache[musicplayer_message_$guildID_waitinterval;false]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$env[track];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$env[track;durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]
    $setCache[musicplayer_message_$guildID_waitinterval;true]
    ]

    ;$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerPause",
    code: `
    $wait[1]
    $onlyIf[$try[$queueLength;-1]!=-1]
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $if[$callFunction[configMusic;interval_message]==true;
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    $callFunction[updateCurrentMusicPlayer;false]
    `
},
{
    type: "playerResume",
    code: `
    $onlyIf[$try[$isPlaying;false]]

    $callFunction[updateCurrentMusicPlayer;false]

    $if[$callFunction[configMusic;interval_message];
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]

    $jsonLoad[testmessage;{}]
    $!jsonSet[testmessage;id;$trackInfo[id]]
    $!jsonSet[testmessage;title;$trackInfo[title]]
    $!jsonSet[testmessage;author;$trackInfo[author]]
    $!jsonSet[testmessage;url;$trackInfo[url]]
    $!jsonSet[testmessage;thumbnail;$trackInfo[thumbnail]]
    $!jsonSet[testmessage;duration;$trackInfo[duration]]
    $!jsonSet[testmessage;durationMS;"$trackInfo[durationMS]"]
    $if[$or[$trackInfo[requestedBy;id]==;$trackInfo[requestedBy;id]==null];
    $!jsonSet[testmessage;requestedBy;null]
    ;
    $!jsonSet[testmessage;requestedBy;{}]
    $!jsonSet[testmessage;requestedBy;id;"$trackInfo[requestedBy;id]"]
    ]
    
    $let[interval_time;1000]
    $let[nextmessage_time;16000]

    $setInterval[
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]

    $let[calculatetime;$sum[$callFunction[musicVirtualDuration;$guildID;$get[cid]];$get[interval_time]]]
    $let[elapsedtime;$if[$hasMusicNode;$callFunction[musicVirtualDuration;$guildID;$get[cid];$get[calculatetime]];0]]
    $if[$getCache[musicplayer_message_$guildID_waitinterval]!=false;
    $setCache[musicplayer_message_$guildID_waitinterval;false]
    $callFunction[musicPlayerMessage;$get[cid];$get[mid];$jsonStringify[testmessage];$checkCondition[$sum[$get[elapsedtime];$get[nextmessage_time]]>=$trackInfo[durationMS]];intervalmusicmessage_$guildID_$get[cid];$guildID;;$callFunction[configMusic;interval_message]]
    $setCache[musicplayer_message_$guildID_waitinterval;true]
    ]

    ;$get[interval_time];intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
},
{
    type: "playerFinish",
    code: `
    $let[cid;$getCache[musicplayer_message_$guildID_channelid]]
    $let[mid;$getCache[musicplayer_message_$guildID_messageid]]
    $if[$callFunction[configMusic;interval_message]==true;
    $deleteCache[musicplayer_message_$guildID_waitinterval]
    $!clearInterval[intervalmusicmessage_$guildID_$get[cid]]
    ]
    `
}]