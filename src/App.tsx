import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Menu, QrCode, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CertificateIllustration } from "./components/CertificateIllustration";

const steps = [
  ["01", "ISSUE", "An institution creates a digital certificate with a unique identity."],
  ["02", "FINGERPRINT", "CertiChain generates a SHA-256 fingerprint for the certificate."],
  ["03", "ANCHOR", "The fingerprint is anchored so the original proof cannot be quietly changed."],
  ["04", "VERIFY", "Anyone can scan or enter the ID and get an instant integrity result."],
];

const footerModes = {
  issue: { label: "ISSUE", title: "CREATE PROOF.", text: "Institutions create certificates with a unique identity and cryptographic fingerprint.", action: "Open issuer flow" },
  verify: { label: "VERIFY", title: "CHECK WHAT'S REAL.", text: "Enter a certificate ID or scan a QR code to compare the document with its anchored proof.", action: "Start verification" },
  revoke: { label: "REVOKE", title: "STOP TRUST WHEN NEEDED.", text: "If a credential should no longer be accepted, its verification state can be marked revoked.", action: "View revocation" },
};

type VerificationState = "idle" | "scanning" | "checking" | "valid" | "tampered" | "revoked";

const demoCertificate = {
  id: "CC-2026-0842",
  student: "Arun Kumar",
  course: "B.E. Computer Science",
  grade: "A+",
  issuer: "ABC Institute of Technology",
  issued: "12 March 2026",
  hash: "8f7a2d91...c31e",
};

function VerifyPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"id" | "qr">("id");
  const [certificateId, setCertificateId] = useState(demoCertificate.id);
  const [status, setStatus] = useState<VerificationState>("idle");
  const [demoTampered, setDemoTampered] = useState(false);

  const verify = () => {
    setStatus("scanning");
    window.setTimeout(() => setStatus("checking"), 700);
    window.setTimeout(() => setStatus(demoTampered ? "tampered" : "valid"), 1700);
  };

  const reset = () => {
    setStatus("idle");
    setDemoTampered(false);
    setCertificateId(demoCertificate.id);
  };

  const simulateTamper = () => {
    setDemoTampered(true);
    setStatus("checking");
    window.setTimeout(() => setStatus("tampered"), 900);
  };

  const simulateRevoke = () => {
    setDemoTampered(false);
    setStatus("checking");
    window.setTimeout(() => setStatus("revoked"), 900);
  };

  const busy = status === "scanning" || status === "checking";

  return (
    <main className="verify-page">
      <nav className="nav verify-nav">
        <button className="brand brand-button" onClick={onBack}><span className="brand-mark">C</span><span>CertiChain</span></button>
        <div className="verify-nav-right"><span>PUBLIC VERIFICATION</span><button onClick={onBack}>Back to home <ArrowUpRight size={15}/></button></div>
      </nav>

      <section className="verify-hero section-pad">
        <motion.div className="verify-intro" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:.65}}>
          <p className="eyebrow"><span/> Public verification</p>
          <h1>VERIFY<br/><em>WHAT’S REAL.</em></h1>
          <p>Enter a certificate ID or scan its QR code. We compare the document against its original cryptographic proof.</p>
          <div className="verify-proof-row">
            <span><ShieldCheck size={16}/> SHA-256 fingerprint</span>
            <span><ShieldCheck size={16}/> Blockchain anchored</span>
          </div>
        </motion.div>

        <motion.div className="verify-card-wrap" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.1}}>
          <div className="verify-card">
            <div className="verify-card-head"><div><span className="verify-card-label">CERTICHAIN / CHECK</span><h2>Certificate proof</h2></div><CertificateIllustration variant="verifier"/></div>
            <div className="verify-tabs">
              <button className={mode==="id"?"active":""} onClick={()=>{setMode("id");reset()}}>Certificate ID</button>
              <button className={mode==="qr"?"active":""} onClick={()=>{setMode("qr");reset()}}><QrCode size={16}/> Scan QR</button>
            </div>

            {mode === "id" ? (
              <div className="verify-input-area">
                <label>Certificate ID</label>
                <div className="verify-input">
                  <input value={certificateId} onChange={(e)=>setCertificateId(e.target.value.toUpperCase())} placeholder="CC-2026-0842" disabled={busy}/>
                  <span>●</span>
                </div>
                <p>Try the demo ID <button onClick={()=>setCertificateId(demoCertificate.id)}>{demoCertificate.id}</button></p>
                <button className="verify-main-button" onClick={verify} disabled={busy || !certificateId.trim()}>
                  {busy ? "VERIFYING..." : "VERIFY CERTIFICATE"} {!busy && <ArrowUpRight size={18}/>}
                </button>
              </div>
            ) : (
              <div className="qr-scanner">
                <div className={`qr-frame ${busy ? "active" : ""}`}>
                  <span className="corner tl"/><span className="corner tr"/><span className="corner bl"/><span className="corner br"/>
                  <QrCode size={90}/>
                  {busy && <motion.div className="scan-line" animate={{y:[-45,45,-45]}} transition={{duration:1.3,repeat:Infinity,ease:"easeInOut"}}/>}
                </div>
                <strong>{busy ? "Reading QR proof..." : "Align a certificate QR code"}</strong>
                <p>This demo scanner loads the sample certificate when you start verification.</p>
                <button className="verify-main-button" onClick={verify} disabled={busy}>{busy ? "SCANNING..." : "SCAN & VERIFY"} <QrCode size={17}/></button>
              </div>
            )}

            <AnimateVerifyStatus status={status} demoTampered={demoTampered} />
          </div>
        </motion.div>
      </section>

      {status === "valid" && (
        <motion.section className="verification-result valid-result" initial={{opacity:0,y:35}} animate={{opacity:1,y:0}}>
          <div className="result-topline"><span>01 / VERIFIED</span><span className="status-pill valid"><Check size={15}/> ACTIVE</span></div>
          <div className="result-grid">
            <div>
              <div className="big-status"><span className="status-icon"><Check size={34}/></span><div><p>VERIFICATION COMPLETE</p><h2>CERTIFICATE<br/><em>VERIFIED.</em></h2></div></div>
              <p className="result-copy">The submitted certificate matches the original cryptographic fingerprint anchored by the issuer.</p>
              <div className="result-actions"><button onClick={()=>alert("Certificate preview ready for the next backend connection.")}>VIEW CERTIFICATE <ArrowUpRight size={17}/></button><button onClick={()=>alert("Verification link copied.")}>SHARE <ArrowUpRight size={17}/></button></div>
            </div>
            <CertificateProofCard certificate={demoCertificate} />
          </div>
          <div className="demo-controls"><span>DEMO CONTROLS</span><button onClick={simulateTamper}>SIMULATE TAMPERING <ArrowUpRight size={16}/></button><button onClick={simulateRevoke}>SIMULATE REVOCATION <ArrowUpRight size={16}/></button><button onClick={reset}>VERIFY ANOTHER</button></div>
        </motion.section>
      )}

      {status === "tampered" && (
        <motion.section className="verification-result tampered-result" initial={{opacity:0,y:35}} animate={{opacity:1,y:0}}>
          <div className="result-topline"><span>02 / INTEGRITY FAILURE</span><span className="status-pill bad"><X size={15}/> MISMATCH</span></div>
          <div className="result-grid">
            <div>
              <div className="big-status"><span className="status-icon bad-icon"><X size={34}/></span><div><p>INTEGRITY CHECK FAILED</p><h2>TAMPER<br/><em>DETECTED.</em></h2></div></div>
              <p className="result-copy">The current document no longer matches the fingerprint originally anchored for this certificate.</p>
              <div className="hash-compare"><div><span>ORIGINAL FINGERPRINT</span><code>{demoCertificate.hash}</code></div><div><span>CURRENT FINGERPRINT</span><code className="bad-code">4b12a7c4...91aa</code></div></div>
            </div>
            <div className="tamper-visual"><CertificateIllustration variant="tamper"/><div className="tamper-stamp"><X size={18}/> HASH MISMATCH</div></div>
          </div>
          <div className="demo-controls"><span>DEMO CONTROLS</span><button onClick={reset}>RESTORE ORIGINAL</button><button onClick={simulateRevoke}>SIMULATE REVOCATION <ArrowUpRight size={16}/></button></div>
        </motion.section>
      )}

      {status === "revoked" && (
        <motion.section className="verification-result revoked-result" initial={{opacity:0,y:35}} animate={{opacity:1,y:0}}>
          <div className="result-topline"><span>03 / STATUS CHANGE</span><span className="status-pill revoked"><X size={15}/> REVOKED</span></div>
          <div className="result-grid">
            <div>
              <div className="big-status"><span className="status-icon revoked-icon"><X size={34}/></span><div><p>PROOF MATCHED / STATUS FAILED</p><h2>CERTIFICATE<br/><em>REVOKED.</em></h2></div></div>
              <p className="result-copy">The certificate is authentic, but the issuing institution has withdrawn its validity.</p>
              <div className="revocation-box"><strong>Revoked on 18 September 2026</strong><span>Reason: Certificate withdrawn by issuing institution.</span></div>
            </div>
            <CertificateProofCard certificate={demoCertificate} revoked/>
          </div>
          <div className="demo-controls"><span>DEMO CONTROLS</span><button onClick={reset}>VERIFY ANOTHER</button></div>
        </motion.section>
      )}

      <section className="verify-how section-pad">
        <div className="section-kicker">HOW THE CHECK WORKS / 02</div>
        <div className="verify-how-grid">
          {[
            ["01","READ","Certificate ID or QR identifies the credential."],
            ["02","FINGERPRINT","The current document is represented as a SHA-256 hash."],
            ["03","COMPARE","The fingerprint is compared with the anchored original."],
            ["04","RESULT","CertiChain returns valid, tampered or revoked."],
          ].map(([n,t,d],i)=><motion.article key={n} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}><span>{n}</span><h3>{t}</h3><p>{d}</p></motion.article>)}
        </div>
      </section>

      <footer className="verify-footer"><button onClick={onBack}>← CERTICHAIN</button><span>VERIFY ONCE. TRUST INSTANTLY.</span><span>SHA-256 · BLOCKCHAIN · QR</span></footer>
    </main>
  );
}

