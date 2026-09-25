import type { IBaseCommand, CommandType } from "@tryforge/forgescript";
export default {
    type: "guildDelete",
    code: `
    $!clearInterval[intervalmusicmessage_$oldGuild[id]_$getCache[initclientmusic;musicplayer_message_$oldGuild[id]_channelid]]
    $async[
    $callFunction[destroyPlayer;$oldGuild[id]]
    $callFunction[bulkMusicPlayer;false;$oldGuild[id]]
    ]
    `
} satisfies IBaseCommand<CommandType>;
