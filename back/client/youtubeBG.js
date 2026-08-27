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
            import('bgutils-js/webpo')
        ]).then(([botguard, webpo]) => {
            bgModules = {
                getChallenge: botguard.getChallenge,
                BotGuardClient: botguard.BotGuardClient,
                WebPoMinter: webpo.WebPoMinter,
                createColdStartToken: webpo.createColdStartToken
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

function contentBindingFor() {
    return bgVisitorData ? { c: bgVisitorData } : undefined;
}
let bgIntegrityTokenData = null;
let bgIntegrityExp = 0;
let bgInitPromise = null;
let bgRefreshPromise = null;
const poTokenCache = new Map();

function ensureBgDom() {
    if (bgDomInitialized) return;
    const dom = new (require('jsdom').JSDOM)('', { url: 'https://www.youtube.com/' });
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    bgDomInitialized = true;
}

async function installBotGuardInterpreter() {
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

async function refreshBotGuardIntegrity() {
    if (bgRefreshPromise) return bgRefreshPromise;
    bgRefreshPromise = (async () => {
        if (!bgProgram || !bgGlobalName) await installBotGuardInterpreter();
        const { BotGuardClient } = await getBgModules();
        const botguard = await BotGuardClient.create({ program: bgProgram, globalName: bgGlobalName, globalObject: globalThis });
        const webPoSignalOutput = [];
        const botguardResponse = await botguard.snapshot({ webPoSignalOutput, contentBinding: contentBindingFor() });
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
        const integrityTokenJson = await integrityTokenResponse.json();
        const [rawToken, estimatedTtlSecs] = integrityTokenJson;
        if (typeof rawToken !== 'string' || !rawToken) throw new Error('BotGuard integrity token unavailable');
        bgIntegrityTokenData = { integrityToken: rawToken };
        bgIntegrityExp = Date.now() + (estimatedTtlSecs ? estimatedTtlSecs * 1000 : CAPTION_POT_TTL_FALLBACK);
    })().finally(() => { bgRefreshPromise = null; });
    return bgRefreshPromise;
}

async function initBotGuard() {
    if (bgProgram && bgGlobalName) return;
    if (bgInitPromise) return bgInitPromise;
    bgInitPromise = (async () => {
        await installBotGuardInterpreter();
        await refreshBotGuardIntegrity();
        Logger.info(`/ [YoutubeConfig] BotGuard initialized`);
    })().finally(() => { bgInitPromise = null; });
    return bgInitPromise;
}

// Re-snapshot the loaded BotGuard program with the current visitor binding to
// get a fresh webPoSignalOutput. Reuses the cached integrity token for minting.
async function snapshotWithVisitor() {
    if (!bgProgram || !bgGlobalName) await installBotGuardInterpreter();
    const { BotGuardClient } = await getBgModules();
    const botguard = await BotGuardClient.create({ program: bgProgram, globalName: bgGlobalName, globalObject: globalThis });
    const webPoSignalOutput = [];
    await botguard.snapshot({ webPoSignalOutput, contentBinding: contentBindingFor() });
    return webPoSignalOutput;
}

async function generateCbPotFall(videoId) {
    ensureBgDom();
    const { getChallenge, BotGuardClient, WebPoMinter } = await getBgModules();
    const challenge = await getChallenge({
        requestKey: POTOKEN_REQUEST_KEY,
        fetchFunction: fetch,
        useYouTubeAPI: true
    });
    if (!challenge) throw new Error('BotGuard challenge unavailable');
    const interpreterJs = challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!interpreterJs) throw new Error('BotGuard interpreter script unavailable');
    new Function(interpreterJs)();
    const botguard = await BotGuardClient.create({ program: challenge.program, globalName: challenge.globalName, globalObject: globalThis });
    const webPoSignalOutput = [];
    const botguardResponse = await botguard.snapshot({ webPoSignalOutput, contentBinding: contentBindingFor() });
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
    const integrityTokenJson = await integrityTokenResponse.json();
    const [rawToken, estimatedTtlSecs] = integrityTokenJson;
    if (typeof rawToken !== 'string' || !rawToken) throw new Error('BotGuard integrity token unavailable');
    if (estimatedTtlSecs) bgIntegrityExp = estimatedTtlSecs * 1000;
    else bgIntegrityExp = CAPTION_POT_TTL_FALLBACK;
    let token;
    let isReal = true;
    try {
        const minter = await WebPoMinter.create({ integrityToken: rawToken }, webPoSignalOutput);
        token = await minter.mintAsWebsafeString(videoId);
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
    const cached = poTokenCache.get(videoId);
    if (cached && cached.exp > Date.now()) return cached.token;
    try {
        // Ensure the cached integrity token is present and fresh.
        if (!bgProgram || !bgGlobalName || !bgIntegrityTokenData || bgIntegrityExp <= Date.now()) {
            try {
                if (!bgProgram || !bgGlobalName) await initBotGuard();
                else await refreshBotGuardIntegrity();
            } catch (e) {
                return await generateCbPotFall(videoId);
            }
        }
        // Re-snapshot with the current visitor binding (cached integrity reused).
        const webPoSignalOutput = await snapshotWithVisitor();
        const { WebPoMinter } = await getBgModules();
        let token;
        let isReal = true;
        try {
            const webPoMinter = await WebPoMinter.create(bgIntegrityTokenData, webPoSignalOutput);
            token = await webPoMinter.mintAsWebsafeString(videoId);
        } catch (e) {
            console.error('WebPoMinter from cached integrity failed, using cold start:', e?.message || e);
            token = generateAnonPOT(videoId);
            isReal = false;
        }
        if (!token) throw new Error('poToken generation produced no token');
        poTokenCache.set(videoId, { token, exp: bgIntegrityExp, isReal });
        return { token, isReal };
    } catch (e) {
        console.error('Content-bound poToken generation failed, using cold start:', e?.message || e);
        const fallbackToken = generateAnonPOT(videoId);
        poTokenCache.set(videoId, { token: fallbackToken, exp: Date.now() + CAPTION_POT_TTL_FALLBACK, isReal: false });
        return { token: fallbackToken, isReal: false };
    }
}

let sessionPoTokenCache = { poToken: null, exp: 0, isReal: false };

async function generateSessionPoToken(visitorData, forceRefresh = false) {
    if (visitorData) setVisitorData(visitorData);
    if (!forceRefresh && sessionPoTokenCache.poToken && sessionPoTokenCache.exp > Date.now()) {
        return sessionPoTokenCache;
    }
    try {
        if (forceRefresh || !bgProgram || !bgGlobalName || !bgIntegrityTokenData || bgIntegrityExp <= Date.now()) {
            if (!bgProgram || !bgGlobalName) await initBotGuard();
            else await refreshBotGuardIntegrity();
        }
        const webPoSignalOutput = await snapshotWithVisitor();
        const { WebPoMinter, createColdStartToken } = await getBgModules();
        let token;
        try {
            const webPoMinter = await WebPoMinter.create(bgIntegrityTokenData, webPoSignalOutput);
            token = await webPoMinter.mintAsWebsafeString();
        } catch (e) {
            console.error('WebPoMinter session token failed, using cold start:', e?.message || e);
            token = generateAnonPOT();
        }
        if (!token) throw new Error('Session poToken generation produced no token');
        sessionPoTokenCache = { poToken: token, exp: bgIntegrityExp, isReal: true };
        return sessionPoTokenCache;
    } catch (e) {
        console.error('Session poToken generation failed, using cold start fallback:', e?.message || e);
        const fallbackToken = generateAnonPOT();
        sessionPoTokenCache = { poToken: fallbackToken, exp: Date.now() + CAPTION_POT_TTL_FALLBACK, isReal: false };
        return sessionPoTokenCache;
    }
}

function generateAnonPOT(id) {
    const identifier = id || Math.random().toString(36).substring(2, 13);
    if (bgModules && bgModules.createColdStartToken) return bgModules.createColdStartToken(identifier);
    return identifier;
}

module.exports = { initBotGuard, refreshBotGuardIntegrity, generateCbPot, generateSessionPoToken, generateAnonPOT, setVisitorData };