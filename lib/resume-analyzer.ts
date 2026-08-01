export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  details: string[];
}

export interface AnalysisResult {
  score: number;
  scoreLabel: string;
  scoreSummary: string;
  categories: CategoryScore[];
  tags: { label: string; type: 'success' | 'warning' | 'error' }[];
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  type: 'skill' | 'keyword' | 'format' | 'section';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

const CONTACT_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  linkedin: /linkedin\.com|linkedin/i,
  github: /github\.com|github/i,
  portfolio: /portfolio|website|\.com|\.io|\.dev/i,
  address: /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|city|state)\b/i,
};

const EDUCATION_PATTERNS = {
  degree: /\b(bachelor|master|phd|doctorate|associate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?e\.?|mba|b\.?tech|m\.?tech)\b/i,
  institution: /\b(university|college|institute|school|academy)\b/i,
  gpa: /\b(gpa|cgpa|grade|percentage)\b.*\d/i,
  graduationYear: /\b(20\d{2}|19\d{2})\b.*\b(graduate|graduated|graduation|expected|present)\b|\b(graduate|graduated|graduation|expected|present)\b.*\b(20\d{2}|19\d{2})\b/i,
  honors: /\b(honors|cum laude|magna cum laude|summa cum laude|distinction|dean's list)\b/i,
};

const EXPERIENCE_PATTERNS = {
  jobTitle: /\b(engineer|developer|manager|analyst|designer|consultant|specialist|coordinator|director|lead|senior|junior|intern|associate)\b/i,
  company: /\b(inc|llc|ltd|corporation|corp|company|co\.|technologies|solutions|services|group)\b/i,
  dates: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b.*\d{4}/i,
  metrics: /\b(\d+%|\$\d+|\d+\+|\d+x|\d+ (users|customers|clients|projects|team|people|members))\b/i,
  actionVerbs: /\b(achieved|accomplished|administered|analyzed|built|collaborated|created|delivered|designed|developed|drove|enhanced|established|executed|generated|grew|implemented|improved|increased|initiated|launched|led|managed|optimized|orchestrated|produced|reduced|resolved|spearheaded|streamlined|supervised|transformed)\b/i,
};

const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'node.js', 'nodejs', 'express', 'django', 'flask',
  'spring', 'rails', 'laravel', '.net', 'asp.net',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase',
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
  'rest', 'api', 'graphql', 'microservices', 'serverless',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material ui',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
  'machine learning', 'deep learning', 'ai', 'tensorflow', 'pytorch', 'data science', 'pandas', 'numpy',
  'agile', 'scrum', 'kanban', 'lean', 'waterfall',
  'excel', 'powerpoint', 'tableau', 'power bi', 'data analysis',
  'project management', 'product management', 'leadership', 'communication', 'teamwork', 'problem solving'
];

const SECTIONS_KEYWORDS = {
  summary: ['summary', 'objective', 'profile', 'about me', 'professional summary', 'career objective'],
  experience: ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
  education: ['education', 'academic', 'qualifications'],
  skills: ['skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies'],
  projects: ['projects', 'personal projects', 'key projects', 'portfolio'],
  certifications: ['certifications', 'certificates', 'licenses', 'credentials'],
};

