module.exports = {
    name: "dynamicQueue",
    code: `
    $if[$checkCondition[$try[$isPlaying;false]==true]==false;$return]
    $setCache[musicplayer_message_$guildID_ongoingdynamicmusic;true]
    $jsonLoad[mytlsbl;$getCache[musicplayer_message_$guildID_isdynamicmusic]]
    $jsonLoad[mytlsbr;$env[mytlsbl;tracks]]
    $jsonLoad[mytlsbq;$callFunction[filterMediaID;$try[$djsEval[require("discord-player").useQueue(ctx.client.guilds.cache.get("$guildID")).tracks.data?.[0\\]?.url];]]]
    $let[lookmytlsbq;$arrayFindIndex[mytlsbr;pvk;$checkCondition[$env[pvk]==$env[mytlsbq;id]]]]
    $if[$get[lookmytlsbq]!=-1;
    $arraySlice[mytlsbr;mytlsbr;$get[lookmytlsbq]]
    $!jsonSet[mytlsbl;tracks;$env[mytlsbr]]
    ;
    $!jsonSet[mytlsbl;tracks;[\\]]
    ]
    $setCache[musicplayer_message_$guildID_isdynamicmusic;$env[mytlsbl]]
    $let[countQueueMLength;$queueLength]
    $if[$get[countQueueMLength]<10;
    $let[trkkgl;$trackInfo[url]]
    $let[countQueueMLengthSub;$sub[20;$get[countQueueMLength]]]
    $jsonLoad[filtymcr;$callFunction[filterMediaID;$get[trkkgl]]]
    $jsonLoad[startlsf;$callFunction[hitsTracks;$env[filtymcr;type];$get[trkkgl];$get[countQueueMLengthSub]]]
    $arrayForEach[startlsf;startlsfd;

    $let[llgntvdc;$env[startlsfd;url]]
    $jsonLoad[lljntvdc;$callFunction[filterMediaID;$get[llgntvdc]]]
        
        $let[lockprovyt;youtubeVideo]
        $let[found;false]
        $let[attemptry;0]
        $let[donetry;5]

        $while[$and[$get[attemptry]<=$get[donetry];$get[found]==false];
        $jsonLoad[llgntmpms;$getCache[musicplayer_message_$guildID_isdynamicmusic]]
        $if[$and[$queueLength<20;$default[$env[llgntmpms;status];false]==true];
        $try[
        $if[$env[lljntvdc;type]==youtube;
        $playTrack[$voiceID[$guildID;$clientID];$trimLines[$get[llgntvdc]];$get[lockprovyt]]
        ;
        $if[$or[$env[lljntvdc;type]==null;$env[lljntvdc;type]==applemusic;$env[lljntvdc;type]==soundcloud;$env[lljntvdc;type]==spotify;$env[lljntvdc;type]==youtubeplaylist]!=true;
        $playTrack[$voiceID[$guildID;$clientID];$trimLines[$get[llgntvdc]];$env[lljntvdc;type]]
        ;
        $playTrack[$voiceID[$guildID;$clientID];$trimLines[$get[llgntvdc]];auto]
        ]]
        $jsonLoad[tnvisk;$default[$env[llgntmpms;tracks];[\\]]]
        $jsonLoad[tnldnb;$callFunction[filterMediaID;$trimLines[$get[llgntvdc]]]]
        $arrayPush[tnvisk;$env[tnldnb;id]]
        $!jsonSet[llgntmpms;tracks;$jsonStringify[tnvisk]]
        $setCache[musicplayer_message_$guildID_isdynamicmusic;$jsonStringify[llgntmpms]]
        $let[found;true]
        ;
        $if[$env[lljntvdc;type]==youtube;
        $if[$get[attemptry]==2;$let[lockprovyt;youtube]]
        ]
        $letSum[attemptry;1]
        ;causeplayerror]
        ;
        $break
        $letSum[attemptry;1]
        ]]
    ]
    ]
    $deleteCache[musicplayer_message_$guildID_ongoingdynamicmusic]
    $if[$getCache[musicplayer_message_$guildID_waitinterval]==true;
    $callFunction[updateCurrentMusicPlayer;false]
    ]
    `
}