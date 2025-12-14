module.exports = {
name: "loadDJUser",
code: `
$jsonLoad[djks;$getRecord[guild;;musicplayer_data_djft_$guildID]]
$let[hasrole;$env[djks;role]]
$let[hasdj;$env[djks;mode]]
$addContainer[
$addTextDisplay[## DJ]
$addSeparator[Small;true]
$addTextDisplay[User with this Role can access to Music Commands,
without restriction Voice Channel.

If enabled, anyone that don't have Role can't access
Music Commands.]
$addSeparator[Large;true]
$addActionRow
$addButton[toggledjrolepick_clear;Clear Role;Secondary;;$checkCondition[$get[hasrole]==]]
$addActionRow
$if[$get[hasrole]!=;
$addRoleSelectMenu[toggledjrolepick;Role to use;1;1;false;$get[hasrole]]
;
$addRoleSelectMenu[toggledjrolepick;Role to use;1;1;false]
]
$addSeparator[Small;false]
$addActionRow
$addStringSelectMenu[toggledjrolemode;DJ Mode;$checkCondition[$get[hasrole]==];1;1]
$addOption[🔴 Disable;;0;;$checkCondition[$get[hasdj]==0]]
$addOption[🟢 Enable;;1;;$checkCondition[$get[hasdj]==1]]
;$callFunction[useIcon;color_embed]]
`
}