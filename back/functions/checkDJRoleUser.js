module.exports = {
    name: "checkDJRoleUser",
    code: `
    $let[0;$getGuildVar[musicplayer_data_djft-role;$guildID]]
    $let[1;$getGuildVar[musicplayer_data_djft-mode;$guildID]]
    $let[cs;$and[$get[0]!=;$get[1]==1]]
    $return[$get[cs]$if[$get[cs];|$get[0]]]
    `
}