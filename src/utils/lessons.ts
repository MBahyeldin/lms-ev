import fs from 'fs'

export function getTextInptURL({
    url
}: {
    url: string
}) {
    return {
        "blocks":
            [{
                "blockId": 0,
                "layout": "lms-block-text",
                "background": "",
                "columns": "1",
                "items": [{ 
                    "placeholder": {},
                    "type": "centered",
                    "content": `<p><a title="link" href="${url}" target="_blank" rel="noopener">${url}</a></p>`
                }]
            }]
    }
}


export function getTextInptImage({
    url
}: {
    url: string
}) {
    return {
        "blocks":
            [{
                "blockId": 0,
                "layout": "lms-block-text",
                "background": "",
                "columns": "1",
                "items": [{ 
                    "placeholder": {},
                    "type": "centered",
                    "content": `<p><img class="zls-tinymce-img" src="${url}" alt="" /></p>`
                }]
            }]
    }
}


export function getDocumentInput ({
    content
}: {
    content: string
}){
    const parts = content.split('|').map(x => x.trim());
    if (parts.length != 4) {
        throw new Error ('bad content for document: ' + content);
    }
    // "/Users/devtools/Documents/lms-ev/filedir/73/ab/73ab9f9e0a709bbe20ce03f0b8362c10872af9b5 
    //  Name: Email Writing - New Temp.pdf 
    //  Type: application/pdf 
    //  Size: 2206872 bytes",
    const filePath = parts[0];
    if (!filePath) {
        throw new Error (`file path for content: "${content}" doesnt exist`)
    }
    const fileContent = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath)
    const fileName = parts[1]?.slice(6);
    const fileType = parts[2]?.slice(6);
    return {
        fileContent,
        fileHeaders: {
            'x-content-length': fileStats.size,
            'x-filename': fileName,
            'x-content_type': fileType,
            'Content-Type': fileType,
            'x-streammode': 1,
        }
    }
}

export function getVideoVimeoInput({
    videoId
}: {
    videoId: string
}) {
    return `embedHtml=%3Cdiv+style%3D%22padding%3A56.25%25+0+0+0%3Bposition%3Arelative%3B%22%3E%3Ciframe+src%3D%22https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F${videoId}%3Ftitle%3D0%26amp%3Bbyline%3D0%26amp%3Bportrait%3D0%26amp%3Bbadge%3D0%26amp%3Bautopause%3D0%26amp%3Bplayer_id%3D0%26amp%3Bapp_id%3D58479%22+frameborder%3D%220%22+allow%3D%22autoplay%3B+fullscreen%3B+picture-in-picture%3B+clipboard-write%3B+encrypted-media%3B+web-share%22+referrerpolicy%3D%22strict-origin-when-cross-origin%22+style%3D%22position%3Aabsolute%3Btop%3A0%3Bleft%3A0%3Bwidth%3A100%25%3Bheight%3A100%25%3B%22+title%3D%22Test+Upload+from+API%22%3E%3C%2Fiframe%3E%3C%2Fdiv%3E%3Cscript+src%3D%22https%3A%2F%2Fplayer.vimeo.com%2Fapi%2Fplayer.js%22%3E%3C%2Fscript%3E&isEmbedHtml=true&url=https%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F${videoId}%3Ftitle%3D0%26byline%3D0%26portrait%3D0%26badge%3D0%26autopause%3D0%26player_id%3D0%26app_id%3D58479`
}