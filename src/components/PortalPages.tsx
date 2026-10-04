import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Download, QrCode, Search, ShieldCheck, Share2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

const certs = [
  { id:"CC-2026-0842", name:"Arun Kumar", course:"B.E. Computer Science", issuer:"ABC Institute of Technology", date:"12 Mar 2026", grade:"A+", status:"ACTIVE" },
  { id:"CC-2026-0839", name:"Meera Priya", course:"B.Sc. Information Technology", issuer:"ABC Institute of Technology", date:"08 Mar 2026", grade:"A", status:"ACTIVE" },
  { id:"CC-2026-0827", name:"Rahul Dev", course:"B.E. Cyber Security", issuer:"ABC Institute of Technology", date:"02 Mar 2026", grade:"A+", status:"ACTIVE" },
];

function go(path:string){ window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }

export function HolderPortal({ onBack }:{onBack:()=>void}) {
  const [selected,setSelected]=useState(certs[0]);
  const [copied,setCopied]=useState(false);
  const share=async()=>{const url=location.origin+"/verify/"+selected.id; try{if(navigator.share) await navigator.share({title:"CertiChain certificate",text:"Verify my certificate",url}); else {await navigator.clipboard?.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800)}}catch{}};
  return <main className="portal-page">
    <header className="portal-nav"><button className="portal-brand" onClick={onBack}><span className="brand-mark">C</span> CertiChain</button><span className="portal-label">CERTIFICATE HOLDER</span><button className="portal-back" onClick={onBack}><ArrowLeft size={15}/> Public site</button></header>
    <section className="portal-shell">
      <aside className="portal-sidebar"><div className="portal-avatar"><UserRound size={20}/></div><strong>Arun Kumar</strong><span>Certificate holder</span><nav><button className="selected">Overview</button><button>My certificates</button><button>Verification links</button></nav><div className="portal-trust"><ShieldCheck size={18}/><b>Trust profile</b><span>3 active credentials</span></div></aside>
      <div className="portal-main">
        <div className="portal-heading"><div><p className="eyebrow"><span/> Personal credential wallet</p><h1>MY<br/><em>CERTIFICATES.</em></h1><p>Keep your credentials ready to share. Every certificate has its own verification proof.</p></div><button className="portal-dark" onClick={()=>go("/verify")}>VERIFY A CERTIFICATE <ArrowUpRight size={16}/></button></div>
        <div className="portal-stats"><div><span>ACTIVE</span><b>3</b><small>credentials</small></div><div><span>VERIFIED</span><b>24</b><small>public checks</small></div><div><span>TRUST</span><b>100%</b><small>current status</small></div></div>
        <div className="portal-grid">
          <div className="holder-card"><div className="holder-card-top"><div><span>SELECTED CREDENTIAL</span><h2>{selected.course}</h2></div><span className="active-pill"><Check size={13}/> ACTIVE</span></div>
            <div className="holder-certificate"><div className="holder-seal"><Check size={24}/></div><small>CERTIFICATE OF ACHIEVEMENT</small><h3>{selected.name}</h3><p>has successfully completed</p><strong>{selected.course}</strong><div className="holder-meta"><span>GRADE <b>{selected.grade}</b></span><span>ISSUED <b>{selected.date}</b></span><span>ID <b>{selected.id}</b></span></div><div className="holder-proof"><ShieldCheck size={17}/><span>Cryptographic proof active</span><code>{selected.id}</code></div></div>
            <div className="holder-actions"><button className="portal-dark" onClick={()=>go("/verify/"+selected.id)}>VERIFY <ArrowUpRight size={15}/></button><button onClick={share}><Share2 size={15}/> SHARE {copied?"COPIED":""}</button><button onClick={()=>window.print()}><Download size={15}/> PRINT</button></div>
          </div>
          <div className="holder-list"><div className="portal-section-title"><span>YOUR CREDENTIALS</span><h2>All certificates</h2></div>{certs.map(c=><button key={c.id} className={selected.id===c.id?"holder-row active":"holder-row"} onClick={()=>setSelected(c)}><div className="mini-cert"><Check size={14}/></div><div><b>{c.course}</b><span>{c.id} · {c.date}</span></div><strong>{c.grade}</strong><ArrowUpRight size={15}/></button>)}</div>
        </div>
      </div>
    </section>
  </main>;
}

export function VerifierPortal({ onBack }:{onBack:()=>void}) {
  const [query,setQuery]=useState("");
  const [checked,setChecked]=useState(false);
  const result=useMemo(()=>certs.find(c=>c.id.toLowerCase()===query.trim().toLowerCase())||null,[query]);
  return <main className="verifier-page">
    <header className="portal-nav dark-portal"><button className="portal-brand light-brand" onClick={onBack}><span className="brand-mark">C</span> CertiChain</button><span className="portal-label">VERIFIER WORKSPACE</span><button className="portal-back light-button" onClick={onBack}><ArrowLeft size={15}/> Public site</button></header>
    <section className="verifier-shell">
      <div className="verifier-intro"><p className="eyebrow light-eyebrow"><span/> Public verification</p><h1>KNOW<br/><em>WHAT’S REAL.</em></h1><p>Check a credential before you trust it. No account is required.</p><div className="verifier-search"><Search size={19}/><input value={query} onChange={e=>{setQuery(e.target.value);setChecked(false)}} placeholder="Enter certificate ID" onKeyDown={e=>e.key==="Enter"&&setChecked(true)}/><button onClick={()=>setChecked(true)}>CHECK</button></div><p className="verifier-hint">Try <button onClick={()=>{setQuery("CC-2026-0842");setChecked(true)}}>CC-2026-0842</button></p></div>
      <motion.div className="verifier-panel" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><div className="verifier-panel-head"><span>VERIFICATION CENTER</span><QrCode size={24}/></div>{checked&&result?<div className="verifier-success"><div className="verifier-status"><Check size={24}/></div><span>AUTHENTIC CREDENTIAL</span><h2>VERIFIED.</h2><p>The certificate record matches its original cryptographic proof.</p><div className="verifier-record"><div><span>RECIPIENT</span><b>{result.name}</b></div><div><span>QUALIFICATION</span><b>{result.course}</b></div><div><span>ISSUER</span><b>{result.issuer}</b></div><div><span>CERTIFICATE ID</span><b>{result.id}</b></div></div><button className="verifier-action" onClick={()=>go("/verify/"+result.id)}>VIEW FULL PROOF <ArrowUpRight size={16}/></button></div>:checked?<div className="verifier-fail"><div className="verifier-fail-icon">!</div><span>NO MATCH FOUND</span><h2>NOT VERIFIED.</h2><p>We couldn't find an active certificate with that ID. Check the ID and try again.</p><button onClick={()=>{setQuery("");setChecked(false)}}>TRY AGAIN</button></div>:<div className="verifier-empty"><div className="qr-large"><QrCode size={110}/></div><h2>SCAN OR SEARCH.</h2><p>Enter a certificate ID above, or use the QR code printed on the credential.</p><div className="proof-row"><span><ShieldCheck size={14}/> SHA-256</span><span><Check size={14}/> STATUS CHECK</span></div></div>}</motion.div>
    </section>
  </main>;
}
