module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$advancedTextSplit[$customID;_;0]==refreshsearchnoca]
    $onlyIf[$advancedTextSplit[$customID;_;1]==$authorID]
    $let[query;$getCache[storecachesearchusersfetch-q_$djsEval[ctx.interaction.message.interaction.id]]]
    $let[provider;$getCache[storecachesearchusersfetch-p_$djsEval[ctx.interaction.message.interaction.id]]]

    $onlyIf[$or[$get[query]==;$get[provider]==]!=true;$!deferUpdate $!interactionDelete]
    $let[fsearch;false]
    $async[
    $let[a;$callFunction[searchSomeTrack;$get[query];$get[provider]]]
    $let[currentping;$round[$executionTime;0]]
    $jsonLoad[loadser;$get[a]]
    $if[$env[loadser;0]==;$let[fsearch;null];$let[fsearch;true]]
    ]
    $interactionUpdate[$addTextDisplay[_ _]]

    $loop[-1;
    $if[$get[fsearch]!=false;$break]
    $wait[5]
    ]

    $if[$get[fsearch]==null;
    $interactionReply[$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoResultSearch]]]
    $stop
    ]

    $let[currentping;$round[$executionTime;0]]
    $interactionUpdate[
    $arraySlice[loadser;loadser;0;10]
    $arrayReverse[loadser;loadser]
    $addContainer[
    $addTextDisplay[-# Provider:\n\`$get[provider]\`\n-# Ping:\n\`$get[currentping]ms\`]
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
    $deleteCache[storecachesearchusersfetch-q_$djsEval[ctx.interaction.message.interaction.id]]
    $deleteCache[storecachesearchusersfetch-p_$djsEval[ctx.interaction.message.interaction.id]]
    `
}