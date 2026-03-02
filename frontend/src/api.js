import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (name, email, password, role = "student") =>
  api.post("/auth/register", { name, email, password, role });

export const logout = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

// Courses
export const getCourses = () => api.get("/courses");
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post("/courses", data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Enrollments
export const enroll = (courseId) => api.post(`/courses/${courseId}/enroll`);
export const drop = (courseId) => api.delete(`/courses/${courseId}/enroll`);
export const getRoster = (courseId) => api.get(`/courses/${courseId}/roster`);
export const getMyCourses = () => api.get("/courses/my-courses");

// Assignments
export const getAssignments = (courseId) =>
  api.get(`/courses/${courseId}/assignments`);
export const createAssignment = (courseId, data) =>
  api.post(`/courses/${courseId}/assignments`, data);
export const updateAssignment = (id, data) =>
  api.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

// Submissions
export const submitWork = (assignmentId, content) =>
  api.post(`/assignments/${assignmentId}/submit`, { content });
export const getSubmissions = (assignmentId) =>
  api.get(`/assignments/${assignmentId}/submissions`);
export const gradeSubmission = (submissionId, grade, feedback) =>
  api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
export const getMyGrades = () => api.get("/students/me/grades");

// Stats
export const getCourseStats = (courseId) =>
  api.get(`/courses/${courseId}/stats`);

export default api;
