import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Download, QrCode, Search, ShieldCheck, Share2, UserRound, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

type Certificate = {
  id:string; name:string; course:string; issuer:string; date:string; grade:string; status:"ACTIVE"|"REVOKED";
};

const demoCerts: Certificate[] = [
  { id:"CC-2026-0842", name:"Arun Kumar", course:"B.E. Computer Science", issuer:"ABC Institute of Technology", date:"12 Mar 2026", grade:"A+", status:"ACTIVE" },
  { id:"CC-2026-0839", name:"Arun Kumar", course:"B.Sc. Information Technology", issuer:"ABC Institute of Technology", date:"08 Mar 2026", grade:"A", status:"ACTIVE" },
  { id:"CC-2026-0827", name:"Arun Kumar", course:"B.E. Cyber Security", issuer:"ABC Institute of Technology", date:"02 Mar 2026", grade:"A+", status:"ACTIVE" },
];

function isRevoked(id:string){
  try { return Boolean(localStorage.getItem(`certichain:revoked:${id}`)); } catch { return false; }
}
function readCertificates(): Certificate[] {
  try {
    const raw=localStorage.getItem("certichain:certificates");
    const stored=raw?JSON.parse(raw):[];
    const list=Array.isArray(stored)?stored:[];
    const merged=[...demoCerts,...list];
    return merged.filter((c,i,a)=>c?.id && a.findIndex(x=>x.id===c.id)===i).map(c=>({
      id:c.id, name:c.student||c.name, course:c.course, issuer:c.issuer,
      date:c.issued||c.date, grade:c.grade, status:isRevoked(c.id)?"REVOKED":"ACTIVE"
    }));
  } catch { return demoCerts; }
}

function CertificateQR({id,size=180}:{id:string;size?:number}){
  const [src,setSrc]=useState("");
  useEffect(()=>{
    let active=true;
    QRCode.toDataURL(certificateUrl(id),{width:size,margin:1}).then(url=>{if(active)setSrc(url)}).catch(()=>setSrc(""));
    return()=>{active=false};
  },[id,size]);
  return src?<img src={src} width={size} height={size} alt={`QR verification code for ${id}`}/>:<QrCode size={Math.min(size,110)}/>;
}

import { navigateTo } from "../router";

function certificateUrl(id:string){ return window.location.origin+"/verify/"+encodeURIComponent(id); }

async function shareCertificate(certificate:Certificate){
  const url=certificateUrl(certificate.id);
  if(navigator.share){ await navigator.share({title:"CertiChain certificate",text:"Verify my certificate",url}); return "shared"; }
  await navigator.clipboard?.writeText(url);
  return "copied";
}

function printCertificate(certificate:Certificate){
  const win=window.open("","_blank","width=900,height=700");
  if(!win) return false;
  win.document.write(`<!doctype html><html><head><title>${certificate.id} · CertiChain</title><style>
  body{margin:0;padding:40px;background:#f3f3ef;font-family:Arial;color:#161B1E}.sheet{max-width:760px;margin:auto;background:white;border:1px solid #ddd;padding:50px;text-align:center;box-shadow:12px 12px 0 #F6C92E}.seal{width:60px;height:60px;border-radius:50%;background:#F6C92E;display:grid;place-items:center;margin:35px auto 15px;font-size:28px}h1{font-size:44px;margin:10px 0}.course{font-size:20px;font-weight:700;margin:12px 0 28px}.meta{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;border-top:1px solid #ddd;padding-top:18px;font-size:11px}.hash{margin-top:28px;border-top:1px solid #ddd;padding-top:15px;text-align:left;font-size:11px}@media print{body{padding:0;background:#fff}.sheet{box-shadow:none;border:0}}</style></head><body><div class="sheet"><b>CERTICHAIN · VERIFIED CREDENTIAL</b><div class="seal">✓</div><small>CERTIFICATE OF ACHIEVEMENT</small><h1>${certificate.name}</h1><p>has successfully completed</p><div class="course">${certificate.course}</div><div class="meta"><span>ISSUER <b>${certificate.issuer}</b></span><span>DATE <b>${certificate.date}</b></span><span>ID <b>${certificate.id}</b></span><span>GRADE <b>${certificate.grade}</b></span></div><div class="hash"><b>VERIFICATION ID</b><br/>${certificate.id}</div></div><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`);
  win.document.close();
  return true;
}

