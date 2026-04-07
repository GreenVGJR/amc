// Credits:
// https://github.com/MorpheApp/morphe-patches

const { tarClient, tarClientYT } = require('./clientYoutube.js');

module.exports = {
    name: "generateTokenYoutube",
    params: [{
        name: "successlogs",
        description: "Show successful on console",
        required: true
    }],
    code: `
    $let[lookauth;$trimLines[$trim[$djsEval[process.env.YOUTUBE_AUTH]]]]
    $jsonLoad[listclient;$replace[${tarClientYT()};%SEMI%;\\;]]
    $if[$or[$env[listclient;client_id]==null;$env[listclient;client_secret]==null];
    $return[false]
    ]
    $jsonLoad[lr;{"token":null,"refresh_token":null}]
    $if[$isJSON[$get[lookauth]]==false;
    $jsonLoad[rr;{}]
    $!jsonSet[rr;client_id;$env[listclient;client_id]]
    $!jsonSet[rr;scope;https://www.googleapis.com/auth/youtube]
    $!jsonSet[rr;device_id;$randomUUID]
    $!jsonSet[rr;device_model;UNKNOWN]
    $if[$env[successlogs]==true;$logger[Warn;Google - Fetching Device Code]]
    $httpAddHeader[User-Agent;$env[listclient;userAgent]]
    $httpAddHeader[Content-Type;application/json]
    $httpSetBody[$jsonStringify[rr]]
    $!httpRequest[https://www.youtube.com/o/oauth2/device/code;POST;ppl]
    $if[$env[ppl;user_code]==;
    $logger[Error;Google - Failed to fetch: $env[ppl;error_description]. Skipping]
    $return[null]
    ]
    $let[isRetrieved;false]
    $let[device_code;$env[ppl;device_code]]
    $logger[Info;Google - Device Code: $env[ppl;user_code] | Expires in 30 mins]
    $logger[Info;Google - Open this in browser and type the code: https://www.youtube.com/activate]
    $if[$env[successlogs]==true;$logger[Warn;Google - Re-fetch every 5 seconds]]
    $loop[100;
    $jsonLoad[rst;{}]
    $!jsonSet[rst;client_id;$env[listclient;client_id]]
    $!jsonSet[rst;client_secret;$env[listclient;client_secret]]
    $!jsonSet[rst;code;$get[device_code]]
    $!jsonSet[rst;grant_type;http://oauth.net/grant_type/device/1.0]
    $wait[5s]
    $if[$get[isRetrieved]==false;
    $httpAddHeader[User-Agent;$env[listclient;userAgent]]
    $httpAddHeader[Content-Type;application/json]
    $httpSetBody[$env[rst]]
    $!httpRequest[https://www.youtube.com/o/oauth2/token;POST;ppm]
    $if[$env[ppm;access_token]==;
    $c[idk what to put here]
    ;
    $let[isRetrieved;true]
    $!jsonSet[lr;token;$env[ppm;access_token]]
    $!jsonSet[lr;refresh_token;$env[ppm;refresh_token]]
    $break
    ]]]
    $if[$get[isRetrieved]==false;
    $logger[Error;Google - No response. Skipping]
    $return[null]
    ]
    ;
    $if[$env[successlogs]==true;$logger[Warn;Google - Refreshing Token]]
    $jsonLoad[ytc;$get[lookauth]]
    $jsonLoad[rst;{}]
    $!jsonSet[rst;client_id;$env[listclient;client_id]]
    $!jsonSet[rst;client_secret;$env[listclient;client_secret]]
    $!jsonSet[rst;refresh_token;$env[ytc;refresh_token]]
    $!jsonSet[rst;grant_type;refresh_token]
    $httpAddHeader[User-Agent;$env[listclient;userAgent]]
    $httpAddHeader[Content-Type;application/json]
    $httpSetBody[$env[rst]]
    $!httpRequest[https://www.youtube.com/o/oauth2/token;POST;ppm]
    $if[$env[ppm;access_token]==;
    $logger[Error;Google - Failed to fetch: $env[ppm;error_description]. Skipping]
    $return[null]
    ]
    $!jsonSet[lr;token;$env[ppm;access_token]]
    $!jsonSet[lr;refresh_token;$env[ytc;refresh_token]]
    ]
    $if[$env[successlogs]==true;$logger[Info;Google - Token: $cropText[$env[lr;token];0;12;...]]]
    $writeFile[.env;$replace[$readFile[.env];YOUTUBE_AUTH=$get[lookauth];YOUTUBE_AUTH=$jsonStringify[lr]]]
    $!djsEval[require('dotenv').config({ override: true, quiet: true })]
    $if[$env[successlogs]==true;$logger[Info;Continuing process]]
    $return[true]
    `
}