import { Client } from "@microsoft/microsoft-graph-client";
import getClient from "../agents/sharePoint";
import { SharePointData } from "../utils/sharePointData";
import path from "path";
import fs, { createWriteStream } from "fs";
import { Readable } from "stream";

let graphClient: Client;
const ABS_PATH = path.resolve();
const downloadedPath = path.join(ABS_PATH, 'data', 'sharepoint', 'downloaded');

if (!fs.existsSync(downloadedPath)) {
    fs.mkdirSync(downloadedPath, { recursive: true });
}

export default async function getSharePointUrlData(sharingUrl: string) {
    if (!graphClient) {
        graphClient = await getClient();
    }
    
    const encodedUrl = encodeSharingUrl(sharingUrl);

    const item = await graphClient
        .api(`/shares/${encodedUrl}/driveItem`)
        .get();
    item.url = encodedUrl;
    
    const localPath = await downloadSharePointFile(item);

    return new SharePointData({
        name: item.name,
        size: item.size,
        mimeType: item.file?.mimeType,
        url: sharingUrl,
        localPath: localPath,
    });
}

export function encodeSharingUrl(sharingUrl: string) {
    return (
    "u!" +
    Buffer.from(sharingUrl)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  );
}


async function downloadSharePointFile(sharePointData: {
    name: string;
    size: number;
    mimeType: string;
    url: string;
}) {
    const filePath = path.join(downloadedPath, `${Date.now()}-${sharePointData.name}`);
    const client = await getClient();
    
    const downloadStream = await client.api(`/shares/${sharePointData.url}/driveItem/content`).getStream();
        
    return new Promise<string>((resolve, reject) => {
        const nodeReadable = Readable.fromWeb(downloadStream);
        const out = createWriteStream(filePath);

        nodeReadable.on('error', reject);
        out.on('error', reject);
        out.on('finish', () => resolve(filePath));

        nodeReadable.pipe(out);
    });

}
