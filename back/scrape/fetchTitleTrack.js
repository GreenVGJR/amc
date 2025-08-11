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
    $return[$advancedTextSplit[$env[a;results;author]; - Topic;0] - $env[a;results;title]]
    ]
    $if[$env[filtype;type]==soundcloud;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $jsonLoad[b;$env[a;results]]
    $arrayMap[b;bb;$if[$env[bb;hydratable]==sound;$return[$env[bb]]];c]
    $return[$env[c;0;data;user;username] - $env[c;0;data;title]]
    ]
    $if[$env[filtype;type]==spotify;
    $jsonLoad[a;$extractTrack[$env[url]]]
    $return[$env[a;results;album;artist;0;name] - $env[a;results;name]]
    ]
    `
}