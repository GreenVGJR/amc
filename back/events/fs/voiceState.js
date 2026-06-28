module.exports = {
    type: "voiceStateUpdate",
    code: `
    $async[
    $let[ttun;ongoingtimeoutmusicstate-$guildID]
    $let[ttmc;$try[$isPlaying;]]
    $if[$get[ttmc]==true;
    $arrayLoad[checkifnotuser;,;$channelVoiceMemberIDs[$voiceID[$guildID;$clientID];,]]
    $if[$arraySome[checkifnotuser;finduser;$checkCondition[$isBot[$env[finduser]]!=true]]==false;
        $if[$try[$trackInfo[durationMS]]!=0;$!pauseTrack]
        $setTimeout[$if[$and[$getCache[initclientmusic;musicplayer_message_$guildID_is247music]!=true;$try[$isPlaying;]!=];$!leaveVoiceChannel];20s;$get[ttun]]
        ;
        $!clearTimeout[$get[ttun]]
        $if[$try[$trackInfo[durationMS]]!=0;
        $!resumeTrack
        ]
    ]]]
    `
}