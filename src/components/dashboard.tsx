"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Eye, EyeOff, Globe2, Image as ImageIcon, LayoutTemplate, LogOut, Settings2, Sparkles, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { sectionCatalog, templates } from "@/lib/portfolio/templates";
import type { Portfolio, PortfolioSection } from "@/lib/portfolio/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PortfolioShowcase } from "@/components/portfolio-showcase";

const starter: Portfolio = {
  name: "Your name", slug: "your-name", kind: "individual", template: "atelier", accent: "#bc6545",
  sections: [{ id: "intro", type: "hero", title: "Introduction", visible: true, content: { headline: "Tell the world what you do.", subtitle: "" } }],
};

const accentPresets = [
  { name: "Terracotta", value: "#bc6545" },
  { name: "Forest", value: "#426b55" },
  { name: "Ocean", value: "#39758a" },
  { name: "Plum", value: "#805b83" },
  { name: "Midnight", value: "#34415c" },
  { name: "Charcoal", value: "#44413d" },
];

function sectionText(section: PortfolioSection) {
  return String(section.content.body ?? section.content.headline ?? "");
}

function SectionFields({ section, onChange, onUpload, onRemoveImage, uploading }: {
  section: PortfolioSection;
  onChange: (content: Record<string, unknown>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  uploading: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const set = (key: string, value: string) => onChange({ ...section.content, [key]: value });
  const bodyLabel = section.type === "hero" ? "Headline" : section.type === "projects" ? "Project summary" : "Content";
  const imageUrl = typeof section.content.imageUrl === "string" ? section.content.imageUrl : "";
  const hasImage = /^https?:\/\//i.test(imageUrl);
  const hasImagePath = typeof section.content.imagePath === "string" && Boolean(section.content.imagePath);
  return <FieldGroup className="section-fields">
    <Field><FieldLabel htmlFor={`${section.id}-body`}>{bodyLabel}</FieldLabel><Textarea id={`${section.id}-body`} value={String(section.content[section.type === "hero" ? "headline" : "body"] ?? "")} onChange={(event) => set(section.type === "hero" ? "headline" : "body", event.target.value)} /></Field>
    {section.type === "hero" && <Field><FieldLabel htmlFor={`${section.id}-subtitle`}>Subtitle</FieldLabel><Input id={`${section.id}-subtitle`} value={String(section.content.subtitle ?? "")} onChange={(event) => set("subtitle", event.target.value)} /></Field>}
    {["projects", "case-studies", "contact", "resume"].includes(section.type) && <Field><FieldLabel htmlFor={`${section.id}-url`}>Link</FieldLabel><Input id={`${section.id}-url`} type="url" placeholder="https://example.com" value={String(section.content.url ?? "")} onChange={(event) => set("url", event.target.value)} /></Field>}
    {["hero", "about", "projects", "case-studies"].includes(section.type) && <Field>
      <FieldLabel htmlFor={`${section.id}-image`}>Image (optional)</FieldLabel>
      <Card className="gap-0 overflow-hidden p-0">
        {hasImage ? <div className="relative aspect-video w-full bg-muted">
          <Image src={imageUrl} alt={String(section.content.imageAlt || section.title)} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" unoptimized />
        </div> : <CardContent className="flex min-h-32 items-center justify-center p-4 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-6" />
            <p className="text-sm">{uploading ? "Uploading image…" : hasImagePath ? "Image saved, but its preview could not be loaded." : "No image uploaded"}</p>
          </div>
        </CardContent>}
        <CardFooter className="justify-between gap-2 border-t px-3 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
            <Upload data-icon="inline-start" />{uploading ? "Uploading…" : hasImage ? "Replace image" : "Upload image"}
          </Button>
          {hasImage && <Button type="button" variant="ghost" size="sm" onClick={onRemoveImage}>Remove</Button>}
        </CardFooter>
      </Card>
      <Input ref={fileInput} id={`${section.id}-image`} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Upload image for ${section.title}`} onChange={onUpload} disabled={uploading} />
    </Field>}
  </FieldGroup>;
}

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio>(starter);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeNav, setActiveNav] = useState("My portfolio");
  const [published, setPublished] = useState(false);
  const [profile, setProfile] = useState({ displayName: "", bio: "" });
  const [onboardingKind, setOnboardingKind] = useState<Portfolio["kind"]>("individual");
  const [uploading, setUploading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetch("/api/portfolio"), fetch("/api/profile")]).then(async ([portfolioResponse, profileResponse]) => {
      const stored = await portfolioResponse.json().catch(() => null);
      const storedProfile = await profileResponse.json().catch(() => null);
      if (stored?.draft) { setPortfolio(stored.draft as Portfolio); setPublished(Boolean(stored.published)); setHasPortfolio(true); }
      if (storedProfile?.displayName !== undefined) setProfile(storedProfile);
      setLoaded(true);
    }).catch(() => { setLoaded(true); setNotice("Unable to load your workspace. Check your connection and try again."); });
  }, []);

  const update = (next: Portfolio) => { setPortfolio(next); setSaved(false); setNotice(""); };
  const save = async () => {
    setSaved(false);
    const response = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(portfolio) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setNotice([result?.error, result?.hint].filter((value): value is string => typeof value === "string").join(" ") || "Your draft could not be saved. Try again."); return false; }
    setHasPortfolio(true); setSaved(true); setNotice("Your draft is saved. It is still private until you publish."); return true;
  };
  const publish = async () => {
    if (!portfolio.name.trim() || !await save()) return;
    const response = await fetch("/api/portfolio/publish", { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setNotice(typeof result?.error === "string" ? result.error : "Publishing failed. Your live page was not changed."); return; }
    setPublished(true); setNotice(result?.url ? `Published successfully: ${result.url}` : "Published successfully.");
  };
  const unpublish = async () => {
    const response = await fetch("/api/portfolio/unpublish", { method: "POST" });
    if (!response.ok) { setNotice("Unpublishing failed. Your live page was not changed."); return; }
    setPublished(false); setNotice("Your portfolio is unpublished. The public URL no longer shows it.");
  };
  const updateProfile = async () => {
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setNotice(response.ok ? "Account settings saved." : "Account settings could not be saved.");
  };
  const logout = async () => { await createSupabaseBrowserClient().auth.signOut(); router.push("/auth"); };
  const move = (index: number, delta: number) => {
    const next = [...portfolio.sections]; const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; update({ ...portfolio, sections: next });
  };
  const changeSection = (id: string, patch: Partial<PortfolioSection>) => update({ ...portfolio, sections: portfolio.sections.map((section) => section.id === id ? { ...section, ...patch } : section) });
  const addSection = (type: PortfolioSection["type"]) => {
    const item = sectionCatalog.find((section) => section.type === type);
    if (!item || portfolio.sections.some((section) => section.type === type)) return;
    update({ ...portfolio, sections: [...portfolio.sections, { id: crypto.randomUUID(), type, title: item.label, visible: true, content: { body: "" } }] });
  };
  const upload = async (section: PortfolioSection, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0]; if (!file) return;
    setUploading(section.id);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/portfolio/media", { method: "POST", body: form });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.path !== "string" || typeof result?.url !== "string") {
        setNotice(result?.error || "Image upload failed.");
        return;
      }
      changeSection(section.id, { content: { ...section.content, imagePath: result.path, imageUrl: result.url } });
    } catch {
      setNotice("Image upload failed. Check your connection and try again.");
    } finally {
      input.value = "";
      setUploading(null);
    }
  };
  const removeImage = (section: PortfolioSection) => {
    const content = { ...section.content };
    delete content.imagePath;
    delete content.imageUrl;
    changeSection(section.id, { content });
  };

  if (!loaded) return <main className="auth-shell"><p>Loading your workspace…</p></main>;
  if (!hasPortfolio) return <main className="auth-shell"><Card className="auth-card onboarding-card">
    <CardHeader className="p-0"><Link className="wordmark mb-4" href="/">forme<span>.</span></Link><span className="eyebrow">A GOOD PLACE TO BEGIN</span>
    <CardTitle className="auth-title">Let’s make a home for your work.</CardTitle><CardDescription>Start with a few basics. You can shape every detail afterward.</CardDescription></CardHeader>
    <CardContent className="p-0"><FieldGroup>
      <Field><FieldLabel htmlFor="display-name">What should we call you?</FieldLabel><Input id="display-name" value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} /></Field>
      <Field><FieldLabel htmlFor="portfolio-name">Portfolio name</FieldLabel><Input id="portfolio-name" value={portfolio.name === "Your name" ? profile.displayName : portfolio.name} onChange={(event) => update({ ...portfolio, name: event.target.value })} /></Field>
      <FieldSet><FieldLegend>This portfolio is for</FieldLegend><RadioGroup value={onboardingKind} onValueChange={(value) => { const kind = value as Portfolio["kind"]; setOnboardingKind(kind); update({ ...portfolio, kind }); }}><Field orientation="horizontal"><RadioGroupItem value="individual" id="individual" /><FieldLabel htmlFor="individual">Me</FieldLabel></Field><Field orientation="horizontal"><RadioGroupItem value="organization" id="organization" /><FieldLabel htmlFor="organization">An organisation</FieldLabel></Field></RadioGroup></FieldSet>
      <Button onClick={async () => { await updateProfile(); await save(); }}>Create my portfolio</Button>
      <Button variant="ghost" className="justify-start px-0" onClick={logout}><LogOut data-icon="inline-start"/> Sign out</Button>
    </FieldGroup></CardContent>
  </Card></main>;

  return <main className="app-shell" style={{ "--portfolio-accent": portfolio.accent } as React.CSSProperties}>
    <aside className="sidebar"><Link className="wordmark side-brand" href="/">forme<span>.</span></Link>
    <div className="workspace-picker workspace-identity"><span className="workspace-icon">{portfolio.name.charAt(0)}</span><span><b>{portfolio.name}</b><small>{portfolio.kind === "organization" ? "Organisation workspace" : "Personal workspace"}</small></span></div>
      <div className="side-label">WORKSPACE</div><nav className="side-nav">
        <Button variant="ghost" className={activeNav === "My portfolio" ? "active justify-start" : "justify-start"} onClick={() => setActiveNav("My portfolio")}><LayoutTemplate data-icon="inline-start"/>My portfolio</Button>
        <Button variant="ghost" className={activeNav === "Settings" ? "active justify-start" : "justify-start"} onClick={() => setActiveNav("Settings")}><Settings2 data-icon="inline-start"/>Settings</Button>
      </nav>
      <div className="sidebar-bottom"><Button variant="ghost" className="justify-start" onClick={logout}><LogOut data-icon="inline-start"/>Sign out</Button></div>
    </aside>
    <section className="editor-area"><header className="editor-topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><span className="save-state"><i className={saved ? "saved-dot" : "pending-dot"}/>{saved ? (published ? "Published" : "All changes saved") : "Unsaved changes"}</span><Button variant="outline" onClick={() => setPreview(!preview)}><Eye data-icon="inline-start"/>{preview ? "Editing" : "Preview"}</Button>{published && <Button asChild className="dashboard-publish" style={{ backgroundColor: portfolio.accent, color: "#fff" }}><Link href={`/${portfolio.slug}`} target="_blank" rel="noreferrer noopener">Visit portfolio <ArrowUpRight data-icon="inline-end"/></Link></Button>}{published && <Button variant="outline" onClick={unpublish}>Unpublish</Button>}<Button className="dashboard-publish" style={{ backgroundColor: portfolio.accent, color: "#fff" }} onClick={publish}><Globe2 data-icon="inline-start"/>Publish</Button></div></header>
      <div className="editor-content">
        <div className="editor-heading"><div><span className="eyebrow">YOUR CREATIVE HOME</span><h1>Make it <em>yours.</em></h1><p>Shape your story, one section at a time.</p></div></div>
        {notice && <Alert className="notice"><AlertDescription className="flex items-center justify-between"><span>{notice}</span><Button variant="ghost" size="icon" onClick={() => setNotice("")} aria-label="Dismiss"><X /></Button></AlertDescription></Alert>}
        {activeNav === "Settings" ? <section className="settings-panel"><h2>Account settings</h2><p>Keep your profile details up to date.</p><FieldGroup><Field><FieldLabel htmlFor="settings-name">Display name</FieldLabel><Input id="settings-name" value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}/></Field><Field><FieldLabel htmlFor="settings-bio">Short bio</FieldLabel><Textarea id="settings-bio" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })}/></Field><Button onClick={updateProfile}>Save settings</Button></FieldGroup></section> : <div className="editor-grid">
          <div className="main-column"><div className="section-title-row"><div><h2>Your story</h2><p>Arrange the pieces that make you, you.</p></div><Select defaultValue="" onValueChange={(value) => { if (value) addSection(value as PortfolioSection["type"]); }}><SelectTrigger className="button-soft"><SelectValue placeholder="Add section" /></SelectTrigger><SelectContent>{sectionCatalog.filter((item) => !portfolio.sections.some((section) => section.type === item.type)).map((item) => <SelectItem key={item.type} value={item.type}>{item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="sections-list">{portfolio.sections.map((section, index) => <Card className={`section-card ${!section.visible ? "muted" : ""}`} key={section.id}><div className="section-grip"><span>0{index + 1}</span><div className="reorder"><Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp /></Button><Button variant="ghost" size="icon" aria-label="Move down" onClick={() => move(index, 1)} disabled={index === portfolio.sections.length - 1}><ArrowDown /></Button></div></div><div className="section-info"><div className="section-card-heading"><Input aria-label="Section title" value={section.title} onChange={(event) => changeSection(section.id, { title: event.target.value })}/><Badge variant="secondary" className="section-type">{section.type.replace("-", " ")}</Badge></div><SectionFields section={section} onChange={(content) => changeSection(section.id, { content })} onUpload={(event) => upload(section, event)} onRemoveImage={() => removeImage(section)} uploading={uploading === section.id}/><div className="section-card-footer"><span><i/> {section.visible ? "Visible on your page" : "Hidden from your page"}</span><div><Button variant="ghost" onClick={() => changeSection(section.id, { visible: !section.visible })}>{section.visible ? <EyeOff data-icon="inline-start"/> : <Eye data-icon="inline-start"/>} {section.visible ? "Hide" : "Show"}</Button><Button variant="ghost" onClick={() => update({ ...portfolio, sections: portfolio.sections.filter((item) => item.id !== section.id) })}><Trash2 data-icon="inline-start"/>Remove</Button></div></div></div></Card>)}</div>
          </div>
          <aside className="settings-column"><Card className="settings-card"><CardHeader className="settings-heading"><div><CardTitle>Your web address</CardTitle><CardDescription>Choose the name and link for your page.</CardDescription></div><Globe2 /></CardHeader><CardContent className="flex flex-col gap-3"><Field><FieldLabel htmlFor="portfolio-name">Portfolio name</FieldLabel><Input id="portfolio-name" value={portfolio.name} onChange={(event) => update({ ...portfolio, name: event.target.value })}/></Field><Field><FieldLabel htmlFor="portfolio-url">Your address</FieldLabel><div className="url-field"><Input id="portfolio-url" value={portfolio.slug} onChange={(event) => update({ ...portfolio, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}/><span>{(process.env.NEXT_PUBLIC_SITE_URL || "https://forme.site").replace(/^https?:\/\//, "").replace(/\/$/, "")}/</span></div></Field></CardContent></Card><Card className="settings-card"><CardHeader className="settings-heading"><div><CardTitle>Pick your feel</CardTitle><CardDescription>Choose a layout and colors for your page.</CardDescription></div><Sparkles /></CardHeader><CardContent><div className="template-list">{templates.map((item) => <Button type="button" variant="ghost" key={item.id} aria-pressed={portfolio.template === item.id} className={`template-option ${portfolio.template === item.id ? "selected" : ""}`} onClick={() => update({ ...portfolio, template: item.id })}><span className={`template-thumb ${item.tone}`}><i/><i/><i/></span><span><b>{item.name}</b><small>{item.description}</small></span><span className="radio-dot"/></Button>)}</div><Field className="accent-control"><FieldLabel htmlFor="accent">Accent colour</FieldLabel><div className="accent-picker"><Input id="accent" type="color" value={portfolio.accent} aria-label="Choose a custom accent color" onChange={(event) => update({ ...portfolio, accent: event.target.value })}/><span>{portfolio.accent.toUpperCase()}</span></div><div className="accent-presets" aria-label="Accent color presets">{accentPresets.map((preset) => <Button key={preset.value} type="button" variant="ghost" size="icon" className={`accent-swatch ${portfolio.accent.toLowerCase() === preset.value ? "selected" : ""}`} style={{ "--swatch": preset.value } as React.CSSProperties} aria-label={`${preset.name} accent`} aria-pressed={portfolio.accent.toLowerCase() === preset.value} title={preset.name} onClick={() => update({ ...portfolio, accent: preset.value })}><span /></Button>)}</div></Field></CardContent></Card></aside>
        </div>}
      </div>
    </section>
    {preview && <div className="preview-overlay"><div className={`preview-window preview-${previewMode}`}><div className="preview-toolbar"><span>{previewMode === "desktop" ? "Desktop preview" : "Mobile preview"}</span><div><Button variant={previewMode === "desktop" ? "secondary" : "ghost"} onClick={() => setPreviewMode("desktop")}>Desktop</Button><Button variant={previewMode === "mobile" ? "secondary" : "ghost"} onClick={() => setPreviewMode("mobile")}>Mobile</Button><Button variant="ghost" size="icon" onClick={() => setPreview(false)} aria-label="Close preview"><X /></Button></div></div><PortfolioShowcase portfolio={portfolio} preview mobilePreview={previewMode === "mobile"} /></div></div>}
  </main>;
}
