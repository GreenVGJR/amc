import type { IForgeFunction } from "@tryforge/forgescript";
export default {
    name: "checkAutoplayStatus",
    code: `
    $jsonLoad[ccjm;$default[$getCache[initclientmusic;musicplayer_message_$guildID_isdynamicmusic];{}]]
    $return[$default[$env[ccjm;status];false]]
    `
} satisfies IForgeFunction;
