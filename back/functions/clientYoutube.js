const listclient = require('../client/youtubeClients.js');
const targetclient = require('../config.json');
const targetYtClient = targetclient.useClientYT.toUpperCase() === 'ANDROID_REEL' ? 'ANDROID' : (targetclient.useClientYT.toUpperCase() === 'IOS_REEL' ? 'IOS' : targetclient.useClientYT.toUpperCase());
const pickclient = JSON.stringify(listclient[targetYtClient]).replaceAll(';', '%SEMI%');

function tarClient() { return targetYtClient };
function tarClientYT() { return pickclient };

module.exports = { tarClient, tarClientYT };