export function analyzeResume(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const categories: CategoryScore[] = [];
  const suggestions: Suggestion[] = [];
  
  // 1. CONTACT & HEADER INFO (Max 100)
  const contactScore = analyzeContact(text, lowerText, suggestions);
  categories.push(contactScore);
  
  // 2. EDUCATION (Max 100)
  const educationScore = analyzeEducation(text, lowerText, suggestions);
  categories.push(educationScore);
  
  // 3. WORK EXPERIENCE (Max 100)
  const experienceScore = analyzeExperience(text, lowerText, suggestions);
  categories.push(experienceScore);
  
  // 4. SKILLS & KEYWORDS (Max 100)
  const skillsScore = analyzeSkills(text, lowerText, suggestions);
  categories.push(skillsScore);
  
  // 5. FORMATTING & STRUCTURE (Max 100)
  const formatScore = analyzeFormatting(text, lowerText, suggestions);
  categories.push(formatScore);
  
  // Calculate weighted overall score
  const weights = {
    'Contact & header info': 0.15,
    'Education': 0.15,
    'Work experience': 0.30,
    'Skills & keywords': 0.25,
    'Formatting & structure': 0.15,
  };
  
  let totalScore = 0;
  categories.forEach(cat => {
    const weight = weights[cat.name as keyof typeof weights] || 0.2;
    totalScore += (cat.score / cat.maxScore) * 100 * weight;
  });
  
  const score = Math.round(totalScore);
  
  // Generate tags
  const tags: { label: string; type: 'success' | 'warning' | 'error' }[] = [];
  
  const sectionsFound = Object.values(SECTIONS_KEYWORDS).filter(keywords =>
    keywords.some(k => lowerText.includes(k))
  ).length;
  
  if (sectionsFound >= 4) {
    tags.push({ label: 'Sections present', type: 'success' });
  } else {
    tags.push({ label: 'Missing sections', type: 'error' });
  }
  
  const presentKeywords = TECH_KEYWORDS.filter(k => lowerText.includes(k));
  if (presentKeywords.length >= 15) {
    tags.push({ label: 'Good keywords', type: 'success' });
  } else if (presentKeywords.length >= 8) {
    tags.push({ label: 'Low keywords', type: 'warning' });
  } else {
    tags.push({ label: 'Few keywords', type: 'error' });
  }
  
  const hasMetrics = EXPERIENCE_PATTERNS.metrics.test(text);
  if (hasMetrics) {
    tags.push({ label: 'Has metrics', type: 'success' });
  } else {
    tags.push({ label: 'No metrics', type: 'warning' });
  }
  
  // Find keywords
  const missingKeywords = TECH_KEYWORDS.filter(k => !lowerText.includes(k)).slice(0, 20);
  
  // Score label and summary
  let scoreLabel: string;
  let scoreSummary: string;
  
  if (score >= 85) {
    scoreLabel = 'Excellent';
    scoreSummary = 'Your resume is well-optimized for ATS systems. Minor improvements could push it even higher.';
  } else if (score >= 70) {
    scoreLabel = 'Good';
    scoreSummary = 'Resume is ATS-friendly but has room for improvement in keywords and formatting.';
  } else if (score >= 55) {
    scoreLabel = 'Average';
    scoreSummary = 'Resume passes basic ATS filters but needs improvements in formatting, keyword density, and quantifiable achievements to rank higher.';
  } else if (score >= 40) {
    scoreLabel = 'Below Average';
    scoreSummary = 'Your resume may struggle with ATS systems. Focus on adding more keywords, metrics, and proper section headers.';
  } else {
    scoreLabel = 'Needs Work';
    scoreSummary = 'Resume requires significant improvements to pass ATS filters. Add proper sections, keywords, and quantifiable achievements.';
  }
  
  return {
    score,
    scoreLabel,
    scoreSummary,
    categories,
    tags,
    missingKeywords,
    presentKeywords,
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
  };
}

