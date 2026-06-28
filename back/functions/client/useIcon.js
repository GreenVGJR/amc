module.exports = {
    name: "useIcon",
    params: [{
        name: "nameicon", // string
        description: "Icon's name",
        required: true
    }],
    code: `$jsonLoad[result;$getCache[initclientmusic;system_file-useIcon]]
    $let[name;$env[nameicon]]
    $let[res;$env[result;$get[name]]]
    $return[$get[res]]`
}