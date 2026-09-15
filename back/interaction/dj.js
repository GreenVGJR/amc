module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
    $onlyIf[$or[$customID==toggledjrolepick_clear;$customID==toggledjrolepick;$customID==toggledjrolemode]]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageChannels;ManageRoles]]
    $getRecord[guild;test;musicplayer_data_djft_$guildID]
    $if[$customID==toggledjrolepick_clear;
    $!jsonSet[test;role;]
    $!jsonSet[test;mode;0]
    $interactionUpdate[$addTextDisplay[$callFunction[useCustomMusicMessage;config_infoDJUpdate]]]
    ]
    $if[$customID==toggledjrolepick;
    $!jsonSet[test;role;"$selectMenuValues[0]"]
    $!jsonSet[test;mode;0]
    ]
    $if[$customID==toggledjrolemode;
    $!jsonSet[test;mode;"$selectMenuValues[0]"]
    ]
    $!putRecord[guild;test;musicplayer_data_djft_$guildID]
    $interactionUpdate[$callFunction[loadDJUser]]
    `
}