function analyzeContact(text: string, lowerText: string, suggestions: Suggestion[]): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;
  
  const hasEmail = CONTACT_PATTERNS.email.test(text);
  const hasPhone = CONTACT_PATTERNS.phone.test(text);
  const hasLinkedIn = CONTACT_PATTERNS.linkedin.test(lowerText);
  const hasGitHub = CONTACT_PATTERNS.github.test(lowerText);
  const hasPortfolio = CONTACT_PATTERNS.portfolio.test(lowerText);
  
  if (hasEmail) { score += 25; details.push('Email found'); }
  else { details.push('Missing email'); }
  
  if (hasPhone) { score += 25; details.push('Phone found'); }
  else { details.push('Missing phone'); }
  
  if (hasLinkedIn) { score += 20; details.push('LinkedIn found'); }
  else { details.push('Missing LinkedIn'); }
  
  if (hasGitHub) { score += 15; details.push('GitHub found'); }
  
  if (hasPortfolio) { score += 15; details.push('Portfolio/Website found'); }
  
  let feedback = '';
  if (score >= 80) {
    feedback = 'Name, phone, email, LinkedIn, GitHub, Portfolio — all present. Excellent.';
  } else if (score >= 50) {
    feedback = 'Basic contact info present. Consider adding LinkedIn and portfolio links.';
  } else {
    feedback = 'Contact information is incomplete. Add email, phone, and professional links.';
    suggestions.push({
      type: 'section',
      priority: 'high',
      title: 'Complete Contact Information',
      description: 'Add your email, phone number, LinkedIn profile, and portfolio/GitHub links.',
    });
  }
  
  return { name: 'Contact & header info', score, maxScore, feedback, details };
}

function analyzeEducation(text: string, lowerText: string, suggestions: Suggestion[]): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;
  
  const hasEducationSection = SECTIONS_KEYWORDS.education.some(k => lowerText.includes(k));
  const hasDegree = EDUCATION_PATTERNS.degree.test(text);
  const hasInstitution = EDUCATION_PATTERNS.institution.test(lowerText);
  const hasGPA = EDUCATION_PATTERNS.gpa.test(text);
  const hasGradYear = EDUCATION_PATTERNS.graduationYear.test(text);
  const hasHonors = EDUCATION_PATTERNS.honors.test(lowerText);
  
  if (hasEducationSection) { score += 20; details.push('Education section present'); }
  else { details.push('Missing education section header'); }
  
  if (hasDegree) { score += 25; details.push('Degree mentioned'); }
  else { details.push('No degree found'); }
  
  if (hasInstitution) { score += 20; details.push('Institution mentioned'); }
  else { details.push('No institution found'); }
  
  if (hasGPA) { score += 15; details.push('GPA/CGPA included'); }
  else { details.push('Missing GPA/CGPA'); }
  
  if (hasGradYear) { score += 15; details.push('Graduation year found'); }
  else { details.push('Missing graduation year'); }
  
  if (hasHonors) { score += 5; details.push('Honors/awards mentioned'); }
  
  let feedback = '';
  if (score >= 80) {
    feedback = 'Degree, institution and GPA present with graduation details. Great!';
  } else if (score >= 50) {
    feedback = 'Degree, institution and CGPA present. Missing: expected graduation year.';
  } else {
    feedback = 'Education section needs more details: degree, institution, GPA, graduation year.';
    suggestions.push({
      type: 'section',
      priority: 'high',
      title: 'Enhance Education Section',
      description: 'Include your degree, institution name, GPA/CGPA, and graduation year.',
    });
  }
  
  return { name: 'Education', score, maxScore, feedback, details };
}

