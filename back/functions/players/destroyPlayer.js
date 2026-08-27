module.exports = {
    name: "destroyPlayer",
    params: [{
        name: "guildCID",
        required: false
    }],
    code: `
    $let[guildCID;$if[$or[$env[guildCID]==;$env[guildCID]==null];$guildID;$env[guildCID]]]
    $return[$try[$djsEval[
    const { useQueue } = require('discord-player')\\;
    const targetGuild = ctx.client.guilds.cache.get(ctx.getKeyword("guildCID"))\\;
    try {
    const queue = useQueue(targetGuild)\\;
    queue.connection.destroy()\\;
    true\\;
    }
    catch {
    false\\;
    }
    ];false]]
    `
}