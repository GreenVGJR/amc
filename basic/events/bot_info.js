module.exports = {
    name: "botinfoclearcache",
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $async[$try[$deleteRecords[cachesearch_global]]]
    $ephemeral
    $interactionReply[OK]
    `
}