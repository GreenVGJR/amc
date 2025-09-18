module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==refreshsearchnoca]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]
    $let[query;$getVar[storecachesearchusersfetch-q;$djsEval[ctx.interaction.message.interaction.id];null]]
    $let[provider;$getVar[storecachesearchusersfetch-p;$djsEval[ctx.interaction.message.interaction.id];null]]

    $onlyIf[$or[$get[query]==null;$get[provider]==null]!=true;$!deferUpdate $!interactionDelete]
    $interactionUpdate[$addContainer[
    $addTextDisplay[-# Query:\n\`$get[query]\`\n-# Provider:\n\`$get[provider]\`\n-# Ping:\n\`Loading\`]
    $addSeparator[Large;true]
    ;aa$randomBytes[2]]
    ]

    $jsonLoad[loadser;$callFunction[searchSomeTrack;$get[query];$get[provider]]]
    $onlyIf[$env[loadser;0]!=;$callFunction[useCustomMusicMessage;config_errorNoResultSearch]]

    $let[currentping;$round[$executionTime;0]]
    $interactionUpdate[
    $arraySlice[loadser;loadser;0;10]
    $arrayReverse[loadser;loadser]
    $addContainer[
    $addTextDisplay[-# Query:\n\`$get[query]\`\n-# Provider:\n\`$get[provider]\`\n-# Ping:\n\`$get[currentping]ms\`]
    $addSeparator[Large;true]
    $arrayForEach[loadser;result;
    $addSection[
    $addTextDisplay[
    > ### $cropText[$replace[$env[result;title];#;\\\\#];0;197;...]
    > $env[result;url]
    > -# $if[$and[$advancedTextSplit[$env[result;duration];:;1]==;$advancedTextSplit[$env[result;duration];:;2]==];$advancedTextSplit[$env[result;duration];:;0];$if[$advancedTextSplit[$env[result;duration];:;0]==00;$advancedTextSplit[$env[result;duration];:;1]:$advancedTextSplit[$env[result;duration];:;2];$env[result;duration]]]
    ]
    $addThumbnail[$if[$or[$env[result;thumbnail]==null;$env[result;thumbnail]==];$userDefaultAvatar[$authorID];$env[result;thumbnail]]]
    ]
    ]
    ;aa$randomBytes[2]]
    ]
    $!deleteVar[storecachesearchusersfetch-q;$djsEval[ctx.interaction.message.interaction.id]]
    $!deleteVar[storecachesearchusersfetch-p;$djsEval[ctx.interaction.message.interaction.id]]
    `
}