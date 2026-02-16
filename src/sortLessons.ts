
import ZohoAgent from './agents/ZohoLearnAgent'


async function createCourses() {
    const zohoAgent = ZohoAgent.getInstance();

    try {
        const courses = (await zohoAgent.getSources()); // Limit to first 5 courses for testing
       for (const c of courses) {
            try {
                console.log(`Processing course: ${c.name}`);
                if (c.lessonCount === '0') {
                    console.log(`No lessons found for course: ${c.name}`);
                    continue;
                }
                const course = await zohoAgent.getCourseByUrl({ url: c.url }) ;
                const chapters = course.lessons; 
                for (const chapter of chapters) {
                    const lessons = chapter.lessons || [];
                    if (lessons.length <= 1) {
                        console.log(`Chapter "${chapter.name}" has ${lessons.length} lesson(s), skipping sorting.`);
                        continue;
                    }
                    const sortedLessons = lessons.sort((a, b) => {
                        const aNum = parseInt(a.name.split('.')[0] ?? '0') || 0;
                        const bNum = parseInt(b.name.split('.')[0] ?? '1') || 0;
                        return aNum - bNum;
                    });     
                    await zohoAgent.setOrderedLessons({
                        course,
                        chapter,
                        lessons: sortedLessons
                    });        
                }

            }
            catch (error) {
                console.log(`Error processing course ${c.name}:`, error);
            }
        }

    } catch (error) {
        console.log('Error:', error);
    }

    console.log("Done Processing...");
}

(async () => {
    await createCourses();
})();
