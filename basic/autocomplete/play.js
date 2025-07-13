module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: [
        'autocomplete'
    ],
    code: `
    $onlyIf[$and[$applicationCommandName==play;$focusedOptionName==query]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];__null__]]
    $onlyIf[$voiceID[$guildID;$authorID]!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];__null1__]]
    $onlyIf[$or[$focusedOptionValue!=;$getVar[cachesearchistory_user_autocomplete;$authorID]!=]]

    $if[$isValidLink[$focusedOptionValue]==false;
    $jsonLoad[testing;$callFunction[fastSearchTrack;$if[$focusedOptionValue!=;$focusedOptionValue;$getVar[cachesearchistory_user_autocomplete;$authorID]]]]
    $if[$focusedOptionValue!=;$setVar[cachesearchistory_user_autocomplete;$authorID;$focusedOptionValue]]
    $let[count;-1]
    $if[$env[testing;results;0]==;
    $addChoice[$if[$focusedOptionValue==;$getVar[cachesearchistory_user_autocomplete;$authorID];$focusedOptionValue];$if[$focusedOptionValue==;$getVar[cachesearchistory_user_autocomplete;$authorID];$focusedOptionValue]]
    ;
    $while[$charCount[$env[testing;results;$sum[$get[count];1]]]!=0;
    $addChoice[$env[testing;results;$sum[$get[count];1]];$env[testing;results;$sum[$get[count];1]]]
    $letSum[count;1]
    ]
    ]
    ]
    `
}