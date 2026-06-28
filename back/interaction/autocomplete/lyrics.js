module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==lyrics;$focusedOptionName==translate]]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];__null__]]
    $jsonLoad[result;$getCache[initclientmusic;system_file-listLyricsLanguage]]
    $jsonLoad[result;$jsonEntries[result]]
    $arrayMap[result;rest;$if[$checkContains[$toLowercase[$env[rest;1]];$toLowercase[$focusedOptionValue]];$return[$env[rest]]];result2]
    $arraySlice[result2;result2;0;24]
    $arrayForEach[result2;per;
    $addChoice[$env[per;1];$env[per;1]]]
    ]
    $if[$env[result2;0]==;$autocomplete]
`
}