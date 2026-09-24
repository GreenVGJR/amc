const { Logger } = require("@tryforge/forgescript");
const { default_userAgent_desktop } = require('../config.json');

const YTBG_KEY = "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw";
const POTOKEN_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const CAPTION_POT_TTL_FALLBACK = 30 * 60 * 1000;

let bgModulesPromise = null;
let bgModules = null;
function getBgModules() {
    if (!bgModulesPromise) {
        bgModulesPromise = Promise.all([
            import('bgutils-js/botguard'),
            import('bgutils-js/webpo'),
            import('bgutils-js/utils')
        ]).then(([botguard, webpo, utils]) => {
            bgModules = {
                getChallenge: botguard.getChallenge,
                BotGuardClient: botguard.BotGuardClient,
                WebPoMinter: webpo.WebPoMinter,
                createColdStartToken: webpo.createColdStartToken,
                parseLooseJSON: utils.parseLooseJSON
            };
            return bgModules;
        });
    }
    return bgModulesPromise;
}

let bgDomInitialized = false;
let bgProgram = null;
let bgGlobalName = null;
let bgVisitorData = null;

function setVisitorData(visitorData) {
    bgVisitorData = visitorData;
}
let bgInitPromise = null;
let bgRefreshPromise = null;
const poTokenCache = new Map();
const POT_CACHE_KEY_VERSION = '|v2'; // bump when mint inputs change (drops stale pots)
function potCacheKey(videoId) {
    return `${videoId}${POT_CACHE_KEY_VERSION}`;
}

function ensureBgDom(ytConfig) {
    if (bgDomInitialized && !ytConfig) return;
    const dom = new (require('jsdom').JSDOM)('<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>', {
        url: 'https://www.youtube.com/',
        referrer: 'https://www.youtube.com/',
        userAgent: default_userAgent_desktop
    });
    if (ytConfig) dom.window.yt = { config_: ytConfig };
    Object.assign(globalThis, {
        ...(ytConfig ? { yt: dom.window.yt } : {}),
        window: dom.window,
        document: dom.window.document,
        location: dom.window.location,
        origin: dom.window.origin
    });
    if (!('navigator' in globalThis)) {
        Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator });
    }
    bgDomInitialized = true;
}

// Challenge source 1 (preferred for web clients): page-embedded ytAtN.
async function installFromPageChallenge() {
    const { parseLooseJSON } = await getBgModules();
    const pageRes = await fetch('https://www.youtube.com/', {
        headers: {
            'accept': '*/*',
            'accept-language': 'en-US',
            'user-agent': default_userAgent_desktop
        }
    });
    if (!pageRes.ok) throw new Error(`watch page fetch failed: ${pageRes.status}`);
    const pageHtml = await pageRes.text();
    const ytcfgMatch = pageHtml.match(/ytcfg\.set\(({.+?})\);/s);
    if (!ytcfgMatch) throw new Error('ytcfg not found in page HTML');
    let ytConfig;
    try {
        ytConfig = JSON.parse(ytcfgMatch[1]);
    } catch {
        throw new Error('ytcfg parse failed');
    }
    const atnMatch = pageHtml.match(/window\.ytAtN\(\s*({[\s\S]*?})\s*\)/);
    if (!atnMatch) throw new Error('ytAtN challenge not found in page HTML');
    const challengeResponse = parseLooseJSON(atnMatch[1])?.R;
    const bgChallenge = challengeResponse?.bgChallenge;
    if (!bgChallenge?.program || !bgChallenge?.globalName) throw new Error('page bgChallenge incomplete');
    const interpreterUrl = bgChallenge.interpreterUrl?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;
    if (!interpreterUrl) throw new Error('page interpreter URL missing');
    const interpRes = await fetch(`https:${interpreterUrl}`, { headers: { 'user-agent': default_userAgent_desktop } });
    if (!interpRes.ok) throw new Error(`interpreter fetch failed: ${interpRes.status}`);
    const interpreterJs = await interpRes.text();
    if (!interpreterJs) throw new Error('empty interpreter script');
    ensureBgDom(ytConfig);
    new Function(interpreterJs)();
    bgProgram = bgChallenge.program;
    bgGlobalName = bgChallenge.globalName;
}