function analyzeExperience(text: string, lowerText: string, suggestions: Suggestion[]): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;
  
  const hasExperienceSection = SECTIONS_KEYWORDS.experience.some(k => lowerText.includes(k));
  const hasJobTitle = EXPERIENCE_PATTERNS.jobTitle.test(text);
  const hasCompany = EXPERIENCE_PATTERNS.company.test(text);
  const hasDates = EXPERIENCE_PATTERNS.dates.test(text);
  const hasMetrics = EXPERIENCE_PATTERNS.metrics.test(text);
  
  // Count action verbs
  const actionVerbMatches = text.match(new RegExp(EXPERIENCE_PATTERNS.actionVerbs.source, 'gi')) || [];
  const uniqueActionVerbs = new Set(actionVerbMatches.map(v => v.toLowerCase())).size;
  
  // Count bullet points (lines starting with - or *)
  const bulletPoints = (text.match(/^[\s]*[-•*]\s/gm) || []).length;
  
  if (hasExperienceSection) { score += 15; details.push('Experience section present'); }
  else { details.push('Missing experience section header'); }
  
  if (hasJobTitle) { score += 15; details.push('Job title found'); }
  else { details.push('No clear job title'); }
  
  if (hasCompany) { score += 10; details.push('Company mentioned'); }
  else { details.push('No company name found'); }
  
  if (hasDates) { score += 10; details.push('Employment dates present'); }
  else { details.push('Missing employment dates'); }
  
  if (hasMetrics) { 
    score += 25; 
    details.push('Quantifiable metrics found'); 
  } else { 
    details.push('No quantifiable metrics (%, $, numbers)'); 
    suggestions.push({
      type: 'format',
      priority: 'high',
      title: 'Add Quantifiable Achievements',
      description: 'Include metrics like "increased sales by 25%", "managed team of 10", "reduced costs by $50K".',
    });
  }
  
  if (uniqueActionVerbs >= 8) {
    score += 15;
    details.push(`${uniqueActionVerbs} action verbs used`);
  } else if (uniqueActionVerbs >= 4) {
    score += 8;
    details.push(`Only ${uniqueActionVerbs} action verbs - add more variety`);
  } else {
    details.push('Few action verbs used');
    suggestions.push({
      type: 'format',
      priority: 'medium',
      title: 'Use Strong Action Verbs',
      description: 'Start bullets with: achieved, implemented, developed, led, optimized, delivered, spearheaded.',
    });
  }
  
  if (bulletPoints >= 6) {
    score += 10;
    details.push('Good use of bullet points');
  } else if (bulletPoints >= 3) {
    score += 5;
    details.push('Some bullet points used');
  } else {
    details.push('Missing bullet points for achievements');
  }
  
  let feedback = '';
  if (score >= 80) {
    feedback = 'Strong experience section with metrics, action verbs, and clear structure.';
  } else if (score >= 55) {
    feedback = 'Experience section exists but lacking quantifiable metrics or action verbs.';
  } else {
    feedback = 'Experience section needs significant improvement. Add metrics, dates, and action verbs.';
  }
  
  return { name: 'Work experience', score, maxScore, feedback, details };
}

function analyzeSkills(text: string, lowerText: string, suggestions: Suggestion[]): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;
  
  const hasSkillsSection = SECTIONS_KEYWORDS.skills.some(k => lowerText.includes(k));
  const presentKeywords = TECH_KEYWORDS.filter(k => lowerText.includes(k));
  const keywordCount = presentKeywords.length;
  
  if (hasSkillsSection) { score += 20; details.push('Skills section present'); }
  else { 
    details.push('Missing skills section header'); 
    suggestions.push({
      type: 'section',
      priority: 'high',
      title: 'Add Skills Section',
      description: 'Create a dedicated "Skills" or "Technical Skills" section listing your abilities.',
    });
  }
  
  if (keywordCount >= 20) {
    score += 50;
    details.push(`Excellent keyword count: ${keywordCount}`);
  } else if (keywordCount >= 12) {
    score += 35;
    details.push(`Good keyword count: ${keywordCount}`);
  } else if (keywordCount >= 6) {
    score += 20;
    details.push(`Low keyword count: ${keywordCount}`);
    suggestions.push({
      type: 'keyword',
      priority: 'medium',
      title: 'Add More Technical Keywords',
      description: 'Include more relevant technologies, tools, and methodologies from job descriptions.',
    });
  } else {
    score += 5;
    details.push(`Very few keywords: ${keywordCount}`);
    suggestions.push({
      type: 'keyword',
      priority: 'high',
      title: 'Add Technical Keywords',
      description: 'Your resume lacks technical keywords. Add relevant skills, tools, and technologies.',
    });
  }
  
  // Check for soft skills
  const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'collaboration'];
  const hasSoftSkills = softSkills.some(s => lowerText.includes(s));
  if (hasSoftSkills) {
    score += 15;
    details.push('Soft skills mentioned');
  } else {
    details.push('Missing soft skills');
  }
  
  // Check for certifications
  const hasCerts = SECTIONS_KEYWORDS.certifications.some(k => lowerText.includes(k));
  if (hasCerts) {
    score += 15;
    details.push('Certifications section found');
  } else {
    details.push('No certifications section');
  }
  
  let feedback = '';
  if (score >= 80) {
    feedback = 'Strong skills section with good keyword density and certifications.';
  } else if (score >= 50) {
    feedback = 'Skills present but consider adding more relevant keywords from target job descriptions.';
  } else {
    feedback = 'Skills section needs work. Add more technical and soft skills relevant to your target role.';
  }
  
  return { name: 'Skills & keywords', score, maxScore, feedback, details };
}

