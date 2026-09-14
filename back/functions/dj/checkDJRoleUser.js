module.exports = {
    name: "checkDJRoleUser",
    code: `
    $getRecord[guild;djks;musicplayer_data_djft_$guildID]
    $jsonLoad[djks;$env[djks]]
    $let[0;$env[djks;role]]
    $let[1;$env[djks;mode]]
    $let[cs;$and[$get[0]!=;$get[1]==1]]
    $return[$get[cs]$if[$get[cs];|$get[0]]]
    `
}