function AnimateVerifyStatus({status,demoTampered}:{status:VerificationState;demoTampered:boolean}) {
  if(status==="idle"||status==="valid"||status==="tampered"||status==="revoked") return null;
  const steps=status==="scanning"
    ? ["READING CERTIFICATE","IDENTIFYING CREDENTIAL","PREPARING PROOF"]
    : ["GENERATING SHA-256 FINGERPRINT","CHECKING ANCHORED PROOF","COMPARING INTEGRITY"];
  return <motion.div className="verify-progress" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}><div className="progress-orbit"><motion.span animate={{rotate:360}} transition={{duration:1.8,repeat:Infinity,ease:"linear"}}><ShieldCheck size={25}/></motion.span></div><div><p>{steps[0]}</p><motion.div className="progress-bar" animate={{scaleX:[.2,1,.35]}} transition={{duration:1.2,repeat:Infinity}}/><small>{demoTampered ? "Preparing integrity comparison..." : steps[1]}</small></div></motion.div>;
}

function CertificateProofCard({certificate,revoked=false}:{certificate:typeof demoCertificate;revoked?:boolean}) {
  return <div className="proof-card"><div className="proof-card-title"><span>CERTIFICATE RECORD</span><QrCode size={28}/></div><h3>{certificate.student}</h3><p>{certificate.course}</p><div className="proof-details"><div><span>GRADE</span><b>{certificate.grade}</b></div><div><span>ISSUER</span><b>{certificate.issuer}</b></div><div><span>ISSUED</span><b>{certificate.issued}</b></div><div><span>ID</span><b>{certificate.id}</b></div></div><div className="proof-checks"><span><Check size={14}/> FINGERPRINT MATCHED</span><span><Check size={14}/> BLOCKCHAIN VERIFIED</span><span className={revoked?"revoked-check":""}>{revoked?<X size={14}/>:<Check size={14}/>} {revoked?"STATUS REVOKED":"STATUS ACTIVE"}</span></div></div>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (route === "/verify") return <VerifyPage onBack={() => { window.history.pushState({}, "", "/"); setRoute("/"); }} />;

  const [tampered, setTampered] = useState(false);
  const [footerMode, setFooterMode] = useState<keyof typeof footerModes>("verify");
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -80]);
  const footer = footerModes[footerMode];

  return (
    <main className="site-shell">
      <nav className="nav">
        <a href="#" className="brand"><span className="brand-mark">C</span><span>CertiChain</span></a>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#how">How it works</a><a href="#tamper">Tamper check</a><a href="#for">Built for</a>
          <button className="nav-verify nav-route-button" onClick={() => { window.history.pushState({}, "", "/verify"); setRoute("/verify"); }}>Verify certificate <ArrowUpRight size={17}/></button>
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      </nav>

      <section className="hero section-pad">
        <motion.div className="hero-copy" style={{ y: heroY }}>
          <p className="eyebrow"><span/> Digital certificate verification</p>
          <h1>VERIFY<br/><em>WHAT’S REAL.</em></h1>
          <p className="hero-lede">Certificates should prove achievement — not create doubt. CertiChain makes authenticity visible in seconds.</p>
          <div className="hero-actions"><button className="button button-dark route-button" onClick={() => { window.history.pushState({}, "", "/verify"); setRoute("/verify"); }}>VERIFY CERTIFICATE <ArrowUpRight size={18}/></button><a className="button button-light" href="#issue">ISSUE CERTIFICATE</a></div>
          <div className="hero-proof"><ShieldCheck size={19}/><span>Cryptographic fingerprint + blockchain anchor</span></div>
        </motion.div>
        <motion.div className="hero-art" initial={{opacity:0,scale:.94,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:.8,ease:"easeOut"}}><CertificateIllustration variant="hero"/></motion.div>
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
          <article><span>02</span><h3>Students</h3><p>Carry one certificate proof that can be shared without asking someone to manually confirm it.</p><button className="inline-link route-button" onClick={() => { window.history.pushState({}, "", "/verify"); setRoute("/verify"); }}>My certificate <ArrowUpRight size={17}/></button></article>
          <article><span>03</span><h3>Verifiers</h3><p>Scan a QR or enter an ID and know whether the document is original, tampered or revoked.</p><button className="inline-link route-button" onClick={() => { window.history.pushState({}, "", "/verify"); setRoute("/verify"); }}>Verify now <ArrowUpRight size={17}/></button></article>
        </div>
      </section>

      <section className="cta section-pad" id="verify"><div className="cta-art"><CertificateIllustration variant="verifier"/></div><div><div className="section-kicker">FINAL CHECK / 06</div><h2>TRUST IT.<br/><span>OR DON’T.</span></h2><p>Enter a certificate ID or scan its QR code. CertiChain checks the document against its original cryptographic proof.</p><button className="button button-dark route-button" onClick={() => { window.history.pushState({}, "", "/verify"); setRoute("/verify"); }}>START VERIFICATION <ArrowUpRight size={18}/></button></div></section>

      <footer className="footer-cta section-pad" id="issue">
        <div className="footer-top"><span>CertiChain</span><span>Verify once. Trust instantly.</span></div>
        <div className="footer-interactive">
          <div className="footer-big">MAKE<br/><em>TRUST</em><br/>VERIFIABLE.</div>
          <div className="footer-panel">
            <div className="footer-tabs" role="tablist">
              {(Object.keys(footerModes) as Array<keyof typeof footerModes>).map((mode) => <button key={mode} className={footerMode===mode ? "active" : ""} onClick={()=>setFooterMode(mode)}>{footerModes[mode].label}</button>)}
            </div>
            <motion.div key={footerMode} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.25}}>
              <p className="footer-panel-kicker">CERTICHAIN / {footer.label}</p>
              <h3>{footer.title}</h3><p>{footer.text}</p>
              <a href={footerMode==="issue" ? "#issue" : "#verify"} className="footer-action">{footer.action} <ArrowUpRight size={17}/></a>
            </motion.div>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 CertiChain</span><span>Issue · Verify · Revoke</span><span>Built for digital credentials</span></div>
      </footer>
    </main>
  );
}
