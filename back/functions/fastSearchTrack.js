module.exports = {
    name: "fastSearchTrack",
    params: [{
        name: "query", // string
        description: "To show a results",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Accept-Language;en-US]
    $let[http;$httpRequest[https://clients1.google.com/complete/search?client=youtube&gs_ri=youtube&ds=yt&q=$encodeURI[$env[query]];GET;test]]
    $onlyIf[$get[http]!=429]
    $textSplit[$advancedTextSplit[$env[test];(\\[;1];\\["] 
    $let[splitcount;$sub[$getTextSplitLength;1]]
    $let[count;1]
    $arrayLoad[results]
    $while[$get[count]<=$get[splitcount];
    $arrayPushJSON[results;$advancedTextSplit[$splitText[$get[count]];",;0]]
    $letSum[count;1]
    ]
    ;
    $arrayLoad[results]
    ]
    $return[{"status":$get[http],"respondTime":"$httpResponseTime","results":$env[results]}]
    `
}