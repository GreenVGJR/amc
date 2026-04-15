// Test replace yt stream
const http2 = require('http2');
const { randomBytes } = require('crypto');
const { default_userAgent, streamTypeYT, useClientYT, useBearer } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT?.toUpperCase();

let vt;
let datasyncID = "";

const useClient = ytClients?.[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const buildQuery = 'reel/reel_item_watch?prettyPrint=false&alt=json&fields=playerResponse(responseContext(visitorData),playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent))';

const APIuserAgent = useClient?.userAgent || default_userAgent;
const ytcookies = process.env.YOUTUBE_COOKIES;
const tempytcookies = process.env.YOUTUBE_ANONCOOKIES;
let ytauth;
const hostdomain = useClient.targetDomain;
const lk = { context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion } } };
var templist = [];

function refreshYtAuth() {
    require('dotenv').config({ override: true, quiet: true });
    try { ytauth = JSON.parse(process.env.YOUTUBE_AUTH); } catch { }
}
refreshYtAuth();

let actuallk = { ...useClient };
delete actuallk.targetDomain;
delete actuallk.client_id;
delete actuallk.client_secret;
actuallk.hl = "en";
actuallk.gl = "US";

// HTTP/2 session cache: reuse connections per origin
const h2Sessions = new Map();

function getH2Session(origin) {
    let session = h2Sessions.get(origin);
    if (session && !session.closed && !session.destroyed) return session;
    session = http2.connect(origin);
    session.on('error', () => { session.close(); h2Sessions.delete(origin); });
    session.on('close', () => h2Sessions.delete(origin));
    session.setTimeout(30000, () => { session.close(); h2Sessions.delete(origin); });
    h2Sessions.set(origin, session);
    return session;
}

/**
 * HTTP/2 request helper
 * @param {string} url - Full URL to request
 * @param {{ method?: string, headers?: object, body?: string }} opts
 * @returns {Promise<{ statusCode: number, headers: object, body: { json: () => Promise<any>, text: () => Promise<string> } }>}
 */
function http2Request(url, opts = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const origin = parsed.origin;
        const session = getH2Session(origin);

        const reqHeaders = {
            [http2.constants.HTTP2_HEADER_METHOD]: opts.method || 'GET',
            [http2.constants.HTTP2_HEADER_PATH]: parsed.pathname + parsed.search,
            [http2.constants.HTTP2_HEADER_SCHEME]: parsed.protocol.replace(':', ''),
            [http2.constants.HTTP2_HEADER_AUTHORITY]: parsed.host,
        };

        // Map user headers into h2 headers (lowercase)
        if (opts.headers) {
            for (const [key, value] of Object.entries(opts.headers)) {
                reqHeaders[key.toLowerCase()] = String(value);
            }
        }

        const req = session.request(reqHeaders);
        req.on('error', reject);

        const chunks = [];
        let statusCode;
        let resHeaders;

        req.on('response', (headers) => {
            statusCode = headers[http2.constants.HTTP2_HEADER_STATUS];
            resHeaders = headers;
        });

        req.on('data', (chunk) => chunks.push(chunk));

        req.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve({
                statusCode,
                headers: resHeaders,
                body: {
                    json: () => Promise.resolve(JSON.parse(buf.toString())),
                    text: () => Promise.resolve(buf.toString()),
                }
            });
        });

        if (opts.body) {
            req.write(opts.body);
        }
        req.end();
    });
}

const generateVisitor = async () => {
    try {
        if (ytcookies) {
            const embedRes = await http2Request("https://www.youtube.com/", { method: "GET", headers: { "User-Agent": default_userAgent, "Cookie": ytcookies } });
            const embedText = await embedRes.body.text();
            vt = embedText.split('"visitorData":"')[1]?.split('"')[0] || "";
            actuallk.visitorData = vt;
            datasyncID = embedText.split('"DATASYNC_ID":"')[1]?.split('"')[0]?.split('||')[0] || "";
        }

        if (!vt) {
            const res = await http2Request(`https://${hostdomain}/youtubei/v1/player?prettyPrint=false&alt=json&fields=responseContext(visitorData)`, { method: "POST", body: JSON.stringify(lk), headers: { "Origin": `https://${hostdomain}`, "Content-Type": "application/json", "User-Agent": APIuserAgent } });
            const data = await res.body.json();
            vt = data.responseContext.visitorData || "";
            actuallk.visitorData = vt;
        }
    } catch (e) { console.error(e) }
};
generateVisitor().catch(console.error);

async function fallbackYTStream(lstracks) {
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

        if (isVRnAuth) refreshYtAuth();

        const buildRoute = { playerRequest: { videoId: lstracks.split('watch?v=')[1], contentCheckOk: true, racyCheckOk: true }, disablePlayerResponse: false, cpn: cpn, context: { client: { ...actuallk } } };

        let a = await http2Request(`https://${hostdomain}/youtubei/v1/${buildQuery}`, {
            method: "POST", body: JSON.stringify(buildRoute), headers: {
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
        })
            .then(b => b.body.json());

        let finalurl;
        let changeLength = false;
        let streamingLength = null;
        let durationLength = null;
        a = Array.isArray(a) ? a[0] : a;
        a = a?.playerResponse || a;

        const new_vt = a?.responseContext?.visitorData;
        if (new_vt) actuallk.visitorData = new_vt;

        if (!a?.playabilityStatus || a.playabilityStatus.status !== 'OK') {
            vt = "";
            generateVisitor().catch(console.error);
            throw new Error(`InnerTube Error: ${a?.playabilityStatus || null}`);
        }

        if ((a?.videoDetails?.isLiveContent || streamTypeYT === 2) && a?.streamingData?.hlsManifestUrl) {
            if (targetClient === 'VISIONOS') {
                finalurl = await http2Request(a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn, { method: "GET" }).then(a => a.body.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
            }
            else {
                // let extractor handle this
                finalurl = a.streamingData.hlsManifestUrl + "?cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }
        else if (['IOS'].includes(targetClient) && streamTypeYT === 1) {
            const fr = a.streamingData.adaptiveFormats.find(c => [140, 139].includes(c.itag));
            finalurl = fr.url + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            changeLength = true;
            streamingLength = String(fr.contentLength);
        }
        else {
            const fr = a.streamingData?.adaptiveFormats?.find(c => [774, 251, 140, 599].includes(c.itag));
            const fs = a.streamingData?.formats?.[0]?.url;
            if (fr) {
                finalurl = fr.url + "&ratebypass=true&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
                changeLength = true;
                streamingLength = String(fr.contentLength);
            } else {
                finalurl = fs + "&rn=0&alr=no&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            }
        }
        templist.push({
            id: lstracks,
            url: finalurl,
            ref: Date.now() + 1800000,
            allowLength: changeLength,
            contentLength: streamingLength
        });
        return finalurl + (changeLength ? `&range=0-${streamingLength}` : "");
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
    // streamOptions: {
    //     useClient: "MUSIC"
    // },
    createStream: async (q) => {
        try { return await fallbackYTStream(q.url); }
        catch { return; }
    }
}