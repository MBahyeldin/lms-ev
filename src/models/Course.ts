import getSharePointUrlData from "../utils/sharePoint";
import VimeoAgent from "../agents/VimeoAgent";
import fs from 'fs';

export interface CourseData {
    course_id: number;
    course_name: string;
    category_name: string;
}

export interface SectionData  {
    section_number: number;
    section_name: string;
}

export interface ModuleData {
    module_id: number;
    module_type: string;
    module_name: string;
    module_content: string;
}

export interface Module extends ModuleData {
    module_content_type: "TEXT" | "VIDEO" | "IMAGE" | "QUIZ" | "DOCUMENT" | "BLOCK" | "UNKNOWN";
    onDisk?: boolean;
    onSharePoint?: boolean;
    isDeleted?: boolean;
    onYouTube?: boolean;
    isUrl?: boolean;
    isImage?: boolean;
}

export interface FlattenedModule extends ModuleData {
    course_id: number;
    course_name: string;
    category_name: string;
    section_number: number;
    section_name: string;
}

interface Section extends SectionData {
    modules: Module[];
}

export interface Course extends CourseData {
    sections: Section[];
}

export class CourseModel implements Course {
    course_id: number;
    course_name: string;
    category_name: string;
    sections: Section[];

    constructor(courseData: CourseData) {
        this.course_id = courseData.course_id;
        this.course_name = courseData.course_name;
        this.category_name = courseData.category_name;
        this.sections = [];
    }

    addSection(sectionData: SectionData): Section {
        const section: Section = {
            section_number: sectionData.section_number,
            section_name: sectionData.section_name,
            modules: []
        };
        this.sections.push(section);
        return section;
    }

    async addModuleToSection(sectionNumber: number, moduleData: ModuleData): Promise<void> {
        const section = this.sections.find(sec => sec.section_number === sectionNumber);
        let onDisk = false;
        let onSharePoint = false;
        let onYouTube = false;
        let isDeleted = false;
        let isImage = false;
        let isUrl = false;
        if (section) {
            const moduleContentType = (async () => {
                switch (moduleData.module_type.toLowerCase()) {
                    case 'resource':
                        onDisk = true;
                        return "DOCUMENT";
                    case 'url':
                        let url = moduleData.module_content;
                        if (url.startsWith('http') || url.startsWith('https')) {
                            if (url.includes('youtube.com')) {
                                onYouTube = true;
                                return "VIDEO";
                            }
                            if (url.includes('sharepoint.com')) {
                                onSharePoint = true;
                                try {
                                    const data = await getSharePointUrlData(url);
                                    const { mimeType } = data;
                                    if (mimeType) {
                                        if (mimeType.startsWith('video/')) {
                                            moduleData.module_content = data.localPath;
                                            const vimeoAgent = VimeoAgent.getInstance();
                                            const videoPath = await vimeoAgent.uploadVideo(data.localPath, data.name, data.name) as string;
                                            const vimeoVideoId = videoPath.split('/').pop()
                                            moduleData.module_content = vimeoVideoId ? vimeoVideoId : "-1";
                                            fs.unlinkSync(data.localPath) // to avoid disk full
                                            return "VIDEO";

                                        } else if (mimeType.startsWith('image/')) {
                                            moduleData.module_content = data.localPath
                                            isImage = true;
                                            return "TEXT";
                                        } else if (mimeType === 'application/pdf'
                                            || mimeType.startsWith('application')
                                            || mimeType.startsWith('text/html')
                                        ) {
                                            moduleData.module_content = data.localPath
                                            return "DOCUMENT";
                                        } else {
                                            return "UNKNOWN";
                                        }
                                    } else {
                                        return "UNKNOWN";
                                    }
                                } catch (error) {
                                    isDeleted = true;
                                    console.log("error", error); 
                                    return "UNKNOWN";
                                }
                            }
                            isUrl = true;
                            return "TEXT"
                        }
                        return "UNKNOWN";
                    case 'image':
                        isImage = true;
                        return "TEXT";
                    default:
                        return "UNKNOWN";
                }
            })();
            section.modules.push({
                ...moduleData,
                module_content_type: await moduleContentType,
                onDisk,
                onSharePoint,
                onYouTube,
                isDeleted,
                isUrl,
                isImage,
            });
        } else {
            throw new Error(`Section ${sectionNumber} not found in course ${this.course_id}`);
        }
    }
}