module.exports = {
    name: "generateBearerYt",
    params: [{
        name: "inputcookie", // string
        required: true
    }, {
        name: "datasyncid", // string
        required: false
    }, {
        name: "origin", // string
        required: false
    }],
    code: `
    $return[$try[$djsEval[const GTH = (sapisid = "$advancedTextSplit[$env[inputcookie];SAPISID=;1;\\;;0]", secure1psid = "$advancedTextSplit[$env[inputcookie];__Secure-1PAPISID=;1;\\;;0]", secure3psid = "$advancedTextSplit[$env[inputcookie];__Secure-3PAPISID=;1;\\;;0]", origin_url = "https://$env[origin]", datasyncid = "$env[datasyncid]") => { const t = Math.floor(Date.now() / 1000).toString()\\; const dsi = (datasyncid && datasyncid !== "null" && datasyncid.trim() !== "") ? datasyncid + " " : ""\\; return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"\\; }\\; GTH()];null]]
    `
}