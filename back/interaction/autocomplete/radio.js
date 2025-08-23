module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==radio;$focusedOptionName==country];]
    $onlyIf[$guildID!=;$addChoice[$callFunction[useCustomMusicMessage;config_errorAttemptSearch];__null__]]
    $onlyIf[$charCount[$focusedOptionValue]<=100;$autocomplete]
    $jsonLoad[result;$readFile[./back/listRadioCountry.json]]
    $arrayMap[result;rest;$if[$checkContains[$toLowercase[$env[rest]];$toLowercase[$focusedOptionValue]];$return[$env[rest]]];result2]
    $arraySlice[result2;result2;0;24]
    $arrayForEach[result2;per;
    $addChoice[$env[per;0];$env[per;0]]]
    ]
    $if[$env[result2;0]==;$autocomplete]
`
}