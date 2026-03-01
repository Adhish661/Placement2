// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Accomplishment from '../models/Accomplishment.js';
import Experience from '../models/Experience.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

// @desc    Generate ATS-friendly resume
// @route   GET /api/resume/generate
// @access  Private/Student
export const generateResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = await Profile.findOne({ user: req.user._id });
  const projects = await Project.find({ user: req.user._id });
  const accomplishments = await Accomplishment.find({ user: req.user._id });
  const experiences = await Experience.find({ user: req.user._id }).sort({ startDate: -1 });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please complete your profile first.');
  }

  // Create PDF
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${user.name.replace(/\s/g, '_')}.pdf"`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text(profile.basicDetails?.fullName || user.name, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(profile.basicDetails?.currentCollege || '', { align: 'center' });
  
  // Contact Information
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Email: ${user.email}`, { align: 'center' });
  if (profile.basicDetails?.permanentAddress) {
    const addr = profile.basicDetails.permanentAddress;
    doc.text(`${addr.city}, ${addr.state} ${addr.pincode}`, { align: 'center' });
  }

  // Flatten all skills from dynamic sections (or fallback)
  const sectionSkills = Array.isArray(profile.skills?.sections)
    ? profile.skills.sections.flatMap((s) => s.items || [])
    : [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.languages || []),
      ];

  // Summary
  if (sectionSkills.length > 0) {
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('SUMMARY');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    const topSkills = sectionSkills.slice(0, 5).join(', ');
    const program = profile.education?.current?.program || '';
    const summary = `
    Results-driven ${program} student with strong foundations in ${topSkills} and problem-solving. Experienced in building practical, real-world projects with a focus on performance, scalability, and clean code practices. Quick learner with the ability to adapt to new technologies and work effectively in team-based environments. Seeking an opportunity to contribute technical expertise, analytical thinking, and innovation to a growth-oriented organization.`;
    doc.text(summary, { align: 'left' });
  }

  // Experience
  if (experiences.length > 0) {
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('EXPERIENCE');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    
    experiences.forEach(exp => {
      const startDate = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const endDate = exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      doc.font('Helvetica-Bold').text(`${exp.jobTitle} | ${exp.companyName} | ${exp.jobLocation || 'N/A'}`);
      doc.font('Helvetica').text(`${startDate} - ${endDate}`);
      if (exp.description) {
        doc.text(exp.description, { indent: 20 });
      }
      doc.moveDown(0.5);
    });
  }

  // Education
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  
  if (profile.education?.current) {
    const edu = profile.education.current;
    doc.font('Helvetica-Bold').text(`${edu.program || ''} ${edu.branch ? `- ${edu.branch}` : ''}`);
    doc.font('Helvetica').text(`${edu.institutionName || ''} | ${edu.department || ''}`);
    if (edu.passoutBatch) {
      doc.text(`Expected Graduation: ${edu.passoutBatch}`);
    }
  }

  // Skills
  const sections =
    Array.isArray(profile.skills?.sections) && profile.skills.sections.length
      ? profile.skills.sections
      : [
          ...(profile.skills?.technical?.length
            ? [{ name: 'Technical', items: profile.skills.technical }]
            : []),
          ...(profile.skills?.languages?.length
            ? [{ name: 'Languages', items: profile.skills.languages }]
            : []),
        ];

  if (sections.length > 0) {
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('SKILLS');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    
    sections.forEach((section) => {
      if (section.items && section.items.length) {
        const label = section.name || 'Skills';
        doc.text(`${label}: ${section.items.join(', ')}`);
      }
    });
  }

  // Projects
  if (projects.length > 0) {
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('PROJECTS');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    
    projects.forEach(project => {
      doc.font('Helvetica-Bold').text(project.title);
      doc.font('Helvetica').text(project.description);
      if (project.githubLink) {
        doc.text(`GitHub: ${project.githubLink}`);
      }
      doc.moveDown(0.5);
    });
  }

  doc.end();
});