// Challenge source 2 (fallback; fine for YTMUSIC): WAA Create API.
async function installFromWaaChallenge() {
    ensureBgDom();
    const { getChallenge } = await getBgModules();
    const challenge = await getChallenge({
        requestKey: POTOKEN_REQUEST_KEY,
        fetchFunction: fetch,
        useYouTubeAPI: true
    });
    if (!challenge) throw new Error('BotGuard challenge unavailable');
    const interpreterJs = challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!interpreterJs) throw new Error('BotGuard interpreter script unavailable');
    new Function(interpreterJs)();
    bgProgram = challenge.program;
    bgGlobalName = challenge.globalName;
}

async function installBotGuardInterpreter() {
    if (bgProgram && bgGlobalName) return;
    try {
        await installFromPageChallenge();
        Logger.info(`/ [YoutubeBG] BotGuard challenge source: page ytAtN`);
    } catch (e) {
        console.error('Page challenge failed, falling back to WAA Create:', e?.message || e);
        await installFromWaaChallenge();
    }
}

// Integrity token and its minter MUST come from the same BotGuard snapshot,
// and the minter must be created ONCE per integrity token: every extra
// WebPoMinter.create() on the same webPoSignalOutput chains VM state and
// mints ever-longer (+~88 chars) server-rejected pots. Reuse one minter.
let bgMintPair = null; // { minter, exp }
async function attestMintPair() {
    if (!bgProgram || !bgGlobalName) await installBotGuardInterpreter();
    const { BotGuardClient, WebPoMinter } = await getBgModules();
    const botguard = await BotGuardClient.create({ program: bgProgram, globalName: bgGlobalName, globalObject: globalThis });
    const webPoSignalOutput = [];
    // No contentBinding: with page-issued programs a visitor-bound snapshot
    // still yields a minter, but its pots are media-rejected after ~768KB.
    const botguardResponse = await botguard.snapshot({ webPoSignalOutput });
    const integrityTokenResponse = await fetch('https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json+protobuf',
            'x-goog-api-key': YTBG_KEY,
            'x-user-agent': 'grpc-web-javascript/0.1',
            'user-agent': default_userAgent_desktop
        },
        body: JSON.stringify([POTOKEN_REQUEST_KEY, botguardResponse])
    });
    if (!integrityTokenResponse.ok) {
        const snippet = await integrityTokenResponse.text().catch(() => '');
        throw new Error(`GenerateIT failed: HTTP ${integrityTokenResponse.status} ${(snippet || '').slice(0, 160)}`);
    }
    const integrityTokenJson = await integrityTokenResponse.json();
    const [rawToken, estimatedTtlSecs] = integrityTokenJson;
    if (typeof rawToken !== 'string' || !rawToken) throw new Error('BotGuard integrity token unavailable');
    const minter = await WebPoMinter.create({ integrityToken: rawToken }, webPoSignalOutput);
    return {
        minter,
        exp: Date.now() + (estimatedTtlSecs ? estimatedTtlSecs * 1000 : CAPTION_POT_TTL_FALLBACK)
    };
}

async function ensureMintPair() {
    if (bgMintPair && bgMintPair.exp > Date.now() && bgMintPair.minter) return bgMintPair;
    if (bgRefreshPromise) return bgRefreshPromise;
    bgRefreshPromise = (async () => {
        bgMintPair = await attestMintPair();
        return bgMintPair;
    })().finally(() => { bgRefreshPromise = null; });
    return bgRefreshPromise;
}

async function refreshBotGuardIntegrity() {
    bgMintPair = null;
    return ensureMintPair();
}

async function mintWithPair(contentBinding) {
    const pair = await ensureMintPair();
    return pair.minter.mintAsWebsafeString(contentBinding);
}

async function initBotGuard() {
    if (bgProgram && bgGlobalName && bgMintPair) return;
    if (bgInitPromise) return bgInitPromise;
    bgInitPromise = (async () => {
        await installBotGuardInterpreter();
        await ensureMintPair();
        Logger.info(`/ [YoutubeConfig] BotGuard initialized`);
    })().finally(() => { bgInitPromise = null; });
    return bgInitPromise;
}

