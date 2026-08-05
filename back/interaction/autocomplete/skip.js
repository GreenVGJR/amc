module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==skip;$focusedOptionName==position]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];-1]]
    $onlyIf[$voiceID[$guildID;$authorID]!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];-1]]
    $onlyIf[$callFunction[checkRadioPlayer;$guildID]!=true;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptRadioPlayer];-1]]
    
    $let[nodes;$if[$hasMusicNode;$isPlaying;false]]
    $onlyIf[$get[nodes];$autocomplete]

    $jsonLoad[rest;$try[$djsEval[JSON.stringify(require("discord-player").useQueue(ctx.interaction.guild).tracks.data)];{}]]
    $if[$or[$focusedOptionValue==;$isNumber[$focusedOptionValue]];
    $let[value;$if[$sub[$focusedOptionValue;1]>=0;$sub[$focusedOptionValue;1];0]]
    $arraySlice[rest;rest;$get[value];$sum[$get[value];24]]
    $if[$arrayLength[rest]==0;
    $addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchSkipTrack];-1]
    ;
    $let[counting;$get[value]]
    $arrayForEach[rest;rest2;
        $let[tempstoretext;$env[rest2;title]]
        $addChoice[$cropText[$sum[$get[counting];1] - $get[tempstoretext];0;100;];$sum[$get[counting];1]]
        $letSum[counting;1]
    ]]
    ;
    $arrayMap[rest;rest2;$if[$checkContains[$toLowerCase[$env[rest2;author] $env[rest2;title]];$toLowerCase[$focusedOptionValue]];$return[$env[rest2]]];rest3]
    $if[$arrayLength[rest]==0;
    $addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchSkipTrack];-1]
    ;
    $arrayForEach[rest3;rest4;
        $let[tempstoretext;$env[rest4;title]]
        $let[lookIndex;$arrayFindIndex[rest;checkrest;$checkCondition[$env[checkrest;url]==$env[rest4;url]]]]
        $addChoice[$cropText[$sum[$get[lookIndex];1] - $get[tempstoretext];0;100;];$sum[$get[lookIndex];1]]
    ]]]
`
}