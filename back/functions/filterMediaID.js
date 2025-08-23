module.exports = {
    name: "filterMediaID",
    params: [{
        name: "url", // string
        description: "To gets a ID and Type",
        required: true
    }],
    code: `$let[list;$readFile[./back/listRegex.json]]
    $jsonLoad[listregex;$get[list]]
    $let[url;$env[url]]

    $if[$checkContains[$get[url];youtube.com/playlist];$let[type;youtubeplaylist];$if[$checkContains[$get[url];youtube.com;youtu.be];$let[type;youtube]]]
    $if[$checkContains[$get[url];soundcloud.com];$let[type;soundcloud]]
    $if[$checkContains[$get[url];open.spotify.com];$let[type;spotify]]
    $if[$checkContains[$get[url];tiktok.com/music/];$let[type;tiktokmusic];$if[$checkContains[$get[url];vt.tiktok.com;vm.tiktok.com];$let[type;tiktokmob];$if[$checkContains[$get[url];tiktok.com];$let[type;tiktok]]]]

    $if[$get[type]!=;
    $let[regex;$env[listregex;$get[type];0]]
    $let[regex_target;$env[listregex;$get[type];1]]
    $let[regex_target_alt;$env[listregex;$get[type];2]]
    $let[res;$djsEval[ctx.getKeyword("url").match(ctx.getKeyword("regex"))?.\\[ctx.getKeyword("regex_target")\\]]]
    $if[$get[res]==undefined;$let[res;$djsEval[ctx.getKeyword("url").match(ctx.getKeyword("regex"))?.\\[ctx.getKeyword("regex_target_alt")\\]]]]
    ]
    $arrayLoad[results;]
    $arrayPushJSON[results;{"id":$if[$or[$get[res]==;$get[res]==undefined];null;"$get[res]"],"type":$if[$get[type]==;null;"$get[type]"]}]
    $return[$env[results;0]]
    `
}