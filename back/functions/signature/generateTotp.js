module.exports = {
    name: "generateTotp",
    params: [{
        name: "totpsecret", // string
        required: true
    }],
    code: `
    $return[$try[$djsEval[const crypto = require('crypto')\\;
    const secret = $jsonStringify[totpsecret]\\;
    const getTotp = async () => {
        const st = Math.floor(Date.now() / 1000)\\;
        const key = Buffer.from(Array.from(secret, (c, i) => c.charCodeAt(0) ^ ((i % 33) + 9)).join(''), 'utf8')\\;
        const counter = Math.floor(st / 30)\\;
        const cb = Buffer.alloc(8)\\;
        cb.writeBigUInt64BE(BigInt(counter))\\;
        const h = crypto.createHmac('sha1', key).update(cb).digest()\\;
        const bin = h.readUInt32BE(h.at(-1) & 0xf) & 0x7fffffff\\;
        const totp = String(bin % 1000000).padStart(6, '0')\\;
        return JSON.stringify({ totp, totpServer: totp })\\;
    }\\;
    getTotp()];{}]]
    `
}
