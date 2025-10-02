module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
    $onlyIf[$or[$customID==toggledjrolepick_clear;$customID==toggledjrolepick;$customID==toggledjrolemode]]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageChannels;ManageRoles]]
    $if[$customID==toggledjrolepick_clear;
    $setGuildVar[musicplayer_data_djft-role;]
    $setGuildVar[musicplayer_data_djft-mode;0]
    ]
    $if[$customID==toggledjrolepick;
    $setGuildVar[musicplayer_data_djft-role;$selectMenuValues[0]]
    $setGuildVar[musicplayer_data_djft-mode;0]
    ]
    $if[$customID==toggledjrolemode;
    $setGuildVar[musicplayer_data_djft-mode;$selectMenuValues[0]]
    ]
    $interactionUpdate[$callFunction[loadDJUser]]
    `
}