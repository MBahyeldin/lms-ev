import fs from 'fs';
import path from 'path';

const ABS_PATH = path.resolve();
const DATA_DIR = path.join(ABS_PATH, 'data', 'sharepoint');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
let data: SharePointData[] = [];

export class SharePointData {
    url: string;
    name: string;
    size: number;
    mimeType: string;
    localPath: string;


    constructor({
        name,
        size,
        mimeType,
        url,
        localPath,
    }: {
        name: string;
        size: number;
        mimeType: string;
        url: string;
        localPath: string;
    }) {
        this.url = url;
        this.name = name;
        this.size = size;
        this.mimeType = mimeType;
        this.localPath = localPath;
        data.push(this);
    }
}

// export function saveSharePointData(filename: string) {
//     const filePath = path.join(DATA_DIR, filename);
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
//     data = []; // Clear data after saving
// }
