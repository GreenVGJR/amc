// Test replace yt stream
const { request } = require("undici");
const { randomBytes } = require('crypto');
const { default_userAgent, streamTypeYT, useClientYT, useSABR } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT?.toUpperCase();

let vt;
let datasyncID = ""; // only worked for youtube embed client which idk how

const useClient = ytClients?.[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const buildQuery = ['ANDROID_REEL','IOS_REEL'].includes(targetClient) ? 'reel/reel_item_watch?prettyPrint=false&alt=json&fields=playerResponse(playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent))' : 'player?prettyPrint=false&alt=json&fields=playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent)';

const APIuserAgent = useClient?.userAgent || default_userAgent;
const ytcookies = process.env.YOUTUBE_COOKIES;
const hostdomain = useClient.targetDomain;
const lk = { context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion } } };
var templist = [];

let actuallk = { ...useClient };
delete actuallk.targetDomain;
actuallk.hl = "en";
actuallk.gl = "US";

(async () => {
    if (ytcookies) {
        try {
            const embedText = await fetch("https://www.youtube.com/embed?html5=1", { method: "GET", headers: { "User-Agent": default_userAgent, "Cookie": ytcookies } }).then(a => a.text());
            vt = embedText.split('"visitorData":"')[1]?.split('"')[0] || "";
            actuallk.visitorData = vt;
        } catch (e) { }
    }
    
    if (!vt) {
        vt = await request(`https://${hostdomain}/youtubei/v1/player?prettyPrint=false&fields=responseContext.visitorData`, { method: "POST", body: JSON.stringify(lk), headers: { "Origin": `https://${hostdomain}`, "Content-Type": "application/json", "User-Agent": APIuserAgent } }).then(a => a.body.json()).then(b => b.responseContext.visitorData || "");
        actuallk.visitorData = vt;
    }
})();

async function fallbackYTStream(lstracks) {
    if (checklist = templist.find(l => l.id === lstracks)) {
        if (Date.now() <= checklist.ref) return checklist.url;
    }
    try {
        let GTH;
        if(ytcookies) {
        GTH = (sapisid = ytcookies?.match(/(?:^|;\\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = `https://${hostdomain}`, datasyncid = datasyncID) => { const t = Math.floor(Date.now() / 1000).toString(); const dsi = (datasyncid && datasyncid !== "null" && datasyncid.trim() !== "") ? datasyncid + " " : ""; return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
        }

        const buildRoute = ['ANDROID_REEL','IOS_REEL'].includes(targetClient) ? { playerRequest: { videoId: lstracks.split('watch?v=')[1], contentCheckOk: true, racyCheckOk: true }, disablePlayerResponse: false, context: { client: { ...actuallk } } } : { videoId: lstracks.split('watch?v=')[1], context: { client: { ...actuallk }, request: { useSsl: true, internalExperimentFlags: [], consistencyTokenJars: [] } }, playbackContext: { contentPlaybackContext: { splay: true, html5Preference: "HTML5_PREF_WANTS", lactMilliseconds: "-1", signatureTimestamp: "0" } }, racyCheckOk: true, contentCheckOk: true };
        
        let a = await request(`https://${hostdomain}/youtubei/v1/${buildQuery}`, {
            method: "POST", body: JSON.stringify(buildRoute), headers: {
                "Accept-Language": "en",
                "Content-Type": "application/json",
                "X-Goog-Visitor-Id": vt,
                "Origin": `https://${hostdomain}`,
                "X-Origin": `https://${hostdomain}`,
                "X-Youtube-Client-Name": useClient.clientName,
                "X-Youtube-Client-Version": useClient.clientVersion,
                "User-Agent": APIuserAgent,
                ...(ytcookies && {
                    "Authorization": GTH(),
                    "Cookie": ytcookies,
                    "X-Youtube-Bootstrap-Logged-In": true,
                    "Alt-Used": hostdomain,
                    "X-Goog-AuthUser": 0
                })
            }
        })
        .then(b => b.body.json());

        let finalurl;
        a = a?.playerResponse || a;
        if(a.playabilityStatus.status !== 'OK') throw new Error();
        const cpn = randomBytes(12).toString('base64url');

        if ((a?.videoDetails?.isLiveContent || streamTypeYT === 2) && a?.streamingData?.hlsManifestUrl) {
            if(targetClient === 'VISIONOS') {
            finalurl = await request(a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn, { method: "GET" }).then(a => a.body.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
            }
            else {
                // let extractor handle this
                finalurl = a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }
        else if(a.streamingData?.formats?.[0]?.url && targetClient === 'ANDROID') {
            finalurl = a.streamingData.formats[0].url + "&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
        }
        else {
            const fr = a.streamingData.adaptiveFormats.find(c => [251, 140, 599].includes(c.itag));
            finalurl = fr.url + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&range=0-" + fr.contentLength + "&cpn=" + cpn;
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

