// Credits:
// https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/tiktok.py#L223

module.exports = {
    name: "wafTiktok",
    description: "Solve WAF Challenge Tiktok",
    params: [{
        name: "html",
        required: true
    }],
    code: `
    $c[fs@ignore-error]
    $let[tkdc;$advancedTextSplit[$env[html];id="wci";1;class=";1;";0]]
    $let[tkcc;$advancedTextSplit[$env[html];id="cs";1;class=";1;";0]]
    $return[$try[$get[tkdc]=$djsEval[
        const crypto = require("crypto")\\;
        const tkcc = ctx.getKeyword("tkcc")\\;
        const tkdc = ctx.getKeyword("tkdc")\\;

        if (!tkcc || !tkdc) throw new Error()\\;

        const c = Buffer.from(tkcc, "base64").toString("utf-8")\\;
        const pc = JSON.parse(c)\\;

        const t = Buffer.from(pc.v.c, "base64")\\;
        const x = Buffer.from(pc.v.a, "base64")\\;

        let final = null\\;

        for (let i = 0\\; i <= 1000000\\; i++) {
            const hash = crypto.createHash("sha256")\\;
            const k = String(i)\\;
            hash.update(x)\\;
            hash.update(k)\\;
            
            if (hash.digest().equals(t)) {
                final = k\\;
                pc.d = Buffer.from(k).toString("base64")\\;
                break\\;
            }
        }

        if (!final) throw new Error()\\;

        const finalJson = JSON.stringify(pc)\\;
        const cookieValue = Buffer.from(finalJson).toString("base64")\\;

        cookieValue
    ];0]]
    `
}