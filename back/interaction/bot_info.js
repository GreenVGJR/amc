module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $onlyIf[$or[$customID==botinfoclearcache;$customID==botinfoclearcacheradio]]
    $ephemeral
    $defer
    $jsonLoad[idkth;$keysDB[global]]
    $if[$customID==botinfoclearcache;
    $arrayForEach[idkth;th;
    $if[$startsWith[$env[th];cachesearch_global-query];
    $try[$!removeRecord[global;$env[th]]]
    ]]]
    $if[$customID==botinfoclearcacheradio;
    $arrayForEach[idkth;th;
    $if[$startsWith[$env[th];cachesearch_global-radio];
    $try[$!removeRecord[global;$env[th]]]
    ]]]
    $interactionReply[OK]
    `
}