"use client"

import { useRef, useState, useEffect, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { getUser } from "@/lib/auth"
import { resumeTemplates, defaultResumeData, ResumeData } from "@/lib/templates"
import { TemplateRenderer } from "@/components/template-renderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Save,
  Download,
  Loader2,
  Plus,
  Trash2,
  ArrowLeftRight,
  Eye,
  PenLine,
} from "lucide-react"

type TabId = "personal" | "experience" | "education" | "skills" | "certifications" | "projects"

export default function TemplateEditorPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.templateId as string
  const template = resumeTemplates.find((t) => t.id === templateId)

  const [data, setData] = useState<ResumeData>(defaultResumeData)
  const [saving, setSaving] = useState(false)
  const [resumeName, setResumeName] = useState("My Resume")
  const [activeTab, setActiveTab] = useState<TabId>("personal")
  const [split, setSplit] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [showPreviewMobile, setShowPreviewMobile] = useState(false)
  const splitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!getUser()) {
      router.replace("/")
    }
  }, [router])

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center print:hidden">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Template not found</h1>
          <Button asChild>
            <Link href="/templates">Back to Templates</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!getUser()) {
      toast.error("Please sign in to save your resume")
      router.replace("/")
      return
    }

    setSaving(true)
    try {
      const saved: {
        id: string
        name: string
        templateId: string
        data: ResumeData
        updatedAt: string
      }[] = JSON.parse(window.localStorage.getItem("ats_saved_resumes") || "[]")
      saved.push({
        id: crypto.randomUUID(),
        name: resumeName,
        templateId,
        data,
        updatedAt: new Date().toISOString(),
      })
      window.localStorage.setItem("ats_saved_resumes", JSON.stringify(saved))
      toast.success("Resume saved successfully")
    } catch {
      toast.error("Failed to save resume", {
        description: "Local storage is unavailable in this browser",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    window.print()
  }

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !splitRef.current) return
    const rect = splitRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(65, Math.max(35, pct)))
  }

  const stopDrag = () => setDragging(false)

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    setData((prev) => {
      const newExp = [...prev.experience]
      newExp[index] = { ...newExp[index], [field]: value }
      return { ...prev, experience: newExp }
    })
  }

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: [""]
      }]
    }))
  }

  const removeExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setData((prev) => {
      const newEdu = [...prev.education]
      newEdu[index] = { ...newEdu[index], [field]: value }
      return { ...prev, education: newEdu }
    })
  }

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, {
        degree: "",
        school: "",
        location: "",
        graduationDate: ""
      }]
    }))
  }

  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index: number, field: string, value: string) => {
    setData((prev) => {
      const certs = [...(prev.certifications ?? [])]
      certs[index] = { ...certs[index], [field]: value }
      return { ...prev, certifications: certs }
    })
  }

  const addCertification = () => {
    setData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), { name: "", issuer: "", date: "" }]
    }))
  }

  const removeCertification = (index: number) => {
    setData((prev) => ({
      ...prev,
      certifications: (prev.certifications ?? []).filter((_, i) => i !== index)
    }))
  }

  const updateProject = (index: number, field: string, value: string) => {
    setData((prev) => {
      const projects = [...(prev.projects ?? [])]
      projects[index] = { ...projects[index], [field]: value }
      return { ...prev, projects }
    })
  }

  const updateProjectTech = (index: number, value: string) => {
    setData((prev) => {
      const projects = [...(prev.projects ?? [])]
      projects[index] = {
        ...projects[index],
        technologies: value.split(",").map((s) => s.trim()).filter(Boolean)
      }
      return { ...prev, projects }
    })
  }

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [...(prev.projects ?? []), { name: "", description: "", technologies: [], link: "" }]
    }))
  }

  const removeProject = (index: number) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects ?? []).filter((_, i) => i !== index)
    }))
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "personal", label: "Personal Info" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "certifications", label: "Certifications" },
    { id: "projects", label: "Projects" },
  ]

  const inputClass = "border-2 border-border/60 rounded-lg focus:border-primary"

  return (
    <>
    <div className="min-h-screen bg-background print:hidden">
      {/* Header */}
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Templates</span>
            </Link>
            <div className="flex items-center gap-2">
              <img
                src="/icon.svg"
                alt="ResumeATS logo"
                className="w-8 h-8 rounded-lg shadow-md shadow-primary/30"
              />
              <div className="hidden sm:block mr-1">
                <p className="text-xs text-muted-foreground leading-tight">{template.name}</p>
                <p className="text-[10px] text-muted-foreground/70 leading-tight">{template.inspiredBy}</p>
              </div>
              <Input
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="border-0 text-lg font-semibold bg-transparent focus-visible:ring-0 w-40 sm:w-48"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="rounded-xl border-2 border-border"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export </span>PDF
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/30"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </header>

      <div
        ref={splitRef}
        className={`flex flex-col lg:flex-row h-[calc(100vh-60px)] ${dragging ? "select-none" : ""}`}
      >
        {/* Editor Panel */}
        <div
          className={`${
            showPreviewMobile ? "hidden lg:block" : "block"
          } flex-1 min-h-0 min-w-0 overflow-y-auto lg:flex-none lg:w-[var(--split)]`}
          style={{ "--split": `${split}%` } as CSSProperties}
        >
          {/* Tabs */}
          <div className="flex border-b-2 border-border bg-card sticky top-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground mb-4">Personal Information</h2>

                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) => updatePersonalInfo("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={data.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn</label>
                    <Input
                      value={data.personalInfo.linkedin || ""}
                      onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <Input
                      value={data.personalInfo.website || ""}
                      onChange={(e) => updatePersonalInfo("website", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">GitHub</label>
                    <Input
                      value={data.personalInfo.github || ""}
                      onChange={(e) => updatePersonalInfo("github", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Professional Summary</label>
                  <textarea
                    value={data.summary}
                    onChange={(e) => setData((prev) => ({ ...prev, summary: e.target.value }))}
                    rows={4}
                    className="w-full border-2 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary border-border/60"
                  />
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Work Experience</h2>
                  <Button
                    onClick={addExperience}
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {data.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-card border-2 border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Position {idx + 1}</span>
                      <button
                        onClick={() => removeExperience(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateExperience(idx, "title", e.target.value)}
                        className={inputClass}
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => updateExperience(idx, "location", e.target.value)}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        className={inputClass}
                      />
                      <Input
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (one per line)</label>
                      <textarea
                        value={exp.description.join("\n")}
                        onChange={(e) => updateExperience(idx, "description", e.target.value.split("\n"))}
                        rows={4}
                        className="w-full border-2 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary border-border/60"
                        placeholder="• Led team of 5 engineers&#10;• Increased revenue by 20%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Education</h2>
                  <Button
                    onClick={addEducation}
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-card border-2 border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Education {idx + 1}</span>
                      <button
                        onClick={() => removeEducation(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      className={inputClass}
                    />
                    <Input
                      placeholder="School/University"
                      value={edu.school}
                      onChange={(e) => updateEducation(idx, "school", e.target.value)}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location"
                        value={edu.location}
                        onChange={(e) => updateEducation(idx, "location", e.target.value)}
                        className={inputClass}
                      />
                      <Input
                        placeholder="Graduation Date"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(idx, "graduationDate", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <Input
                      placeholder="GPA (optional)"
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Skills</h2>
                <p className="text-sm text-muted-foreground">Enter skills separated by commas</p>
                <textarea
                  value={data.skills.join(", ")}
                  onChange={(e) => setData((prev) => ({
                    ...prev,
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }))}
                  rows={6}
                  className="w-full border-2 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary border-border/60"
                  placeholder="JavaScript, TypeScript, React, Node.js, Python..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "certifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Certifications</h2>
                  <Button
                    onClick={addCertification}
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {(data.certifications ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No certifications yet. Add AWS, Google, or industry certifications to stand out.
                  </p>
                )}

                {(data.certifications ?? []).map((cert, idx) => (
                  <div key={idx} className="p-4 bg-card border-2 border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Certification {idx + 1}</span>
                      <button
                        onClick={() => removeCertification(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Certification name (e.g. AWS Solutions Architect)"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, "name", e.target.value)}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Issuer"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                        className={inputClass}
                      />
                      <Input
                        placeholder="Year"
                        value={cert.date}
                        onChange={(e) => updateCertification(idx, "date", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Projects</h2>
                  <Button
                    onClick={addProject}
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {(data.projects ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No projects yet. Highlight your best work to demonstrate hands-on experience.
                  </p>
                )}

                {(data.projects ?? []).map((project, idx) => (
                  <div key={idx} className="p-4 bg-card border-2 border-border rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Project {idx + 1}</span>
                      <button
                        onClick={() => removeProject(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Project name"
                        value={project.name}
                        onChange={(e) => updateProject(idx, "name", e.target.value)}
                        className={inputClass}
                      />
                      <Input
                        placeholder="Link (optional)"
                        value={project.link || ""}
                        onChange={(e) => updateProject(idx, "link", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      placeholder="Short description of what you built and the impact"
                      value={project.description}
                      onChange={(e) => updateProject(idx, "description", e.target.value)}
                      rows={3}
                      className="w-full border-2 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary border-border/60"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">Technologies (comma separated)</label>
                      <Input
                        placeholder="React, TypeScript, AWS"
                        value={project.technologies.join(", ")}
                        onChange={(e) => updateProjectTech(idx, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          className="hidden lg:flex w-3 shrink-0 cursor-col-resize items-center justify-center bg-card border-x border-border hover:bg-accent/30 transition-colors select-none touch-none"
          onPointerDown={startDrag}
          onPointerMove={onDragMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          title="Drag to resize preview"
        >
          <ArrowLeftRight className="w-4 h-4 text-foreground/40" />
        </div>

        {/* Preview Panel */}
        <div
          className={`${
            showPreviewMobile ? "block" : "hidden"
          } lg:block flex-1 min-w-0 bg-muted/30 overflow-auto p-6`}
        >
          <div className="flex justify-center sticky top-0">
            <div className="shadow-2xl max-w-full">
              <TemplateRenderer
                templateId={templateId}
                data={data}
                scale={0.7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile preview toggle */}
      <button
        onClick={() => setShowPreviewMobile((v) => !v)}
        className="lg:hidden fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 text-sm font-semibold"
      >
        {showPreviewMobile ? (
          <>
            <PenLine className="w-4 h-4" />
            Back to Editing
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Preview Resume
          </>
        )}
      </button>
    </div>

    {/* Print-only full-size version for PDF export */}
    <div className="hidden print:block">
      <TemplateRenderer templateId={templateId} data={data} scale={1} />
    </div>
    </>
  )
}
