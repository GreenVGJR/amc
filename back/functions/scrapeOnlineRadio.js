module.exports = {
    name: "scrapeOnlineRadio",
    params: [{
        name: "query", // string
        description: "To get a list station",
        required: true
    },
    {
        name: "countrycode", // enum
        description: "Country Code",
        required: false
    },
    {
        name: "page", // int
        description: "Pages",
        required: false
    },
    {
        name: "guildId", // int
        description: "guildID to implement cache",
        required: false
    },
    {
        name: "checkCache", // bool
        description: "Look any cache available",
        required: false
    },
    {
        name: "disableRes", // bool
        description: "Disable Response",
        required: false
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
    $arrayLoad[tempstore]
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $if[$env[checkCache]==false;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $!httpRequest[https://onlineradiobox.com/search?part=1&q=$env[query]&c=$env[countrycode]&offset=$multi[$env[page];20];GET]
    $arrayLoad[res;"stations__station";$advancedTextSplit[$httpResult;class="stations-list";1]]
    $arrayForEach[res;rest;
    $if[$advancedTextSplit[$env[rest];href=";1;";0]!=;
    $arrayPushJSON[tempstore;{
    "url":"https://onlineradiobox.com$advancedTextSplit[$env[rest];href=";1;";0]",
    "thumbnail":"https:$advancedTextSplit[$env[rest];src=";1;";0]",
    "radioId":"$advancedTextSplit[$env[rest];radioId=";1;";0]",
    "radioName":"$djsEval[require("entities").decodeHTML(\\\`$advancedTextSplit[$env[rest];radioName=";1;";0]\\\`)]",
    "streamFormat":"$advancedTextSplit[$env[rest];streamType=";1;";0]",
    "stream":"$advancedTextSplit[$env[rest];stream=";1;";0]"
    }]
    ]]
    ]
    $let[results;$env[tempstore]]
    $jsonLoad[lf;{}]
    $!jsonSet[lf;list_radio;$get[results]]
    $if[$env[tempstore;0]!=;$!putRecord[global;$jsonStringify[lf];cachesearch_global-radio_$md5[$env[query]$env[countrycode]$env[page]]]]
    ;
    $let[results;$getRecord[global;;cachesearch_global-radio_$md5[$env[query]$env[countrycode]$env[page]]]]
    $jsonLoad[listradio;$get[results]]
    $let[results;$env[listradio;list_radio]]
    ]
    $return[$if[$env[disableRes]==false;$get[results]]]
    `
}