module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==play;$focusedOptionName==query]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];__null__]]
    $onlyIf[$voiceID[$guildID;$authorID]!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchJoinVC];__null1__]]
    $onlyIf[$getCache[radioplayer_data_$guildID_playerstatus]!=true;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptRadioPlayer];__null2__]]
    $onlyIf[$or[$focusedOptionValue!=;$getCache[cachesearchistory_user_autocomplete_$authorID]!=];$addChoice[$callFunction[useCustomMusicMessage;config_infoSearchFirst];__infointer-$authorID__]]
    $if[$isValidLink[$focusedOptionValue]==false;
    $jsonLoad[testing;$callFunction[fastSearchTrack;$if[$focusedOptionValue!=;$focusedOptionValue;$getCache[cachesearchistory_user_autocomplete_$authorID]]]]
    $async[$if[$focusedOptionValue!=;$setCache[cachesearchistory_user_autocomplete_$authorID;"$focusedOptionValue"]]]
    $if[$env[testing;results;0]==;
    $addChoice[$if[$focusedOptionValue==;$getCache[cachesearchistory_user_autocomplete_$authorID];$focusedOptionValue];$if[$focusedOptionValue==;$getCache[cachesearchistory_user_autocomplete_$authorID];$focusedOptionValue]]
    ;
    $if[$env[testing;results;0]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;0];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;0];";\\\\"]\\\`)]]]
    $if[$env[testing;results;1]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;1];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;1];";\\\\"]\\\`)]]]
    $if[$env[testing;results;2]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;2];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;2];";\\\\"]\\\`)]]]
    $if[$env[testing;results;3]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;3];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;3];";\\\\"]\\\`)]]]
    $if[$env[testing;results;4]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;4];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;4];";\\\\"]\\\`)]]]
    $if[$env[testing;results;5]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;5];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;5];";\\\\"]\\\`)]]]
    $if[$env[testing;results;6]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;6];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;6];";\\\\"]\\\`)]]]
    $if[$env[testing;results;7]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;7];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;7];";\\\\"]\\\`)]]]
    $if[$env[testing;results;8]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;8];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;8];";\\\\"]\\\`)]]]
    $if[$env[testing;results;9]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;9];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;9];";\\\\"]\\\`)]]]
    $if[$env[testing;results;10]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;10];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;10];";\\\\"]\\\`)]]]
    $if[$env[testing;results;11]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;11];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;11];";\\\\"]\\\`)]]]
    $if[$env[testing;results;12]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;12];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;12];";\\\\"]\\\`)]]]
    $if[$env[testing;results;13]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;13];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;13];";\\\\"]\\\`)]]]
    $if[$env[testing;results;14]!=;$addChoice[$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;14];";\\\\"]\\\`)];$djsEval[require("entities").decodeHTML(\\\`$replace[$env[testing;results;14];";\\\\"]\\\`)]]]
    ]
    ;
    $onlyIf[$charCount[$focusedOptionValue]<=100]
    $if[$callFunction[configMusic;fetchMusicTitle_autocomplete];
    $let[fetch;$trim[$callFunction[fetchTitleTrack;$focusedOptionValue]]]
    $if[$get[fetch]==;
    $addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearchFetchTitle];$focusedOptionValue]
    ;
    $addChoice[$cropText[$get[fetch];0;100];$focusedOptionValue]
    ]
    ;
    $addChoice[$cropText[$focusedOptionValue;0;100];$focusedOptionValue]
    ]
    ]
    `
}