module.exports = {
    data: {
        "type": 1,
        "name": "ping",
        "description": "How fast this bot can respond?",
        "description_localizations": {
            "id": "Secepat apa bot ini nge-respon?"
        },
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
    $interactionReply[🏓 $pingms]
  `
}