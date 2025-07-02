module.exports = {
    name: "useIcon",
    params: [{
        name: "nameicon", // string
        description: "Icon's name",
        required: true
    }],
    code: `$jsonLoad[result;$readFile[./back/iconsURL.json]]
    $let[name;$env[nameicon]]
    $let[res;$env[result;$get[name]]]
    $return[$get[res]]`
}