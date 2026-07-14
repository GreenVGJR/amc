// Removes youtubei logs appear
['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[YOUTUBEJS]')) return;
        original(...args);
    };
});
try {
    const yt = require('youtubei.js');
    yt.Platform.shim.eval = (data, env) => {
        return new Function(...Object.keys(env), data.output)(...Object.values(env));
    };
    yt.Log.setLevel(0);
} catch (e) { }
try {
    const ytAlt = require('discord-player-youtubei/node_modules/youtubei.js');
    ytAlt.Platform.shim.eval = (data, env) => {
        return new Function(...Object.keys(env), data.output)(...Object.values(env));
    };
    ytAlt.Log.setLevel(0);
} catch (e) { }
