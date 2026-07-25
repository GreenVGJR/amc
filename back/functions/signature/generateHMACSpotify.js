module.exports = {
    name: "generateHMACSpotify",
    code: `
    $return[$djsEval[const crypto = require('crypto')\\;

    const verifier = crypto.randomBytes(64).toString('base64url').slice(0, 128)\\;
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')\\;
    
    JSON.stringify({ verifier, challenge })\\;
    ]]
    `
}