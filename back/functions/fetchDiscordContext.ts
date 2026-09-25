import type { IForgeFunction } from "@tryforge/forgescript";
export default {
    name: "fetchDiscordContext",
    code: `
    $arrayLoad[anGuild;,;$guildIDs[,]]
    $arrayForEach[anGuild;a;
    $fetchMembers[$env[a]]
    $fetchChannels[$env[a]]
    $fetchRoles[$env[a]]
    ]
    $return
    `
} satisfies IForgeFunction;
