export default interface ZohoCourse {
  clients: unknown[];
  role: "ADMIN" | "MEMBER" | string;
  attachments: unknown[];
  learningpathCount: string;
  canManageUsers: string;
  canEdit: string;
  bannerUrl: string;
  description: string;
  colorIndex: string;
  articleCount: string;
  badgeCount: string;
  type: "COURSE" | string;
  coAuthorIds: string;
  members: string;
  reportsViewAccessLevel: unknown[];
  canFavourite: string;
  canPublish: string;
  createdTime: string;
  id: string;
  bannerThumbUrl: string;
  activePortalsCount: string;
  flow: "FREE" | string;
  createdUser: string;
  clientPortalPartitionOrder: string;
  overallRating: OverallRating;
  elapsedLongTime: string;
  learnerCount: string;
  clientsCount: string;
  lastVisitLesson: Lesson | null;
  isAdmin: string;
  nameTile: string;
  completionType: string;
  url: string;
  tags: string[];
  lessonCount: string;
  activeLearningpathCount: string;
  metaInfo: MetaInfo;
  learnerStatus: string;
  coAuthors: User[];
  learners: User[];
  createdUserDetails: User;
  meta: Meta;
  name: string;
  enrollmentType: "PRIVATE" | "PUBLIC" | string;
  intAccessLevelToViewReports: string;
  lessons: Lesson[];
  elapsedTime: string;
  status: "UNPUBLISHED" | "PUBLISHED" | string;
}

export interface OverallRating {
  rating: string;
  count: string;
}

export interface User {
  role: string;
  imageURL: string;
  name: string;
  colorIndex: string;
  emailId: string;
  id: string;
  type: "MEMBER" | string;
  learnerCourseStatus: string;
  status: "ACTIVE" | string;
  learnerCourseProgress: string;
}

export interface Lesson {
  questionCount: string;
  modifiedTime: string;
  canRead?: string;
  courseUrl: string;
  type: "CHAPTER" | "TEXT" | string;
  pendingEvaluationCount: string;
  canFavourite: string;
  createdTime: string;
  scorm?: Record<string, unknown>;
  modifiedBy?: string;
  canDelete: string;
  id: string;
  viewCount: string;
  courseId: string;
  order: string;
  canDuplicate: string;
  elapsedLongTime: string;
  url: string;
  parentId?: string;
  discussionsCount: string;
  courseName: string;
  currentQuestionNumber: string;
  lessonVersion: string;
  learnerStatus: string;
  createdBy: string;
  lessonMeta: LessonMeta;
  name: string;
  status: "ACTIVE" | string;
  lessons: Lesson[];
  successStatus: "UNKNOWN" | string;
}
export interface LessonMeta {
  showDiscussion: string;
  showPublicDiscussion?: string;
  EDIT_ZFS_ID?: string;
  VIEW_ZFS_ID?: string;
  lastupdatedid?: string;
  blockordermap?: string;
}

export interface MetaInfo {
  courseSettings: {
    isRatingEnabled: string;
    canViewLessonAfterCourseCompletion: string;
  };
  theme: {
    showBannerInSidebar: string;
    bannerOverlayPercentage: string;
  };
  discussion: {
    allowDiscussion: string;
    allowPublicDiscussion: string;
  };
}

export interface Meta {
  COURSE_SETTINGS: {
    CAN_VIEW_LESSON_AFTER_COURSE_COMPLETION: string;
    IS_RATING_ENABLED: string;
  };
  DISCUSSION: {
    ALLOW_DISCUSSION: string;
    ALLOW_PUBLIC_DISCUSSION: string;
  };
  THEME: {
    SHOW_BANNER_IN_SIDEBAR: string;
    BANNER_OVERLAY_PERCENTAGE: string;
  };
}



