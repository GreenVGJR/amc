import type { IBaseCommand, CommandType } from "@tryforge/forgescript";
export default {
    name: "eval",
    type: "messageCreate",
    code: `
    $onlyIf[$botOwnerID==$authorID]
    $eval[$message;false]
    `
} satisfies IBaseCommand<CommandType>;
