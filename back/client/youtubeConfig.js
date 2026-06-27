// Test replace yt stream
const { Readable } = require('stream');
const { randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');
const cacheDir = path.join(__dirname, 'ytCacheTracks');
fs.mkdirSync(cacheDir, { recursive: true });
const { default_userAgent_desktop, streamTypeYT, useClientYT, useBearer, cacheTrackYT } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT?.toUpperCase();

let vt;
let datasyncID = "";
let configInfoPromise = null;
let signatureTimestamp = null;
let signatureTimestampPromise = null;
let webPlayer = null;
let authRequiredUntil = 0;

function generateAnonPOT() {
    const b = Buffer.alloc(10);
    b[0] = 0x22;
    b[1] = 0x08;
    for (let i = 0; i < 8; i++) b[2 + i] = Math.floor(Math.random() * 256);
    return b.toString('base64url');
}

let poToken = generateAnonPOT();

const useClient = ytClients?.[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const isWebClient = targetClient === 'WEB_SAFARI';
const apiEndpoint = isWebClient ? 'player' : 'get_watch';
const apiFields = isWebClient
    ? 'responseContext(visitorData),playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent,lengthSeconds)'
    : 'playerResponse(responseContext(visitorData),playabilityStatus,streamingData(hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent,lengthSeconds))';
const buildQuery = apiEndpoint + '?prettyPrint=false&alt=json&fields=' + apiFields;

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

async function fetchWebConfigInfo() {
    if (!isWebClient || actuallk.configInfo?.coldConfigData) return;
    if (configInfoPromise) return configInfoPromise;

    configInfoPromise = fetch(`https://${hostdomain}/youtubei/v1/config?prettyPrint=false&alt=json`, {
        method: "POST",
        headers: {
            "Accept-Language": "en",
            "Content-Type": "application/json",
            "Origin": `https://${hostdomain}`,
            "X-Origin": `https://${hostdomain}`,
            "X-Goog-Visitor-Id": vt || "",
            "X-Youtube-Client-Name": useClient.clientName,
            "X-Youtube-Client-Version": useClient.clientVersion,
            "User-Agent": APIuserAgent,
            ...(ytcookies ? { "Cookie": ytcookies } : {})
        },
        body: JSON.stringify({ context: { client: { ...actuallk } } })
    }).then(r => r.json()).then(res => {
        const gcg = res?.responseContext?.globalConfigGroup;
        const configInfo = {
            coldConfigData: gcg?.rawColdConfigGroup?.configData,
            coldHashData: gcg?.coldHashData,
            hotHashData: gcg?.hotHashData
        };
        if (configInfo.coldConfigData && configInfo.coldHashData && configInfo.hotHashData) {
            actuallk.configInfo = configInfo;
        }
    }).finally(() => {
        configInfoPromise = null;
    });

    return configInfoPromise;
}

async function fetchSignatureTimestamp(force = false) {
    if (!force && !isWebClient) return;
    if (signatureTimestamp || (webPlayer && !force)) return;
    if (signatureTimestampPromise) return signatureTimestampPromise;

    signatureTimestampPromise = Promise.resolve().then(async () => {
        const { Player, Log, Platform } = require('youtubei.js');
        try { Log.setLevel(Log.Level.ERROR); } catch { }
        Platform.shim.eval = (data, env) => {
            return new Function(...Object.keys(env), data.output)(...Object.values(env));
        };
        const player = await Player.create();
        webPlayer = player;
        signatureTimestamp = player?.signature_timestamp;
    }).finally(() => {
        signatureTimestampPromise = null;
    });

    return signatureTimestampPromise;
}

async function decipherYoutubeUrl(url) {
    if (!webPlayer || !url) return url;
    let processedUrl = url;

    const nPathMatch = processedUrl.match(/\/n\/([^\/]+)/);
    if (nPathMatch) {
        const rawN = nPathMatch[1];
        try {
            const dummyUrl = `https://www.youtube.com/watch?n=${encodeURIComponent(rawN)}`;
            const decipheredDummyUrl = await webPlayer.decipher(dummyUrl);
            const decipheredN = new URL(decipheredDummyUrl).searchParams.get('n');
            if (decipheredN) {
                processedUrl = processedUrl.replace(`/n/${rawN}/`, `/n/${decipheredN}/`);
            }
        } catch (e) {
            console.error("Error deciphering path-based n-token:", e);
        }
    }

    try {
        processedUrl = await webPlayer.decipher(processedUrl);
    } catch (e) {
        console.error("Error deciphering query-based parameters:", e);
    }

    return processedUrl;
}

generateVisitor().then(() => Promise.all([fetchWebConfigInfo(), fetchSignatureTimestamp()])).catch(console.error);

function createChunkedStream(url, totalSize, videoId, ext) {
    let start = 0;
    const chunkSize = 1024 * 1024 * 5;
    const concurrency = 5;
    let isEnded = false;
    let abortControllers = [];
    let isReading = false;
    let isSuccess = false;

    const tempFilePath = path.join(cacheDir, `${videoId}.${Date.now()}.${randomBytes(4).toString('hex')}.temp`);
    const finalFilePath = path.join(cacheDir, `${videoId}.${ext}`);

    let writeStream = null;
    let writeErrorOccurred = false;

    if (cacheTrackYT) {
        writeStream = fs.createWriteStream(tempFilePath);
        writeStream.on('error', (err) => {
            console.error("Cache Write Error:", err);
            writeErrorOccurred = true;
        });
    }

    const maxRetries = 3;

    async function fetchChunk(startByte) {
        let end = startByte + chunkSize - 1;
        let chunkIsLast = false;
        if (end >= totalSize) {
            chunkIsLast = true;
            end = totalSize - 1;
        }

        const chunkUrl = `${url}&range=${startByte}-${end}`;
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const ac = new AbortController();
            abortControllers.push(ac);

            try {
                const response = await fetch(chunkUrl, {
                    headers: { "Content-Length": 0, "User-Agent": APIuserAgent },
                    method: "POST",
                    signal: ac.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} for range ${startByte}-${end}`);
                }

                if (!response.body) {
                    throw new Error(`No response body for range ${startByte}-${end}`);
                }

                const chunks = [];
                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(Buffer.from(value));
                }

                return { buffer: Buffer.concat(chunks), isLast: chunkIsLast, end };
            } catch (err) {
                lastError = err;
                if (err?.name === 'AbortError') throw err;
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
            }
        }

        throw lastError;
    }

    return new Readable({
        async read() {
            if (isEnded || isReading) return;
            isReading = true;

            try {
                const batchStart = start;
                const tasks = [];

                for (let i = 0; i < concurrency; i++) {
                    const chunkStart = batchStart + i * chunkSize;
                    if (chunkStart >= totalSize) break;
                    tasks.push(fetchChunk(chunkStart));
                }

                if (tasks.length === 0) {
                    isEnded = true;
                    this.push(null);
                    isReading = false;
                    return;
                }

                abortControllers = [];
                const results = await Promise.allSettled(tasks);

                for (const result of results) {
                    if (result.status === 'rejected') {
                        const err = result.reason;
                        if (writeStream && !isSuccess) {
                            writeStream.end(() => {
                                fs.unlink(tempFilePath, () => { });
                            });
                        }
                        if (err?.name === 'AbortError') {
                            this.destroy();
                        } else {
                            this.destroy(err);
                        }
                        return;
                    }

                    const { buffer, isLast, end } = result.value;

                    this.push(buffer);
                    if (writeStream && !writeErrorOccurred) {
                        writeStream.write(buffer);
                    }

                    if (isLast) {
                        isEnded = true;
                        isSuccess = true;
                        if (writeStream) {
                            writeStream.end(() => {
                                if (!writeErrorOccurred) {
                                    fs.rename(tempFilePath, finalFilePath, (err) => {
                                        if (err) console.error("Cache rename failed:", err);
                                    });
                                } else {
                                    fs.unlink(tempFilePath, () => { });
                                }
                            });
                        }
                        this.push(null);
                        return;
                    }

                    start = end + 1;
                }
            } catch (err) {
                if (writeStream && !isSuccess) {
                    writeStream.end(() => {
                        fs.unlink(tempFilePath, () => { });
                    });
                }
                this.destroy(err);
            } finally {
                isReading = false;
            }
        },
        destroy(err, callback) {
            for (const ac of abortControllers) {
                ac.abort();
            }
            if (writeStream && !isSuccess) {
                writeStream.end(() => {
                    fs.unlink(tempFilePath, () => { });
                });
            }
            if (callback) callback(err);
        }
    });
}

function isHlsUrl(url) {
    return typeof url === "string" && (url.includes('googlevideo.com/api/manifest/') || url.includes('.m3u8'));
}

function getFormatUrl(format) {
    return format?.url || format?.signatureCipher || format?.cipher || null;
}

async function fallbackYTStream(lstracks) {
    refreshYtAuth();
    poToken = generateAnonPOT();
    
    const videoId = lstracks.includes('watch?v=') ? lstracks.split('watch?v=')[1].split('&')[0] : lstracks;
    const cacheFilePathWebm = path.join(cacheDir, `${videoId}.webm`);
    const cacheFilePathM4a = path.join(cacheDir, `${videoId}.m4a`);
    if (cacheTrackYT) {
        if (fs.existsSync(cacheFilePathWebm)) {
            return fs.createReadStream(cacheFilePathWebm);
        }
        if (fs.existsSync(cacheFilePathM4a)) {
            return fs.createReadStream(cacheFilePathM4a);
        }
    }

    const checklist = templist.find(l => l.id === lstracks);
    if (checklist) {
        if (Date.now() <= checklist.ref) {
            if (cacheTrackYT) {
                if (fs.existsSync(cacheFilePathWebm)) {
                    return fs.createReadStream(cacheFilePathWebm);
                }
                if (fs.existsSync(cacheFilePathM4a)) {
                    return fs.createReadStream(cacheFilePathM4a);
                }
            }
            if (isHlsUrl(checklist.url)) return checklist.url;
            const isAllowLength = checklist.allowLength;
            if (isAllowLength && checklist.contentLength) {
                const ext = checklist.url.includes('mime=audio/webm') || checklist.url.includes('itag=251') || checklist.url.includes('itag=774') ? 'webm' : 'm4a';
                return createChunkedStream(checklist.url, parseInt(checklist.contentLength), videoId, ext);
            }
            return checklist.url;
        }
    }
    try {
        let GTH;
        if (ytcookies) {
            GTH = (sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = `https://${hostdomain}`, datasyncid = datasyncID) => { const t = Math.floor(Date.now() / 1000).toString(); const dsi = (datasyncid && datasyncid !== "null" && datasyncid.trim() !== "") ? datasyncid + " " : ""; return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(dsi + t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
        }

        const cpn = randomBytes(12).toString('base64url');

        let a;
        const isVRnAuth = ytauth?.token && targetClient === "ANDROID_VR" && useBearer;

        if (isWebClient && !actuallk.configInfo?.coldConfigData) {
            if (!vt) await generateVisitor();
            await fetchWebConfigInfo();
        }
        if (isWebClient && !signatureTimestamp) await fetchSignatureTimestamp();
        else if (!isWebClient && !webPlayer) await fetchSignatureTimestamp(true);

        const playbackContext = signatureTimestamp ? { playbackContext: { contentPlaybackContext: { vis: 0, splay: false, lactMilliseconds: '-1', signatureTimestamp } } } : {};

        const buildRoute = targetClient === 'WEB_SAFARI'
            ? { videoId: videoId, contentCheckOk: true, racyCheckOk: true, cpn: cpn, context: { client: { ...actuallk } }, ...playbackContext, serviceIntegrityDimensions: { poToken }, attestationRequest: { omitBotguardData: isWebClient } }
            : { playerRequest: { videoId: videoId, contentCheckOk: true, racyCheckOk: true }, disablePlayerResponse: false, cpn: cpn, context: { client: { ...actuallk } }, serviceIntegrityDimensions: { poToken }, attestationRequest: { omitBotguardData: false } };

        const buildHeaders = (useAuth) => {
            const base = {
                "Accept-Encoding": "gzip",
                "Accept-Language": "en",
                "Content-Type": "application/json",
                "X-Goog-Visitor-Id": vt,
                "Origin": `https://${hostdomain}`,
                "X-Origin": `https://${hostdomain}`,
                "X-Youtube-Client-Name": useClient.clientName,
                "X-Youtube-Client-Version": useClient.clientVersion,
                "User-Agent": APIuserAgent,
            };
            if (useAuth && isVRnAuth) {
                return { ...base, "Authorization": "Bearer " + ytauth.token, "Cookie": tempytcookies };
            }
            if (useAuth && ytcookies) {
                return { ...base, "Authorization": GTH(), "Cookie": ytcookies, "X-Youtube-Bootstrap-Logged-In": true, "Alt-Used": hostdomain, "X-Goog-AuthUser": 0 };
            }
            return { ...base, "Cookie": tempytcookies };
        };

        const fetchPlayerResponse = (headers, query = buildQuery) => fetch(`https://${hostdomain}/youtubei/v1/${query}`, {
            method: "POST",
            body: JSON.stringify(buildRoute),
            headers
        }).then(r => r.json());

        let usedAuth = false;
        const hasAuth = isVRnAuth || !!ytcookies;
        const shouldUseAuth = !hasAuth || Date.now() < authRequiredUntil;

        if (shouldUseAuth) {
            usedAuth = true;
            a = await fetchPlayerResponse(buildHeaders(true));
        } else {
            a = await fetchPlayerResponse(buildHeaders(false));
        }

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
            const playabilityError = a?.playabilityStatus?.status || '';
            if (!usedAuth && hasAuth && playabilityError === 'LOGIN_REQUIRED') {
                authRequiredUntil = Date.now() + 3600000;
                usedAuth = true;
                a = await fetchPlayerResponse(buildHeaders(true));
                a = Array.isArray(a) ? a[0] : a;
                a = a?.playerResponse || a;
                const retry_vt = a?.responseContext?.visitorData;
                if (retry_vt) actuallk.visitorData = retry_vt;
            }
            if (!a?.playabilityStatus || a.playabilityStatus.status !== 'OK') {
                vt = "";
                await generateVisitor();
                throw new Error(`InnerTube Error: ${JSON.stringify(a?.playabilityStatus) || null}`);
            }
        }

        const hasUsableFormatUrl = !!(a?.streamingData?.adaptiveFormats || []).find(getFormatUrl) || !!(a?.streamingData?.formats || []).find(getFormatUrl);
        if (!isWebClient && !hasUsableFormatUrl) {
            const fullResponse = await fetchPlayerResponse(buildHeaders(usedAuth), `${apiEndpoint}?prettyPrint=false&alt=json`);
            let fullPlayerResponse = Array.isArray(fullResponse) ? fullResponse[0] : fullResponse;
            fullPlayerResponse = fullPlayerResponse?.playerResponse || fullPlayerResponse;
            if (fullPlayerResponse?.playabilityStatus?.status === 'OK') a = fullPlayerResponse;
        }

        if (streamTypeYT === 2 && a?.streamingData?.hlsManifestUrl) {
            finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
        }
        else if (targetClient === 'WEB_SAFARI' && a?.streamingData?.hlsManifestUrl) {
            finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
        }
        else if (['IOS'].includes(targetClient)) {
            fr = a.streamingData?.adaptiveFormats?.find(c => [140, 139].includes(c.itag) && getFormatUrl(c));
            if (fr) {
                const rawFormatUrl = getFormatUrl(fr);
                const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                finalurl = decipheredUrl + "&ratebypass=true&rn=0&alr=no&fallback_count=0&cver=" + useClient.clientVersion + "&cpn=" + cpn;
                changeLength = true;
                durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
                streamingLength = String(fr.contentLength);
            } else if (a?.videoDetails?.isLiveContent && a?.streamingData?.hlsManifestUrl) {
                finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
            } else {
                throw new Error(`No playable format for IOS`);
            }
        }
        else if (['ANDROID', 'ANDROID_VR', 'VISIONOS'].includes(targetClient)) {
            fr = a.streamingData?.adaptiveFormats?.find(c => [251, 250, 249, 774].includes(c.itag) && getFormatUrl(c));
            if (!fr) fr = a.streamingData?.adaptiveFormats?.find(c => [141, 140, 599].includes(c.itag) && getFormatUrl(c));
            if (fr) {
                const rawFormatUrl = getFormatUrl(fr);
                const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                finalurl = decipheredUrl + "&ratebypass=true&rn=0&alr=no&fallback_count=0&cver=" + useClient.clientVersion + "&cpn=" + cpn;
                changeLength = true;
                durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
                streamingLength = String(fr.contentLength);
            } else {
                const fs = a.streamingData?.formats?.find(getFormatUrl);
                if (fs) {
                    const rawFormatUrl = getFormatUrl(fs);
                    const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                    finalurl = decipheredUrl + "&rn=0&alr=no&fallback_count=0&cver=" + useClient.clientVersion + "&cpn=" + cpn;
                } else if (a?.videoDetails?.isLiveContent && a?.streamingData?.hlsManifestUrl) {
                    finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
                } else {
                    throw new Error(`No playable format for ${targetClient}`);
                }
            }
        }
        else {
            const fs = a.streamingData?.formats?.find(getFormatUrl);
            if (fs) {
                const rawFormatUrl = getFormatUrl(fs);
                const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                finalurl = decipheredUrl + "&rn=0&alr=no&fallback_count=0&cver=" + useClient.clientVersion + "&cpn=" + cpn;
            } else if (a?.videoDetails?.isLiveContent && a?.streamingData?.hlsManifestUrl) {
                finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
            } else {
                throw new Error(`No playable format for ${targetClient}`);
            }
        }

        if (!finalurl) {
            throw new Error(`No playable YouTube format URL for ${targetClient}`);
        }

        if (isHlsUrl(finalurl)) {
            return finalurl;
        }

        let actualfinalurl;

        const filterlocation = await fetch(finalurl, {
            method: "HEAD",
            headers: { "Range": "bytes=0-","User-Agent": APIuserAgent }
        });

        if (filterlocation.status === 403 && changeLength) {
            const bytesPerSecond = parseInt(fr.contentLength) / durationLength;
            const previewLength = String(Math.floor(bytesPerSecond * 60));
            actualfinalurl = filterlocation.url;
            streamingLength = previewLength;
            changeLength = true;
        }
        else {
            actualfinalurl = filterlocation.url;
        }

        templist.push({
            id: lstracks,
            url: actualfinalurl,
            ref: Date.now() + 3600000,
            allowLength: changeLength,
            contentLength: streamingLength
        });

        if (changeLength && streamingLength && parseInt(streamingLength) > 0 && !actualfinalurl?.includes('googlevideo.com/api/manifest/')) {
            const ext = [251, 774].includes(fr?.itag) ? "webm" : "m4a";
            return createChunkedStream(actualfinalurl, parseInt(streamingLength), videoId, ext);
        }

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
    disablePlayer: false,
    ignoreSignInErrors: true,
    slicePlaylist: true,
    useYoutubeDL: false,
    createStream: async (q) => {
        try { return await fallbackYTStream(q.url); }
        catch { return; }
    }
}
