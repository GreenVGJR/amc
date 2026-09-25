import type { IApplicationCommandData } from "@tryforge/forgescript";
export default {
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
    $interactionReply[🏓 $pingms]
  `
} satisfies IApplicationCommandData;