function analyzeFormatting(text: string, lowerText: string, suggestions: Suggestion[]): CategoryScore {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;
  
  // Check length (ideal: 400-1500 words for single page)
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount >= 300 && wordCount <= 800) {
    score += 25;
    details.push(`Good length: ~${wordCount} words`);
  } else if (wordCount >= 200 && wordCount <= 1000) {
    score += 15;
    details.push(`Acceptable length: ~${wordCount} words`);
  } else if (wordCount < 200) {
    details.push(`Too short: ~${wordCount} words`);
    suggestions.push({
      type: 'format',
      priority: 'high',
      title: 'Resume Too Short',
      description: 'Your resume appears too short. Add more details about your experience and achievements.',
    });
  } else {
    score += 10;
    details.push(`May be too long: ~${wordCount} words`);
  }
  
  // Check section headers
  const sectionCount = Object.values(SECTIONS_KEYWORDS).filter(keywords =>
    keywords.some(k => lowerText.includes(k))
  ).length;
  
  if (sectionCount >= 5) {
    score += 25;
    details.push(`All ${sectionCount} major sections present`);
  } else if (sectionCount >= 3) {
    score += 15;
    details.push(`${sectionCount} sections found - add more`);
  } else {
    score += 5;
    details.push(`Only ${sectionCount} sections - missing key sections`);
    suggestions.push({
      type: 'section',
      priority: 'high',
      title: 'Add Missing Sections',
      description: 'Include standard sections: Summary, Experience, Education, Skills, Projects.',
    });
  }
  
  // Check for consistent date formatting
  const datePatterns = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/gi) || [];
  if (datePatterns.length >= 2) {
    score += 20;
    details.push('Consistent date formatting');
  } else if (datePatterns.length >= 1) {
    score += 10;
    details.push('Some dates present');
  } else {
    details.push('Missing or inconsistent dates');
  }
  
  // Check for professional summary
  const hasSummary = SECTIONS_KEYWORDS.summary.some(k => lowerText.includes(k));
  if (hasSummary) {
    score += 15;
    details.push('Professional summary present');
  } else {
    details.push('Missing professional summary');
    suggestions.push({
      type: 'section',
      priority: 'medium',
      title: 'Add Professional Summary',
      description: 'Add a 2-3 sentence summary at the top highlighting your key qualifications.',
    });
  }
  
  // Check for projects section
  const hasProjects = SECTIONS_KEYWORDS.projects.some(k => lowerText.includes(k));
  if (hasProjects) {
    score += 15;
    details.push('Projects section found');
  } else {
    details.push('No projects section');
    suggestions.push({
      type: 'section',
      priority: 'low',
      title: 'Consider Adding Projects',
      description: 'A projects section can showcase your practical experience and technical abilities.',
    });
  }
  
  let feedback = '';
  if (score >= 80) {
    feedback = 'Well-structured resume with all key sections and proper formatting.';
  } else if (score >= 50) {
    feedback = 'Basic structure is good but some sections could be added or improved.';
  } else {
    feedback = 'Resume structure needs improvement. Add missing sections and ensure consistent formatting.';
  }
  
  return { name: 'Formatting & structure', score, maxScore, feedback, details };
}
