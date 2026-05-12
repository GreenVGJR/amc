// Test replace yt stream
const { randomBytes } = require('crypto');
const { default_userAgent_desktop, streamTypeYT, useClientYT, useBearer } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT?.toUpperCase();

let vt;
let datasyncID = "";

const useClient = ytClients?.[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const buildQuery = 'reel/reel_item_watch?prettyPrint=false&alt=json&fields=playerResponse(responseContext(visitorData),playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent,lengthSeconds))';

const APIuserAgent = useClient?.userAgent || default_userAgent_desktop;
let ytauth;
let ytcookies;
let tempytcookies;
const hostdomain = useClient.targetDomain;
const lk = { context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion } } };
var templist = [];

function refreshYtAuth() {
    require('dotenv').config({ override: true, quiet: true });
    if (process.env.YOUTUBE_AUTH) {
        try { ytauth = JSON.parse(process.env.YOUTUBE_AUTH); } catch { }
    }
    if (process.env.YOUTUBE_COOKIES) {
        ytcookies = process.env.YOUTUBE_COOKIES;
    }
    if (process.env.YOUTUBE_ANONCOOKIES) {
        tempytcookies = process.env.YOUTUBE_ANONCOOKIES;
    }
}
refreshYtAuth();

let actuallk = { ...useClient };
delete actuallk.targetDomain;
delete actuallk.client_id;
delete actuallk.client_secret;
actuallk.hl = "en";
actuallk.gl = "US";


const generateVisitor = async () => {
    try {
        if (ytcookies) {
            const embedText = await fetch("https://www.youtube.com/", { method: "GET", headers: { "User-Agent": default_userAgent_desktop, "Cookie": ytcookies } }).then(r => r.text());
            vt = embedText.split('"visitorData":"')[1]?.split('"')[0] || "";
            actuallk.visitorData = vt;
            datasyncID = embedText.split('"DATASYNC_ID":"')[1]?.split('"')[0]?.split('||')[0] || "";
        }

        if (!vt) {
            const data = await fetch(`https://${hostdomain}/youtubei/v1/player?prettyPrint=false&alt=json&fields=responseContext(visitorData)`, { method: "POST", body: JSON.stringify(lk), headers: { "Origin": `https://${hostdomain}`, "Content-Type": "application/json", "User-Agent": APIuserAgent } }).then(r => r.json());
            vt = data.responseContext.visitorData || "";
            actuallk.visitorData = vt;
        }
    } catch (e) { console.error(e) }
};
generateVisitor().catch(console.error);

async function fallbackYTStream(lstracks) {
    refreshYtAuth();
    const checklist = templist.find(l => l.id === lstracks);
    if (checklist) {
        if (Date.now() <= checklist.ref) {
            const isAllowLength = checklist.allowLength;
            return checklist.url + (isAllowLength ? `&range=0-${checklist.contentLength}` : "");
        }
    }
    try {
        let GTH;
        if (ytcookies) {
            GTH = (sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = `https://${hostdomain}`, datasyncid = datasyncID) => { const t = Math.floor(Date.now() / 1000).toString(); const dsi = (datasyncid && datasyncid !== "null" && datasyncid.trim() !== "") ? datasyncid + " " : ""; return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
        }

        const cpn = randomBytes(12).toString('base64url');
        const isVRnAuth = ytauth?.token && targetClient === "ANDROID_VR" && useBearer;

        const buildRoute = { playerRequest: { videoId: lstracks.split('watch?v=')[1], contentCheckOk: true, racyCheckOk: true }, disablePlayerResponse: false, cpn: cpn, context: { client: { ...actuallk } } };

        let a = await fetch(`https://${hostdomain}/youtubei/v1/${buildQuery}`, {
            method: "POST", body: JSON.stringify(buildRoute), headers: {
                "Accept-Encoding": "gzip",
                "Accept-Language": "en",
                "Content-Type": "application/json",
                "X-Goog-Visitor-Id": vt,
                "Origin": `https://${hostdomain}`,
                "X-Origin": `https://${hostdomain}`,
                "X-Youtube-Client-Name": useClient.clientName,
                "X-Youtube-Client-Version": useClient.clientVersion,
                "User-Agent": APIuserAgent,
                ...(ytcookies && !isVRnAuth ? {
                    "Authorization": GTH(),
                    "Cookie": ytcookies,
                    "X-Youtube-Bootstrap-Logged-In": true,
                    "Alt-Used": hostdomain,
                    "X-Goog-AuthUser": 0
                } : {
                    ...(isVRnAuth ? {
                        "Authorization": "Bearer " + ytauth.token
                    } : {}),
                    "Cookie": tempytcookies
                })
            }
        }).then(r => r.json());

        let finalurl;
        let changeLength = false;
        let streamingLength = null;
        let durationLength = null;
        let fr = null;
        a = Array.isArray(a) ? a[0] : a;
        a = a?.playerResponse || a;

        const new_vt = a?.responseContext?.visitorData;
        if (new_vt) actuallk.visitorData = new_vt;

        if (!a?.playabilityStatus || a.playabilityStatus.status !== 'OK') {
            vt = "";
            generateVisitor().catch(console.error);
            throw new Error(`InnerTube Error: ${JSON.stringify(a?.playabilityStatus) || null}`);
        }

        if ((a?.videoDetails?.isLiveContent || streamTypeYT === 2) && a?.streamingData?.hlsManifestUrl) {
            if (targetClient === 'VISIONOS') {
                finalurl = await fetch(a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn).then(r => r.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
            }
            else {
                // let extractor handle this
                finalurl = a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }
        else if (['IOS'].includes(targetClient) && streamTypeYT === 1) {
            fr = a.streamingData.adaptiveFormats.find(c => [140, 139].includes(c.itag));
            finalurl = fr.url + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            changeLength = true;
            durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
            streamingLength = String(fr.contentLength);
        }
        else {
            fr = a.streamingData?.adaptiveFormats?.find(c => [774, 251, 140, 599].includes(c.itag));
            const fs = a.streamingData?.formats?.[0]?.url;
            if (fr) {
                finalurl = fr.url + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
                changeLength = true;
                durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
                streamingLength = String(fr.contentLength);
            } else {
                finalurl = fs + "&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }

        let actualfinalurl;

        const filterlocation = await fetch(finalurl, {
            method: "HEAD",
            headers: { "User-Agent": APIuserAgent }
        });

        if (filterlocation.status === 403 && changeLength) {
            const bytesPerSecond = parseInt(fr.contentLength) / durationLength;
            const previewLength = String(Math.floor(bytesPerSecond * 60));
            actualfinalurl = filterlocation.url + `&range=0-${previewLength}`;
            streamingLength = previewLength;
        }
        else {
            actualfinalurl = filterlocation.url + (changeLength ? `&range=0-${streamingLength}` : "");
        }

        if (filterlocation.body) await filterlocation.body.cancel();

        templist.push({
            id: lstracks,
            url: actualfinalurl,
            ref: Date.now() + 1800000,
            allowLength: changeLength,
            contentLength: streamingLength
        });
        return actualfinalurl;
    }
    catch (e) {
        console.error(e.message);
        return e;
    }
}

module.exports = {
    ...(ytcookies && { cookie: ytcookies }),
    generateWithPoToken: false,
    disablePlayer: true,
    ignoreSignInErrors: true,
    slicePlaylist: true,
    useYoutubeDL: false,
    useClient: {
        clientType: "ANDROID"
    },
    innertubeConfigRaw: {
        client_type: "WEB",
        retrieve_player: false
    },
    createStream: async (q) => {
        try { return await fallbackYTStream(q.url); }
        catch { return; }
    }
}