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
    
    $localFunction[refreshspotify;
    $if[$env[refresh]==true;
    $callFunction[generateAuthKeys;spotify;;false]
    ]
    $httpAddHeader[authorization;Bearer $getGlobalVar[authmusic_spotify]]
    $httpAddHeader[client-token;$getGlobalVar[authmusic_spotify_token]]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Origin;https://open.spotify.com/]
    $httpAddHeader[app-platform;WebPlayer]
    $httpAddHeader[spotify-app-version;1.0]
    $httpAddHeader[User-Agent;$get[agent]]
    $jsonLoad[test;$filterMediaID[$get[url]]]
    $let[gid;$djsEval[(id => \\[...id\\].reduce((a, c) => a * 62n + BigInt("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c)), 0n).toString(16).padStart(32, '0'))("$env[test;id]")]]
    $let[http;$httpRequest[https://spclient.wg.spotify.com/metadata/4/track/$get[gid];GET;a]]
    $onlyIf[$or[$get[http]==401;$get[http]==400]!=true;$callLocalFunction[refreshspotify;true]]
    $arrayPushJSON[results;{"status":$get[http],"results":$if[$env[a]==;null;$env[a]]}]
    ;retry]
    $callLocalFunction[refreshspotify;false]

    ]
    ]
    $let[resultforeturn;$if[$env[results;0]==;{};$env[results;0]]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];1;2000;];$get[resultforeturn]]]
    `
}