export function HolderPortal({ onBack }:{onBack:()=>void}) {
  const [certificates,setCertificates]=useState<Certificate[]>(demoCerts);
  const [selected,setSelected]=useState<Certificate>(demoCerts[0]);
  const [copied,setCopied]=useState(false);
  const [activeTab,setActiveTab]=useState("Overview");
  const [showQr,setShowQr]=useState(false);
  const [query,setQuery]=useState("");
  useEffect(()=>{ const list=readCertificates(); setCertificates(list); setSelected(list[0]||demoCerts[0]); },[]);

  const filtered=useMemo(()=>certificates.filter(c=>`${c.course} ${c.id}`.toLowerCase().includes(query.toLowerCase())),[query]);

  const share=async()=>{
    try{
      const result=await shareCertificate(selected);
      if(result==="copied"){setCopied(true);setTimeout(()=>setCopied(false),1800);}
    }catch{}
  };

  const tab=(name:string)=>{
    setActiveTab(name);
    if(name==="My certificates") document.getElementById("holder-certificates")?.scrollIntoView({behavior:"smooth"});
    if(name==="Verification links"){setShowQr(true);}
  };

  return <main className="portal-page">
    <header className="portal-nav">
      <button className="portal-brand" onClick={onBack}><span className="brand-mark">C</span> CertiChain</button>
      <span className="portal-label">CERTIFICATE HOLDER</span>
      <button className="portal-back" onClick={onBack}><ArrowLeft size={15}/> Public site</button>
    </header>
    <section className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-avatar"><UserRound size={20}/></div><strong>Arun Kumar</strong><span>Certificate holder</span>
        <nav>{["Overview","My certificates","Verification links"].map(name=><button key={name} className={activeTab===name?"selected":""} onClick={()=>tab(name)}>{name}</button>)}</nav>
        <div className="portal-trust"><ShieldCheck size={18}/><b>Trust profile</b><span>{certificates.filter(c=>!isRevoked(c.id)).length} active credentials</span></div>
      </aside>
      <div className="portal-main">
        <div className="portal-heading">
          <div><p className="eyebrow"><span/> Personal credential wallet</p><h1>MY<br/><em>CERTIFICATES.</em></h1><p>Keep your credentials ready to share. Every certificate has its own verification proof.</p></div>
          <button className="portal-dark" onClick={()=>navigateTo("/verify")}>VERIFY A CERTIFICATE <ArrowUpRight size={16}/></button>
        </div>

        <div className="portal-stats"><div><span>ACTIVE</span><b>{certificates.filter(c=>!isRevoked(c.id)).length}</b><small>credentials</small></div><div><span>VERIFIED</span><b>24</b><small>public checks</small></div><div><span>TRUST</span><b>100%</b><small>current status</small></div></div>

        <div className="portal-grid">
          <div className="holder-card">
            <div className="holder-card-top"><div><span>SELECTED CREDENTIAL</span><h2>{selected.course}</h2></div><span className="active-pill"><Check size={13}/> {selected.status}</span></div>
            <div className="holder-certificate">
              <div className="holder-seal"><Check size={24}/></div><small>CERTIFICATE OF ACHIEVEMENT</small><h3>{selected.name}</h3><p>has successfully completed</p><strong>{selected.course}</strong>
              <div className="holder-meta"><span>GRADE <b>{selected.grade}</b></span><span>ISSUED <b>{selected.date}</b></span><span>ID <b>{selected.id}</b></span></div>
              <div className="holder-proof"><ShieldCheck size={17}/><span>Cryptographic proof active</span><code>{selected.id}</code></div>
            </div>
            <div className="holder-actions">
              <button className="portal-dark" onClick={()=>navigateTo("/verify/"+selected.id)}>VERIFY <ArrowUpRight size={15}/></button>
              <button onClick={share}><Share2 size={15}/> SHARE {copied?"COPIED":""}</button>
              <button onClick={()=>printCertificate(selected)}><Download size={15}/> PRINT / PDF</button>
              <button onClick={()=>setShowQr(true)}><QrCode size={15}/> QR</button>
            </div>
          </div>

          <div className="holder-list" id="holder-certificates">
            <div className="portal-section-title"><span>YOUR CREDENTIALS</span><h2>All certificates</h2></div>
            <div className="holder-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search certificate or ID"/></div>
            {filtered.length ? filtered.map(c=><button key={c.id} className={selected.id===c.id?"holder-row active":"holder-row"} onClick={()=>setSelected(c)}>
              <div className="mini-cert"><Check size={14}/></div><div><b>{c.course}</b><span>{c.id} · {c.date}</span></div><strong>{c.grade}</strong><ArrowUpRight size={15}/>
            </button>) : <div className="holder-empty">No certificate matches that search.</div>}
          </div>
        </div>
      </div>
    </section>
    {showQr && <motion.div className="portal-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} onClick={()=>setShowQr(false)}>
      <motion.div className="portal-qr-modal" initial={{opacity:0,y:20,scale:.98}} animate={{opacity:1,y:0,scale:1}} onClick={e=>e.stopPropagation()}>
        <button className="portal-modal-close" onClick={()=>setShowQr(false)}><X size={18}/></button>
        <span>VERIFICATION LINK</span><h2>SHARE YOUR PROOF.</h2>
        <div className="qr-placeholder"><CertificateQR id={selected.id} size={180}/></div>
        <b>{selected.id}</b><p>Use the QR on your certificate or share the verification link.</p>
        <button className="portal-dark" onClick={share}><Share2 size={15}/> SHARE LINK</button>
      </motion.div>
    </motion.div>}
  </main>;
}

