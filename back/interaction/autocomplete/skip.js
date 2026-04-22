module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==skip;$focusedOptionName==position]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];-1]]
    $onlyIf[$voiceID[$guildID;$authorID]!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];-1]]
    $onlyIf[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptRadioPlayer];-1]]
    
    $let[nodes;$if[$hasMusicNode;$isPlaying;false]]
    $onlyIf[$get[nodes];$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];-1]]

    $jsonLoad[rest;$try[$djsEval[JSON.stringify(require("discord-player").useQueue(ctx.interaction.guild).tracks.data)];{}]]
    $arrayMap[rest;rest2;$if[$env[rest2;id]!=;$return[$env[rest2]]];rest]
    $if[$or[$focusedOptionValue==;$isNumber[$focusedOptionValue]];
    $let[value;$if[$sub[$focusedOptionValue;1]>=0;$sub[$focusedOptionValue;1];0]]
    $arraySlice[rest;rest;$get[value];$sum[$get[value];25]]
    $if[$arrayLength[rest]==0;
    $addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchSkipTrack];-1]
    ;
    $let[counting;$get[value]]
    $arrayForEach[rest;rest2;
        $addChoice[[$cropText[$if[$env[rest2;durationMS]==0;LIVE;$parseDigital[$env[rest2;durationMS]]]\\] $env[rest2;title];0;100;];$sum[$get[counting];1]]
        $letSum[counting;1]
    ]]
    ;
    $arrayMap[rest;rest2;$if[$checkContains[$toLowerCase[$env[rest2;author] $env[rest2;title]];$toLowerCase[$focusedOptionValue]];$return[$env[rest2]]];rest3]
    $if[$arrayLength[rest]==0;
    $addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchSkipTrack];-1]
    ;
    $arrayForEach[rest3;rest4;
        $let[lookIndex;$arrayFindIndex[rest;checkrest;$checkCondition[$env[checkrest;url]==$env[rest4;url]]]]
        $addChoice[[$cropText[$if[$env[rest4;durationMS]==0;LIVE;$parseDigital[$env[rest4;durationMS]]]\\] $env[rest4;title];0;100;];$sum[$get[lookIndex];1]]
    ]]]
`
}