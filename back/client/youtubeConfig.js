// Test replace yt stream
const { request, Agent } = require("undici");
const { randomBytes } = require('crypto');
const { default_userAgent, streamTypeYT, useClientYT, useSABR } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT.toUpperCase();

let vt;

const useClient = ytClients[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const userAgent = default_userAgent;
const ytcookies = process.env.YOUTUBE_COOKIES;
const hostdomain = ytcookies ? "www.youtube.com" : "m.youtube.com";
const lk = { context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion } } };
var templist = [];
(async () => {
    vt = await request("https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=responseContext.visitorData", { method: "POST", body: JSON.stringify(lk), headers: { "Origin": "https://www.youtube.com", "Content-Type": "application/json", "User-Agent": userAgent, ...(ytcookies && { Cookie: ytcookies }) } }).then(a => a.body.json()).then(b => b.responseContext.visitorData);
})();

async function fallbackYTStream(lstracks) {
    if (checklist = templist.find(l => l.id === lstracks)) {
        if (Date.now() <= checklist.ref) return checklist.url;
    }
    try {
        let GTH;
        if(ytcookies) {
        GTH = (sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = "https://www.youtube.com") => { const t = Math.floor(Date.now() / 1000).toString(); return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
        }
        const pl = { videoId: lstracks.split('watch?v=')[1], context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion, visitorData: vt, clientScreen: "EMBED", clientFormFactor: "UNKNOWN_FORM_FACTOR", userAgent: userAgent }, thirdParty: { "embedUrl": "https://www.youtube.com" }, request: { useSsl: true, internalExperimentFlags: [], consistencyTokenJars: [] } }, playbackContext: { contentPlaybackContext: { splay: false, html5Preference: "HTML5_PREF_WANTS", lactMilliseconds: "-1", signatureTimestamp: "0" } }, racyCheckOk: true, contentCheckOk: true };
        let a = await request(`https://${hostdomain}/youtubei/v1/player?prettyPrint=false&fields=playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent)`, {
            method: "POST", body: JSON.stringify(pl), headers: {
                "Content-Type": "application/json",
                "Accept-Language": "en",
                "X-Goog-Visitor-Id": vt,
                "Origin": `https://${hostdomain}`,
                "X-Origin": `https://${hostdomain}`,
                "X-Youtube-Client-Name": useClient.clientName,
                "X-Youtube-Client-Version": useClient.clientVersion,
                "User-Agent": userAgent,
                ...(ytcookies && {
                    "Authorization": GTH(),
                    "Cookie": ytcookies
                })
            }
        })
        .then(b => b.body.json());

        let finalurl;
        if(a.playabilityStatus.status !== 'OK') throw new Error();
        const cpn = randomBytes(12).toString('base64url');

        if ((a?.videoDetails?.isLiveContent || streamTypeYT === 2) && a?.streamingData?.hlsManifestUrl) {
            if(targetClient === 'VISIONOS') {
            finalurl = await request(a.streamingData.hlsManifestUrl + "&cver=" + useClient.clientVersion + "&cpn=" + cpn, { method: "GET" }).then(a => a.body.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
            }
            else {
                // let extractor handle this
                finalurl = a.streamingData.hlsManifestUrl + "&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }
        else if(a.streamingData?.formats?.[0]?.url && targetClient === 'ANDROID') {
            finalurl = "https://redirector.googlevideo.com" + a.streamingData.formats[0].url.split('googlevideo.com')[1] + "&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
        }
        else {
            const fr = a.streamingData.adaptiveFormats.find(c => [251, 140].includes(c.itag));
            finalurl = "https://redirector.googlevideo.com" + fr.url.split('googlevideo.com')[1] + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&range=0-" + fr.contentLength + "&cpn=" + cpn;
        }
        // due youtube changes, i've change this to 1 minute
        templist.push({
            id: lstracks,
            url: finalurl,
            ref: Date.now() + 60000
        });
        return finalurl;
    }
    catch {
        throw new Error();
    }
}

module.exports = {
    ...(ytcookies && { cookie: ytcookies }),
    generateWithPoToken: false,
    disablePlayer: true,
    slicePlaylist: true,
    ...(useSABR === true ? {
        streamOptions: {
            useClient: "WEB",
            highWatermark: 1 << 20
        }
    } : {
        createStream: async (q, e) => {
            try { return await fallbackYTStream(q.url); }
            catch { return; }
        }
    })
}

