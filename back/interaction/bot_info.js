module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $onlyIf[$or[$customID==botinfoclearcache;$customID==botinfoclearcacheradio]]
    $ephemeral
    $defer
    $if[$customID==botinfoclearcache;
    $try[$deleteRecords[cachesearch_global-query]]
    ]
    $if[$customID==botinfoclearcacheradio;
    $try[$deleteRecords[cachesearch_global-radio]]
    ]
    $interactionReply[OK]
    `
}