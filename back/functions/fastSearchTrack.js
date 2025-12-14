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
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpRemoveHeader[Accept-Encoding]
    $httpAddHeader[Accept-Language;en-US]
    $let[http;$httpRequest[https://suggestqueries-clients6.youtube.com/complete/search?ds=yt&hl=en&client=youtube&gs_ri=youtube&q=$env[query];GET;test]]
    $onlyIf[$or[$get[http]==429;$get[http]==403]!=true]
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