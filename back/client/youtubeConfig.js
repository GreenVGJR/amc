const { default_userAgent_desktop, streamTypeYT, useClientYT, useBearer, cacheTrackYT, skipOnCheckFormat } = require('../config.json');
const ytClients = require('./youtubeClients.js');
const targetClient = useClientYT?.toUpperCase();
const useClient = ytClients?.[targetClient];
if (!useClient) {
    const available = Object.keys(ytClients).join(", ");
    throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

if (['WEB_CREATOR', 'WEB_PARENT'].includes(targetClient) && !process.env.YOUTUBE_COOKIES) {
    throw new Error(`Please put youtube cookies first before using this client. (${targetClient})`);
}

const isWebClient = useClient.targetDomain !== 'youtubei.googleapis.com';

// Forgescript Logger
const { Logger } = require("@tryforge/forgescript");

const { Readable } = require('stream');
const { randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');
const cacheDir = path.join(__dirname, 'ytCacheTracks');
fs.mkdirSync(cacheDir, { recursive: true });

const { initBotGuard, generateCbPot, generateSessionPoToken, generateAnonPOT, setVisitorData } = require('./youtubeBG.js');

let vt;
let datasyncID = "";
let configInfoPromise = null;
let configInfoAttempted = false;
let signatureTimestamp = null;
let signatureTimestampPromise = null;
let webPlayer = null;
let authRequiredUntil = 0;

let poToken = generateAnonPOT();

const apiEndpoint = isWebClient ? 'player' : 'get_watch';
const apiFields = isWebClient
    ? 'responseContext(visitorData),playabilityStatus,streamingData(serverAbrStreamingUrl,hlsManifestUrl,formats(url,signatureCipher),adaptiveFormats(itag,url,contentLength,signatureCipher)),videoDetails(isLiveContent,lengthSeconds)'
    : 'playerResponse(responseContext(visitorData),playabilityStatus,streamingData(serverAbrStreamingUrl,hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent,lengthSeconds))';
const buildQuery = apiEndpoint + '?prettyPrint=false&alt=json&fields=' + apiFields;

const APIuserAgent = useClient?.userAgent || default_userAgent_desktop;
let ytauth;
let ytcookies;
let tempytcookies;
const hostdomain = useClient.targetDomain;
const lk = { context: { client: { clientName: useClient.clientName, clientVersion: useClient.clientVersion } } };
const sortTargetOpus = [774, 251, 250, 249];
const sortTargetM4a = [141, 140, 139];
var templist = [];

function normalizeCookies(cookies) {
    if (!cookies) return "";
    const list = Array.isArray(cookies) ? cookies : cookies.split(",");
    return list.map(c => c.trim().split(";")[0]).filter(Boolean).join("; ");
}

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
let ytcookiesapi;
delete actuallk.targetDomain;
delete actuallk.client_id;
delete actuallk.client_secret;
delete actuallk.embedded;
delete actuallk.embedUrl;
actuallk.hl = "en";
actuallk.gl = "US";
const isEmbeddedClient = useClient.embedded === true;
const embedUrl = useClient.embedUrl;

let visitorPromise = null;
const generateVisitor = async () => {
    if (visitorPromise) return visitorPromise;
    visitorPromise = (async () => {
        try {
            const url = "https://www.youtube.com/sw.js_data";
            const headers = { "User-Agent": default_userAgent_desktop };
            if (ytcookies) {
                headers.Cookie = ytcookies;
            }
            const res = await fetch(url, { method: "GET", headers });
            ytcookiesapi = ytcookies || normalizeCookies(res.headers.getSetCookie());
            const raw = await res.text();
            const jsonPart = raw.split("\n")[2];
            const data = jsonPart ? JSON.parse(jsonPart) : null;
            vt = data?.[0]?.[2]?.[0]?.[0]?.[13] || "";
            actuallk.visitorData = vt;
            setVisitorData(vt);
            const rawSync = data?.[0]?.[3];
            datasyncID = typeof rawSync === "string" ? rawSync.split('||')[0] : "";
            Logger.info(`/ [YoutubeConfig] Fetched Visitor Data`);
        } catch (e) {
            console.error(e);
        } finally {
            visitorPromise = null;
        }
    })();
    return visitorPromise;
};

async function fetchWebConfigInfo() {
    if (!isWebClient || actuallk.configInfo?.coldConfigData || configInfoAttempted) return;
    if (configInfoPromise) return configInfoPromise;

    configInfoPromise = fetch(`https://${hostdomain}/youtubei/v1/config?prettyPrint=false&alt=json`, {
        method: "POST",
        mode: "same-origin",
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
        body: JSON.stringify({ context: { client: { ...actuallk } }, serviceIntegrityDimensions: { poToken } })
    }).then(r => r.json()).then(res => {
        const gcg = res?.responseContext?.globalConfigGroup;
        const configInfo = {
            coldConfigData: gcg?.rawColdConfigGroup?.configData,
            coldHashData: gcg?.coldHashData,
            hotHashData: gcg?.hotHashData
        };
        if (configInfo.coldConfigData && configInfo.coldHashData && configInfo.hotHashData) {
            actuallk.configInfo = configInfo;
        } else {
            configInfoAttempted = true;
        }
    }).finally(() => {
        configInfoPromise = null;
        Logger.info(`/ [YoutubeConfig] Fetched Client Config`);
    });

    return configInfoPromise;
}

function extractYtcfg(html) {
    const m = html.match(/ytcfg\.set\(\{([\s\S]*?)\}\)\s*;/);
    if (!m) return null;
    try {
        return JSON.parse('{' + m[1] + '}');
    } catch {
        return null;
    }
}

let embeddedContextCache = null;
let embeddedContextPromise = null;
let embeddedRetried = false;

async function fetchEmbeddedContext(videoId) {
    if (!isEmbeddedClient) return null;
    if (embeddedContextCache) return embeddedContextCache;
    if (embeddedContextPromise) return embeddedContextPromise;

    embeddedContextPromise = (async () => {
        try {
            const url = `https://${hostdomain}/embed/${videoId}?html5=1`;
            const headers = { "User-Agent": APIuserAgent, "Referer": embedUrl };
            if (ytcookies) headers.Cookie = ytcookies;
            const res = await fetch(url, { method: "GET", headers });
            const html = await res.text();
            const ytcfg = extractYtcfg(html);
            const thirdParty = ytcfg?.INNERTUBE_CONTEXT?.thirdParty || null;
            const encryptedHostFlags = ytcfg?.WEB_PLAYER_CONTEXT_CONFIGS?.WEB_PLAYER_CONTEXT_CONFIG_ID_EMBEDDED_PLAYER?.encryptedHostFlags || null;
            embeddedContextCache = { thirdParty, encryptedHostFlags };
            Logger.info(`/ [YoutubeConfig] Fetched Web Embedded Config${encryptedHostFlags ? '' : ' (encryptedHostFlags absent)'}`);
        } catch (e) {
            console.error(e);
            embeddedContextCache = null;
        } finally {
            embeddedContextPromise = null;
        }
    })();

    return embeddedContextPromise;
}

async function fetchSignatureTimestamp(force = false) {
    if (!force && !isWebClient) return;
    if (signatureTimestamp || (webPlayer && !force)) return;
    if (signatureTimestampPromise) return signatureTimestampPromise;

    signatureTimestampPromise = Promise.resolve().then(async () => {
        const { Player, Platform } = require('youtubei.js');
        Platform.shim.eval = (data, env) => {
            return new Function(...Object.keys(env), data.output)(...Object.values(env));
        };
        const player = await Player.create();
        webPlayer = player;
        signatureTimestamp = player?.signature_timestamp;
    }).finally(() => {
        signatureTimestampPromise = null;
        Logger.info(`/ [YoutubeConfig] Fetched Youtubei Player`);
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
            const decipheredDummyUrl = await webPlayer.decipher(null, dummyUrl);
            const decipheredN = new URL(decipheredDummyUrl).searchParams.get('n');
            if (decipheredN) {
                processedUrl = processedUrl.replace(`/n/${rawN}/`, `/n/${decipheredN}/`);
            }
        } catch (e) {
            console.error("Error deciphering path-based n-token:", e);
        }
    }

    try {
        // Passing the value as the 2nd arg (signature_cipher) makes youtubei.js
        // also append the deciphered `sig`/signature, not just the `n` token.
        processedUrl = await webPlayer.decipher(null, processedUrl);
    } catch (e) {
        console.error("Error deciphering query-based parameters:", e);
    }

    return processedUrl;
}

function createChunkedStream(url, totalSize, videoId, ext) {
    let start = 0;
    const chunkSize = 1024 * 1024 * 10;
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

                const totalLength = chunks.reduce((n, b) => n + b.length, 0);
                const merged = Buffer.allocUnsafe(totalLength);
                let offset = 0;
                for (const buf of chunks) {
                    buf.copy(merged, offset);
                    offset += buf.length;
                }

                return { buffer: merged, isLast: chunkIsLast, end };
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

function createLiveChunkedStream(baseUrl) {
    let rn = 0;
    let isEnded = false;
    let isReading = false;
    let noContentRetries = 0;
    const maxNoContentRetries = 10;
    let abortControllers = [];

    async function fetchLiveChunk() {
        const chunkUrl = baseUrl.includes('&rn=')
            ? baseUrl.replace(/&rn=\d+/, `&rn=${rn}`)
            : `${baseUrl}&rn=${rn}`;

        const ac = new AbortController();
        abortControllers.push(ac);

        const response = await fetch(chunkUrl, {
            headers: { "User-Agent": APIuserAgent },
            signal: ac.signal
        });
        return response;
    }

    return new Readable({
        highWaterMark: 0,
        async read() {
            if (isEnded || isReading) return;
            isReading = true;

            try {
                abortControllers = [];
                const fetchStart = Date.now();
                const response = await fetchLiveChunk();
                const fetchElapsed = Date.now() - fetchStart;

                if (response.status === 404 || response.status === 410) {
                    isEnded = true;
                    this.push(null);
                    return;
                }

                if (response.status === 204) {
                    noContentRetries++;
                    if (noContentRetries >= maxNoContentRetries) {
                        isEnded = true;
                        this.push(null);
                        return;
                    }
                    await new Promise(r => setTimeout(r, 1000));
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Live stream chunk fetch failed: HTTP ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                if (buffer.length === 0) {
                    noContentRetries++;
                    if (noContentRetries >= maxNoContentRetries) {
                        isEnded = true;
                        this.push(null);
                        return;
                    }
                    await new Promise(r => setTimeout(r, 1000));
                    return;
                }

                noContentRetries = 0;
                rn++;
                await new Promise(r => setTimeout(r, 200));
                this.push(buffer);
            } catch (err) {
                if (err?.name === 'AbortError') {
                    this.destroy();
                } else {
                    console.error("Live chunk fetch error:", err);
                    this.destroy(err);
                }
            } finally {
                isReading = false;
            }
        },
        destroy(err, callback) {
            isEnded = true;
            for (const ac of abortControllers) ac.abort();
            if (callback) callback(err);
        }
    });
}

function isHlsUrl(url) {
    return typeof url === "string" && (url.includes('googlevideo.com/api/manifest/') || url.includes('.m3u8'));
}

function getFormatUrl(format) {
    return format?.url || format?.signatureCipher || null;
}

function withStreamParams(url, params) {
    try {
        const u = new URL(url);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
        }
        return u.toString();
    } catch {
        return url;
    }
}

function filterPlayerObject(YTPlayerResponse) {
    return (Array.isArray(YTPlayerResponse) ? YTPlayerResponse[0] : YTPlayerResponse)?.playerResponse || YTPlayerResponse;
}

generateVisitor().then(() => Promise.all([
    fetchWebConfigInfo(),
    fetchSignatureTimestamp(),
    ...(isWebClient ? [initBotGuard().then(() => generateSessionPoToken(actuallk.visitorData)).then(() => Logger.info(`/ [YoutubeConfig] Generated Session Token`))] : [])
]));

const warmupEmbeddedClient = async () => {
    if (!isEmbeddedClient) return;
    try {
        if (!vt) await generateVisitor();
        await Promise.all([
            fetchEmbeddedContext('dQw4w9WgXcQ'), // You know the rules
            fetchSignatureTimestamp(),
            initBotGuard().then(() => generateSessionPoToken(actuallk.visitorData))
        ]);
    } catch (e) {
        console.error(`[YoutubeConfig] Embedded warmup failed:`, e?.message || e);
    }
};
warmupEmbeddedClient();

async function fallbackYTStream(lstracks) {
    refreshYtAuth();
    embeddedRetried = false;

    const videoId = lstracks.includes('watch?v=') ? lstracks.split('watch?v=')[1].split('&')[0] : lstracks;
    poToken = generateAnonPOT();
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
                const ext = checklist.url.includes('mime=audio/webm') ? 'webm' : 'm4a';
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

        if (isWebClient && !actuallk.configInfo?.coldConfigData && !isEmbeddedClient) {
            if (!vt) await generateVisitor();
            await fetchWebConfigInfo(); // Just in case it fails before
        }
        if (isWebClient && !signatureTimestamp) await fetchSignatureTimestamp();
        let embeddedContext = null;
        if (isEmbeddedClient) {
            if (!vt) await generateVisitor();
            embeddedContext = await fetchEmbeddedContext(videoId);
        }

        let sessionPoToken = poToken;
        if (isWebClient) {
            let sessionPoData = await generateSessionPoToken(actuallk.visitorData);
            if (sessionPoData.exp <= Date.now()) {
                sessionPoData = await generateSessionPoToken(actuallk.visitorData, true);
            }
            sessionPoToken = sessionPoData.poToken;
        }

        const playbackContext = signatureTimestamp ? { playbackContext: { contentPlaybackContext: { vis: 0, splay: false, lactMilliseconds: '-1', signatureTimestamp, ...(embeddedContext?.encryptedHostFlags ? { encryptedHostFlags: embeddedContext.encryptedHostFlags } : {}) } } } : {};

        const embeddedThirdParty = embeddedContext?.thirdParty
            ? { ...embeddedContext.thirdParty, embedUrl }
            : { embedUrl };

        const buildRoute = isWebClient
            ? { videoId: videoId, contentCheckOk: true, racyCheckOk: true, cpn: cpn, context: { client: { ...actuallk, ...(isEmbeddedClient ? { originalUrl: `https://${hostdomain}/embed/${videoId}?html5=1` } : {}) }, ...(isEmbeddedClient ? { thirdParty: embeddedThirdParty } : {}) }, ...playbackContext, serviceIntegrityDimensions: { poToken: sessionPoToken }, attestationRequest: { omitBotguardData: false } }
            : { playerRequest: { videoId: videoId, contentCheckOk: true, racyCheckOk: true }, disablePlayerResponse: false, cpn: cpn, context: { client: { ...actuallk } }, serviceIntegrityDimensions: { poToken }, attestationRequest: { omitBotguardData: false } };

        const buildHeaders = (useAuth) => {
            const base = {
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
            if (useAuth && ytcookies && isWebClient) {
                return { ...base, "Authorization": GTH(), "Cookie": ytcookies, "X-Youtube-Bootstrap-Logged-In": true, "Alt-Used": hostdomain, "X-Goog-AuthUser": 0 };
            }
            return { ...base, "Cookie": tempytcookies };
        };

        const fetchPlayerResponse = (headers, query = buildQuery) => fetch(`https://${hostdomain}/youtubei/v1/${query}`, {
            method: "POST",
            mode: "same-origin",
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
        a = filterPlayerObject(a);

        const new_vt = a?.responseContext?.visitorData;
        if (new_vt) { actuallk.visitorData = new_vt; setVisitorData(new_vt); }

        const embedderDenied = a?.playabilityStatus?.errorScreen?.playerErrorMessageRenderer?.reason?.runs?.some(r => /Error code: 152/.test(r.text)) || a?.playabilityStatus?.errorScreen?.playerErrorMessageRenderer?.errorCode === 'PLAYABILITY_ERROR_CODE_EMBEDDER_IDENTITY_DENIED';
        if (isEmbeddedClient && embedderDenied && !embeddedRetried) {
            embeddedRetried = true;
            Logger.info(`/ [YoutubeConfig] EMBEDDER_IDENTITY_DENIED, refreshing embedded context`);
            embeddedContextCache = null;
            await generateVisitor();
            sessionPoToken = (await generateSessionPoToken(actuallk.visitorData, true)).poToken;
            embeddedContext = await fetchEmbeddedContext(videoId);
            const retryThirdParty = embeddedContext?.thirdParty ? { ...embeddedContext.thirdParty, embedUrl } : { embedUrl };
            const retryRoute = { videoId: videoId, contentCheckOk: true, racyCheckOk: true, cpn: cpn, context: { client: { ...actuallk, originalUrl: `https://${hostdomain}/embed/${videoId}?html5=1` }, thirdParty: retryThirdParty }, ...playbackContext, serviceIntegrityDimensions: { poToken: sessionPoToken }, attestationRequest: { omitBotguardData: false } };
            a = filterPlayerObject(await fetch(`https://${hostdomain}/youtubei/v1/${buildQuery}`, {
                method: "POST",
                body: JSON.stringify(retryRoute),
                headers: buildHeaders(usedAuth)
            }).then(r => r.json()));
            const retried_vt = a?.responseContext?.visitorData;
            if (retried_vt) { actuallk.visitorData = retried_vt; setVisitorData(retried_vt); }
        }

        if (!a?.playabilityStatus || a.playabilityStatus.status !== 'OK') {
            const playabilityError = a?.playabilityStatus?.status || '';
            if (!usedAuth && hasAuth && playabilityError === 'LOGIN_REQUIRED') {
                authRequiredUntil = Date.now() + 3600000;
                usedAuth = true;
                a = filterPlayerObject(await fetchPlayerResponse(buildHeaders(true)));
                const retry_vt = a?.responseContext?.visitorData;
                if (retry_vt) { actuallk.visitorData = retry_vt; setVisitorData(retry_vt); }
            }
            if (!a?.playabilityStatus || a.playabilityStatus.status !== 'OK') {
                vt = "";
                await generateVisitor();
                throw new Error(`InnerTube Error: ${JSON.stringify(a?.playabilityStatus) || null}`);
            }
        }

        let forceLegacy = false;
        let actualfinalurl;
        let fsFmt = {};
        let frso = {};
        const isLive = a?.videoDetails?.isLiveContent && a?.videoDetails?.lengthSeconds == 0;

        for (let attempt = 0; attempt < 2; attempt++) {
            forceLegacy = attempt === 1;
            finalurl = "";
            changeLength = false;
            streamingLength = null;
            durationLength = null;
            fr = null;

            if (isLive && a?.streamingData?.hlsManifestUrl) {
                finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
            }
            else if (streamTypeYT === 2 && a?.streamingData?.hlsManifestUrl) {
                finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
            }
            else {
                fsFmt = a.streamingData?.formats?.find(getFormatUrl);
                frso = a.streamingData?.adaptiveFormats?.filter(c => [...sortTargetOpus, ...sortTargetM4a].includes(c.itag) && getFormatUrl(c)).sort((a, b) => b.itag - a.itag)?.[0];
                if (frso && !forceLegacy) {
                    const rawFormatUrl = getFormatUrl(frso);
                    const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                    finalurl = withStreamParams(decipheredUrl, { ratebypass: 'true', rn: '0', alr: 'no', cver: useClient.clientVersion, cpn });
                    changeLength = true;
                    durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
                    streamingLength = String(frso.contentLength);
                }
                else {
                    const rawFormatUrl = getFormatUrl(fsFmt);
                    const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
                    finalurl = withStreamParams(decipheredUrl, { rn: '0', alr: 'no', cver: useClient.clientVersion, cpn });
                }
            }

            if (!finalurl && a?.streamingData?.hlsManifestUrl) {
                finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
            }

            if (!finalurl && a?.streamingData?.serverAbrStreamingUrl) {
                throw new Error(`This content unavailable due youtube enforce SABR-only`);
            }

            if (!finalurl) {
                throw new Error(`No playable YouTube format URL for ${targetClient}`);
            }

            if (isHlsUrl(finalurl)) {
                return finalurl;
            }

            let contentPoToken;
            if (isWebClient) contentPoToken = encodeURIComponent(await generateCbPot(videoId, actuallk.visitorData));

            let filterlocation;
            let secfinalurl;
            let finalWithPot;
            const maxHeadRetries = 4;

            for (let headAttempt = 0; headAttempt <= maxHeadRetries; headAttempt++) {
                filterlocation = await fetch(finalurl + (contentPoToken ? "&pot=" + contentPoToken : ""), {
                    method: "HEAD",
                    headers: { "Range": "bytes=0-", "User-Agent": APIuserAgent }
                });

                secfinalurl = filterlocation.url;
                finalWithPot = contentPoToken && !secfinalurl.includes("pot=") ? (secfinalurl + "&pot=" + contentPoToken) : secfinalurl;

                if (filterlocation.status !== 403 || !changeLength || skipOnCheckFormat) {
                    break;
                }

                if (headAttempt < maxHeadRetries) {
                    await new Promise(r => setTimeout(r, 1000 * (headAttempt + 1)));
                }
            }

            if (filterlocation.status === 403 && changeLength) {
                if (isWebClient && !forceLegacy) {
                    continue;
                }
                const bytesPerSecond = parseInt(frso.contentLength) / durationLength;
                const previewLength = String(Math.floor(bytesPerSecond * 60));
                actualfinalurl = finalWithPot;
                streamingLength = previewLength;
                changeLength = true;
            }
            else {
                actualfinalurl = finalWithPot;
            }

            break;
        }

        if (isLive) {
            return createLiveChunkedStream(actualfinalurl);
        }

        templist.push({
            id: lstracks,
            url: actualfinalurl,
            ref: Date.now() + 3600000,
            allowLength: changeLength,
            contentLength: streamingLength
        });

        if (changeLength && streamingLength && parseInt(streamingLength) > 0 && !isHlsUrl(actualfinalurl)) {
            const ext = sortTargetOpus.includes((frso && !forceLegacy ? frso : fsFmt)?.itag) ? "webm" : "m4a";
            return createChunkedStream(actualfinalurl, parseInt(streamingLength), videoId, ext);
        }

        return actualfinalurl;
    }
    catch (e) {
        console.error(e);
        return e;
    }
}

module.exports = {
    get cookie() { return ytcookiesapi; },
    generateWithPoToken: false,
    disablePlayer: false,
    ignoreSignInErrors: true,
    slicePlaylist: true,
    useYoutubeDL: false,
    innertubeConfigRaw: {
        generate_session_locally: true
    },
    createStream: async (q) => {
        try { return await fallbackYTStream(q.url); }
        catch { return; }
    }
}