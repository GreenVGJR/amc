module.exports = {
    type: "voiceStateUpdate",
    code: `
    $async[
    $let[ttun;ongoingtimeoutmusicstate-$guildID]
    $let[ttmc;$try[$isPlaying;]]
    $if[$get[ttmc]==true;
    $arrayLoad[checkifnotuser;,;$channelVoiceMemberIDs[$voiceID[$guildID;$clientID];,]]
    $if[$arraySome[checkifnotuser;finduser;$checkCondition[$isBot[$env[finduser]]!=true]]==false;
        $!pauseTrack
        $if[$getCache[musicplayer_message_$guildID_is247music]!=true;
        $setTimeout[$if[$try[$isPlaying;]!=;$!leaveVoiceChannel];20s;$get[ttun]]
        ]
        ;
        $!clearTimeout[$get[ttun]]
        $!resumeTrack
    ]]]
    `
}