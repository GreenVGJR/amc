module.exports = {
    name: "generateAPOTYoutube",
    code: `
    $return[$try[$djsEval[    const b = Buffer.alloc(10)\\;
    b[0\\] = 0x22\\;
    b[1\\] = 0x08\\;
    for (let i = 0\\; i < 8\\; i++) b[2 + i\\] = Math.floor(Math.random() * 256)\\;
    b.toString('base64url')\\;
    ]]]
    `
}