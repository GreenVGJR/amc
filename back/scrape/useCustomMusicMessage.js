module.exports = {
    name: "useCustomMusicMessage",
    params: [{
        name: "nameConfig", // string
        description: "Name",
        required: true
    }],
    code: `$jsonLoad[result;$readFile[./back/messageConfig.json]]
    $let[name;$env[nameConfig]]
    $let[res;$env[result;$get[name]]]
    $return[$get[res]]`
}