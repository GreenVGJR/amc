module.exports = {
    name: "botinfoclearcache",
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $ephemeral
    $defer
    $try[$deleteRecords[cachesearch_global-query]]
    $interactionReply[OK]
    `
}