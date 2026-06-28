module.exports = {
    name: "joinVC",
    params: [{
        name: "voiceCID",
        required: false
    }],
    code: `
    $let[textCID;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
    $return[$try[$djsEval[
    const { useMainPlayer } = require('discord-player')\\;
    const { music } = require(process.cwd() + '/index.js')\\;

    const musicPlayer = useMainPlayer()\\;

    const voiceChannel = ctx.getEnvironmentKey('voiceCID')
      ? ctx.client.channels.cache.get(ctx.getEnvironmentKey('voiceCID'))
      : ctx.member.voice.channel\\;

    const textChannel = ctx.getKeyword('textCID') !== ''
      ? ctx.client.channels.cache.get(ctx.getKeyword('textCID'))
      : ctx.channel\\;

    if (voiceChannel) {
      const connectOptions = music.connectOptions ?? {}\\;
      const queue = musicPlayer.nodes.create(voiceChannel.guild, {
        metadata: { text: textChannel },
        ...connectOptions,
      })\\;

      queue.connect(voiceChannel).catch(() => {})\\;
    }

    true\\;
    ];false]]
    `
}