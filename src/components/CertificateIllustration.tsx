import { motion } from "framer-motion";

type Variant = "hero" | "problem" | "tamper" | "verifier";

export function CertificateIllustration({ variant = "hero" }: { variant?: Variant }) {
  const tamper = variant === "tamper";
  const verifier = variant === "verifier";
  const ink = "#161B1E";
  const yellow = "#F6C92E";
  const paper = "#FEFEFE";
  const peach = "#F2A98F";
  const slate = "#536064";
  const coral = "#E77B68";

  return (
    <motion.svg viewBox="0 0 620 470" className="certificate-art" role="img" aria-label="CertiChain certificate illustration"
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}
      transition={{ duration: .8, ease: [0.25, .1, .25, 1] }}>
      <ellipse cx="310" cy="420" rx="220" ry="18" fill={ink} opacity=".08"/>
      <path d="M74 104c18-37 59-58 101-58h281c49 0 90 40 90 89v185c0 49-40 89-90 89H154c-49 0-90-40-90-89V132c0-10 3-19 10-28Z" fill={yellow} opacity=".22"/>
      <rect x="136" y="87" width="328" height="250" rx="16" fill={paper} stroke={ink} strokeWidth="6"/>
      <path d="M164 120h272M164 294h272" stroke={ink} strokeWidth="4" opacity=".18"/>
      <rect x="166" y="148" width="142" height="12" rx="6" fill={ink}/>
      <rect x="166" y="177" width="210" height="9" rx="4.5" fill={ink} opacity=".22"/>
      <rect x="166" y="199" width="170" height="9" rx="4.5" fill={ink} opacity=".16"/>
      <rect x="166" y="237" width="92" height="12" rx="6" fill={tamper ? coral : yellow}/>
      <rect x="270" y="237" width="112" height="12" rx="6" fill={ink} opacity=".12"/>
      <circle cx="408" cy="191" r="33" fill={tamper ? coral : yellow} stroke={ink} strokeWidth="5"/>
      {tamper ? <path d="m394 177 28 28M422 177l-28 28" stroke={ink} strokeWidth="7" strokeLinecap="round"/> : <path d="m392 191 11 11 20-25" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>}
      <circle cx="93" cy="287" r="29" fill={peach} stroke={ink} strokeWidth="5"/>
      <path d="M70 279c4-28 40-31 48-3-12-8-25-9-48 3Z" fill={ink}/>
      <path d="M54 365c4-53 26-72 39-72 15 0 37 19 42 72" fill={slate} stroke={ink} strokeWidth="5"/>
      <path d="M78 309l15 19 16-19" fill={yellow} stroke={ink} strokeWidth="4"/>
      <rect x="386" y="330" width="172" height="62" rx="18" fill={tamper ? coral : yellow} stroke={ink} strokeWidth="5"/>
      <text x="472" y="369" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="800" fill={ink}>{tamper ? "TAMPERED" : verifier ? "SCAN & TRUST" : "VERIFIED"}</text>
      {verifier && <g><rect x="490" y="80" width="74" height="112" rx="15" fill={ink}/><rect x="500" y="94" width="54" height="78" rx="8" fill={paper}/><path d="M513 110h28M513 122h18M513 142h29M513 154h21" stroke={ink} strokeWidth="5" strokeLinecap="round"/></g>}
      <motion.circle cx="518" cy="88" r="9" fill={ink} animate={{ y: [0,-7,0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}/>
    </motion.svg>
  );
}
