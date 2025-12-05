# PRD: External Songs into Playlists & DJ Sessions

---

# **PRD: External Songs into Playlists & DJ Sessions**

---

## **1. Overview**

**Feature Goal:** Allow Seda.fm users to add songs from their Spotify or Apple Music profiles *and* upload their own owned tracks directly into Seda.fm playlists and DJ sessions.

This strengthens Seda.fm’s value proposition as a **music-first social platform** by bridging existing libraries, owned content, and community-driven DJing.

---

## **2. Target Customers**

- **Music Fans**: Users with Spotify/Apple libraries who want continuity.
- **Community DJs/Curators**: Hosts who want easy access to their libraries and uploads.
- **Artists**: Musicians who want fans to bring their tracks into Seda.
- **Indie Creators**: Those with original tracks they want to share before distribution.

---

## **3. Underserved Needs**

- Fans can’t easily bring their taste/history into Seda.
- DJs want fast ways to build sets using songs they already love.
- Indie artists need a lightweight way to share/test tracks.

---

## **4. Value Proposition**

- **Continuity:** Your taste and tracks come with you.
- **Speed:** Build playlists/DJ sets from any source.
- **Creativity:** Upload and share unreleased songs.
- **Discovery:** Imported + uploaded tracks feed into Seda’s rec engine.

---

## **5. Feature Roadmap**

| **Phase** | **Features** | **Notes** |
| --- | --- | --- |
| **MVP** | - OAuth integration with Spotify & Apple Music  - Import tracks (no auto-sync of playlists)  - “My Library” tab (Spotify / Apple / Uploads toggle)  - Add imported tracks to playlists  - Add imported tracks to DJ sessions (host & participant requests)  - Upload owned tracks (MP3/FLAC/WAV ≤100MB)  - Cross-platform mixing supported  - Imported libraries private by default  - Metadata sync (artist, title, album art, duration) | Core utility: get personal libraries + uploads into Seda. |
| **Future Enhancements** | - Opt-in social discovery (recommend songs from imports/uploads to friends)  - Library sync history (track changes over time)  - Smart Crates (blend Seda recs + imports + uploads) | Unlocks network effects and deeper personalization. |

---

## **6. UX / User Stories & Acceptance Criteria**

### **Connecting & Importing**

- *As a fan*, I want to connect my Spotify account so I can bring my liked songs into Seda playlists.
    - **AC:** OAuth flow works, saved tracks visible under “My Library → Spotify.”
- *As a fan*, I want to connect my Apple Music account so I can queue my saved tracks in DJ sessions.
    - **AC:** OAuth flow works, saved tracks visible under “My Library → Apple.”

### **Adding to Playlists**

- *As a fan*, I want to add songs from Spotify/Apple into Seda playlists.
    - **AC:** Track appears in playlist with correct metadata; duplicates prevented.
- *As an indie artist*, I want to upload my MP3 and add it to a Seda playlist.
    - **AC:** Upload succeeds, appears in “My Library → Uploads,” and adds to playlist.

### **Adding to DJ Sessions**

- *As a DJ*, I want to queue tracks from Spotify/Apple libraries.
    - **AC:** Tracks added to queue, play via SDK, with clear error if unavailable.
- *As a DJ*, I want to upload my own track and drop it into a session.
    - **AC:** Uploaded track appears in queue, streams from Seda’s player.
- *As a fan*, I want to request tracks from my libraries or uploads.
    - **AC:** Requests appear in host’s request list, added if host approves.

---

## **7. Integration Requirements**

- **Spotify:** session-only musicUserToken, encrypted developer token, APIs: Search, User Library, Playlist.
- **Apple Music:** session-only tokens, encrypted dev token, APIs: Library Songs, Playlists, Catalog.
- **Uploads:** secure storage (signed URLs + CDN), metadata extraction, virus scan, copyright attestation.
- **Playback:** Spotify/Apple via SDKs; uploads via Seda’s player; unified queue for DJ sessions.

