// Test replace yt stream
const { request } = require("undici");
const { default_userAgent } = require('../config.json');

let vt;
const userAgent = default_userAgent;
const ytcookies = process.env.YOUTUBE_COOKIES;
const hostdomain = ytcookies ? "www.youtube.com" : "m.youtube.com";
const lk = { context: { client: { clientName: 101, clientVersion: "0.1" } } };
var templist = [];
(async () => {
    vt = await request("https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=responseContext.visitorData", { method: "POST", body: JSON.stringify(lk), headers: { "Origin": "https://www.youtube.com", "Content-Type": "application/json", "User-Agent": userAgent, ...(ytcookies && { Cookie: ytcookies }) } }).then(a => a.body.json()).then(b => b.responseContext.visitorData);
})();

async function fallbackYTStream(lstracks) {
    if (checklist = templist.find(l => l.id === lstracks)) {
        if (Date.now() <= checklist.ref) return checklist.url;
        else {
            const loindex = templist.findIndex(k => k.id === checklist.id);
            templist.splice(loindex, 1);
        }
    }
    try {
        const GTH = (sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = "https://www.youtube.com") => { const t = Math.floor(Date.now() / 1000).toString(); return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
        const pl = { videoId: lstracks.split('watch?v=')[1], context: { client: { clientName: 101, clientVersion: "0.1", visitorData: vt, clientScreen: "WATCH", clientFormFactor: "UNKNOWN_FORM_FACTOR" }, request: { useSsl: true, internalExperimentFlags: [], consistencyTokenJars: [] } }, playbackContext: { contentPlaybackContext: { vis: 0, splay: true, html5Preference: "HTML5_PREF_WANTS", lactMilliseconds: "-1" } }, attestationRequest: { omitBotguardData: true }, racyCheckOk: true, contentCheckOk: true };
        let a = await request(`https://${hostdomain}/youtubei/v1/player?prettyPrint=false&fields=streamingData(hlsManifestUrl,adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent)`, {
            method: "POST", body: JSON.stringify(pl), headers: {
                "Content-Type": "application/json",
                "Accept-Language": "en",
                "Origin": `https://${hostdomain}`,
                "X-Origin": `https://${hostdomain}`,
                "User-Agent": userAgent,
                ...(ytcookies && {
                    "Authorization": GTH(),
                    "Cookie": ytcookies,
                    "X-Goog-Visitor-Id": vt
                })
            }
        })
            .then(b => b.body.json());
        let finalurl;

        if (a.videoDetails.isLiveContent) {
            finalurl = await request(a.streamingData.hlsManifestUrl, { method: "GET" }).then(a => a.body.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
        }
        else {
            const fr = a.streamingData.adaptiveFormats.find(c => [251, 140].includes(c.itag));
            finalurl = fr.url + "&ratebypass=true&range=0-" + fr.contentLength;
        }
        templist.push({
            id: lstracks,
            url: finalurl,
            ref: Date.now() + 21600000
        });
        return finalurl;
    }
    catch {
        throw new Error();
    }
}

module.exports = {
    generateWithPoToken: false,
    disablePlayer: true,
    slicePlaylist: true,
    overrideBridgeMode: "yt",
    createStream: async (q, e) => {
        try { return await fallbackYTStream(q.url); }
        catch { return; }
    }
    /*
    streamOptions: {
        useClient: "IOS"
    },
    innertubeConfigRaw: {
        player_id: "0004de42" // https://github.com/LuanRT/YouTube.js/issues/1043#issuecomment-3328154175
    }
    */
}
