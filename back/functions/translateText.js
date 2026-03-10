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
$try[
$httpAddHeader[Content-Type;application/json+protobuf]
$httpAddHeader[User-Agent;$callFunction[configMusic;default_userAgent]]
$httpAddHeader[X-Goog-Api-Key;AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520]
$httpSetBody[$jsonStringify[51]]
$httpSetContentType[Text]
$!httpRequest[https://translate-pa.googleapis.com/v1/translateHtml;POST]
$let[rtcgow;$httpResult]
$jsonLoad[lvm;$djsEval[require("entities").decodeHTML(ctx.getKeyword("rtcgow"))]]
]
$return[$default[$env[lvm;0];null]]
`
}