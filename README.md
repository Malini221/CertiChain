# CertiChain
Verify once. Trust instantly.

## Landing page
The current frontend is an editorial, full-width certificate verification experience inspired by the supplied video reference and the supplied Certification-cuate illustration style.

Visual system:
- White / warm yellow / charcoal
- Large editorial typography
- Flat hand-drawn vector certificate illustrations
- Framer Motion scroll and entrance motion
- Responsive desktop-to-mobile layout

Core landing flow:
1. Verify What’s Real
2. Issue → Hash → Anchor → Verify
3. The certificate problem
4. CertiChain verification flow
5. Interactive tamper-detection demo
6. Built for institutions, students and verifiers
7. Verification CTA
8. Final trust statement

The frontend is intentionally presentation-first so backend verification APIs can be connected next.


## Illustration language
The illustration system now follows the supplied Pana / Cuate / Rafiki-style references:
- Flat 2D editorial vector scenes
- Warm yellow as the primary accent
- Charcoal / blue-gray outlines and clothing
- Coral and peach skin tones
- White and light-gray interface surfaces
- Rounded browser, phone, certificate and document shapes
- Friendly simplified human characters
- Small floating communication / location / document motifs
- Subtle Framer Motion floating and entrance movement

The same visual language is intended for future Verify, Issuer and certificate-detail screens so the product feels like one consistent system.


## Completed product flow

### Public verification
- Certificate ID verification
- QR verification interface
- Animated verification states
- VALID / TAMPERED / REVOKED results
- SHA-256 original vs current fingerprint comparison
- Certificate preview modal
- Share proof link
- Tamper simulation and revocation simulation

### Issuer portal
- Issuer dashboard with issuance and verification statistics
- Recent certificate list
- Issue certificate form with live preview
- Generated certificate identity and SHA-256 fingerprint
- Print-to-PDF certificate download flow
- Native share / clipboard fallback
- Revocation confirmation modal
- Verification handoff without a page reload

### API
A small Express API is included in `server/index.mjs` for the hackathon demo.

Run the frontend:
```bash
npm install
npm run dev
```

Run the API in a second terminal:
```bash
npm run server
```

API endpoints:
- `GET /api/health`
- `GET /api/dashboard/stats`
- `GET /api/certificates`
- `GET /api/certificates/:id`
- `POST /api/certificates`
- `GET /api/verify/:id`
- `PATCH /api/certificates/:id/revoke`
- `GET /api/certificates/:id/qr`

The API currently uses an in-memory demo store so the complete issue → fingerprint → verify → revoke story can be demonstrated quickly. Replace the store with PostgreSQL/Supabase and the blockchain anchor with a testnet contract when moving beyond the prototype.


## Certificate verification model

Every issued certificate gets a unique ID such as `CC-2026-XXXXXX`. Its QR code contains only the verification URL:

```
/verify/<certificate-id>
```

The frontend demo persists the latest issued certificate locally so the generated QR remains verifiable after navigation or refresh. Verification resolves the ID to the stored certificate record and returns:
- **VALID** — record exists and is active
- **TAMPERED** — the demo integrity check detects a changed proof
- **REVOKED** — the record exists but its status has been withdrawn
- **INVALID / NOT FOUND** — no record exists for the supplied ID

For production, replace local demo persistence with PostgreSQL/Supabase and replace the demo blockchain flag with a real signed credential or blockchain transaction.