async function generateCbPotFall(videoId) {
    // Force a fresh challenge (page ytAtN first, WAA Create as fallback),
    // then attest + mint atomically from one snapshot.
    bgProgram = null;
    bgGlobalName = null;
    bgMintPair = null;
    await installBotGuardInterpreter();
    let token;
    let isReal = true;
    try {
        token = await mintWithPair(videoId);
    } catch (e) {
        // integrity token decode failed, fall back to cold start
        console.error('WebPoMinter failed, using cold start fallback:', e?.message || e);
        token = generateAnonPOT(videoId);
        isReal = false;
    }
    if (!token) throw new Error('poToken generation produced no token');
    return { token, isReal };
}

async function generateCbPot(videoId, visitorData) {
    if (visitorData) setVisitorData(visitorData);
    const cacheKey = potCacheKey(videoId);
    const cached = poTokenCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) return { token: cached.token, isReal: cached.isReal };
    try {
        let token;
        let isReal = true;
        let exp = Date.now() + CAPTION_POT_TTL_FALLBACK;
        try {
            token = await mintWithPair(videoId);
            exp = (await ensureMintPair()).exp;
        } catch (e) {
            // Cached program may be stale; retry once with a fresh challenge.
            try {
                return await generateCbPotFall(videoId);
            } catch {
                console.error('WebPoMinter content token failed, using cold start:', e?.message || e);
                token = generateAnonPOT(videoId);
                isReal = false;
            }
        }
        if (!token) throw new Error('poToken generation produced no token');
        poTokenCache.set(cacheKey, { token, exp, isReal });
        return { token, isReal };
    } catch (e) {
        console.error('Content-bound poToken generation failed, using cold start:', e?.message || e);
        const fallbackToken = generateAnonPOT(videoId);
        poTokenCache.set(cacheKey, { token: fallbackToken, exp: Date.now() + CAPTION_POT_TTL_FALLBACK, isReal: false });
        return { token: fallbackToken, isReal: false };
    }
}

let sessionPoTokenCache = { poToken: null, exp: 0, isReal: false };

async function generateSessionPoToken(visitorData, forceRefresh = false) {
    if (visitorData) setVisitorData(visitorData);
    if (!forceRefresh && sessionPoTokenCache.poToken && sessionPoTokenCache.exp > Date.now()) {
        return sessionPoTokenCache;
    }
    const mintSession = async () => {
        const token = await mintWithPair(undefined);
        if (!token) throw new Error('Session poToken generation produced no token');
        sessionPoTokenCache = { poToken: token, exp: (await ensureMintPair()).exp, isReal: true };
        return sessionPoTokenCache;
    };
    try {
        if (forceRefresh) bgMintPair = null;
        return await mintSession();
    } catch (e) {
        // Cached program may be stale; retry once with a fresh challenge.
        try {
            bgProgram = null;
            bgGlobalName = null;
            bgMintPair = null;
            await installBotGuardInterpreter();
            return await mintSession();
        } catch {
            console.error('Session poToken generation failed, using cold start fallback:', e?.message || e);
            const fallbackToken = generateAnonPOT();
            sessionPoTokenCache = { poToken: fallbackToken, exp: Date.now() + CAPTION_POT_TTL_FALLBACK, isReal: false };
            return sessionPoTokenCache;
        }
    }
}

function generateAnonPOT(id) {
    const identifier = id || Math.random().toString(36).substring(2, 13);
    if (bgModules && bgModules.createColdStartToken) return bgModules.createColdStartToken(identifier);
    return identifier;
}

// Drops the cached challenge, attested pair and minted pots so the next
// mint re-attests from a fresh page challenge (programs rotate often).
function invalidateBotGuard() {
    bgProgram = null;
    bgGlobalName = null;
    bgMintPair = null;
    poTokenCache.clear();
}

module.exports = { initBotGuard, refreshBotGuardIntegrity, generateCbPot, generateSessionPoToken, generateAnonPOT, setVisitorData, invalidateBotGuard };