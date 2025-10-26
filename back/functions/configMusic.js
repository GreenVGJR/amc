module.exports = {
    name: "configMusic",
    params: [{
        name: "name", // string
        description: "Config name",
        required: true
    }],
    code: `$jsonLoad[result;$getCache[system_file-config]]
    $let[name;$env[name]]
    $let[res;$env[result;$get[name]]]
    $return[$get[res]]`
}