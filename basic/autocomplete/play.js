module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: [
        'autocomplete'
    ],
    code: `
    $onlyIf[$and[$applicationCommandName==play;$focusedOptionName==query]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];__null__]]
    $onlyIf[$voiceID[$guildID;$authorID]!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];__null1__]]
    $onlyIf[$or[$focusedOptionValue!=;$getMemberVar[cachesearchistory_user_autocomplete;$authorID]!=]]

    $if[$isValidLink[$focusedOptionValue]==false;
    $jsonLoad[testing;$callFunction[fastSearchTrack;$if[$focusedOptionValue!=;$focusedOptionValue;$getMemberVar[cachesearchistory_user_autocomplete;$authorID]]]]
    $async[$if[$focusedOptionValue!=;$setMemberVar[cachesearchistory_user_autocomplete;$focusedOptionValue;$authorID]]]
    $let[count;-1]
    $if[$env[testing;results;0]==;
    $addChoice[$if[$focusedOptionValue==;$getMemberVar[cachesearchistory_user_autocomplete;$authorID];$focusedOptionValue];$if[$focusedOptionValue==;$getMemberVar[cachesearchistory_user_autocomplete;$authorID];$focusedOptionValue]]
    ;
    $while[$charCount[$env[testing;results;$sum[$get[count];1]]]!=0;
    $addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;$sum[$get[count];1]];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;$sum[$get[count];1]];";\\\\"]\\\`)]]
    $letSum[count;1]
    ]
    ]
    ]
    `
}