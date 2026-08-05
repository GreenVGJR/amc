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
    $let[cco;$if[$or[$env[cco]==null;$env[cco]==];;$trim[$env[cco]]]]
    $let[discordAgent;$getCache[initclientmusic;system_filetp-defaultDiscordAgent]]
    $let[cclkfj;0]
    $localFunction[jsdbuduibs;
    $if[$get[cclkfj]>=5;$return]
    $if[$env[cclgjinretry]==true;$letSum[cclkfj;1]]
    $try[
    $if[$get[cco]!=;
    $let[cckvol;$cropText[$get[cco];0;500;]]
    $jsonLoad[fn;{}]
    $if[$typeof[$get[cckvol]]==string;$!jsonSet[fn;status;$get[cckvol]];$!jsonSet[fn;status;"$get[cckvol]"]]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[User-Agent;$get[discordAgent]]
    $httpSetBody[$env[fn]]
    ]
    $httpAddHeader[Authorization;Bot $clientToken]
    $let[kfkv;$httpRequest[https://discord.com/api/v10/channels/$env[ccl]/voice-status;PUT;sdbnja]]
    $if[$get[kfkv]==429;$wait[500] $callLocalFunction[jsdbuduibs;true] $return]
    ]
    ;cclgjinretry]
    $callLocalFunction[jsdbuduibs;false]
    $return[$checkCondition[$get[kfkv]==204]]
    `
}