---

## **8. Data Requirements**

- Store mapped metadata only (trackId, artist, albumArtUrl, duration, source).
- Encrypt tokens at rest.
- Deduplication by (providerTrackId | ISRC | audioHash).

---

## **9. Success Metrics**

- % of users connecting an external profile.
- 
    
    # **of tracks uploaded vs. imported.**
    
- % of DJ sessions with uploaded/imported tracks played.
- Session engagement (duration, repeat participation).

---

## **10. Risks & Mitigations**

- **Copyright uploads:** Require attestation + consider content ID later.
- **API rate limits:** Cache + backoff.
- **Licensing gaps:** Show fallback/alternative UX.
- **Storage costs:** Enforce size & quota limits.

---

## **11. Edge Cases & Error Handling**

(see [detailed matrix](PRD%20External%20Songs%20into%20Playlists%20&%20DJ%20Sessions%2026c0d66a3cf280ba9833dd53e7e5ee07.md) from earlier draft; included in final doc for eng/QA — covers auth, uploads, playlists, DJ queue, privacy, moderation, storage, CDN failures).

---

## **12. Non-Functional Requirements (NFRs)**

- **Perf:** library load ≤3s P95; add-to-queue ≤250ms ack.
- **Reliability:** 99.9% queue & storage uptime.
- **Security:** Encrypted tokens, signed URLs, malware scan.
- **Observability:** Structured logs, dashboards, alerts.

---

## **13. API Stubs**

### **Uploads (**

### **POST /uploads**

### **)**

**Request (form-data):** file, artist, title, duration, attestCopyright

**Response:** Track metadata object with trackId and status.

### **Playlists (**

### **POST /playlists/{playlistId}/tracks**

### **)**

**Request:** { trackId, source }

**Response:** Track object added to playlist.

### **DJ Sessions (**

### **POST /dj-sessions/{sessionId}/queue**

### **)**

**Request:** { trackId, source, requestedBy }

**Response:** Track object with queuePosition.

---

## **14. Example Payloads**

✔ **Upload**

```
{
  "trackId": "upl_abc123",
  "source": "upload",
  "title": "Sunset Groove",
  "artist": "Indie DJ",
  "duration": 215,
  "albumArtUrl": "https://cdn.seda.fm/uploads/upl_abc123/artwork.jpg"
}
```

✔ **Spotify Playlist Add**

```
{
  "trackId": "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
  "source": "spotify"
}
```

✔ **DJ Queue (Upload)**

```
{
  "sessionId": "dj_9012",
  "queuePosition": 5,
  "track": {
    "trackId": "upl_abc123",
    "source": "upload",
    "title": "Sunset Groove",
    "artist": "Indie DJ",
    "duration": 215,
    "albumArtUrl": "https://cdn.seda.fm/uploads/upl_abc123/artwork.jpg"
  },
  "requestedBy": "user_99",
  "status": "queued"
}
```

---

## **15. Sequence Diagram (Mermaid)**

```
sequenceDiagram
    participant U as User
    participant C as Seda Client
    participant API as Seda API
    participant S as Spotify/Apple API
    participant ST as Storage/CDN

    U->>C: Connect Spotify/Apple
    C->>S: OAuth Request
    S-->>C: Token
    C->>API: Save token (encrypted)

    U->>C: Import Library
    C->>API: Request tracks
    API->>S: Fetch user library
    S-->>API: Return tracks
    API-->>C: Return mapped metadata
    C-->>U: Display "My Library"

    U->>C: Upload track
    C->>API: POST /uploads
    API->>ST: Store file + metadata
    ST-->>API: Upload success
    API-->>C: Return trackId + metadata
    C-->>U: Confirm upload

    U->>C: Add track to Playlist/DJ Session
    C->>API: POST trackId
    API-->>C: Confirm added
    C-->>U: Track visible in playlist/queue
```

---