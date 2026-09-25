import listclient from "../../client/youtubeClients";
import targetclient from "../../config.json";

const targetYtClient = targetclient.useClientYT.toUpperCase();
const pickclient = JSON.stringify(listclient[targetYtClient as keyof typeof listclient]).replaceAll(';', '%SEMI%');

export function tarClient(): string { return targetYtClient };
export function tarClientYT(): string { return pickclient };
