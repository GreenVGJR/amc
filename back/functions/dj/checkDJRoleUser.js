module.exports = {
    name: "checkDJRoleUser",
    code: `
    $jsonLoad[djks;$getRecord[guild;;musicplayer_data_djft_$guildID]]
    $let[0;$env[djks;role]]
    $let[1;$env[djks;mode]]
    $let[cs;$and[$get[0]!=;$get[1]==1]]
    $return[$get[cs]$if[$get[cs];|$get[0]]]
    `
}