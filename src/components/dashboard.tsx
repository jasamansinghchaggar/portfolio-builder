'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Eye,
  EyeSlash,
  Globe,
  Image as ImageIcon,
  Layout,
  SignOut,
  Gear,
  Sparkle,
  Trash,
  Upload,
  X,
} from '@phosphor-icons/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { sectionCatalog, templates } from '@/lib/portfolio/templates';
import type { Portfolio, PortfolioSection } from '@/lib/portfolio/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { PortfolioShowcase } from '@/components/portfolio-showcase';

const starter: Portfolio = {
  name: 'Your name',
  slug: 'your-name',
  kind: 'individual',
  template: 'atelier',
  accent: '#bc6545',
  sections: [
    {
      id: 'intro',
      type: 'hero',
      title: 'Introduction',
      visible: true,
      content: { headline: 'Tell the world what you do.', subtitle: '' },
    },
  ],
};

const accentPresets = [
  { name: 'Terracotta', value: '#bc6545' },
  { name: 'Forest', value: '#426b55' },
  { name: 'Ocean', value: '#39758a' },
  { name: 'Plum', value: '#805b83' },
  { name: 'Midnight', value: '#34415c' },
  { name: 'Charcoal', value: '#44413d' },
];

function sectionText(section: PortfolioSection) {
  return String(section.content.body ?? section.content.headline ?? '');
}

