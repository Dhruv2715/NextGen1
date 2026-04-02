export const BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_BASE_URL : "";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_RESUME_LINK: "/api/auth/resume-link",
    GOOGLE: "/api/auth/google",
    UPDATE_LOCATION: "/api/auth/location",
    GET_MAP_LOCATIONS: "/api/auth/map-locations",
  },

  // Single merged AI block (was duplicated before, causing GENERATE_QUESTIONS to be overwritten)
  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
    GENERATE_QUESTION: "/api/ai/generate-question",
    GENERATE_EXPLANATION: "/api/ai/generate-explanation",
    ANALYZE_TRANSCRIPT: "/api/ai/analyze-transcript",
    CLEANUP_TRANSCRIPT: "/api/ai/cleanup-transcript",
    GENERATE_PDF_DATA: "/api/ai/generate-pdf-data",
  },

  SESSION: {
    CREATE: "/api/sessions/create",
    GET_ALL: "/api/sessions/my-sessions",
    GET_ONE: (id) => `/api/sessions/${id}`,
    DELETE: (id) => `/api/sessions/${id}`,
  },

  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
  },

  JOBS: {
    GET_ALL: "/api/jobs",
    GET_MY_JOBS: "/api/jobs/my-jobs",
    CREATE: "/api/jobs",
    GET_BY_ID: (id) => `/api/jobs/${id}`,
    UPDATE: (id) => `/api/jobs/${id}`,
    DELETE: (id) => `/api/jobs/${id}`,
  },

  INTERVIEWS: {
    CREATE: "/api/interviews",
    GET_MY_INTERVIEWS: "/api/interviews",
    GET_BY_ID: (id) => `/api/interviews/${id}`,
    UPDATE: (id) => `/api/interviews/${id}`,
    SUBMIT: (id) => `/api/interviews/${id}/submit`,
    GET_TRANSCRIPTS: (id) => `/api/interviews/${id}/transcripts`,
  },
};
