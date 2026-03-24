module.exports = {
    type: "linkedNodeConnect",
    code: `
    $try[$jsonLoad[a;$linkedEvent]]
    $logger[Info;Node connected: $env[a;node;0;id]]
    `
}