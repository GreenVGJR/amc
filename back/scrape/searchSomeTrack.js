module.exports = {
    name: "searchSomeTrack",
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
    $try[
    $let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36;$env[userAgent]]]
    $if[$env[provider]==youtube;
    $jsonLoad[loadser;$try[$getYoutubeVideo[$env[query]];{}]]
    $jsonLoad[loadser2;$env[loadser;results]]
    $arrayLoad[results]
    $arrayForEach[loadser2;result;
    $arrayPushJSON[results;{"title":"$replace[$replace[$env[result;title];\\\\;];";\\\\"]","duration":"$if[$env[result;duration]==0;LIVE;$parseDigital[$multi[$env[result;duration];1000]]]","thumbnail":"$env[result;thumbnail]","url":"$env[result;url]"}]
    ]
    ;
    $if[$env[provider]==youtubemusic;
    $jsonLoad[ser;$try[$getYoutubeMusic[$env[query]];{}]]
    $jsonLoad[loadser;$env[ser;results]]
    $arrayLoad[results]
    $arrayForEach[loadser;result;
    $arrayPushJSON[results;{"title":"$replace[$replace[$env[result;title];\\\\;];";\\\\"]","duration":"$parseDigital[$multi[$env[result;duration];1000]]","thumbnail":"$env[result;thumbnail]","url":"$env[result;url]"}]
    ]
    ;
    $if[$env[provider]==soundcloud;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://api-v2.soundcloud.com/search/tracks?q=$env[query]&client_id=$getGlobalVar[authmusic_soundcloud]&limit=10;GET;tests]
    $jsonLoad[res;$env[tests;collection]]
    $arrayLoad[results]
    $arrayForEach[res;result;
    $arrayPushJSON[results;{"title":"$replace[$replace[$env[result;title];\\\\;];";\\\\"]","duration":"$parseDigital[$env[result;full_duration]]$if[$env[result;duration]==30000; - REGION LOCK]","thumbnail":"$env[result;artwork_url]","url":"$env[result;permalink_url]"}]
    ]
    ;
    $if[$env[provider]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $try[
    $if[$env[refresh]==true;
    $onlyIf[$get[tryattempt]<5;$return[{}]]
    $callFunction[generateAuthKeys;spotify;;false]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[Authorization;Bearer $getGlobalVar[authmusic_spotify]]
    $httpAddHeader[App-platform;WebPlayer]
    $let[httpspo;$httpRequest[https://api.spotify.com/v1/search?q=$env[query]&type=track&offset=0&limit=10;GET;jsonres]]
    $onlyIf[$or[$get[httpspo]==401;$get[httpspo]==400]!=true;$callLocalFunction[refreshspotify;true]]
    $jsonLoad[res1;$env[jsonres;tracks;items]]
    $arrayLoad[results]
    $arrayForEach[res1;res2;$arrayPushJSON[results;{"title":"$replace[$replace[$env[res2;name];\\\\;];";\\\\"]","duration":"$parseDigital[$env[res2;duration_ms]]","thumbnail":"$env[res2;album;images;0;url]","url":"$env[res2;external_urls;spotify]"}]]
    ]
    ;refresh]
    $callLocalFunction[refreshspotify;false]
    ;
    $if[$env[provider]==applemusic;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip]
    $!httpRequest[https://music.apple.com/us/search?term=$env[query];GET]
    $jsonLoad[res;$advancedTextSplit[$httpResult;type="application/json";1;data">;1;</script>;0]]
    $jsonLoad[res2;$env[res;0;data;sections]]
    $jsonLoad[res3;$env[res2;$arrayFindIndex[res2;result;$checkContains[$env[result;id];song]]]]
    $jsonLoad[res4;$env[res3;items]]
    $arraySlice[res4;res4;0;10]

    $arrayLoad[results]
    $arrayForEach[res4;res5;$arrayPushJSON[results;{"title":"$replace[$replace[$env[res5;title];\\\\;];";\\\\"]","duration":"Unknown","thumbnail":"$replace[$env[res5;artwork;dictionary;url];{w}x{h}bb.{f};2160x2160bb.webp]","url":"$advancedTextSplit[$env[res5;contentDescriptor;url];?;0]"}]]
    ;
    $if[$env[provider]==amazonmusic;
    $jsonLoad[a;$if[$getGlobalVar[authmusic_amazonmusic;{}]=={};{};$inflate[$getGlobalVar[authmusic_amazonmusic];base64]]]
    $httpSetBody[{"keyword":"{\\\\"interface\\\\":\\\\"Web.TemplatesInterface.v1_0.Touch.SearchTemplateInterface.SearchKeywordClientInformation\\\\",\\\\"keyword\\\\":\\\\"$env[query]\\\\"}","userHash":"{\\\\"level\\\\":\\\\"LIBRARY_MEMBER\\\\"}","headers":"{\\\\"x-amzn-authentication\\\\":\\\\"{\\\\\\\\\\\\"interface\\\\\\\\\\\\":\\\\\\\\\\\\"ClientAuthenticationInterface.v1_0.ClientTokenElement\\\\\\\\\\\\",\\\\\\\\\\\\"accessToken\\\\\\\\\\\\":\\\\\\\\\\\\"\\\\\\\\\\\\"}\\\\",\\\\"x-amzn-device-model\\\\":\\\\"WEBPLAYER\\\\",\\\\"x-amzn-device-width\\\\":\\\\"1920\\\\",\\\\"x-amzn-device-family\\\\":\\\\"WebPlayer\\\\",\\\\"x-amzn-device-id\\\\":\\\\"$env[a;deviceId]\\\\",\\\\"x-amzn-user-agent\\\\":\\\\"$get[agent]\\\\",\\\\"x-amzn-session-id\\\\":\\\\"$env[a;sessionId]\\\\",\\\\"x-amzn-device-height\\\\":\\\\"1080\\\\",\\\\"x-amzn-request-id\\\\":\\\\"$randomBytes[4]-$randomBytes[2]-$randomBytes[2]-$randomBytes[6]\\\\",\\\\"x-amzn-device-language\\\\":\\\\"$env[a;displayLanguage]\\\\",\\\\"x-amzn-currency-of-preference\\\\":\\\\"USD\\\\",\\\\"x-amzn-os-version\\\\":\\\\"$advancedTextSplit[$env[a;version];.;0].$advancedTextSplit[$env[a;version];.;1]\\\\",\\\\"x-amzn-application-version\\\\":\\\\"$env[a;version]\\\\",\\\\"x-amzn-device-time-zone\\\\":\\\\"$djsEval[Intl.DateTimeFormat().resolvedOptions().timeZone]\\\\",\\\\"x-amzn-timestamp\\\\":\\\\"$getTimestamp\\\\",\\\\"x-amzn-csrf\\\\":\\\\"{\\\\\\\\\\\\"interface\\\\\\\\\\\\":\\\\\\\\\\\\"CSRFInterface.v1_0.CSRFHeaderElement\\\\\\\\\\\\",\\\\\\\\\\\\"token\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;token]\\\\\\\\\\\\",\\\\\\\\\\\\"timestamp\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;ts]\\\\\\\\\\\\",\\\\\\\\\\\\"rndNonce\\\\\\\\\\\\":\\\\\\\\\\\\"$env[a;csrf;rnd]\\\\\\\\\\\\"}\\\\",\\\\"x-amzn-music-domain\\\\":\\\\"music.amazon.com\\\\",\\\\"x-amzn-referer\\\\":\\\\"music.amazon.com\\\\",\\\\"x-amzn-affiliate-tags\\\\":\\\\"\\\\",\\\\"x-amzn-ref-marker\\\\":\\\\"\\\\",\\\\"x-amzn-page-url\\\\":\\\\"https://music.amazon.com/search\\\\",\\\\"x-amzn-weblab-id-overrides\\\\":\\\\"\\\\",\\\\"x-amzn-video-player-token\\\\":\\\\"\\\\",\\\\"x-amzn-feature-flags\\\\":\\\\"\\\\",\\\\"x-amzn-has-profile-id\\\\":\\\\"\\\\"}"}]
    $httpAddHeader[Origin;https://music.amazon.com]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://na.mesk.skill.music.a2z.com/api/showSearch;POST;b]
    $jsonLoad[c;$env[b;methods;0;template;widgets]]
    $arrayMap[c;cd;$if[$toLowercase[$env[cd;header]]==songs;$return[$env[cd;items]]];d]
    $jsonLoad[e;$env[d;0]]
    $arrayLoad[results]
    $arrayForEach[e;ef;$arrayPushJSON[results;{"title":"$replace[$replace[$env[ef;primaryText;text];\\\\;];";\\\\"]","duration":"Unknown","thumbnail":"$env[ef;image]","url":"https://music.amazon.com$env[ef;primaryLink;deeplink]"}]]
    ;
    $if[$env[provider]==deezer;
    $localFunction[refreshdeezer;
    $try[
    $if[$env[refresh]==true;
    $callFunction[generateAuthKeys;deezer;;false]
    ]
    $httpSetBody[{"operationName":"SearchFull","variables":{"query":"$env[query]","firstList":10},"query":"$inflate[789c95524d6b23310cfd2b2ef4904209e9a150e656965d28f4509a1cf66008ca589988f5c813596e134afe7bf13869b39b6d869eacafa7f724799d50b6668a20f5ea57f27e74b9ce91ca4c55889b8b6b73b92489fa48512bf3c07a7165de2c134705d6821bed2105dae70563f21ab3a902f59f38eabb5447ddfa3a740df6551c1ce6773c1ecf60e171965196e773dd76c8d0a2e5dd89db41830fbc0c7d27763f92c420a755424148b743ddfe71779697024d8bace65392096c8a91b7e02c2ba947cb2e092805b6dc852e792884147f6e3a4f35a9e5161dc10125d4acca7ac095e705c8679623f37ea9783a4e4c8bef01cebbe017a93dc872143b0fdb5999a90e2f28fba33c51ad49f0f7b405ef8f238f200d0e91d4815568913448fceaec79b3f7a214f5a0a6c0bf35cd79f7e39e7f4d9389f78103f366b399c79cab4c121f475d493fe33a61fec56fafe47455999bc9dde4daac305fb378bb2bcbb8bff95441531c54d16ff03f227c8e0f08b89d1cf1df4e86e9df01fd8e862c;hex]"}]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept-Encoding;gzip]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Origin;https://www.deezer.com]
    $httpAddHeader[Authorization;Bearer $getGlobalVar[authmusic_deezer]]
    $let[status;$httpRequest[https://pipe.deezer.com/api;POST;res]]
    $onlyIf[$or[$env[res]==;$checkContains[$env[res;errors;0;type];Expired]]!=true;$callLocalFunction[refreshdeezer;true]]
    $arrayLoad[results]
    $jsonLoad[forres;$env[res;data;instantSearch;results;tracks;edges]]
    $arrayForEach[forres;resat;$arrayPushJSON[results;{"title":"$replace[$replace[$env[resat;node;title];\\\\;];";\\\\"]","duration":"$parseDigital[$multi[$env[resat;node;duration];1000]]","thumbnail":"$env[resat;node;album;cover;xxx_small;0]","url":"https://www.deezer.com/us/track/$env[resat;node;id]"}]]
    ]
    ;refresh]
    $callLocalFunction[refreshdeezer;true]
    ]]]]]]]
    $async[
    $if[$env[results;0]!=;
    $setVar[cachesearch_global;$md5[$env[query]$env[provider]];$deflate[$env[results];base64]]
    ]]
    ;
    $arrayLoad[results]
    ]
    $return[$env[results]]
    `
}