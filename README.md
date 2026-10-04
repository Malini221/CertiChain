# CertiChain

### Verify Once. Trust Instantly.

CertiChain is a digital certificate verification platform that transforms certificates from simple documents into verifiable digital identities.

It enables institutions to issue certificates, students to securely share them, and recruiters or organizations to verify their authenticity using a Certificate ID or QR code.

---

## Problem

Digital certificates can be easily copied, edited, or misrepresented.

Traditional verification often requires:

- Manual communication with institutions
- Time-consuming verification processes
- Checking documents individually
- Difficulty identifying modified certificate details
- No simple way to handle revoked credentials

CertiChain addresses these challenges through cryptographic verification and a streamlined verification workflow.

---

## Our Solution

CertiChain creates a unique digital identity for every certificate.

Each certificate is associated with:

- A unique Certificate ID
- A SHA-256 cryptographic fingerprint
- QR-based verification
- Verification status
- Certificate history
- Revocation information
- Blockchain-backed proof layer

The core workflow is:

**ISSUE → HASH → ANCHOR → SHARE → VERIFY → DETECT → REVOKE**

---

## Key Features

### Digital Certificate Identity
Every certificate receives a unique identity and cryptographic fingerprint.

### SHA-256 Fingerprinting
Certificate information is converted into a SHA-256 hash to create a tamper-evident digital fingerprint.

### QR-Based Verification
A verifier can scan the QR code or enter the Certificate ID to quickly verify a credential.

### Tamper Detection
If important certificate information is modified, its fingerprint changes and the system can identify a mismatch.

### Blockchain Proof
The certificate fingerprint can be anchored to blockchain as an immutable proof reference.

### Certificate Revocation
Institutions can revoke certificates when necessary while preserving their verification history.

### Role-Based Workflows
CertiChain provides dedicated workflows for:

- Institutions / Issuers
- Students / Certificate Holders
- Recruiters / Verifiers

### Verification History
Certificate actions and verification events can be recorded to provide traceability.

---

## How It Works

### 1. Issue

An institution enters certificate details such as:

- Student name
- Course
- Grade
- Certificate type
- Issue date

### 2. Generate Proof

CertiChain generates a unique Certificate ID and SHA-256 fingerprint.

### 3. Anchor

The certificate proof can be associated with a blockchain transaction for an immutable reference.

### 4. Share

The certificate is provided with a QR code that can be shared with another person.

### 5. Verify

The verifier enters the Certificate ID or scans the QR code.

### 6. Compare

The system compares the certificate information and cryptographic proof with the trusted record.

### 7. Detect

A mismatch indicates that the certificate may have been modified.

### 8. Revoke

If an institution withdraws a certificate, its status can be changed to **REVOKED** without deleting its history.

---

## Security Approach

CertiChain follows the principles of the **CIA Triad**:

| Principle | Implementation |
|---|---|
| Confidentiality | Controlled access to certificate information |
| Integrity | SHA-256 fingerprinting and tamper detection |
| Availability | Online certificate verification |

The system focuses strongly on **integrity**, ensuring that changes to important certificate information can be detected.

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js

### Database
- Supabase
- PostgreSQL

### Security & Verification
- SHA-256
- QR Code technology
- Blockchain proof layer

### Development & Deployment
- GitHub
- Netlify

---

## System Architecture

```text
                 ┌─────────────────────┐
                 │      Institution    │
                 │       / Issuer      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     CertiChain      │
                 │      Backend        │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        SHA-256         Database       Blockchain
        Fingerprint     PostgreSQL       Proof
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Certificate │
                     │     + QR    │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Verifier   │
                     │ ID / QR Scan│
                     └──────┬──────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Verification     │
                 │ VALID / TAMPERED /  │
                 │      REVOKED        │
                 └─────────────────────┘
