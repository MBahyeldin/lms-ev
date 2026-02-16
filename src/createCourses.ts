import fs from 'fs';
import path from 'path';
import { CourseModel } from './models/Course';
import ZohoAgent from './agents/ZohoLearnAgent'

const ABS_PATH = path.resolve();
const DATA_DIR = path.join(ABS_PATH, 'normalized_data');

const data = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

const flattenedModules: CourseModel[] = [];

data.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData) as CourseModel[];
    flattenedModules.push(...jsonData);
});



async function createCourses() {
    const zohoAgent = ZohoAgent.getInstance();

    try {
        for (let  c of flattenedModules) {
            console.log(c.course_name);
                try {            
                    const course = await zohoAgent.getOrCreateCourse({
                        name: c.course_name,
                        description: c.course_name
                    });

                    for (let section of c.sections.sort((a, b) => a.section_number - b.section_number)) {
                        const chapter = await zohoAgent.addChapterToCourse({
                            course,
                            name: section.section_name
                        });  

                        for (let module of section.modules) {
                            let moduleContentType = "";
                            await new Promise((res) => {
                                setTimeout(() => res(true), 1000);
                            });
                            switch (module.module_content_type) {
                                case "TEXT":
                                    if (module.isUrl) {
                                        moduleContentType = "TEXT-URL"
                                    } else {
                                        moduleContentType = "TEXT-IMAGE"
                                    }
                                    break;
                                case "DOCUMENT":
                                    moduleContentType = "DOCUMENT";
                                    break;
                                case "VIDEO":
                                    if (module.onSharePoint && !module.isDeleted && module.module_content != "-1") {
                                        moduleContentType = "VIDEO-VIMEO"
                                    } else if (module.onYouTube) {
                                        moduleContentType = "VIDEO-YOUTUBE"
                                    }
                                    break;
                            }

                            if (module.module_content_type == "UNKNOWN" || !moduleContentType) {
                                console.log("skipping: ", module.module_content_type, moduleContentType);
                                
                                continue;
                            }

                            const lesson = await zohoAgent.addLessonToChapter({
                                course,
                                chapter,
                                name: module.module_name,
                                type: module.module_content_type
                            });

                            await zohoAgent.setLessonContent({
                                course,
                                lesson,
                                type: moduleContentType,
                                content: module.module_content
                            })
                        }
                    }
                } catch (error) {
                console.log('Error processing course:', c.course_name, error);
            }
        }
    } catch (error) {
        console.log('Error normalizing data:', error);
    }

    console.log("Done Processing...");
}

(async () => {
    await createCourses();
})();
