import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Menu, QrCode, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { CertificateIllustration } from "./components/CertificateIllustration";

const steps = [
  ["01", "ISSUE", "An institution creates a digital certificate with a unique identity."],
  ["02", "FINGERPRINT", "CertiChain generates a SHA-256 fingerprint for the certificate."],
  ["03", "ANCHOR", "The fingerprint is anchored so the original proof cannot be quietly changed."],
  ["04", "VERIFY", "Anyone can scan or enter the ID and get an instant integrity result."],
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tampered, setTampered] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -80]);

  return (
    <main className="site-shell">
      <nav className="nav">
        <a href="#" className="brand"><span className="brand-mark">C</span><span>CertiChain</span></a>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#how">How it works</a><a href="#tamper">Tamper check</a><a href="#for">Built for</a>
          <a className="nav-verify" href="#verify">Verify certificate <ArrowUpRight size={17}/></a>
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      </nav>

      <section className="hero section-pad">
        <motion.div className="hero-copy" style={{ y: heroY }}>
          <p className="eyebrow"><span/> Digital certificate verification</p>
          <h1>VERIFY<br/><em>WHAT’S REAL.</em></h1>
          <p className="hero-lede">Certificates should prove achievement — not create doubt. CertiChain makes authenticity visible in seconds.</p>
          <div className="hero-actions"><a className="button button-dark" href="#verify">VERIFY CERTIFICATE <ArrowUpRight size={18}/></a><a className="button button-light" href="#issue">ISSUE CERTIFICATE</a></div>
          <div className="hero-proof"><ShieldCheck size={19}/><span>Cryptographic fingerprint + blockchain anchor</span></div>
        </motion.div>
        <div className="hero-art"><CertificateIllustration variant="hero"/></div>
        <div className="hero-number">01 / 08</div>
      </section>

      <section className="yellow-band"><div className="marquee"><span>ISSUE</span><b>→</b><span>HASH</span><b>→</b><span>ANCHOR</span><b>→</b><span>VERIFY</span><b>→</b><span>TRUST</span></div></section>

      <section className="problem section-pad">
        <div className="section-kicker">THE PROBLEM / 02</div>
        <div className="split"><div><h2>A certificate can be copied.<br/><span>Its proof shouldn’t.</span></h2><p>PDFs can be edited. Screenshots can be reused. Manual checks slow down institutions and recruiters. CertiChain gives every certificate a verifiable digital fingerprint.</p></div><CertificateIllustration variant="problem"/></div>
      </section>

      <section className="dark-section section-pad" id="how">
        <div className="section-kicker light">THE FLOW / 03</div>
        <div className="dark-heading"><h2>FROM DOCUMENT<br/><span>TO TRUST.</span></h2><p>One clean lifecycle. No complicated verification journey.</p></div>
        <div className="step-grid">{steps.map(([n,title,text],i)=><motion.article className="step-card" key={n} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}><span>{n}</span><h3>{title}</h3><p>{text}</p></motion.article>)}</div>
      </section>

      <section className="tamper section-pad" id="tamper">
        <div className="section-kicker">THE WOW MOMENT / 04</div>
        <div className="tamper-head"><div><h2>CHANGE ONE<br/><span>DETAIL.</span></h2><p>Watch the fingerprint mismatch turn a trusted certificate into a detected alteration.</p></div><button className="toggle" onClick={()=>setTampered(!tampered)}>{tampered ? "Restore original" : "Modify certificate"} <ArrowUpRight size={17}/></button></div>
        <div className="tamper-demo">
          <div className="certificate-mini"><div className="mini-top"><span>CERTICHAIN</span><QrCode size={38}/></div><strong>Certificate of Achievement</strong><p>Student: <b>Arun Kumar</b></p><p>Program: <b>Computer Science</b></p><p>Grade: <b className={tampered?"changed":""}>{tampered?"A++":"A+"}</b></p><div className="mini-line"/><small>ID: CC-2026-0842</small></div>
          <div className="hash-panel"><div><span>ORIGINAL FINGERPRINT</span><code>8f7a...c31e</code></div><div><span>CURRENT FINGERPRINT</span><code className={tampered?"bad":""}>{tampered?"4b12...91aa":"8f7a...c31e"}</code></div><div className={`result ${tampered?"bad":"good"}`}>{tampered?<X size={21}/>:<Check size={21}/>}<div><b>{tampered?"TAMPER DETECTED":"CERTIFICATE VERIFIED"}</b><small>{tampered?"The current document no longer matches its anchored proof.":"Document matches the anchored fingerprint."}</small></div></div></div>
          <CertificateIllustration variant="tamper"/>
        </div>
      </section>

      <section className="audience section-pad" id="for">
        <div className="section-kicker">WHO IT SERVES / 05</div>
        <div className="audience-grid">
          <article><span>01</span><h3>Institutions</h3><p>Issue trusted certificates, keep a clean verification trail and revoke when necessary.</p><a href="#issue">Issuer portal <ArrowUpRight size={17}/></a></article>
          <article><span>02</span><h3>Students</h3><p>Carry one certificate proof that can be shared without asking someone to manually confirm it.</p><a href="#verify">My certificate <ArrowUpRight size={17}/></a></article>
          <article><span>03</span><h3>Verifiers</h3><p>Scan a QR or enter an ID and know whether the document is original, tampered or revoked.</p><a href="#verify">Verify now <ArrowUpRight size={17}/></a></article>
        </div>
      </section>

      <section className="cta section-pad" id="verify"><div className="cta-art"><CertificateIllustration variant="verifier"/></div><div><div className="section-kicker">FINAL CHECK / 06</div><h2>TRUST IT.<br/><span>OR DON’T.</span></h2><p>Enter a certificate ID or scan its QR code. CertiChain checks the document against its original cryptographic proof.</p><a className="button button-dark" href="#verify-form">START VERIFICATION <ArrowUpRight size={18}/></a></div></section>

      <section className="footer-cta section-pad" id="issue"><div className="footer-top"><span>CertiChain</span><span>Verify once. Trust instantly.</span></div><div className="footer-big">MAKE<br/><em>TRUST</em><br/>VERIFIABLE.</div><div className="footer-bottom"><span>© 2026 CertiChain</span><span>Issue · Verify · Revoke</span><span>Built for digital credentials</span></div></section>
    </main>
  );
}
