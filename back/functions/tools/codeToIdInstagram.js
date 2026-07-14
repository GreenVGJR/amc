module.exports = {
    name: "codeToIdInstagram",
    params: [{
        name: "querycv",
        description: "Short code",
        required: true
    }],
    code: `
    $let[templatechars;ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_]
    $arrayLoad[cf;;$env[querycv]]
    $arrayLoad[ck;;$get[templatechars]]
    $let[finalidig;0]
    $arrayForEach[cf;ls;
    $let[finalidig;$bigintMulti[$get[finalidig];64]]
    $let[idlm;$arrayFindIndex[ck;lk;$checkCondition[$env[lk]==$env[ls]]]]
    $let[finalidig;$bigintSum[$get[finalidig];$get[idlm]]]
    ]
    $return[$get[finalidig]]
    `
}