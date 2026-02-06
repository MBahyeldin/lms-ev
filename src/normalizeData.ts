import fs from 'fs';
import path from 'path';
import { CourseModel, FlattenedModule } from './models/Course';
import VimeoAgent from './agents/VimeoAgent';
import ZohoAgent from './agents/ZohoLearnAgent'
// import { saveSharePointData } from './utils/sharePointData';

const ABS_PATH = path.resolve();
const DATA_DIR = path.join(ABS_PATH, 'data');
const OUTPUT_DIR = path.join(ABS_PATH, 'normalized_data');

const data = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const flattenedModules: FlattenedModule[] = [];

data.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);
    flattenedModules.push(...jsonData);
});



async function normalizeData() {
    const courses: CourseModel[] = [];
    const concurrentLength = 10;
    const chunksLength = Math.ceil(flattenedModules.length / concurrentLength);

    try {
        for (let i = 0; i < chunksLength; i++) {  
            const chunk = flattenedModules.slice(i * concurrentLength, (i + 1) * concurrentLength);
            const actions = chunk.map(module => {
            let course = courses.find(c => c.course_id === module.course_id);
            if (!course) {
                course = new CourseModel({
                    course_id: module.course_id,
                    course_name: module.course_name,
                    category_name: module.category_name
                });
                courses.push(course);
            }

            let section = course.sections.find(sec => sec.section_number === module.section_number);
            if (!section) {
                section = course.addSection({
                    section_number: module.section_number,
                    section_name: module.section_name
                });
            }

            return course.addModuleToSection(module.section_number, {
                    module_id: module.module_id,
                    module_type: module.module_type,
                    module_name: module.module_name,
                    module_content: module.module_content,
                });
            });

            await Promise.allSettled(actions);
            console.log(`Processed chunk ${i + 1} of ${chunksLength}`);
        }
    } catch (error) {
        console.log('Error normalizing data:', error);
    }

    console.log("Done Processing...");
    

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'normalized_courses.json'),
        JSON.stringify(courses, null, 2),
        'utf-8'
    );
    console.log('Data normalization complete.');
    // saveSharePointData('sharepoint_data.json');
}

(async () => {
    // const vimeoAgent = VimeoAgent.getInstance();
    // await vimeoAgent.readMe();
    // const fileToUploed = path.join(ABS_PATH, 'data', 'sharepoint', 'downloaded', '001 Introduction.mp4');
    // vimeoAgent.uploadVideo(fileToUploed, 'Test Upload from API', 'This is a test upload via Vimeo API');
    normalizeData();

    // const zohoAgent = ZohoAgent.getInstance();
    // const course = await zohoAgent.getOrCreateCourse({
    //     name: 'Mini Four',
    //     description: 'course desc'
    // });

    // const chapter = await zohoAgent.addChapterToCourse({
    //     course,
    //     name: 'Automation Testing'
    // });

    // const lesson = await zohoAgent.addLessonToChapter({
    //     course,
    //     chapter,
    //     name: 'first lesson',
    //     type: 'TEXT'
    // });

    // await zohoAgent.setLessonContent({
    //     course,
    //     lesson,
    //     type: 'TEXT-IMAGE',
    //     content: '/Users/devtools/Desktop/test.png'
    // })

    // await zohoAgent.setLessonContent({
    //     course,
    //     lesson,
    //     type: 'DOCUMENT',
    //     content: '/Users/devtools/Documents/lms-ev/filedir/1f/4e/1f4ed583f9e268675d773114afc8c64a6a7428a5 | Name: Image_Comparison_Tool_Presentation.pptx | Type: application/vnd.openxmlformats-officedocument.presentationml.presentation | Size: 43658 bytes'
    // })

    //  const resp = await zohoAgent.setLessonContent({
    //     course,
    //     lesson,
    //     type: 'VIDEO-VIMEO',
    //     content: '1161545548'
    // })    

    // const resp = await zohoAgent.setLessonContent({
    //     course,
    //     lesson,
    //     type: 'VIDEO-YOUTUBE',
    //     content: 'https://www.youtube.com/watch?v=Ng6_C87__wg&list=RDxHdnOe1oIT0&index=2'
    // })
})();
