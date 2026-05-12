module.exports = {
  name: "musicVirtualDuration",
  params: [
    {
      name: "guildId", // int
      description: "guildId",
      required: true,
    },
    {
      name: "channelId", // int
      description: "channelId",
      required: true,
    },
    {
      name: "duration", // int
      description: "Virtual duration",
      required: false,
    },
  ],
  code: `
    $let[inital;virtualDuration_$env[guildId]_$env[channelId]]
    $if[$env[duration]!=;
    $setCache[musicplayer_message_$get[inital];"$if[$env[duration]<0;0;$env[duration]]"]
    ]
    $return[$default[$getCache[musicplayer_message_$get[inital]];0]]
  `,
};
