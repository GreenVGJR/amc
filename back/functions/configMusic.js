module.exports = {
    name: "configMusic",
    params: [{
        name: "name", // string
        description: "Config name",
        required: true
    }],
    code: `$jsonLoad[result;$readFile[./back/config.json]]
    $let[name;$env[name]]
    $let[res;$env[result;$get[name]]]
    $return[$get[res]]`
}