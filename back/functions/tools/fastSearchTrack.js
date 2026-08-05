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
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
    $arrayLoad[results]
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$getCache[initclientmusic;authmusic_youtube_tempcookies]]
    $httpAddHeader[Accept-Encoding;gzip, br]
    $httpAddHeader[Accept-Language;en]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://suggestqueries-clients6.youtube.com/complete/search?ds=yt&hl=en&client=youtube&gs_ri=youtube&ytvs=1&q=$env[query];GET;aoni]]
    $onlyIf[$get[http]==200]
    $jsonLoad[results;$cropText[$env[aoni];19;-1]]
    $jsonLoad[results;$env[results;1]]
    $arrayMap[results;restm;$return[$env[restm;0]];results]
    ]
    $return[{"status":$get[http],"respondTime":"$httpResponseTime","results":$env[results]}]
    `
}