import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:5173";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

app.use(cors());
app.use(express.json());

const canonicalHash = (certificate) => crypto
  .createHash("sha256")
  .update(JSON.stringify({
    id: certificate.id,
    student: certificate.student,
    course: certificate.course,
    grade: certificate.grade,
    issuer: certificate.issuer,
    issued: certificate.issued,
  }))
  .digest("hex");

const toApiCertificate = (row) => ({
  id: row.certificate_code,
  databaseId: row.id,
  student: row.student_name,
  course: row.course,
  grade: row.grade,
  issuer: row.issuer_name,
  issued: row.issued_at,
  type: row.certificate_type,
  status: row.status,
  revokedAt: row.revoked_at,
  revocationReason: row.revocation_reason,
  hash: row.sha256_hash,
  blockchainVerified: row.blockchain_anchored,
  blockchainTransaction: row.blockchain_tx_hash,
});

const getCertificate = async (code) => {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_code", code)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const recordHistory = async (certificateId, eventType, message, currentHash = null) => {
  const { error } = await supabase.from("certificate_history").insert({
    certificate_id: certificateId,
    event_type: eventType,
    event_message: message,
    current_hash: currentHash,
  });
  if (error) console.error("History insert failed:", error.message);
};

app.get("/api/health", async (_req, res) => {
  const { error } = await supabase.from("certificates").select("id", { head: true, count: "exact" });
  res.json({ ok: !error, service: "CertiChain API", database: error ? "error" : "connected" });
});

app.get("/api/dashboard/stats", async (_req, res) => {
  try {
    const { count: totalIssued, error } = await supabase
      .from("certificates")
      .select("id", { head: true, count: "exact" });
    if (error) throw error;

    const { count: revoked } = await supabase
      .from("certificates")
      .select("id", { head: true, count: "exact" })
      .eq("status", "REVOKED");

    res.json({
      totalIssued: totalIssued || 0,
      active: (totalIssued || 0) - (revoked || 0),
      revoked: revoked || 0,
      verifications: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to load dashboard statistics", details: error.message });
  }
});

app.get("/api/certificates", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data.map(toApiCertificate));
  } catch (error) {
    res.status(500).json({ error: "Unable to load certificates", details: error.message });
  }
});

app.get("/api/certificates/:id", async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });
    res.json(toApiCertificate(certificate));
  } catch (error) {
    res.status(500).json({ error: "Unable to load certificate", details: error.message });
  }
});

app.post("/api/certificates", async (req, res) => {
  try {
    const {
      student,
      course,
      grade = "A+",
      issuer = "ABC Institute of Technology",
      issued,
      type = "Certificate of Achievement",
    } = req.body || {};

    if (!student || !course || !issued) {
      return res.status(400).json({ error: "student, course and issued are required" });
    }

    const certificateCode = `CC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const draft = {
      id: certificateCode,
      student,
      course,
      grade,
      issuer,
      issued,
    };
    const hash = canonicalHash(draft);
    const transaction = `demo-${crypto.randomBytes(8).toString("hex")}`;

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        certificate_code: certificateCode,
        student_name: student,
        course,
        grade,
        issuer_name: issuer,
        issued_at: issued,
        certificate_type: type,
        sha256_hash: hash,
        status: "VALID",
        blockchain_tx_hash: transaction,
        blockchain_anchored: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    await recordHistory(data.id, "ISSUED", "Certificate issued and fingerprint anchored.", hash);

    res.status(201).json({
      certificate: toApiCertificate(data),
      blockchain: { anchored: true, transaction },
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to create certificate", details: error.message });
  }
});

app.get("/api/verify/:id", async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        status: "NOT_FOUND",
        integrity: "UNKNOWN",
        blockchainVerified: false,
        message: "Certificate not found",
      });
    }

    const apiCertificate = toApiCertificate(certificate);
    const currentHash = canonicalHash(apiCertificate);
    const integrity = currentHash === certificate.sha256_hash ? "ORIGINAL" : "TAMPERED";
    const status = certificate.status === "REVOKED"
      ? "REVOKED"
      : integrity === "TAMPERED"
        ? "TAMPERED"
        : "VALID";

    await recordHistory(
      certificate.id,
      status === "TAMPERED" ? "TAMPER_DETECTED" : "VERIFIED",
      status === "TAMPERED" ? "Certificate fingerprint mismatch detected." : "Certificate verification completed.",
      currentHash
    );

    res.json({
      status,
      integrity,
      blockchainVerified: certificate.blockchain_anchored,
      certificate: apiCertificate,
      originalHash: certificate.sha256_hash,
      currentHash,
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to verify certificate", details: error.message });
  }
});

app.patch("/api/certificates/:id/revoke", async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });

    const reason = req.body?.reason || "Certificate withdrawn by issuing institution.";
    const { data, error } = await supabase
      .from("certificates")
      .update({
        status: "REVOKED",
        revoked_at: new Date().toISOString(),
        revocation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", certificate.id)
      .select("*")
      .single();

    if (error) throw error;
    await recordHistory(data.id, "REVOKED", reason, data.sha256_hash);

    res.json({ success: true, certificate: toApiCertificate(data) });
  } catch (error) {
    res.status(500).json({ error: "Unable to revoke certificate", details: error.message });
  }
});

app.get("/api/certificates/:id/history", async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });

    const { data, error } = await supabase
      .from("certificate_history")
      .select("*")
      .eq("certificate_id", certificate.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to load certificate history", details: error.message });
  }
});

app.get("/api/certificates/:id/qr", async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });

    const verificationUrl = `${APP_URL}/verify/${certificate.certificate_code}`;
    const dataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 260 });
    res.json({ certificateId: certificate.certificate_code, verificationUrl, dataUrl });
  } catch (error) {
    res.status(500).json({ error: "Unable to generate QR", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CertiChain API running on http://localhost:${PORT}`);
});
