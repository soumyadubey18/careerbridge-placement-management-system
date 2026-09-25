import { Interview } from '../types';

export function generateIcsInvite(interview: Interview): void {
  // Parse date: e.g. "2026-10-05 11:00"
  const dateParts = interview.scheduledDate.split(' ');
  const dateStr = dateParts[0];
  const timeStr = dateParts[1] || '10:00';

  const [year, month, day] = dateStr.split('-');
  const [hour, min] = timeStr.split(':');

  const startIso = `${year}${month}${day}T${hour}${min}00`;
  // Default 1 hour duration
  const endHour = String(Number(hour) + 1).padStart(2, '0');
  const endIso = `${year}${month}${day}T${endHour}${min}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareerBridge Academy//Placement & Assessment Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:cb-interview-${interview.id}@careerbridge.edu`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:CareerBridge Mock Interview: ${interview.round} - ${interview.studentName}`,
    `DESCRIPTION:Mock Interview round: ${interview.round}\\nCandidate: ${interview.studentName}\\nCohort: ${interview.batchName}\\nInterviewer: ${interview.interviewer}`,
    'LOCATION:CareerBridge Virtual Video Room Alpha (or Lab 2)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanCandidate = interview.studentName.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `Interview_${cleanCandidate}_${interview.round.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function detectInterviewConflicts(interviews: Interview[]): {
  conflictMap: Record<string, boolean>;
  conflictCount: number;
} {
  const conflictMap: Record<string, boolean> = {};
  let conflictCount = 0;

  for (let i = 0; i < interviews.length; i++) {
    for (let j = i + 1; j < interviews.length; j++) {
      const a = interviews[i];
      const b = interviews[j];

      if (a.scheduledDate === b.scheduledDate) {
        if (a.studentId === b.studentId || a.interviewer === b.interviewer) {
          conflictMap[a.id] = true;
          conflictMap[b.id] = true;
          conflictCount++;
        }
      }
    }
  }

  return { conflictMap, conflictCount };
}
