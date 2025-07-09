module.exports = {
    name: "fastMetadataTrack",
    params: [{
        name: "query", // string
        description: "To show a results",
        required: true
    },
    {
        name: "provider", // enum
        description: "Provider to use",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $if[$env[provider]==youtube;
    $jsonLoad[res;$try[$youtubeVideoSearch[$env[query];1];{}]]
    $jsonLoad[rest2;{
        "id":"$env[res;results;0;id]",
        "dynamic_thumbnail":"$if[$env[res;results;0;animatedThumbnail]!=;$env[res;results;0;animatedThumbnail;0;url]]",
        "thumbnail":"$env[res;results;0;thumbnail;0;url]",
        "duration":"$env[res;results;0;durationSeconds]",
        "title":"$replace[$env[res;results;0;title];\\";\\\\"]"
    }]
    ;
    $if[$env[provider]==soundcloud;
    $try[
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getGlobalVar[authmusic_soundcloud]&limit=1;GET]
    ]
    $jsonLoad[res;$if[$httpResult==;{};$httpResult]]
    $jsonLoad[rest2;{
        "id":"$advancedTextSplit[$env[res;collection;0;permalink_url];soundcloud.com/;1]",
        "dynamic_thumbnail":"",
        "thumbnail":"$env[res;collection;0;artwork_url]",
        "duration":$round[$divide[$env[res;collection;0;duration];1000];0],
        "title":"$replace[$env[res;collection;0;title];\\";\\\\"]"
    }]
    ]]
    $return[$env[rest2]]
    `
}