import ZohoCourse, { Lesson } from "./ZohoCourse";
import fs from "fs";

export default class Zoho {
    basePath: string;
    token: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;

    constructor({
        networkurl,
        token,
        refreshToken,
        clientId,
        clientSecret,
    }: {
        networkurl: string,
        token: string,
        refreshToken: string,
        clientId: string,
        clientSecret: string,
    }) {
        // this.basePath = `https://learn.zoho.com/learn/api/v1/portal/${networkurl}`;
        this.basePath = `https://learn.zoho.com/_lms/api/portal/${networkurl}`;
        this.token = token;
        this.refreshToken = refreshToken;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private async updateTokens() {
        // send request to get new token from the refreshToken
        console.log('TOKEN EXPIRED PLEASE UPDATE IT!');
        const resp = await fetch(`
            https://accounts.zoho.com/oauth/v2/token?refresh_token=${this.refreshToken}&client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=refresh_token
        `, {
            method: 'POST'
        });
        const { access_token } = await resp.json() as { access_token: string }
        this.token = access_token;
    }

    public async request({
        path,
        method,
        body,
        bodyText,
        retryForTokenExpired,
        moreHeaders = {},
        isBinary,
    }: {
        path: string,
        method: 'POST' | 'PUT' | 'GET',
        body?: Record<string, any> | Record<string, string>[] | null | undefined,
        bodyText?: string | null,
        retryForTokenExpired?: boolean,
        moreHeaders?: Record<string, any>;
        isBinary?: boolean
    }): Promise<any> {
        if (!path.startsWith('/')) {
            throw new Error('path should start with "/" ');
        }
        const fullPath = this.basePath + path;

        const headers = {
            // Authorization: `Zoho-oauthtoken ${this.token}`,
            'Content-Type': 'application/json',
            Cookie: process.env.ZOHO_COOKIES || '',
            'X-ZCSRF-TOKEN': `${process.env.ZOHO_X_ZCSRF_TOKEN}`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0',
            'HOST': 'learn.zoho.com',
            ...moreHeaders,
        }
        try {
            let resp;
            if (isBinary) {
                resp = await fetch(fullPath, {
                    headers,
                    method,
                    body: body as unknown as string,
                });
            } else {
                resp = await fetch(fullPath, {
                    headers,
                    method,
                    body: body ? JSON.stringify(body) : bodyText ? bodyText : null,
                });
            }

            if (resp.status === 401 && !retryForTokenExpired) {
                await this.updateTokens();
                return await this.request({
                    path,
                    body,
                    method,
                    retryForTokenExpired: true,
                })
            }

            if (resp.status >= 200 && resp.status < 500) {
                const json = await resp.json() as any;                
                if (json.DATA) {
                    return json.DATA;
                }
                if (json.LESSON) {
                    return json.LESSON?.[0];
                }
                 if (json.COURSE) {
                    return json.COURSE;
                }
                return json;
            }
            return {
                failed: true,
                status: resp.status,
                statusText: resp.statusText
            }
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }


    public async uploadFile({
        body,
        moreHeaders = {},
    }: {
        body: NonSharedBuffer,
        moreHeaders?: Record<string, any>;
    }): Promise<any> {
        const fullPath = 'https://upload-accl.zoho.com/webupload';

        const headers = {
            ...moreHeaders,
            Cookie: process.env.ZOHO_COOKIES || '',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0',        
        }
        try {

            const resp = await fetch(fullPath, {
                headers,
                method: 'POST',
                body: body,
                redirect: "follow"
            });            
            if (resp.status == 200) {
                return {
                    status: 'sucess'
                }
            }
           return {
            status: 'failed'
           }
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    public async uploadImage({
        localPath,
        course,
        lesson,
    }: {
        course: ZohoCourse,
        lesson: Lesson,
        localPath: string,
    }): Promise<any> {
        const fullPath = `https://learn.zoho.com/_lms/api/portal/effvision/course/${course.id}/lesson/${lesson.id}/file`;

        const headers = {
            Cookie: process.env.ZOHO_COOKIES || '',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0',        
        }
        try {

                    
        const formData = new FormData();

        formData.append("attachmentType", "1");
        formData.append("attachmentItemType", "5");
        formData.append(
            "zpcpn",
            "9029490782e7ea645794e31cee3fa5c10b933337fcca62aaa79292085aa9cbf3e6b0387a599e517b6852a3ff794cc4aeaaad32276d90433d195acc57860a5404"
        );


        // attach a file
        const fileBuffer = fs.readFileSync(localPath);
        const fileBlob = new Blob([fileBuffer], { type: "image/png" });

        formData.append("previewFile", fileBlob, "test.pdf");

        const resp = await fetch(fullPath, {
            method: "POST",
            body: formData,
            headers
        });         
            if (resp.status == 200) {
                const data = await resp.json() as any;
                return data?.ATTACHMENTS?.[0].viewUrl;
            }            
           return {            
            status: 'failed'
           }
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
}