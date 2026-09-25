import type { IBaseCommand } from "@tryforge/forgescript";
import type { GuildQueueEvent } from "discord-player";
export default {
    type: "audioTrackAdd",
    code: `
    $try[$let[nnklsdnklbnsd;$callFunction[bannerYoutube;$env[track;author];$env[track;url];false]]]
    `
} satisfies IBaseCommand<`${GuildQueueEvent}`>;
