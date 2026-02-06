import dotenv from "dotenv"
import * as vimeo from 'vimeo';

dotenv.config()

const { Vimeo } = vimeo;

export default class VimeoAgent {
    private static instance?: VimeoAgent;
    private static vimeoClient: vimeo.Vimeo;

    constructor() {
        VimeoAgent.vimeoClient = new Vimeo(process.env.VIMEO_CLIENT_ID!, process.env.VIMEO_CLIENT_SECRET!, process.env.VIMEO_ACCESS_TOKEN!);;
    }

    static getInstance() {
        if (!VimeoAgent.instance) {
            VimeoAgent.instance = new VimeoAgent();
        }
        return VimeoAgent.instance;
    }

    private async request(options: vimeo.RequestOptions) {
        return new Promise((resolve, reject) => {
            VimeoAgent.vimeoClient.request(options, (error, body, status_code, headers) => {
                if (error) {
                    console.log({
                        error,
                        body,
                        status_code,
                        headers
                    });
                    
                    reject(error);
                } else {
                    resolve({ body, status_code, headers });
                }
            });
        });
    }

    async uploadVideo(filePath: string, videoName: string, videoDescription: string) {
        const PROJECT_ID = '28104457';
        return new Promise((resolve, reject) => {
            VimeoAgent.vimeoClient.upload(
                filePath,
                {
                    name: videoName,
                    description: videoDescription,
                    privacy: { embed: 'whitelist', view: 'disable', download: false },
                    folder_uri: '/user/253793088/projects/28104457',
                    embed_domains: ['https://learn.zoho.com'],
                },
                (uri) => {
                    resolve(uri);
                },
                function (bytes_uploaded, bytes_total) {
                    var percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
                    console.log(bytes_uploaded, bytes_total, percentage + '% uploaded');
                },
                function (error) {
                    console.log('Failed to upload video: ' + error);
                    reject(error);
                }
            );
        });
    }

    async readMe() {
        try {
        const resp = await this.request({
            method: 'GET',
            path: '/me/projects'
        });
        console.log(resp);
        } catch (error) {
            console.error('Error fetching /me:', error);
        }
    }
        

}