module.exports = {
    name: "channelStatus",
    params: [{
        name: "ccl", // int
        description: "Voice Channel id",
        required: true
    },
    {
        name: "cco", // string
        description: "Status to apply",
        required: false
    }],
    code: `
    $let[cco;$if[$or[$env[cco]==null;$env[cco]==];;$env[cco]]]
    $let[discordAgent;$getCache[system_filetp-defaultDiscordAgent]]
    $try[
    $if[$get[cco]!=;
    $jsonLoad[fn;{}]
    $!jsonSet[fn;status;"$cropText[$get[cco];0;500;]"]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[User-Agent;$get[discordAgent]]
    $httpSetBody[$env[fn]]
    ]
    $httpAddHeader[Authorization;Bot $clientToken]
    $let[kfkv;$httpRequest[https://discord.com/api/v10/channels/$env[ccl]/voice-status;PUT;sdbnja]]
    ]
    $return[$checkCondition[$get[kfkv]==204]]
    `
}