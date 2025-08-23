module.exports = {
    name: "fetchTitleTrack",
    params: [{
        name: "url", // string
        description: "To provide a information",
        required: true
    }],
    code: `
    $jsonLoad[filtype;$filterMediaID[$env[url]]]
    $if[$env[filtype;type]==youtube;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $let[author;$advancedTextSplit[$env[a;results;author]; - Topic;0]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==soundcloud;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $jsonLoad[b;$env[a;results]]
    $arrayMap[b;bb;$if[$env[bb;hydratable]==sound;$return[$env[bb]]];c]
    $let[author;$env[c;0;data;user;username]]
    $let[title;$env[c;0;data;title]]
    ]
    $if[$env[filtype;type]==spotify;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $let[author;$env[a;results;album;artist;0;name]]
    $let[title;$env[a;results;name]]
    ]
    $if[$or[$env[filtype;type]==tiktok;$env[filtype;type]==tiktokmob];
    $jsonLoad[a;$extractTrack[$env[url]]]
    $let[author;$env[a;results;author;uniqueId]]
    $let[title;$env[a;results;desc]]
    ]
    $if[$env[filtype;type]==tiktokmusic;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $let[author;$env[a;results;author]]
    $let[title;$env[a;results;title]]
    ]
    $if[$or[$get[author]==;$get[author]==null;$get[author]==undefined;$get[title]==;$get[title]==null;$get[title]==undefined]!=true;$return[$trimLines[$get[author] - $get[title]]];$return]
    `
}