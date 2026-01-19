module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
    $onlyIf[$or[$customID==toggledjrolepick_clear;$customID==toggledjrolepick;$customID==toggledjrolemode]]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageChannels;ManageRoles]]
    $jsonLoad[test;$getRecord[guild;;musicplayer_data_djft_$guildID]]
    $if[$customID==toggledjrolepick_clear;
    $!jsonSet[test;role;]
    $!jsonSet[test;mode;0]
    ]
    $if[$customID==toggledjrolepick;
    $!jsonSet[test;role;"$selectMenuValues[0]"]
    $!jsonSet[test;mode;0]
    ]
    $if[$customID==toggledjrolemode;
    $!jsonSet[test;mode;"$selectMenuValues[0]"]
    ]
    $!putRecord[guild;$env[test];musicplayer_data_djft_$guildID]
    $interactionUpdate[$callFunction[loadDJUser]]
    `
}