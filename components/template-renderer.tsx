"use client"

import { ResumeData } from "@/lib/templates"
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from "lucide-react"

interface TemplateRendererProps {
  templateId: string
  data: ResumeData
  scale?: number
}

export function TemplateRenderer({ templateId, data, scale = 1 }: TemplateRendererProps) {
  const styles = getTemplateStyles(templateId)
  
  return (
    <div 
      className="bg-white text-black w-[210mm] min-h-[297mm] origin-top-left"
      style={{ transform: `scale(${scale})` }}
    >
      <div className={`p-8 ${styles.container}`}>
        {/* Header */}
        <header className={`mb-6 ${styles.header}`}>
          <h1 className={`text-3xl font-bold mb-2 ${styles.name}`}>
            {data.personalInfo.fullName}
          </h1>
          <div className={`flex flex-wrap gap-3 text-sm ${styles.contactText}`}>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {data.personalInfo.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {data.personalInfo.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.personalInfo.location}
            </span>
            {data.personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                {data.personalInfo.linkedin}
              </span>
            )}
            {data.personalInfo.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {data.personalInfo.website}
              </span>
            )}
            {data.personalInfo.github && (
              <span className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                {data.personalInfo.github}
              </span>
            )}
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-2 ${styles.sectionTitle}`}>
              Professional Summary
            </h2>
            <p className={`text-sm leading-relaxed ${styles.bodyText}`}>
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 ${styles.sectionTitle}`}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className={`font-semibold ${styles.jobTitle}`}>{exp.title}</h3>
                      <p className={`text-sm ${styles.company}`}>{exp.company} • {exp.location}</p>
                    </div>
                    <span className={`text-sm ${styles.dateText}`}>
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <ul className={`list-disc list-inside text-sm space-y-1 ${styles.bodyText}`}>
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 ${styles.sectionTitle}`}>
              Education
            </h2>
            {data.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold ${styles.jobTitle}`}>{edu.degree}</h3>
                    <p className={`text-sm ${styles.company}`}>
                      {edu.school} • {edu.location}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <span className={`text-sm ${styles.dateText}`}>{edu.graduationDate}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-2 ${styles.sectionTitle}`}>
              Skills
            </h2>
            <div className={`flex flex-wrap gap-2 ${styles.skillsContainer}`}>
              {data.skills.map((skill, idx) => (
                <span key={idx} className={`px-2 py-1 text-sm rounded ${styles.skillTag}`}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-2 ${styles.sectionTitle}`}>
              Certifications
            </h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className={styles.bodyText}>
                    <strong>{cert.name}</strong> - {cert.issuer}
                  </span>
                  <span className={styles.dateText}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className={`text-lg font-bold mb-2 ${styles.sectionTitle}`}>
              Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((project, idx) => (
                <div key={idx}>
                  <h3 className={`font-semibold ${styles.jobTitle}`}>
                    {project.name}
                    {project.link && (
                      <span className={`font-normal text-sm ml-2 ${styles.dateText}`}>
                        ({project.link})
                      </span>
                    )}
                  </h3>
                  <p className={`text-sm ${styles.bodyText}`}>{project.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded ${styles.techTag}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function getTemplateStyles(templateId: string) {
  const baseStyles = {
    container: "",
    header: "border-b-2 pb-4",
    name: "text-gray-900",
    contactText: "text-gray-600",
    sectionTitle: "text-gray-900 border-b border-gray-300 pb-1",
    jobTitle: "text-gray-900",
    company: "text-gray-600",
    dateText: "text-gray-500",
    bodyText: "text-gray-700",
    skillsContainer: "",
    skillTag: "bg-gray-100 text-gray-700",
    techTag: "bg-gray-100 text-gray-600"
  }

  const templates: Record<string, typeof baseStyles> = {
    "classic-professional": {
      ...baseStyles,
      header: "border-b-2 border-blue-900 pb-4",
      name: "text-blue-900 font-serif",
      sectionTitle: "text-blue-900 border-b-2 border-blue-900 pb-1 uppercase tracking-wide",
      skillTag: "bg-blue-50 text-blue-800 border border-blue-200"
    },
    "modern-minimal": {
      ...baseStyles,
      header: "pb-4",
      name: "text-red-700 font-bold tracking-tight",
      sectionTitle: "text-red-700 font-semibold text-base uppercase tracking-wide",
      skillTag: "bg-red-50 text-red-700 border border-red-200"
    },
    "tech-developer": {
      ...baseStyles,
      header: "bg-emerald-600 text-white p-4 -m-8 mb-4 rounded-none",
      name: "text-white",
      contactText: "text-emerald-100",
      sectionTitle: "text-emerald-700 border-b-2 border-emerald-500 pb-1",
      skillTag: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      techTag: "bg-emerald-100 text-emerald-700"
    },
    "executive-suite": {
      ...baseStyles,
      header: "border-b-4 border-stone-700 pb-4",
      name: "text-stone-800 tracking-wide",
      sectionTitle: "text-stone-700 uppercase tracking-wider text-sm font-bold border-b border-stone-300 pb-1",
      skillTag: "bg-stone-100 text-stone-700"
    },
    "creative-edge": {
      ...baseStyles,
      header: "border-l-4 border-teal-600 pl-4 pb-4",
      name: "text-teal-700",
      sectionTitle: "text-teal-700 font-bold border-b-2 border-teal-200 pb-1",
      skillTag: "bg-teal-50 text-teal-700 border border-teal-200"
    },
    "simple-clean": {
      ...baseStyles,
      header: "pb-4",
      name: "text-gray-800",
      sectionTitle: "text-gray-800 font-semibold border-b border-gray-200 pb-1"
    },
    "data-scientist": {
      ...baseStyles,
      header: "border-b-2 border-violet-600 pb-4",
      name: "text-violet-700",
      sectionTitle: "text-violet-700 font-bold border-b border-violet-200 pb-1",
      skillTag: "bg-violet-50 text-violet-700 border border-violet-200",
      techTag: "bg-violet-100 text-violet-700"
    }
  }

  return templates[templateId] || baseStyles
}