function SectionFields({
  section,
  onChange,
  onUpload,
  onRemoveImage,
  uploading,
}: {
  section: PortfolioSection;
  onChange: (content: Record<string, unknown>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  uploading: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const set = (key: string, value: string) => onChange({ ...section.content, [key]: value });
  const bodyLabel =
    section.type === 'hero'
      ? 'Headline'
      : section.type === 'projects'
        ? 'Project summary'
        : 'Content';
  const imageUrl = typeof section.content.imageUrl === 'string' ? section.content.imageUrl : '';
  const hasImage = /^https?:\/\//i.test(imageUrl);
  const hasImagePath =
    typeof section.content.imagePath === 'string' && Boolean(section.content.imagePath);

  return (
    <FieldGroup className="section-fields">
      <Field>
        <FieldLabel htmlFor={`${section.id}-body`}>{bodyLabel}</FieldLabel>
        <Textarea
          id={`${section.id}-body`}
          value={String(section.content[section.type === 'hero' ? 'headline' : 'body'] ?? '')}
          onChange={(event) =>
            set(section.type === 'hero' ? 'headline' : 'body', event.target.value)
          }
        />
      </Field>
      {section.type === 'hero' && (
        <Field>
          <FieldLabel htmlFor={`${section.id}-subtitle`}>Subtitle</FieldLabel>
          <Input
            id={`${section.id}-subtitle`}
            value={String(section.content.subtitle ?? '')}
            onChange={(event) => set('subtitle', event.target.value)}
          />
        </Field>
      )}
      {['projects', 'case-studies', 'contact', 'resume'].includes(section.type) && (
        <Field>
          <FieldLabel htmlFor={`${section.id}-url`}>Link</FieldLabel>
          <Input
            id={`${section.id}-url`}
            type="url"
            placeholder="https://example.com"
            value={String(section.content.url ?? '')}
            onChange={(event) => set('url', event.target.value)}
          />
        </Field>
      )}
      {['hero', 'about', 'projects', 'case-studies'].includes(section.type) && (
        <Field>
          <FieldLabel htmlFor={`${section.id}-image`}>Image (optional)</FieldLabel>
          <Card className="gap-0 overflow-hidden p-0">
            {hasImage ? (
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={imageUrl}
                  alt={String(section.content.imageAlt || section.title)}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <CardContent className="flex min-h-32 items-center justify-center p-4 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {uploading ? <Spinner /> : <ImageIcon aria-hidden="true" className="size-6" />}
                  <p className="text-sm">
                    {uploading
                      ? 'Uploading image…'
                      : hasImagePath
                        ? 'Image saved, but its preview could not be loaded.'
                        : 'No image uploaded'}
                  </p>
                </div>
              </CardContent>
            )}
            <Separator />
            <CardFooter className="justify-between gap-2 px-3 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                <Upload data-icon="inline-start" />
                {uploading ? 'Uploading…' : hasImage ? 'Replace image' : 'Upload image'}
              </Button>
              {hasImage && (
                <Button type="button" variant="ghost" size="sm" onClick={onRemoveImage}>
                  <Trash data-icon="inline-start" />
                  Remove
                </Button>
              )}
            </CardFooter>
          </Card>
          <Input
            ref={fileInput}
            id={`${section.id}-image`}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={`Upload image for ${section.title}`}
            onChange={onUpload}
            disabled={uploading}
          />
        </Field>
      )}
    </FieldGroup>
  );
}

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio>(starter);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeNav, setActiveNav] = useState('portfolio');
  const [published, setPublished] = useState(false);
  const [profile, setProfile] = useState({ displayName: '', bio: '' });
  const [onboardingKind, setOnboardingKind] = useState<Portfolio['kind']>('individual');
  const [uploading, setUploading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetch('/api/portfolio'), fetch('/api/profile')])
      .then(async ([portfolioResponse, profileResponse]) => {
        const stored = await portfolioResponse.json().catch(() => null);
        const storedProfile = await profileResponse.json().catch(() => null);
        if (stored?.draft) {
          setPortfolio(stored.draft as Portfolio);
          setPublished(Boolean(stored.published));
          setHasPortfolio(true);
        }
        if (storedProfile?.displayName !== undefined) setProfile(storedProfile);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
        setNotice('Unable to load your workspace. Check your connection and try again.');
      });
  }, []);

  const update = (next: Portfolio) => {
    setPortfolio(next);
    setSaved(false);
    setNotice('');
  };
  const save = async () => {
    setSaved(false);
    const response = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portfolio),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice(
        [result?.error, result?.hint]
          .filter((value): value is string => typeof value === 'string')
          .join(' ') || 'Your draft could not be saved. Try again.',
      );
      return false;
    }
    setHasPortfolio(true);
    setSaved(true);
    setNotice('Your draft is saved. It is still private until you publish.');
    return true;
  };
  const publish = async () => {
    if (!portfolio.name.trim() || !(await save())) return;
    const response = await fetch('/api/portfolio/publish', {
      method: 'POST',
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice(
        typeof result?.error === 'string'
          ? result.error
          : 'Publishing failed. Your live page was not changed.',
      );
      return;
    }
    setPublished(true);
    setNotice(result?.url ? `Published successfully: ${result.url}` : 'Published successfully.');
  };
  const unpublish = async () => {
    const response = await fetch('/api/portfolio/unpublish', {
      method: 'POST',
    });
    if (!response.ok) {
      setNotice('Unpublishing failed. Your live page was not changed.');
      return;
    }
    setPublished(false);
    setNotice('Your portfolio is unpublished. The public URL no longer shows it.');
  };
  const updateProfile = async () => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setNotice(response.ok ? 'Account settings saved.' : 'Account settings could not be saved.');
  };
  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    router.push('/auth');
  };
  const move = (index: number, delta: number) => {
    const next = [...portfolio.sections];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ ...portfolio, sections: next });
  };
  const changeSection = (id: string, patch: Partial<PortfolioSection>) =>
    update({
      ...portfolio,
      sections: portfolio.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    });
  const addSection = (type: PortfolioSection['type']) => {
    const item = sectionCatalog.find((section) => section.type === type);
    if (!item || portfolio.sections.some((section) => section.type === type)) return;
    update({
      ...portfolio,
      sections: [
        ...portfolio.sections,
        {
          id: crypto.randomUUID(),
          type,
          title: item.label,
          visible: true,
          content: { body: '' },
        },
      ],
    });
  };
  const upload = async (section: PortfolioSection, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(section.id);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/portfolio/media', {
        method: 'POST',
        body: form,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.path !== 'string' || typeof result?.url !== 'string') {
        setNotice(result?.error || 'Image upload failed.');
        return;
      }
      changeSection(section.id, {
        content: {
          ...section.content,
          imagePath: result.path,
          imageUrl: result.url,
        },
      });
    } catch {
      setNotice('Image upload failed. Check your connection and try again.');
    } finally {
      input.value = '';
      setUploading(null);
    }
  };
  const removeImage = (section: PortfolioSection) => {
    const content = { ...section.content };
    delete content.imagePath;
    delete content.imageUrl;
    changeSection(section.id, { content });
  };

  // ─── Loading state ───
  if (!loaded)
    return (
      <main className="auth-shell" id="dashboard-loading">
        <Card className="auth-card items-center">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground mt-3">Loading your workspace…</p>
        </Card>
      </main>
    );

  // ─── Onboarding ───
  if (!hasPortfolio)
    return (
      <main className="auth-shell" id="dashboard-onboarding">
        <Card className="auth-card onboarding-card">
          <CardHeader className="p-0 gap-4">
            <Link className="wordmark" href="/">
              forme<span>.</span>
            </Link>
            <Badge variant="secondary" className="hero-eyebrow w-fit">
              <i /> A GOOD PLACE TO BEGIN
            </Badge>
            <div>
              <CardTitle className="auth-title">Let&apos;s make a home for your work.</CardTitle>
              <CardDescription className="mt-1.5">
                Start with a few basics. You can shape every detail afterward.
              </CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="display-name">What should we call you?</FieldLabel>
                <Input
                  id="display-name"
                  placeholder="Your name"
                  value={profile.displayName}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      displayName: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="portfolio-name">Portfolio name</FieldLabel>
                <Input
                  id="portfolio-name"
                  placeholder="My portfolio"
                  value={portfolio.name === 'Your name' ? profile.displayName : portfolio.name}
                  onChange={(event) =>
                    update({
                      ...portfolio,
                      name: event.target.value,
                    })
                  }
                />
              </Field>
              <FieldSet>
                <FieldLegend>This portfolio is for</FieldLegend>
                <RadioGroup
                  value={onboardingKind}
                  onValueChange={(value) => {
                    const kind = value as Portfolio['kind'];
                    setOnboardingKind(kind);
                    update({ ...portfolio, kind });
                  }}
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem value="individual" id="individual" />
                    <FieldLabel htmlFor="individual">Me</FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="organization" id="organization" />
                    <FieldLabel htmlFor="organization">An organisation</FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
              <Button
                onClick={async () => {
                  await updateProfile();
                  await save();
                }}
                id="onboarding-create"
              >
                Create my portfolio
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="justify-start px-0"
                onClick={logout}
                id="onboarding-signout"
              >
                <SignOut data-icon="inline-start" />
                Sign out
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </main>
    );

  // ─── Main dashboard ───
  const completionSections = portfolio.sections.filter((s) => {
    if (s.type === 'hero') return Boolean(sectionText(s).trim());
    return Boolean(s.content.body || s.content.headline);
  }).length;
  const completionPercent = Math.round(
    (completionSections / Math.max(portfolio.sections.length, 1)) * 100,
  );

  return (
    <main
      className="app-shell"
      style={
        {
          '--portfolio-accent': portfolio.accent,
        } as React.CSSProperties
      }
      id="dashboard"
    >
      {/* ─── Sidebar ─── */}
      <aside className="sidebar" id="dashboard-sidebar">
        <Link className="wordmark side-brand" href="/">
          forme<span>.</span>
        </Link>

        <Card className="workspace-picker workspace-identity p-0 border-sidebar-border bg-sidebar-accent">
          <CardContent className="flex items-center gap-2.5 p-2.5">
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md bg-primary/15 text-primary text-sm font-semibold">
                {portfolio.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0 sidebar-text">
              <span className="text-xs font-semibold truncate">{portfolio.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {portfolio.kind === 'organization' ? 'Organisation' : 'Personal'}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" id="sidebar-nav">
          <Button
            variant={activeNav === 'portfolio' ? 'secondary' : 'ghost'}
            className="justify-start w-full"
            onClick={() => setActiveNav('portfolio')}
            id="nav-portfolio"
          >
            <Layout data-icon="inline-start" />
            <span className="sidebar-text">My portfolio</span>
          </Button>
          <Button
            variant={activeNav === 'settings' ? 'secondary' : 'ghost'}
            className="justify-start w-full"
            onClick={() => setActiveNav('settings')}
            id="nav-settings"
          >
            <Gear data-icon="inline-start" />
            <span className="sidebar-text">Settings</span>
          </Button>
        </nav>

        <div className="sidebar-bottom">
          <Separator />
          <Button
            variant="ghost"
            className="justify-start w-full"
            onClick={logout}
            id="nav-signout"
          >
            <SignOut data-icon="inline-start" />
            <span className="sidebar-text">Sign out</span>
          </Button>
        </div>
      </aside>

      {/* ─── Editor Area ─── */}
      <section className="editor-area" id="editor-area">
        <header className="editor-topbar">
          <Breadcrumb className="breadcrumbs">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeNav === 'portfolio' ? 'My portfolio' : 'Settings'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="top-actions">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={saved ? 'secondary' : 'outline'} className="save-state">
                  <span
                    className={`size-1.5 rounded-full ${saved ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {saved ? (published ? 'Published' : 'Saved') : 'Unsaved'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {saved ? 'All changes saved' : 'You have unsaved changes'}
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(!preview)}
              id="btn-preview"
            >
              <Eye data-icon="inline-start" />
              {preview ? 'Editing' : 'Preview'}
            </Button>

            {published && (
              <Button asChild size="sm" variant="outline" id="btn-visit">
                <Link href={`/${portfolio.slug}`} target="_blank" rel="noreferrer noopener">
                  Visit <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            )}
            {published && (
              <Button variant="outline" size="sm" onClick={unpublish} id="btn-unpublish">
                Unpublish
              </Button>
            )}
            <Button
              size="sm"
              className="dashboard-publish"
              style={{
                backgroundColor: portfolio.accent,
                color: '#fff',
              }}
              onClick={publish}
              id="btn-publish"
            >
              <Globe data-icon="inline-start" />
              Publish
            </Button>
          </div>
        </header>

        <ScrollArea className="editor-scroll">
          <div className="editor-content">
            {/* ─── Editor header ─── */}
            <div className="editor-heading">
              <div>
                <Badge variant="secondary" className="hero-eyebrow">
                  <i /> YOUR CREATIVE HOME
                </Badge>
                <h1>
                  Make it <em>yours.</em>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Shape your story, one section at a time.
                </p>
              </div>
            </div>

            {/* ─── Progress ─── */}
            <Card className="mb-5 border-dashed" id="completion-card">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Portfolio completion</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {completionPercent}%
                    </span>
                  </div>
                  <Progress value={completionPercent} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* ─── Notice ─── */}
            {notice && (
              <Alert className="notice mb-4" id="dashboard-notice">
                <AlertDescription className="flex items-center justify-between">
                  <span>{notice}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotice('')}
                    aria-label="Dismiss"
                  >
                    <X />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* ─── Settings panel ─── */}
            {activeNav === 'settings' ? (
              <Card className="settings-panel" id="settings-panel">
                <CardHeader>
                  <CardTitle>Account settings</CardTitle>
                  <CardDescription>Keep your profile details up to date.</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="settings-name">Display name</FieldLabel>
                      <Input
                        id="settings-name"
                        value={profile.displayName}
                        onChange={(event) =>
                          setProfile({
                            ...profile,
                            displayName: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="settings-bio">Short bio</FieldLabel>
                      <Textarea
                        id="settings-bio"
                        value={profile.bio}
                        onChange={(event) =>
                          setProfile({
                            ...profile,
                            bio: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Button onClick={updateProfile} id="settings-save">
                      Save settings
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>
            ) : (
              /* ─── Portfolio editor ─── */
              <div className="editor-grid">
                <div className="main-column">
                  {/* Section title row */}
                  <div className="section-title-row">
                    <div>
                      <h2 className="font-heading">Your story</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Arrange the pieces that make you, you.
                      </p>
                    </div>
                    <Select
                      defaultValue=""
                      onValueChange={(value) => {
                        if (value) addSection(value as PortfolioSection['type']);
                      }}
                    >
                      <SelectTrigger className="w-40" id="add-section-select">
                        <SelectValue placeholder="Add section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sectionCatalog
                            .filter(
                              (item) =>
                                !portfolio.sections.some((section) => section.type === item.type),
                            )
                            .map((item) => (
                              <SelectItem key={item.type} value={item.type}>
                                {item.label}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sections */}
                  <div className="sections-list">
                    {portfolio.sections.map((section, index) => (
                      <Card
                        className={`section-card ${!section.visible ? 'opacity-60' : ''}`}
                        key={section.id}
                        id={`section-${section.id}`}
                      >
                        <div className="section-grip">
                          <Badge
                            variant="outline"
                            className="text-[10px] tabular-nums px-1.5 py-0.5"
                          >
                            {String(index + 1).padStart(2, '0')}
                          </Badge>
                          <div className="flex flex-col gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  aria-label="Move up"
                                  onClick={() => move(index, -1)}
                                  disabled={index === 0}
                                >
                                  <ArrowUp />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right">Move up</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  aria-label="Move down"
                                  onClick={() => move(index, 1)}
                                  disabled={index === portfolio.sections.length - 1}
                                >
                                  <ArrowDown />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right">Move down</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="section-info">
                          <div className="section-card-heading">
                            <Input
                              aria-label="Section title"
                              value={section.title}
                              className="border-0 px-0 font-semibold text-sm bg-transparent shadow-none focus-visible:ring-0"
                              onChange={(event) =>
                                changeSection(section.id, {
                                  title: event.target.value,
                                })
                              }
                            />
                            <Badge variant="secondary" className="section-type shrink-0">
                              {section.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          <SectionFields
                            section={section}
                            onChange={(content) => changeSection(section.id, { content })}
                            onUpload={(event) => upload(section, event)}
                            onRemoveImage={() => removeImage(section)}
                            uploading={uploading === section.id}
                          />
                          <Separator className="my-3" />
                          <div className="section-card-footer">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`size-1.5 rounded-full ${section.visible ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {section.visible ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      changeSection(section.id, {
                                        visible: !section.visible,
                                      })
                                    }
                                  >
                                    {section.visible ? (
                                      <EyeSlash data-icon="inline-start" />
                                    ) : (
                                      <Eye data-icon="inline-start" />
                                    )}
                                    {section.visible ? 'Hide' : 'Show'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {section.visible ? 'Hide from portfolio' : 'Show on portfolio'}
                                </TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  update({
                                    ...portfolio,
                                    sections: portfolio.sections.filter(
                                      (item) => item.id !== section.id,
                                    ),
                                  })
                                }
                              >
                                <Trash data-icon="inline-start" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* ─── Settings column ─── */}
                <aside className="settings-column">
                  <Card className="settings-card">
                    <CardHeader className="settings-heading">
                      <div>
                        <CardTitle className="text-sm">Your web address</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Choose the name and link for your page.
                        </CardDescription>
                      </div>
                      <Globe className="text-muted-foreground" />
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-col gap-3 pt-4">
                      <Field>
                        <FieldLabel htmlFor="portfolio-name-side">Portfolio name</FieldLabel>
                        <Input
                          id="portfolio-name-side"
                          value={portfolio.name}
                          onChange={(event) =>
                            update({
                              ...portfolio,
                              name: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="portfolio-url">Your address</FieldLabel>
                        <div className="url-field">
                          <Input
                            id="portfolio-url"
                            className="border-0 px-0 shadow-none focus-visible:ring-0"
                            value={portfolio.slug}
                            onChange={(event) =>
                              update({
                                ...portfolio,
                                slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                              })
                            }
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {(process.env.NEXT_PUBLIC_SITE_URL || 'https://forme.site')
                              .replace(/^https?:\/\//, '')
                              .replace(/\/$/, '')}
                            /
                          </span>
                        </div>
                      </Field>
                    </CardContent>
                  </Card>

                  <Card className="settings-card">
                    <CardHeader className="settings-heading">
                      <div>
                        <CardTitle className="text-sm">Pick your feel</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Choose a layout and colors.
                        </CardDescription>
                      </div>
                      <Sparkle className="text-muted-foreground" />
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      <div className="template-list">
                        {templates.map((item) => (
                          <Button
                            type="button"
                            variant="ghost"
                            key={item.id}
                            aria-pressed={portfolio.template === item.id}
                            className={`template-option ${portfolio.template === item.id ? 'selected' : ''}`}
                            onClick={() =>
                              update({
                                ...portfolio,
                                template: item.id,
                              })
                            }
                          >
                            <span className={`template-thumb ${item.tone}`}>
                              <i />
                              <i />
                              <i />
                            </span>
                            <span className="flex flex-col gap-0.5 flex-1 text-left">
                              <b className="text-xs font-semibold">{item.name}</b>
                              <small className="text-[10px] text-muted-foreground">
                                {item.description}
                              </small>
                            </span>
                            <span className="radio-dot" />
                          </Button>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      <Field className="accent-control">
                        <FieldLabel htmlFor="accent">Accent colour</FieldLabel>
                        <div className="accent-picker">
                          <Input
                            id="accent"
                            type="color"
                            className="size-9 p-1 cursor-pointer"
                            value={portfolio.accent}
                            aria-label="Choose a custom accent color"
                            onChange={(event) =>
                              update({
                                ...portfolio,
                                accent: event.target.value,
                              })
                            }
                          />
                          <Badge variant="outline" className="font-mono text-xs">
                            {portfolio.accent.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="accent-presets" aria-label="Accent color presets">
                          {accentPresets.map((preset) => (
                            <Tooltip key={preset.value}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={`accent-swatch ${portfolio.accent.toLowerCase() === preset.value ? 'selected' : ''}`}
                                  style={
                                    {
                                      '--swatch': preset.value,
                                    } as React.CSSProperties
                                  }
                                  aria-label={`${preset.name} accent`}
                                  aria-pressed={portfolio.accent.toLowerCase() === preset.value}
                                  onClick={() =>
                                    update({
                                      ...portfolio,
                                      accent: preset.value,
                                    })
                                  }
                                >
                                  <span />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{preset.name}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </Field>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* ─── Preview overlay ─── */}
      {preview && (
        <div className="preview-overlay" id="preview-overlay">
          <Card className={`preview-window preview-${previewMode}`}>
            <CardHeader className="preview-toolbar p-0 px-4 py-2 flex-row items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {previewMode === 'desktop' ? 'Desktop preview' : 'Mobile preview'}
              </span>
              <div className="flex items-center gap-1">
                <Tabs
                  value={previewMode}
                  onValueChange={(v) => setPreviewMode(v as 'desktop' | 'mobile')}
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="desktop" className="text-xs px-2 py-0.5">
                      Desktop
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="text-xs px-2 py-0.5">
                      Mobile
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setPreview(false)}
                  aria-label="Close preview"
                >
                  <X />
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <PortfolioShowcase
              portfolio={portfolio}
              preview
              mobilePreview={previewMode === 'mobile'}
            />
          </Card>
        </div>
      )}
    </main>
  );
}
