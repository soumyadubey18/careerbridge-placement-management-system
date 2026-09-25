import { jsPDF } from 'jspdf';
import { Student, PlacementApplication, JobOpening, Batch } from '../types';

export interface OfferLetterData {
  student: Student;
  application: PlacementApplication;
  opening?: JobOpening;
}

export function generateOfferLetterPdf(data: OfferLetterData): void {
  const { student, application, opening } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 16;

  // 1. Corporate Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('CAREERBRIDGE ACADEMY · CORPORATE RELATIONS CELL', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`CAMPUS PLACEMENT OFFER OF EMPLOYMENT · REF: CB-OFFER-${application.id.toUpperCase()}`, margin + 6, y + 16);

  y += 30;

  // Date and Letter Reference
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date of Issue: ${today}`, margin, y);
  doc.text('Confidential & Privileged', pageWidth - margin - 38, y);

  y += 8;

  // Recipient Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Roll Number: ${student.rollNo} · Degree: ${student.degree}`, margin + 5, y + 13);
  doc.text(`College / Institute: ${student.college}`, margin + 5, y + 19);
  doc.text(`Cohort Program: ${student.batchName} · Email: ${student.email}`, margin + 5, y + 25);

  y += 34;

  // Congratulatory Intro
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Subject: Official Offer of Employment with ${application.companyName}`, margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introText =
    `Dear ${student.name},\n\n` +
    `On behalf of ${application.companyName} in collaboration with CareerBridge Academy, we are pleased to extend this formal offer of employment for the position of ${application.jobTitle}. Your exceptional performance in technical problem solving, academic milestones, and interview rounds demonstrated the standard of excellence we seek.`;
  
  const splitIntro = doc.splitTextToSize(introText, pageWidth - margin * 2);
  doc.text(splitIntro, margin, y);
  y += splitIntro.length * 4.4 + 4;

  // Terms and Compensation Card
  const offeredCtc = application.offeredCtc || student.placedSalary || opening?.ctc || '8.5 LPA';
  const jobLocation = opening?.location || 'Bengaluru, Karnataka (Corporate Campus)';
  const jobType = opening?.jobType || 'Full-Time';

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS OF EMPLOYMENT & COMPENSATION SCHEDULE', margin + 5, y + 7);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, y + 10, pageWidth - margin - 5, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const leftColX = margin + 5;
  const rightColX = margin + 90;

  doc.text('Hiring Partner:', leftColX, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(application.companyName, leftColX + 32, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Designation:', leftColX, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(application.jobTitle, leftColX + 32, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Employment Type:', leftColX, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(jobType, leftColX + 32, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Annual CTC Package:', rightColX, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(126, 34, 206); // purple-700
  doc.text(offeredCtc, rightColX + 38, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Work Location:', rightColX, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(jobLocation.length > 25 ? jobLocation.substring(0, 23) + '..' : jobLocation, rightColX + 38, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tentative Joining:', rightColX, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('November 02, 2026', rightColX + 38, y + 30);

  y += 48;

  // Detailed Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Terms & Academic Clearance Prerequisites:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const terms = [
    `1. Candidate must maintain a minimum of 75% attendance (Current: ${student.attendancePercentage}%) throughout the cohort.`,
    '2. Successful completion of assigned Capstone project and submission of code repositories.',
    '3. Verification of official degree transcripts and background clearance prior to onboarding.',
    '4. Acceptance of this offer must be confirmed within 7 business days from date of issuance.',
  ];

  terms.forEach((t) => {
    doc.text(t, margin, y);
    y += 5;
  });

  y += 12;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Signature Block 1: Corporate Relations
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 10, margin + 55, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Soumya Dubey', margin, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of Corporate Placements', margin, y + 19);
  doc.text('CareerBridge Academy', margin, y + 23);

  // Signature Block 2: Partner HR
  const sig2X = pageWidth - margin - 55;
  doc.line(sig2X, y + 10, sig2X + 55, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Talent Acquisition Lead', sig2X, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`University Relations Division`, sig2X, y + 19);
  doc.text(application.companyName, sig2X, y + 23);

  // Bottom verification line
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Certified institutional placement document · Authenticity verification code: CB-AUTH-${Date.now().toString(36).toUpperCase()}`,
    margin,
    pageHeight - 10
  );

  const cleanStudent = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanComp = application.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CareerBridge_OfferLetter_${cleanStudent}_${cleanComp}.pdf`);
}

export interface CertificateData {
  student: Student;
  batch?: Batch;
}

export function generateCertificatePdf(data: CertificateData): void {
  const { student, batch } = data;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Decorative Outer Borders
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(79, 70, 229); // indigo-600
  doc.setLineWidth(0.6);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Certificate Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('CAREERBRIDGE ACADEMY OF ADVANCED TECHNOLOGY', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('INSTITUTIONAL ACCREDITATION & PROFESSIONAL SKILLS DIVISION', pageWidth / 2, 32, { align: 'center' });

  // Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CERTIFICATE OF PROGRAM COMPLETION', pageWidth / 2, 48, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('This is proudly presented and certified to', pageWidth / 2, 57, { align: 'center' });

  // Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text(student.name.toUpperCase(), pageWidth / 2, 70, { align: 'center' });

  // Candidate Sub-line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Roll No: ${student.rollNo} · ${student.degree} · ${student.college}`,
    pageWidth / 2,
    77,
    { align: 'center' }
  );

  // Curriculum text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const progName = batch?.name || student.batchName || 'Enterprise Full Stack & Cloud Engineering';
  doc.text(
    `for successfully fulfilling all rigorous industry-aligned milestones, comprehensive laboratory sprints, and capstone requirements in`,
    pageWidth / 2,
    88,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(progName, pageWidth / 2, 96, { align: 'center' });

  // Academic Badges Box
  const boxY = 105;
  const boxWidth = 190;
  const boxX = (pageWidth - boxWidth) / 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, boxY, boxWidth, 18, 2, 2, 'FD');

  const bCol1 = boxX + 15;
  const bCol2 = boxX + 80;
  const bCol3 = boxX + 145;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ATTENDANCE RECORD', bCol1, boxY + 6);
  doc.text('ACADEMIC CGPA', bCol2, boxY + 6);
  doc.text('PLACEMENT STATUS', bCol3, boxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.attendancePercentage}% (Cutoff >= 75%)`, bCol1, boxY + 13);
  doc.text(`${student.cgpa || 8.2} / 10.0`, bCol2, boxY + 13);
  doc.setTextColor(student.status === 'PLACED' ? 126 : 22, student.status === 'PLACED' ? 34 : 101, student.status === 'PLACED' ? 206 : 52);
  doc.text(student.status === 'PLACED' ? 'PLACED & HIRED' : 'HONORS COMPLETED', bCol3, boxY + 13);

  // Signatures
  const sigY = 145;
  const sigLineW = 55;

  // Sig 1: Lead Trainer
  const sig1X = 35;
  doc.setDrawColor(148, 163, 184);
  doc.line(sig1X, sigY + 6, sig1X + sigLineW, sigY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(batch?.trainerName || 'Dr. Vikram Seth', sig1X + sigLineW / 2, sigY + 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Academic Architect', sig1X + sigLineW / 2, sigY + 15, { align: 'center' });

  // Center: Official Institutional Seal
  const sealX = pageWidth / 2;
  doc.setDrawColor(79, 70, 229);
  doc.setFillColor(238, 242, 255);
  doc.circle(sealX, sigY + 5, 12, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('CERTIFIED', sealX, sigY + 4, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('SEAL · 2026', sealX, sigY + 8, { align: 'center' });

  // Sig 2: Placement Director
  const sig2X = pageWidth - 35 - sigLineW;
  doc.setDrawColor(148, 163, 184);
  doc.line(sig2X, sigY + 6, sig2X + sigLineW, sigY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Soumya Dubey', sig2X + sigLineW / 2, sigY + 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director of Placement & Industry Relations', sig2X + sigLineW / 2, sigY + 15, { align: 'center' });

  // Certificate Footer Verification ID
  const certId = `CB-CERT-2026-${student.rollNo}-${student.id.slice(-4).toUpperCase()}`;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Certificate Identifier: ${certId} · Issued by CareerBridge Institute of Tech`, pageWidth / 2, pageHeight - 14, {
    align: 'center',
  });

  const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CareerBridge_Certificate_${cleanName}.pdf`);
}
