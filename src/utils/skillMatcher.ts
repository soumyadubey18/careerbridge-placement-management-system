import { Student, JobOpening } from '../types';

export interface SkillMatchResult {
  student: Student;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  isAttendanceEligible: boolean;
  isCgpaEligible: boolean;
  isFullyEligible: boolean;
}

export function calculateCandidateMatch(student: Student, opening: JobOpening): SkillMatchResult {
  const reqSkills = opening.requiredSkills || [];
  const studentSkillsLower = (student.skills || []).map((s) => s.toLowerCase().trim());

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach((req) => {
    const isMatched = studentSkillsLower.some(
      (s) => s.includes(req.toLowerCase().trim()) || req.toLowerCase().trim().includes(s)
    );
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const skillScore = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 60 : 60;

  const isAttendanceEligible = student.attendancePercentage >= opening.minAttendance;
  const attendanceScore = isAttendanceEligible
    ? 20
    : Math.max(0, (student.attendancePercentage / opening.minAttendance) * 20);

  const studentCgpa = student.cgpa || 8.0;
  const isCgpaEligible = studentCgpa >= opening.minCgpa;
  const cgpaScore = isCgpaEligible ? 20 : Math.max(0, (studentCgpa / opening.minCgpa) * 20);

  const totalScore = Math.min(100, Math.round(skillScore + attendanceScore + cgpaScore));
  const isFullyEligible = isAttendanceEligible && isCgpaEligible;

  return {
    student,
    matchScore: totalScore,
    matchedSkills,
    missingSkills,
    isAttendanceEligible,
    isCgpaEligible,
    isFullyEligible,
  };
}

export function rankCandidatesForOpening(
  students: Student[],
  opening: JobOpening
): SkillMatchResult[] {
  return students
    .map((s) => calculateCandidateMatch(s, opening))
    .sort((a, b) => b.matchScore - a.matchScore);
}
