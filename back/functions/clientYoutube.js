const listclient = require('../client/youtubeClients.js');
const targetclient = require('../config.json');
const targetYtClient = targetclient.useClientYT.toUpperCase();
const pickclient = JSON.stringify(listclient[targetYtClient]).replaceAll(';', '%SEMI%');
const androidVrClient = JSON.stringify(listclient["ANDROID_VR"]).replaceAll(';', '%SEMI%');

function tarClient() { return targetYtClient };
function tarClientYT() { return pickclient };
function androidVrClientYT() { return androidVrClient };

module.exports = { tarClient, tarClientYT, androidVrClientYT };