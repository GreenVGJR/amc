module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["autocomplete"],
    code: `
    $onlyIf[$and[$applicationCommandName==search;$focusedOptionName==query]]
    $onlyIf[$trim[$focusedOptionValue]!=;$autocomplete]
    $if[$charCount[$focusedOptionValue]<=100;
    $jsonLoad[testing;$callFunction[fastSearchTrack;$focusedOptionValue]]
    $if[$env[testing;results;0]!=;$addChoice[$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;0];";\\\\"]")];$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;0];";\\\\"]")]]]
    $if[$env[testing;results;1]!=;$addChoice[$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;1];";\\\\"]")];$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;1];";\\\\"]")]]]
    $if[$env[testing;results;2]!=;$addChoice[$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;2];";\\\\"]")];$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;2];";\\\\"]")]]]
    $if[$env[testing;results;3]!=;$addChoice[$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;3];";\\\\"]")];$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;3];";\\\\"]")]]]
    $if[$env[testing;results;4]!=;$addChoice[$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;4];";\\\\"]")];$djsEval[require("entities").decodeHTML("$replace[$env[testing;results;4];";\\\\"]")]]]
    ]
    $async[
    $if[$and[$callFunction[configMusic;preFetch_Search]==true;$option[provider]!=];
    $let[check;$getVar[cachesearch_global-query;$deflate[$option[provider]$toLowercase[$option[query]];hex];null]]
    $if[$get[check]==null;$let[stores;$callFunction[searchSomeTrack;$option[query];$option[provider]]]]
    ]]
    $autocomplete
    `
}