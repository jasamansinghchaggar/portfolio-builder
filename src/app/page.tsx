import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="landing">
      <nav className="topbar"><Link className="wordmark" href="/">forme<span>.</span></Link><div className="nav-links"><Link href="/dashboard">Explore</Link><Link href="/dashboard">Templates</Link><Link href="/dashboard">For teams</Link></div><div className="nav-actions"><Link href="/dashboard">Log in</Link><Link className="nav-cta" href="/dashboard">Start building <ArrowUpRight size={15}/></Link></div></nav>
      <section className="hero-wrap">
        <div className="hero-copy"><span className="eyebrow"><i/> YOUR WORK, IN ITS BEST LIGHT</span><h1>Make room<br/>for <em>what you do.</em></h1><p>A thoughtful home for your work, ideas, and next chapter. Make it yours in minutes.</p><Link className="button button-dark" href="/dashboard">Build your portfolio <MoveUpRight size={16}/></Link><div className="social-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><span>Made for people with <strong>something to show.</strong></span></div></div>
        <div className="hero-art"><div className="art-note note-top">A little space<br/>to be you <span>✳</span></div><div className="portrait-card"><div className="portrait-sun"/><div className="portrait-shape shape-one"/><div className="portrait-shape shape-two"/><div className="portrait-caption"><span>01 / 03</span><b>Selected stories</b></div></div><div className="art-note note-bottom"><span className="scribble">↗</span>Made by you,<br/>for the world.</div><div className="art-stamp">GOOD<br/>THINGS<br/>AHEAD</div></div>
      </section>
      <section className="ticker"><span>YOUR OWN CORNER OF THE INTERNET</span><i>✳</i><span>MADE TO FEEL LIKE YOU</span><i>✳</i><span>YOUR OWN CORNER OF THE INTERNET</span></section>
      <section className="below-fold"><div><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h2>Less setup.<br/><em>More you.</em></h2></div><p>Choose a starting point, bring in the work that matters, and shape a page that feels unmistakably yours.</p><Link href="/dashboard" className="text-link">See how it works <ArrowUpRight size={15}/></Link></section>
    </main>
  );
}
