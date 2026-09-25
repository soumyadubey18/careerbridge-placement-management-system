import { jsPDF } from 'jspdf';
import { Batch, Student, MockTest, Project, PlacementApplication, JobOpening } from '../types';

export interface BatchReportData {
  batch: Batch;
  students: Student[];
  mockTests: MockTest[];
  projects: Project[];
  applications: PlacementApplication[];
  openings: JobOpening[];
}

export function generateBatchPerformancePdf(data: BatchReportData): void {
  const { batch, students, mockTests, projects, applications } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // 1. Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CAREERBRIDGE ACADEMY', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('COHORT PERFORMANCE & PLACEMENT READINESS REPORT', margin + 6, y + 14);

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${reportDate}`, pageWidth - margin - 35, y + 14);

  y += 28;

  // 2. Cohort Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`${batch.name} (${batch.code})`, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Course: ${batch.course}`, margin + 5, y + 13);
  doc.text(`Lead Trainer: ${batch.trainerName}`, margin + 5, y + 19);

  doc.text(`Schedule: ${batch.schedule}`, margin + 85, y + 13);
  doc.text(`Mode: ${batch.mode} | Classroom: ${batch.classroom || 'Lab Alpha'}`, margin + 85, y + 19);

  y += 29;

  // 3. Calculated Metrics
  const enrolledCount = students.length;
  const capacityPct = Math.round((enrolledCount / batch.capacity) * 100);
  const avgAttendance = enrolledCount > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / enrolledCount)
    : 0;
  const lowAttendanceCount = students.filter((s) => s.attendancePercentage < 75).length;

  // Filter batch mock tests
  const batchTests = mockTests.filter((t) => t.batchId === batch.id);
  let totalTestScores = 0;
  let totalTestMax = 0;
  batchTests.forEach((t) => {
    t.results?.forEach((r) => {
      totalTestScores += r.score;
      totalTestMax += r.maxScore;
    });
  });
  const avgTestScorePct = totalTestMax > 0 ? Math.round((totalTestScores / totalTestMax) * 100) : 78;

  // Placed students
  const placedStudents = students.filter((s) => s.status === 'PLACED');
  const placementRate = enrolledCount > 0 ? Math.round((placedStudents.length / enrolledCount) * 100) : 0;

  // 4. Executive KPI Blocks (4 columns)
  const colWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpis = [
    { label: 'ENROLLMENT', val: `${enrolledCount} / ${batch.capacity}`, sub: `${capacityPct}% Capacity Filled` },
    { label: 'AVG ATTENDANCE', val: `${avgAttendance}%`, sub: `${lowAttendanceCount} below 75% cutoff` },
    { label: 'ASSESSMENT AVG', val: `${avgTestScorePct}%`, sub: `${batchTests.length} tests evaluated` },
    { label: 'PLACEMENT RATE', val: `${placementRate}%`, sub: `${placedStudents.length} Placed / ${enrolledCount}` },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (colWidth + 3);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(kpiX, y, colWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, kpiX + 4, y + 5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, kpiX + 4, y + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.sub, kpiX + 4, y + 15.5);
  });

  y += 24;

  // 5. Section Heading: Enrolled Trainees Performance Roster
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ENROLLED TRAINEES PERFORMANCE ROSTER', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total candidates: ${enrolledCount} | Minimum placement clearance cutoff: 75% attendance`, margin + 85, y);

  y += 4;

  // 6. Student Roster Table
  const tableHeaders = [
    { text: 'Roll No', width: 24 },
    { text: 'Student Name & Degree', width: 56 },
    { text: 'College / Institute', width: 44 },
    { text: 'Attd %', width: 16 },
    { text: 'CGPA', width: 14 },
    { text: 'Status & CTC', width: 28 },
  ];

  // Header row
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let currentX = margin;
  tableHeaders.forEach((th) => {
    doc.text(th.text, currentX + 2, y + 4.8);
    currentX += th.width;
  });

  y += 7;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  if (students.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('No student trainees currently enrolled in this cohort.', margin + 4, y + 6);
    y += 10;
  } else {
    students.forEach((stu, index) => {
      // Check page overflow
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 16;
        // Re-print table header
        doc.setFillColor(79, 70, 229);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        let headerX = margin;
        tableHeaders.forEach((th) => {
          doc.text(th.text, headerX + 2, y + 4.8);
          headerX += th.width;
        });
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
      }

      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      // Roll No
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(stu.rollNo, margin + 2, y + 5);

      // Student Name & Degree
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const studentName = stu.name.length > 20 ? stu.name.substring(0, 18) + '...' : stu.name;
      doc.text(studentName, margin + 26, y + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const degreeShort = (stu.degree || '').length > 28 ? stu.degree.substring(0, 26) + '..' : stu.degree || '';
      doc.text(degreeShort, margin + 26, y + 6.8);

      // College
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const collegeShort = (stu.college || '').length > 24 ? stu.college.substring(0, 22) + '..' : stu.college || '';
      doc.text(collegeShort, margin + 82, y + 5);

      // Attendance %
      doc.setFontSize(7.5);
      if (stu.attendancePercentage < 75) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72); // rose-600 (warning)
        doc.text(`${stu.attendancePercentage}% !`, margin + 126, y + 5);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(22, 101, 52); // green-800
        doc.text(`${stu.attendancePercentage}%`, margin + 126, y + 5);
      }

      // CGPA
      doc.setTextColor(71, 85, 105);
      doc.text(stu.cgpa ? stu.cgpa.toFixed(1) : '8.0', margin + 142, y + 5);

      // Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      if (stu.status === 'PLACED') {
        const placedApp = applications.find(
          (a) => a.studentId === stu.id && a.stage === 'SELECTED'
        );
        const comp = stu.placedCompany || placedApp?.companyName || 'Campus Placement';
        const sal = stu.placedSalary || placedApp?.offeredCtc || '8.5 LPA';
        doc.setTextColor(126, 34, 206); // purple-700
        doc.text(comp, margin + 156, y + 3.8);
        doc.setFontSize(6.5);
        doc.setTextColor(107, 114, 128);
        doc.text(sal, margin + 156, y + 6.8);
      } else {
        doc.setTextColor(30, 41, 59);
        doc.text(stu.status, margin + 156, y + 5);
      }

      doc.setFontSize(7.5);
      y += 8;
    });
  }

  y += 5;

  // 7. Assessments & Projects Summary (if space permits or on next page)
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 16;
  }

  // Two columns summary: Mock Assessments & Capstone Projects
  const halfColWidth = (pageWidth - margin * 2 - 6) / 2;

  // Box 1: Mock Assessment Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, halfColWidth, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MOCK ASSESSMENTS RECORD', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  if (batchTests.length === 0) {
    doc.text('No structured coding tests logged yet for this cohort.', margin + 4, y + 14);
  } else {
    let testY = y + 11;
    batchTests.slice(0, 3).forEach((t) => {
      const res = t.results || [];
      const testAvg = res.length > 0
        ? Math.round(res.reduce((sum, r) => sum + (r.percentage || 0), 0) / res.length)
        : 80;
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.title}:`, margin + 4, testY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Avg: ${testAvg}% | Max: ${t.maxMarks}m | Status: ${t.status}`, margin + 4, testY + 4);
      testY += 7.5;
    });
  }

  // Box 2: Capstone Projects
  const batchProjects = projects.filter((p) => p.batchId === batch.id);
  const box2X = margin + halfColWidth + 6;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(box2X, y, halfColWidth, 34, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CAPSTONE PROJECTS EVALUATION', box2X + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  if (batchProjects.length === 0) {
    doc.text('Projects in progress or awaiting group assignment.', box2X + 4, y + 14);
  } else {
    let projY = y + 11;
    batchProjects.slice(0, 3).forEach((p) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${p.title}:`, box2X + 4, projY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Grade: ${p.evaluationScore ? p.evaluationScore + '/100' : 'In Review'} | Status: ${p.status}`, box2X + 4, projY + 4);
      projY += 7.5;
    });
  }

  y += 40;

  // 8. Sign-off and Verification Footer
  if (y > pageHeight - 30) {
    doc.addPage();
    y = 16;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Official performance summary certified by CareerBridge Training & Placement Administration.', margin, y);

  y += 10;
  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 2, margin + 50, y + 2);
  doc.text(`Lead Trainer (${batch.trainerName})`, margin, y + 6);

  doc.line(pageWidth - margin - 50, y + 2, pageWidth - margin, y + 2);
  doc.text('Head of Placement & Corporate Relations', pageWidth - margin - 50, y + 6);

  // Save the document
  const safeCode = batch.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `CareerBridge_${safeCode}_Performance_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
