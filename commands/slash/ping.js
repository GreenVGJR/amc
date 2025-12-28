module.exports = {
    data: {
        "type": 1,
        "name": "ping",
        "description": "Check bot latency",
        "integration_types": [
            0
        ],
        "contexts": [
            0
        ]
    },
    type: 0,
    code: `
    $onlyIf[$guildID!=;]
    $let[time;$getTimestamp]
    $let[currentping;$round[$sum[$divide[$advancedTextSplit[$interactionRawData;"id":;1;";1];4194304];1420070400000]]]
    $let[currentping;$sub[$get[time];$get[currentping]]]
    $interactionReply[🏓 $get[currentping]ms]
  `
}