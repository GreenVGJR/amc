module.exports = {
    name: "extractTrack",
    params: [{
        name: "url", // string
        description: "To provide a information",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    },
    {
        name: "limitChar", // int
        description: "Limit Character to 2000",
        required: false
    }],
    code: `
    $let[url;$env[url]]
    $let[spliturl;$advancedTextSplit[$get[url];://;1]]
    $let[agent;$if[$env[userAgent]==null;Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]

    $jsonLoad[filterid;$callFunction[filterMediaID;https://$get[spliturl]]]
    $onlyIf[$or[$env[filterid;id]==null;$env[filterid;type]==null]!=true;$return[{}]]
    $arrayLoad[results;]
    
    $try[
    $if[$env[filterid;type]==youtube;
    
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetBody[{
    "videoId": "$env[filterid;id]",
        "context": {
            "client": {
                "clientName":"TVHTML5_SIMPLY_EMBEDDED_PLAYER",
                "clientVersion":"2.0"
            }
        }
    }]
    $let[http;$httpRequest[https://music.youtube.com/youtubei/v1/player?key=$getGlobalVar[authmusic_youtube_key];POST;reshttp]]
    $arrayPushJSON[results;{"status":$get[http],"results":$if[$env[reshttp;videoDetails]==;null;$env[reshttp;videoDetails]]}]

    ]
    $if[$env[filterid;type]==soundcloud;
    
    $httpAddHeader[User-Agent;$get[agent]]
    $let[http;$httpRequest[https://$get[spliturl];GET;reshttp]]
    $let[a;$advancedTextSplit[$env[reshttp];<script>window.__sc_hydration;1;= ;1;\\;</script>;0]]
    $arrayPushJSON[results;{"status":$get[http],"results":$if[$get[a]==;null;$replace[$replace[$get[a];/stream/hls;/stream/hls?client_id=$getGlobalVar[authmusic_soundcloud]];/stream/progressive;/stream/progressive?client_id=$getGlobalVar[authmusic_soundcloud]]]}]
    
    ]
    $if[$env[filterid;type]==spotify;
    
    $httpAddHeader[User-Agent;$get[agent]]
    $let[http;$httpRequest[https://open.spotify.com/embed$advancedTextSplit[$get[url];$advancedTextSplit[$get[url];://;1;/;0];1];GET;reshttp]]
    $let[a;$advancedTextSplit[$env[reshttp];__NEXT_DATA__;1;">;1;</script>;0]]
    $arrayPushJSON[results;{"status":$get[http],"results":$if[$get[a]==;null;$get[a]]}]

    ]
    ]
    $let[resultforeturn;$if[$env[results;0]==;{};$env[results;0]]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];1;2000;];$get[resultforeturn]]]
    `
}