import listclient from "../../client/youtubeClients.ts";
import targetclient from "../../config.json" with { type: "json" };

const targetYtClient = targetclient.useClientYT.toUpperCase();
const pickclient = JSON.stringify(listclient[targetYtClient as keyof typeof listclient]).replaceAll(';', '%SEMI%');

export function tarClient(): string { return targetYtClient };
export function tarClientYT(): string { return pickclient };
