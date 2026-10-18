"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, CircleHelp, Eye, EyeOff, Globe2, LayoutTemplate, LogOut, MoreHorizontal, Settings2, Sparkles, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { sectionCatalog, templates } from "@/lib/portfolio/templates";
import type { Portfolio, PortfolioSection } from "@/lib/portfolio/schema";

const starter: Portfolio = {
  name: "Your name", slug: "your-name", kind: "individual", template: "atelier", accent: "#bc6545",
  sections: [{ id: "intro", type: "hero", title: "Introduction", visible: true, content: { headline: "Tell the world what you do.", subtitle: "" } }],
};

function sectionText(section: PortfolioSection) {
  return String(section.content.body ?? section.content.headline ?? "");
}

function SectionFields({ section, onChange, onUpload, uploading }: {
  section: PortfolioSection;
  onChange: (content: Record<string, unknown>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  const set = (key: string, value: string) => onChange({ ...section.content, [key]: value });
  const bodyLabel = section.type === "hero" ? "Headline" : section.type === "projects" ? "Project summary" : "Content";
  return <div className="section-fields">
    <label>{bodyLabel}<textarea value={String(section.content[section.type === "hero" ? "headline" : "body"] ?? "")} onChange={(event) => set(section.type === "hero" ? "headline" : "body", event.target.value)} /></label>
    {section.type === "hero" && <label>Subtitle<input value={String(section.content.subtitle ?? "")} onChange={(event) => set("subtitle", event.target.value)} /></label>}
    {["projects", "case-studies", "contact", "resume"].includes(section.type) && <label>Link<input type="url" placeholder="https://example.com" value={String(section.content.url ?? "")} onChange={(event) => set("url", event.target.value)} /></label>}
    {["hero", "about", "projects", "case-studies"].includes(section.type) && <label className="upload-field">Image (optional)<span><Upload size={14}/>{uploading ? "Uploading…" : "Choose image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onUpload} disabled={uploading} /></span></label>}
    {typeof section.content.imagePath === "string" && <small className="field-help">Image uploaded securely.</small>}
  </div>;
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

  const template = useMemo(() => templates.find((item) => item.id === portfolio.template) ?? templates[0], [portfolio.template]);
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
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(section.id);
    const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/portfolio/media", { method: "POST", body: form });
    const result = await response.json().catch(() => null);
    if (!response.ok) setNotice(result?.error || "Image upload failed.");
    else changeSection(section.id, { content: { ...section.content, imagePath: result.path, imageUrl: result.url } });
    setUploading(null);
  };

  if (!loaded) return <main className="auth-shell"><p>Loading your workspace…</p></main>;
  if (!hasPortfolio) return <main className="auth-shell"><section className="auth-card onboarding-card">
    <Link className="wordmark" href="/">forme<span>.</span></Link><span className="eyebrow">A GOOD PLACE TO BEGIN</span>
    <h1>Let’s make a home for your work.</h1><p>Start with a few basics. You can shape every detail afterward.</p>
    <label>What should we call you?<input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} /></label>
    <label>Portfolio name<input value={portfolio.name === "Your name" ? profile.displayName : portfolio.name} onChange={(event) => update({ ...portfolio, name: event.target.value })} /></label>
    <fieldset><legend>This portfolio is for</legend><label><input type="radio" checked={onboardingKind === "individual"} onChange={() => { setOnboardingKind("individual"); update({ ...portfolio, kind: "individual" }); }} /> Me</label><label><input type="radio" checked={onboardingKind === "organization"} onChange={() => { setOnboardingKind("organization"); update({ ...portfolio, kind: "organization" }); }} /> An organisation</label></fieldset>
    <button className="button button-dark" onClick={async () => { await updateProfile(); await save(); }}>Create my portfolio</button>
    <button className="auth-switch" onClick={logout}><LogOut size={14}/> Sign out</button>
  </section></main>;

  return <main className="app-shell" style={{ "--accent": portfolio.accent } as React.CSSProperties}>
    <aside className="sidebar"><Link className="wordmark side-brand" href="/">forme<span>.</span></Link>
      <button className="workspace-picker"><span className="workspace-icon">{portfolio.name.charAt(0)}</span><span><b>{portfolio.name}</b><small>{portfolio.kind === "organization" ? "Organisation workspace" : "Personal workspace"}</small></span><ChevronDown size={15}/></button>
      <div className="side-label">WORKSPACE</div><nav className="side-nav">
        <button className={activeNav === "My portfolio" ? "active" : ""} onClick={() => setActiveNav("My portfolio")}><LayoutTemplate size={17}/>My portfolio</button>
        <button className={activeNav === "Settings" ? "active" : ""} onClick={() => setActiveNav("Settings")}><Settings2 size={17}/>Settings</button>
      </nav>
      <div className="sidebar-bottom"><button><CircleHelp size={17}/>Help & feedback</button><button className="profile-button" onClick={() => setActiveNav("Settings")}><span className="profile-avatar">{profile.displayName.slice(0, 2).toUpperCase() || "ME"}</span><span><b>{profile.displayName || "Your account"}</b><small>Account settings</small></span><MoreHorizontal size={18}/></button><button onClick={logout}><LogOut size={17}/>Sign out</button></div>
    </aside>
    <section className="editor-area"><header className="editor-topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><span className="save-state"><i className={saved ? "saved-dot" : "pending-dot"}/>{saved ? (published ? "Published" : "All changes saved") : "Unsaved changes"}</span><button className="button button-outline" onClick={() => setPreview(!preview)}><Eye size={15}/>{preview ? "Editing" : "Preview"}</button>{published && <button className="button button-outline" onClick={unpublish}>Unpublish</button>}<button className="button button-primary" onClick={publish}><Globe2 size={15}/>Publish</button></div></header>
      <div className="editor-content">
        <div className="editor-heading"><div><span className="eyebrow">YOUR CREATIVE HOME</span><h1>Make it <em>yours.</em></h1><p>Shape your story, one section at a time.</p></div></div>
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
        {activeNav === "Settings" ? <section className="settings-panel"><h2>Account settings</h2><p>Keep your profile details up to date.</p><label>Display name<input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}/></label><label>Short bio<textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })}/></label><button className="button button-primary" onClick={updateProfile}>Save settings</button></section> : <div className="editor-grid">
          <div className="main-column"><div className="section-title-row"><div><h2>Your story</h2><p>Arrange the pieces that make you, you.</p></div><select className="button button-soft" defaultValue="" onChange={(event) => { if (event.target.value) addSection(event.target.value as PortfolioSection["type"]); event.target.value = ""; }}><option value="">Add section</option>{sectionCatalog.filter((item) => !portfolio.sections.some((section) => section.type === item.type)).map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></div>
            <div className="sections-list">{portfolio.sections.map((section, index) => <article className={`section-card ${!section.visible ? "muted" : ""}`} key={section.id}><div className="section-grip"><span>0{index + 1}</span><div className="reorder"><button aria-label="Move up" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp size={13}/></button><button aria-label="Move down" onClick={() => move(index, 1)} disabled={index === portfolio.sections.length - 1}><ArrowDown size={13}/></button></div></div><div className="section-info"><div className="section-card-heading"><input aria-label="Section title" value={section.title} onChange={(event) => changeSection(section.id, { title: event.target.value })}/><span className="section-type">{section.type.replace("-", " ")}</span></div><SectionFields section={section} onChange={(content) => changeSection(section.id, { content })} onUpload={(event) => upload(section, event)} uploading={uploading === section.id}/><div className="section-card-footer"><span><i/> {section.visible ? "Visible on your page" : "Hidden from your page"}</span><div><button onClick={() => changeSection(section.id, { visible: !section.visible })}>{section.visible ? <EyeOff size={14}/> : <Eye size={14}/>} {section.visible ? "Hide" : "Show"}</button><button onClick={() => update({ ...portfolio, sections: portfolio.sections.filter((item) => item.id !== section.id) })}><Trash2 size={14}/>Remove</button></div></div></div></article>)}</div>
          </div>
          <aside className="settings-column"><div className="settings-card"><div className="settings-heading"><div><h3>Your web address</h3><p>A little corner of the internet, all yours.</p></div><Globe2 size={17}/></div><label className="field-label" htmlFor="portfolio-name">Portfolio name</label><input id="portfolio-name" className="text-field" value={portfolio.name} onChange={(event) => update({ ...portfolio, name: event.target.value })}/><label className="field-label" htmlFor="portfolio-url">Your address</label><div className="url-field"><input id="portfolio-url" value={portfolio.slug} onChange={(event) => update({ ...portfolio, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}/><span>{(process.env.NEXT_PUBLIC_SITE_URL || "https://forme.site").replace(/^https?:\/\//, "").replace(/\/$/, "")}/</span></div></div><div className="settings-card"><div className="settings-heading"><div><h3>Pick your feel</h3><p>Every good story has a look.</p></div><Sparkles size={17}/></div><div className="template-list">{templates.map((item) => <button key={item.id} className={`template-option ${portfolio.template === item.id ? "selected" : ""}`} onClick={() => update({ ...portfolio, template: item.id })}><span className={`template-thumb ${item.tone}`}><i/><i/><i/></span><span><b>{item.name}</b><small>{item.description}</small></span><span className="radio-dot"/></button>)}</div><label className="field-label" htmlFor="accent">Accent colour</label><input id="accent" type="color" value={portfolio.accent} onChange={(event) => update({ ...portfolio, accent: event.target.value })}/></div></aside>
        </div>}
        <footer className="editor-footer"><span>{template.name} template</span><div><button onClick={save}>{saved ? <Check size={14}/> : null}{saved ? "Saved" : "Save draft"}</button><button className="button button-primary" onClick={publish}>Publish your page <ArrowUp size={14}/></button></div></footer>
      </div>
    </section>
    {preview && <div className="preview-overlay"><div className={`preview-window preview-${previewMode}`}><div className="preview-toolbar"><span>{previewMode === "desktop" ? "Desktop preview" : "Mobile preview"}</span><div><button onClick={() => setPreviewMode("desktop")} className={previewMode === "desktop" ? "active" : ""}>Desktop</button><button onClick={() => setPreviewMode("mobile")} className={previewMode === "mobile" ? "active" : ""}>Mobile</button><button onClick={() => setPreview(false)} aria-label="Close preview"><X size={19}/></button></div></div><div className="preview-site"><div className="preview-nav">{portfolio.name}</div>{portfolio.sections.filter((section) => section.visible).map((section) => <div className={`preview-section preview-${section.type}`} key={section.id}><small>{section.title.toUpperCase()}</small><h2>{sectionText(section)}</h2>{typeof section.content.subtitle === "string" && <p>{section.content.subtitle}</p>}</div>)}</div></div></div>}
  </main>;
}
