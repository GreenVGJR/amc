module.exports = {
    name: "filterCookies",
    params: [{
        name: "mode",
        required: true
    },
    {
        name: "po",
        required: true
    },
    {
        name: "po2",
        required: false
    }, 
    {
        name: "formatCookiesOutput", // 0 = string | 1 = array
        required: false
    }],
    code: `
    $if[$env[mode]==0;
    $arrayLoad[filcookies; ;$env[po]]
    $arrayMap[filcookies;b;
        $let[ffhjkvcookie;$advancedTextSplit[$trim[$env[b]];\\;;0]]
        $if[$get[ffhjkvcookie]!=;$return[$get[ffhjkvcookie]]]
    ;filcookies]
    $arrayMap[filcookies;b;$if[$charCount[$env[b];=]>=1;$return[$trim[$env[b]]]];filcookies]]
    ]
    $if[$env[mode]==1;
    $arrayLoad[filcookies; ;$env[po]]
    $arrayMap[filcookies;b;
        $let[ffhjkvcookie;$advancedTextSplit[$trim[$env[b]];\\;;0]]
        $if[$get[ffhjkvcookie]!=;$return[$get[ffhjkvcookie]]]
    ;filcookies]
    $arrayMap[filcookies;b;$return[$default[$advancedTextSplit[$env[b];, ;1];$advancedTextSplit[$env[b]; ;0]]];filcookies]
    $arrayMap[filcookies;b;$if[$and[$charCount[$env[b]; ]==0;$charCount[$env[b]]!=0];$return[$env[b]]];filcookies]
    $arrayMap[filcookies;b;
        $let[checkValidCookies;$or[$startsWith[$toLowerCase[$env[b]];domain];$startsWith[$toLowerCase[$env[b]];path];$startsWith[$toLowerCase[$env[b]];expires];$startsWith[$toLowerCase[$env[b]];max-age];$startsWith[$toLowerCase[$env[b]];secure];$startsWith[$toLowerCase[$env[b]];httponly];$startsWith[$toLowerCase[$env[b]];samesite];$startsWith[$toLowerCase[$env[b]];priority];$startsWith[$toLowerCase[$env[b]];partitioned]]]
        $if[$and[$get[checkValidCookies]==false;$charCount[$env[b];=]>=1];$return[$trim[$env[b]]]]
    ;filcookies]]
    ]
    $c[Both cookies must be filtered]
    $if[$env[mode]==2;
    $arrayLoad[filcookies; ;$env[po]]
    $arrayMap[filcookies;b;
        $let[ffhjkvcookie;$advancedTextSplit[$trim[$env[b]];\\;;0]]
        $if[$get[ffhjkvcookie]!=;$return[$get[ffhjkvcookie]]]
    ;filcookies]
    $arrayLoad[filcookies2; ;$env[po2]]
    $arrayMap[filcookies2;b;
        $let[ffhjkvcookie;$advancedTextSplit[$trim[$env[b]];\\;;0]]
        $if[$get[ffhjkvcookie]!=;$return[$get[ffhjkvcookie]]]
    ;filcookies2]
    $arrayForEach[filcookies2;llc;
        $let[tempcckvrlv;$advancedTextSplit[$trim[$env[llc]];=;0]]
        $let[tempcckvrll;$advancedTextSplit[$trim[$env[llc]];=;1;\\;;0]]
        $let[tempcckvrlo;$replace[$env[llc];$get[tempcckvrlv]=;]]
        $let[templkcvr;$arrayFindIndex[filcookies;testlookcook;$startsWith[$env[testlookcook];$get[tempcckvrlv]]]]
        $if[$get[templkcvr]!=-1;
        $if[$get[tempcckvrll]==;$!jsonDelete[filcookies;$get[templkcvr]];$!jsonSet[filcookies;$get[templkcvr];$env[llc]]]
        ;
        $if[$and[$env[llc]!=null;$env[llc]!=];$arrayPush[filcookies;$env[llc]]]
        ]
    ]]
    $if[$env[formatCookiesOutput]==1;
    $return[$jsonStringify[filcookies]]
    ;
    $return[$trim[$arrayJoin[filcookies;\\; ]]]
    ]
    `
}