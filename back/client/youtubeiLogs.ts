import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Removes youtubei logs appear
(['log', 'warn', 'error', 'info', 'debug'] as const).forEach(method => {
    const original = console[method];
    console[method] = (...args: any[]) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[YOUTUBEJS]')) return;
        original(...args);
    };
});
function forceWebOnly(yt: any) {
    if (!yt || (yt as any).__webOnlyForced) return;
    const WEB = (yt as any).ClientType?.WEB || 'WEB';
    const Session = (yt as any).Session;
    if (Session && typeof Session.create === 'function' && !(Session as any).__webOnlyForced) {
        const origSessionCreate = Session.create.bind(Session);
        Session.create = (options: any = {}) => origSessionCreate({ ...options, client_type: WEB });
        (Session as any).__webOnlyForced = true;
    }
    const targets = new Set([ (yt as any).Innertube, (yt as any).default ].filter(Boolean));
    for (const target of targets) {
        if (typeof target.create === 'function' && !(target as any).__webOnlyForced) {
            const origCreate = target.create.bind(target);
            target.create = (config: any = {}) => origCreate({ ...config, client_type: WEB });
            (target as any).__webOnlyForced = true;
        }
        const proto = target?.prototype;
        if (proto) {
            for (const method of ['getBasicInfo', 'getInfo'] as const) {
                const orig = proto[method];
                if (typeof orig === 'function' && !(orig as any).__webOnlyForced) {
                    const wrapped = async function (this: any, targetId: any, options: any = {}) {
                        return orig.call(this, targetId, { ...options, client: 'WEB' });
                    };
                    (wrapped as any).__webOnlyForced = true;
                    proto[method] = wrapped;
                }
            }
            const origShorts = proto.getShortsVideoInfo;
            if (typeof origShorts === 'function' && !(origShorts as any).__webOnlyForced) {
                const wrapped = async function (this: any, targetId: any) {
                    return origShorts.call(this, targetId, 'WEB');
                };
                (wrapped as any).__webOnlyForced = true;
                proto.getShortsVideoInfo = wrapped;
            }
        }
    }
    (yt as any).__webOnlyForced = true;
}

try {
    const yt = require('youtubei.js');
    yt.Platform.shim.eval = (data: any, env: any) => {
        return new Function(...Object.keys(env), data.output)(...Object.values(env));
    };
    yt.Log.setLevel(0);
    forceWebOnly(yt);
} catch (e) { }

