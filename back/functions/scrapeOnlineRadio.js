module.exports = {
    name: "scrapeOnlineRadio",
    params: [{
        name: "query", // string
        description: "To get a list station",
        required: true
    },
    {
        name: "countrycode",
        description: "Country Code",
        required: false
    },
    {
        name: "page",
        description: "Pages",
        required: false
    },
    {
        name: "guildId",
        description: "guildID to implement cache",
        required: false
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
    $arrayLoad[tempstore]
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://onlineradiobox.com/search?part=1&q=$env[query]&c=$env[countrycode]&offset=$multi[$env[page];20];GET]
    $arrayLoad[res;"stations__station";$advancedTextSplit[$httpResult;class="stations-list";1]]
    $arrayForEach[res;rest;
    $if[$advancedTextSplit[$env[rest];href=";1;";0]!=;
    $arrayPushJSON[tempstore;{
    "url":"https://onlineradiobox.com$advancedTextSplit[$env[rest];href=";1;";0]",
    "thumbnail":"https:$advancedTextSplit[$env[rest];src=";1;";0]",
    "radioId":"$advancedTextSplit[$env[rest];radioId=";1;";0]",
    "radioName":"$advancedTextSplit[$env[rest];radioName=";1;";0]",
    "streamFormat":"$advancedTextSplit[$env[rest];streamType=";1;";0]",
    "stream":"$advancedTextSplit[$env[rest];stream=";1;";0]"
    }]
    ]]
    ]
    $return[$env[tempstore]]
    `
}