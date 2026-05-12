module.exports = {
    name: "translateText",
    params: [{
        name: "text",
        required: true
    },
    {
        name: "from",
        required: false
    },
    {
        name: "to",
        required: false
    }],
code: `
$arrayLoad[inputtext;
;$env[text]]
$arrayMap[inputtext;a;$if[$env[a]==;$return[ ];$return[$env[a]]];inputtext]
$let[fromtranslate;$if[$or[$env[from]==;$env[from]==null];auto;$env[from]]]
$let[totranslate;$if[$or[$env[to]==;$env[to]==null];en;$env[to]]]
$jsonLoad[51;[null,null\\]]
$jsonLoad[25;[null,null,null\\]]
$!jsonSet[25;0;$jsonStringify[inputtext]]
$!jsonSet[25;1;$get[fromtranslate]]
$!jsonSet[25;2;$get[totranslate]]
$!jsonSet[51;0;$jsonStringify[25]]
$!jsonSet[51;1;wt_lib]
$jsonLoad[finallvm;{"text":null,"acc":null}]
$try[
$httpAddHeader[Content-Type;application/json+protobuf]
$httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent_desktop]]
$httpAddHeader[X-Goog-Api-Key;$inflate[eJxz9KxKDK50DHGKSMwqqwr0CXHxcA1MSi4oNPDMSDUoC3fxyPU3NTIAAA12DPc;base64url]]
$httpSetBody[$jsonStringify[51]]
$httpSetContentType[Text]
$!httpRequest[https://translate-pa.googleapis.com/v1/translateHtml;POST]
$jsonLoad[lvm;$httpResult]
$jsonLoad[trl;$env[lvm;1]]
$let[totalLang;$arrayLength[trl]]
$let[calcLang;0]
$jsonLoad[lvm;$env[lvm;0]]
$arrayForEach[lvm;ok;$if[$env[ok]!=;$letSum[calcLang;1]]]
$arrayMap[lvm;v;
$let[kklv;$env[v]]
$return[$djsEval[require("entities").decodeHTML(ctx.getKeyword("kklv"))]]
;lvm]
]
$!jsonSet[finallvm;text;$default[$jsonStringify[lvm];]]
$!jsonSet[finallvm;acc;"$round[$multi[$divide[$get[calcLang];$get[totalLang]];100];1]"]
$return[$jsonStringify[finallvm]]
`
}