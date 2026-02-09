import dotenv from "dotenv"
import Zoho from "../models/Zoho";
import ZohoCourse, { Lesson } from "../models/ZohoCourse"
import {getTextInptURL, getDocumentInput, getVideoVimeoInput, getTextInptImage} from "../utils/lessons"

dotenv.config()

export default class ZohoAgent {
    private static instance?: ZohoAgent;
    private zohoClient: Zoho;

    constructor() {
        this.zohoClient = new Zoho({
            'networkurl': 'effvision',
            token: process.env.ZOHO_ACCESS_TOKEN!,
            refreshToken: process.env.ZOHO_REFRESH_ACCESS_TOKEN!,
            clientId: process.env.ZOHO_CLIENT_ID!,
            clientSecret:  process.env.ZOHO_CLIENT_SECRET!,
        });
    }

    static getInstance() {
        if (!ZohoAgent.instance) {
            ZohoAgent.instance = new ZohoAgent();
        }
        return ZohoAgent.instance;
    }

    // COURSES
    public async getOrCreateCourse({
        name,
        description,
    }: {
        name: string,
        description: string,
    }){
        const currentCourse = await this.getCourse({
            name,
        });
        if (!currentCourse.errorCode) {            
            console.warn('There is a course with this name, Skip creating');
            return currentCourse;
        }
        const path = '/course';
        const method = 'POST';        

        const x =  await this.zohoClient.request({
            path,
            method,
            body: {
                name,
                description
            }
        });
        
        return x;
    }

    public async getCourse({
        name,
    }: {
        name: string
    }) {
        const path = `/course?course.url=${normalizeName(name)}`;                
        const courseData = await this.zohoClient.request({
            path,
            method: 'GET'
        });                
        return courseData;
    }

    // CHAPTER
    public async addChapterToCourse({
        course,
        name,
    }: {
        course: ZohoCourse,
        name: string,
    }){
        const currentChapter = course.lessons?.find((l) => {
            return l.type === 'CHAPTER' && l.name == name;
        });
        if (currentChapter) {
            return currentChapter;
        }
        const path = `/course/${course.id}/lesson`;
        const method = 'POST';        
        const chapter =  await this.zohoClient.request({
            path,
            method,
            body: [{
                name,
                type: "CHAPTER",
            }]
        });

        return chapter
        
    }

    public async addLessonToChapter({
        course,
        chapter,
        name,
        type,
    }: {
        course: ZohoCourse,
        chapter: Lesson
        name: string,
        type: string,
    }){
        const currentChapter = chapter;
        const currentLesson = currentChapter?.lessons?.find((l) => {
            return l.type === type && l.name == name;
        });

        if(currentLesson) {
            return currentLesson;
        }
        
        const path = `/course/${course.id}/lesson`;
        const method = 'POST';        
        return await this.zohoClient.request({
            path,
            method,
            body: [{
                name,
                type,
                parentId: chapter.id,
            }]
        })
    }

    public async setLessonContent({
        course,
        lesson,
        type,
        content,
    }: {
        course: ZohoCourse,
        lesson: Lesson,
        type: string,
        content: string
    }) {
        if (!course.id) {
            console.log({
                course
            });
            throw new Error('No course id found');
        }
        if (!lesson.id) {
            console.log({
                lesson,
            });
            throw new Error('No lesson id found');
        }
        let path = `/course/${course.id}/lesson/${lesson.id}`;
        let body = null;
        let bodyText = null;
        let method = 'PUT' as 'POST' | 'PUT';
        let moreHeaders = {};
        switch (type) {
            case "TEXT-URL":
                const lessonContent = getTextInptURL({
                    url: content
                });
                path += '/blocks';
                body = lessonContent;
            break
            case "TEXT-IMAGE":
                const portalImageLink = await this.zohoClient.uploadImage({
                    course,
                    lesson,
                    localPath: content,
                });
                
                const lessonContentImage = getTextInptImage({
                    url: portalImageLink
                });
                path += '/blocks';
                body = lessonContentImage;
            break
            case "DOCUMENT":
                const { fileHeaders, fileContent} = getDocumentInput({
                    content
                });
                const extraHeaders = {
                    ...fileHeaders,
                    'x-service': 'ZohoLearn',
                    'fileindex': 0,
                    'item-id': lesson.id,
                    'item-type': 'LESSON',
                    scopeid: '6571003000000004002',
                    'upload-id': '1770396607004',
                    'additional-params': "{\"courseId\":\"" + course.id + "\",\"lessonBlockId\":0,\"isLessonBlockFile\":\"true\"}",
                    charset: 'utf-8',
                    'Content-Length': fileHeaders["x-content-length"]
                };
                body = fileContent;                
                return await this.zohoClient.uploadFile({
                    body,
                    moreHeaders: extraHeaders,
                })
            break
            case 'VIDEO-VIMEO':
                const vimeoContent = getVideoVimeoInput({
                    videoId: content
                });
                path += '/block/0/embed';
                bodyText = vimeoContent;
                method = 'POST';
                moreHeaders = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            break;
            case 'VIDEO-YOUTUBE': 
                const youtubeContent = new URLSearchParams();
                youtubeContent.append('url', content)                
                path += '/block/0/embed';
                bodyText = youtubeContent.toString();
                method = 'POST';
                moreHeaders = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
        }

        if (!body && !bodyText) {
            throw new Error('body is not set for lesson');
        }

        const x = await this.zohoClient.request({
            method,
            path,
            body,
            bodyText,
            moreHeaders,
        })        
    }

}


function normalizeName (name: string): string {
     return name.toLocaleLowerCase().replace(/\s/g, '-')
}