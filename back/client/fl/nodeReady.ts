import type { IBaseCommand } from "@tryforge/forgescript";
import type { IForgeLinkedEvents } from "ForgeLinked/dist/types/structures/ForgeLinkedEventManager";
export default {
    type: "linkedNodeConnect",
    code: `
    $try[$jsonLoad[a;$linkedEvent]]
    $logger[Info;Node connected: $env[a;node;0;id]]
    `
} satisfies IBaseCommand<keyof IForgeLinkedEvents>;