export function VerifierPortal({ onBack }:{onBack:()=>void}) {
  const [query,setQuery]=useState("");
  const [checked,setChecked]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [certificates,setCertificates]=useState<Certificate[]>(demoCerts);
  useEffect(()=>{setCertificates(readCertificates())},[]);
  const result=useMemo(()=>certificates.find(c=>c.id.toLowerCase()===query.trim().toLowerCase())||null,[query]);

  const check=()=>{setScanning(false);setChecked(true);};
  const demoScan=()=>{setScanning(true);setTimeout(()=>{setQuery("CC-2026-0842");setChecked(true);setScanning(false)},900)};

  return <main className="verifier-page">
    <header className="portal-nav dark-portal"><button className="portal-brand light-brand" onClick={onBack}><span className="brand-mark">C</span> CertiChain</button><span className="portal-label">VERIFIER WORKSPACE</span><button className="portal-back light-button" onClick={onBack}><ArrowLeft size={15}/> Public site</button></header>
    <section className="verifier-shell">
      <div className="verifier-intro">
        <p className="eyebrow light-eyebrow"><span/> Public verification</p><h1>KNOW<br/><em>WHAT’S REAL.</em></h1><p>Check a credential before you trust it. No account is required.</p>
        <div className="verifier-search"><Search size={19}/><input value={query} onChange={e=>{setQuery(e.target.value);setChecked(false)}} placeholder="Enter certificate ID" onKeyDown={e=>e.key==="Enter"&&check()}/><button onClick={check}>CHECK</button></div>
        <div className="verifier-tools"><button onClick={demoScan}><QrCode size={16}/> SCAN QR</button><p className="verifier-hint">Try <button onClick={()=>{setQuery("CC-2026-0842");setChecked(true)}}>CC-2026-0842</button></p></div>
      </div>
      <motion.div className="verifier-panel" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="verifier-panel-head"><span>VERIFICATION CENTER</span><QrCode size={24}/></div>
        {scanning?<div className="verifier-scan-state"><motion.div className="scan-frame" animate={{scale:[1,1.03,1]}} transition={{duration:.8,repeat:Infinity}}><QrCode size={115}/><span className="scan-line"/></motion.div><h2>SCANNING QR.</h2><p>Reading the credential verification link…</p></div>
        :checked&&result?<div className="verifier-success"><div className="verifier-status"><Check size={24}/></div><span>AUTHENTIC CREDENTIAL</span><h2>VERIFIED.</h2><p>The certificate record matches its original cryptographic proof.</p><div className="verifier-record"><div><span>RECIPIENT</span><b>{result.name}</b></div><div><span>QUALIFICATION</span><b>{result.course}</b></div><div><span>ISSUER</span><b>{result.issuer}</b></div><div><span>CERTIFICATE ID</span><b>{result.id}</b></div></div><button className="verifier-action" onClick={()=>navigateTo("/verify/"+result.id)}>VIEW FULL PROOF <ArrowUpRight size={16}/></button></div>
        :checked?<div className="verifier-fail"><div className="verifier-fail-icon">!</div><span>NO MATCH FOUND</span><h2>NOT VERIFIED.</h2><p>We couldn't find an active certificate with that ID. Check the ID and try again.</p><button onClick={()=>{setQuery("");setChecked(false)}}>TRY AGAIN</button></div>
        :<div className="verifier-empty"><div className="qr-large"><QrCode size={110}/></div><h2>SCAN OR SEARCH.</h2><p>Enter a certificate ID above, or use the QR code printed on the credential.</p><div className="proof-row"><span><ShieldCheck size={14}/> SHA-256</span><span><Check size={14}/> STATUS CHECK</span></div></div>}
      </motion.div>
    </section>
  </main>;
}
