export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
    github?: string
  }
  summary: string
  experience: {
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    description: string[]
  }[]
  education: {
    degree: string
    school: string
    location: string
    graduationDate: string
    gpa?: string
  }[]
  skills: string[]
  certifications?: {
    name: string
    issuer: string
    date: string
  }[]
  projects?: {
    name: string
    description: string
    technologies: string[]
    link?: string
  }[]
}

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  category: "professional" | "creative" | "simple" | "modern" | "technical"
  color: string
  previewColor: string
  features: string[]
  inspiredBy: string
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "classic-professional",
    name: "Classic Professional",
    description:
      "Inspired by Jake's Resume — the most-used LaTeX template on Overleaf. Clean single column, timeless serif headings, ATS-perfect.",
    category: "professional",
    color: "#1a365d",
    previewColor: "bg-blue-900",
    features: ["ATS-Optimized", "Timeless Layout", "Universal"],
    inspiredBy: "Jake's Resume (Overleaf)"
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description:
      "Inspired by Deedy — compact, dense, with a signature red accent. A favorite for consulting and engineering roles.",
    category: "modern",
    color: "#dc2626",
    previewColor: "bg-red-600",
    features: ["ATS-Optimized", "Compact Design", "Signature Accent"],
    inspiredBy: "Deedy (Overleaf)"
  },
  {
    id: "tech-developer",
    name: "Tech Developer",
    description:
      "Inspired by the Software Engineering Resume — skills-first structure with project highlights, built for developers.",
    category: "technical",
    color: "#059669",
    previewColor: "bg-emerald-600",
    features: ["ATS-Optimized", "Skills Focus", "Tech Industry"],
    inspiredBy: "Software Engineering Resume (Overleaf)"
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    description:
      "Inspired by AltaCV — a two-column layout with a skills sidebar, perfect for data, research, and academic roles.",
    category: "technical",
    color: "#7c3aed",
    previewColor: "bg-violet-600",
    features: ["ATS-Optimized", "Sidebar Layout", "Data & Research"],
    inspiredBy: "AltaCV (Overleaf)"
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    description:
      "Inspired by Candy — modern two-column design with bold color for marketing, design, and creative roles.",
    category: "creative",
    color: "#0d9488",
    previewColor: "bg-teal-600",
    features: ["ATS-Optimized", "Bold Design", "Creative Industry"],
    inspiredBy: "Candy (Overleaf)"
  },
  {
    id: "simple-clean",
    name: "Simple Clean",
    description:
      "Straightforward, distraction-free layout that parses cleanly through every ATS system in the market.",
    category: "simple",
    color: "#374151",
    previewColor: "bg-gray-700",
    features: ["ATS-Optimized", "Universal", "Easy to Read"],
    inspiredBy: "My Resume (Overleaf)"
  }
]

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    website: "johndoe.com",
    github: "github.com/johndoe"
  },
  summary: "Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, performance optimization, and delivering exceptional user experiences. Proven track record of leading cross-functional teams and shipping products used by millions.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp Inc.",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      endDate: "Present",
      description: [
        "Led development of microservices architecture serving 10M+ daily requests",
        "Reduced API response times by 40% through database optimization",
        "Mentored team of 5 junior developers and conducted code reviews"
      ]
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      startDate: "Jun 2019",
      endDate: "Dec 2021",
      description: [
        "Built React-based dashboard used by 50K+ enterprise customers",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Collaborated with product team to define and deliver new features"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "May 2019",
      gpa: "3.8"
    }
  ],
  skills: [
    "JavaScript", "TypeScript", "React", "Node.js", "Python",
    "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes",
    "Git", "Agile", "REST APIs", "GraphQL", "CI/CD"
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023"
    }
  ],
  projects: [
    {
      name: "Open Source Contribution",
      description: "Core contributor to popular React component library",
      technologies: ["React", "TypeScript", "Testing Library"],
      link: "github.com/example"
    }
  ]
}
