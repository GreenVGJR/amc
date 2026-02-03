module.exports = {
    name: "filterCookies",
    params: [{
        name: "mode",
        required: true
    },
    {
        name: "po",
        required: true
    }],
    code: `
    $if[$env[mode]==0;
    $arrayLoad[filcookies;\\;;$env[po]]
    $arrayMap[filcookies;b;$if[$charCount[$env[b];=]>=1;$return[$trim[$env[b]]]];filcookies]]
    ]
    $if[$env[mode]==1;
    $arrayLoad[filcookies;\\;;$env[po]]
    $arrayMap[filcookies;b;$return[$default[$advancedTextSplit[$env[b];, ;1];$advancedTextSplit[$env[b]; ;0]]];filcookies]
    $arrayMap[filcookies;b;$if[$and[$charCount[$env[b]; ]==0;$charCount[$env[b]]!=0];$return[$env[b]]];filcookies]
    ]
    $return[$arrayJoin[filcookies;\\; ]]
    `
}