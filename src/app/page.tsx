import Link from 'next/link';
import { ArrowUpRight, ArrowDown } from '@phosphor-icons/react/dist/ssr';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="landing">
      {/* ─── Nav ─── */}
      <nav className="topbar" id="landing-nav">
        <Link className="wordmark" href="/">
          forme<span>.</span>
        </Link>
        <div className="nav-actions">
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">
                Dashboard <ArrowUpRight data-icon="inline-end" weight="bold" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard">
                  Start building <ArrowUpRight data-icon="inline-end" weight="bold" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero-wrap" id="hero-section">
        <div className="hero-copy">
          <Badge variant="secondary" className="hero-eyebrow">
            <i /> YOUR WORK, IN ITS BEST LIGHT
          </Badge>
          <h1>
            Make room
            <br />
            for <em>what you do.</em>
          </h1>
          <p>A thoughtful home for your work, ideas, and next chapter. Make it yours in minutes.</p>
          <Button asChild size="lg" className="hero-cta">
            <Link href="/dashboard">
              Build your portfolio <ArrowUpRight data-icon="inline-end" weight="bold" />
            </Link>
          </Button>
          <div className="social-proof">
            <div className="avatar-stack">
              <Avatar className="size-7 border-2 border-background -mr-1.5">
                <AvatarFallback className="text-[9px] bg-[#d3b59e] text-[#594938]">
                  AK
                </AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-background -mr-1.5">
                <AvatarFallback className="text-[9px] bg-[#e4d0c1] text-[#594938]">
                  JR
                </AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-background -mr-1.5">
                <AvatarFallback className="text-[9px] bg-[#a7b6a1] text-[#3b4a3b]">
                  SN
                </AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-background">
                <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                  +8
                </AvatarFallback>
              </Avatar>
            </div>
            <span>
              Joined by <strong>500+ creatives</strong> this month
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-note note-top">
            A little space
            <br />
            to be you <span>✳</span>
          </div>
          <div className="portrait-card">
            <div className="portrait-sun" />
            <div className="portrait-shape shape-one" />
            <div className="portrait-shape shape-two" />
            <div className="portrait-caption">
              <span>01 / 03</span>
              <b>Selected stories</b>
            </div>
          </div>
          <div className="art-note note-bottom">
            <span className="scribble">↗</span>
            Made by you,
            <br />
            for the world.
          </div>
          <div className="art-stamp">
            GOOD
            <br />
            THINGS
            <br />
            AHEAD
          </div>
        </div>
      </section>

      {/* ─── Ticker ─── */}
      <Separator />
      <section className="ticker" id="ticker-section">
        <span>YOUR OWN CORNER OF THE INTERNET</span>
        <i>✳</i>
        <span>MADE TO FEEL LIKE YOU</span>
        <i>✳</i>
        <span>YOUR OWN CORNER OF THE INTERNET</span>
      </section>
      <Separator />

      {/* ─── Features ─── */}
      <section className="features-grid" id="features-section">
        <div className="features-header">
          <Badge variant="secondary" className="hero-eyebrow">
            <i /> A GOOD PLACE TO BEGIN
          </Badge>
          <h2>
            Less setup.
            <br />
            <em>More you.</em>
          </h2>
        </div>
        <div className="features-cards">
          {[
            {
              icon: '✦',
              title: 'Pick a template',
              desc: 'Start with a layout that fits your vibe — warm, editorial, or minimal.',
            },
            {
              icon: '◎',
              title: 'Add your sections',
              desc: 'Projects, experience, skills, testimonials — arrange the pieces that make you.',
            },
            {
              icon: '↗',
              title: 'Publish instantly',
              desc: 'Get a beautiful page at your own URL. Share it with the world in one click.',
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="feature-card"
              id={`feature-${feature.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <CardContent className="flex flex-col gap-3">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section" id="cta-section">
        <Card className="cta-card">
          <CardContent className="cta-card-content">
            <div>
              <h2>
                Ready to make
                <br />
                <em>something yours?</em>
              </h2>
              <p>It only takes a minute to get started. No credit card required.</p>
            </div>
            <Button asChild size="lg" className="cta-button">
              <Link href="/dashboard">
                Start building <ArrowDown data-icon="inline-end" weight="bold" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer" id="landing-footer">
        <Separator className="mb-6" />
        <div className="footer-inner">
          <Link className="wordmark text-sm" href="/">
            forme<span>.</span>
          </Link>
          <span>Thoughtfully crafted for creators</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
