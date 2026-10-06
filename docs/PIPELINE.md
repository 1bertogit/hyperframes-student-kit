# The complete editing pipeline

How a raw recording becomes a verified, delivered video, and how the skills,
scripts, and validators in this kit fit together. [WORKFLOW.md](WORKFLOW.md) is the
short command walkthrough; this page is the full map with inputs, outputs, and gates.

## Principles

- **Originals are never touched.** Every stage writes a new file; no stage
  overwrites its input. Archive superseded work instead of deleting it.
- **One timeline per file.** Raw, silenced, and clean videos each have their own
  timings. A transcript is only valid for the video it was derived from.
- **Words drive everything.** Cuts, captions, graphics, and sound are anchored to
  word-level timestamps. A timing change rebuilds every dependent layer.
- **Deterministic rendering.** HyperFrames owns playback; each composition registers
  one paused GSAP timeline. No timers, no CSS transitions in render mode.
- **Evidence over assertion.** A validator or lint pass is structural. Taste, motion,
  and sound are judged from the encoded draft, and what was actually reviewed is
  recorded in `VERIFY.md`.
- **Explicit approvals.** Paid generation, uploads, and publishing need the user's
  authorization. Authorization already given persists for the same action.

## Pipeline at a glance

```text
RAW recording
  |
  0  SETUP            npm ci, npm run setup, npm run check
  1  PROJECT          npm run new-video -- <slug>
  2  TRANSCRIBE       word timestamps -> raw.json
  |    `- corrections  caption-corrections.json -> *.corrected.json (display text only)
  3  CUT SILENCES     silenced.mp4 + retimed transcript
  4  REVIEW MISTAKES  candidates -> reviewed approved-cuts.json -> clean.mp4
  |    `- LOCK THE CUT after the rough animatic, before polished graphics
  5  DIRECT           DESIGN.md, beat sheet, (reels) OPEN-LOOPS.json, style choice
  6  BUILD VISUALS    HyperFrames + GSAP compositions, B-roll, captions
  7  BUILD AUDIO      voice, music bed, ducking, SFX from the event map
  8  VERIFY           preflight, lint, validators, Studio, draft, critique loop
  9  FINAL + DELIVER  final render, VERIFY.md, hand-off (publishing is separate)
```

## Choose a route

| Goal | Skill | Notes |
|---|---|---|
| Long talking-head video | `edit-video` | Orchestrates steps 1-9 below |
| Reel, Short, or short ad from a recording | `short-form-edit` | Adds hook, open loops, B-roll, SFX gates; defaults to 1080x1920 |
| Silence removal only | `cut-silences` | |
| Retakes and stutters only | `cut-mistakes` | Needs the retimed transcript from `cut-silences` |
| Narrative arc and persistent visual world | `video-storytelling` | Used by `edit-video` for the visual layer |
| Overlay beats, takeovers, glass cards | `hyperframes-video-beats` | Long-form overlays |
| Motion showreel cut to music | `motion-showreel` | Beat-grid driven, no talking head |
| Video from a brief, no footage | `make-a-video` | |
| Video from a website | `website-to-hyperframes` | |
| Choose or extend a visual style | `style-library` | Cards with DESIGN.md, CSS tokens, named slots |
| Clinical-atlas reel for an existing project | `atlas-reel` | Maintenance of that style only |
| Legacy May Shorts examples | `short-form-video` | Not for new reels |

## Stage by stage

### 0. Setup

Run once per machine and after pulling kit updates.

```sh
npm ci
npm run setup          # checks tool availability
npm run check          # kit distribution check
npx hyperframes doctor # diagnoses the render environment
```

Requires Node, FFmpeg, and Chrome/Chromium. See [SETUP.md](SETUP.md) and
[TOOLS-AND-API-KEYS.md](TOOLS-AND-API-KEYS.md). Read the latter before choosing a
transcription, asset-generation, or voiceover service.

### 1. Create the project

```sh
npm run new-video -- my-video     # lowercase kebab-case slug
```

Copies `examples/starter` to `video-projects/my-video/`, adds `assets/`,
`compositions/`, `renders/`, and the local GSAP build. Put the recording at
`video-projects/my-video/assets/raw.mp4`. Run all HyperFrames commands from the
project folder. Projects are gitignored.

### 2. Transcribe

Goal: word-level timestamps for the whole recording.

- Default script: `node scripts/transcribe-elevenlabs.mjs <raw.mp4>` (ElevenLabs
  Scribe, uses your key and credits, uploads audio).
- Alternatives: OpenAI Whisper, local Whisper, Deepgram, or any provider whose
  output is normalized to `{ words: [{ text, start, end }], audio_duration_secs }`.
- Reuse an existing verified transcript when one matches the footage.

**Display-text corrections.** Add recurring misspellings (brand and domain terms)
to `caption-corrections.json`, then:

```sh
node scripts/apply-caption-corrections.mjs <transcript.json>
```

This writes `<transcript>.corrected.json` and keeps word timing. Use it for captions
and on-screen text only. Keep the ASR transcript for beat anchors and
`validate-beat-sync`.

### 3. Cut silences

```sh
node .claude/skills/cut-silences/scripts/cut-silences.mjs <raw.json> \
  --video <raw.mp4> --out-dir <assets> --output <assets>/silenced.mp4 --apply
```

Outputs `silenced.mp4` and `raw.silence-transcript.json`. Keep pauses that carry
meaning. Codex users replace `.claude` with `.agents`.

### 4. Review mistakes

```sh
node .claude/skills/cut-mistakes/scripts/find-cut-candidates.mjs <raw.silence-transcript.json> --out-dir <assets>
```

Read every candidate in context. Intentional repetition and emphasis are not
mistakes. Write the reviewed decisions to `approved-cuts.json`
(`{ "cuts": [{ "start": 1.2, "end": 1.5, "reason": "stutter" }] }`, times on the
silenced timeline; an empty list is valid), then:

```sh
node .claude/skills/cut-mistakes/scripts/apply-cuts.mjs <raw.silence-transcript.json> \
  --cuts <approved-cuts.json> --video <silenced.mp4> --out-dir <assets> --output <assets>/clean.mp4 --apply
```

Outputs `clean.mp4` and `raw.mistakes-transcript.json`. Copy that transcript to
`assets/transcript.json`. Optional: `node scripts/build-edl-review.mjs` builds an
HTML page that shows kept and cut regions with both videos side by side.

**Lock the cut.** For reels, render the clean cut once, derive word timing from the
actual frame-aligned EDL, review a rough animatic, then lock the cut before polished
graphics.

### 5. Direct

Decide what the video is before writing HTML.

- Read `MOTION_PHILOSOPHY.md` (a style reference; the project brief controls pacing,
  palette, and typography) and the project's `DESIGN.md`.
- Pick or adapt a style from `style-library/registry.json` if no direction exists.
- Write a **beat sheet**: spoken anchor, on-screen idea, visual, entry time, callback.
  One visual idea per beat, with deliberate callbacks.
- Reels: write the hook as a separate edit (three opening directions, a truthful
  promise and payoff), and `OPEN-LOOPS.json` (one main viewer question at a time,
  closed before the CTA). Save `REFERENCE-ANALYSIS.md` when a reference video is
  supplied; borrow mechanisms, not copy.

### 6. Build the visuals

- Author compositions with the `hyperframes` and `gsap` skills. Root compositions
  use a visible div with `id`, `data-composition-id`, `data-start`, `duration`,
  `width`, `height`. Timed clips carry `data-start`, `data-duration`,
  `data-track-index`; same-track clips must not overlap.
- Mute videos and use sibling audio for the mix. Animate a non-timed wrapper for
  camera moves. Localize every asset.
- Bind reveals to the spoken noun, not an arbitrary stagger. Target within 2 frames
  of word onset for captions and impact events.
- Moving B-roll must have genuine motion, never a still with a zoom. Record
  provenance in `assets/footage-ledger.json` so the same scene is not reused by
  accident.
- Brand marks and product UI must be real or official. No invented logos or
  fabricated evidence.

### 7. Build the audio

- Normalize the voice, then place the music bed roughly 14-20 dB below it; duck under
  speech; fade cleanly; measure the final mix (about -16 LUFS, true peak <= -1 dBTP).
- Build SFX from the visual-event map and align the audible impact, not the file
  start. Vary density; let some cuts pass without a whoosh.
- Save provenance for music and effects. Check licensing before using downloaded
  material.

### 8. Verify

Structural checks, from the repository root:

```sh
node scripts/preflight.mjs video-projects/my-video
npm run validate-beats -- video-projects/my-video   # anchored sub-compositions only
npm run validate:short-form -- video-projects/my-video   # reels
npm run validate:footage -- video-projects/my-video      # reels with moving footage
cd video-projects/my-video && npx hyperframes lint
```

Then review Studio (`npx hyperframes preview`; use a Range-capable server such as
`npx serve` for MP4 scrubbing) and render a draft:

```sh
npx hyperframes render --quality draft
```

**Scored critique loop** (details in
[quality-gates.md](../.claude/skills/short-form-edit/references/quality-gates.md)).
Run on the encoded draft, never the composition source.

1. Build the sheets: contact sheet (2 fps), strips around fast actions, phone-scale
   sheet (360 px wide), plus measured checks: `blackdetect`, `freezedetect`, and the
   audio MD5 when audio was stream-copied.
2. Read every image and score 1-10: hook, readability at phone size, motion quality,
   variety, composition, brand accuracy, sound sync. Score caps apply (for example,
   an illegible CTA caps readability at 6).
3. Write the three worst problems with timestamps; also check the motion-craft items
   (anticipation, follow-through, hero lead, simultaneity, settle).
4. Fix, re-render the affected seconds, rebuild the sheets, rescore. Repeat until
   every score is 8 or higher, minimum two rounds.
5. Optional independent verifier: with subagents authorized, a fresh-context agent
   reviews the sheets and returns only defects. Otherwise record that the review was
   not independent.

Also review: an uninterrupted entertainment pass (`ENTERTAINMENT-REVIEW.md`), fresh
ASR on the final audio, a listening pass at the cut joins, face framing, text
legibility, black frames, and A/V sync. Record any review modality that was not
available.

### 9. Final render and delivery

```sh
npx hyperframes render --fps 60 --quality high   # or the project's chosen settings
```

Deliver the final MP4 path, edit decisions, retimed transcript, composition, and
`VERIFY.md` with the actual output hash, measured results, inspected artifacts,
revisions, and limits. Never label a draft final. Publishing or uploading is a
separate action that needs the user's instruction.

## Where files live

```text
video-projects/<slug>/
  DESIGN.md                  visual direction
  OPEN-LOOPS.json            reels: viewer questions and closures
  REFERENCE-ANALYSIS.md      when a reference video is analyzed
  ENTERTAINMENT-REVIEW.md    attention-drop review
  VERIFY.md                  evidence and limits
  index.html, compositions/  HyperFrames sources
  assets/
    raw.mp4, raw.json                    originals and first transcript
    silenced.mp4, raw.silence-transcript.json
    approved-cuts.json
    clean.mp4, raw.mistakes-transcript.json
    transcript.json                      timings for clean.mp4
    plan.json, edit-decisions.json       reel plan and cut reasons
    footage-ledger.json                  B-roll provenance
  renders/                   drafts and finals
```

Source media, transcripts, credentials, and renders are gitignored. Do not copy
private footage into library examples.

## Command cheat sheet

| Step | Command |
|---|---|
| Check kit | `npm run check` and `npm test` |
| New project | `npm run new-video -- <slug>` |
| Transcribe | `npm run transcribe -- <raw.mp4>` |
| Fix terms | `node scripts/apply-caption-corrections.mjs <transcript.json>` |
| Preflight | `npm run preflight -- video-projects/<slug>` |
| Beat sync | `npm run validate-beats -- video-projects/<slug>` |
| Reel plan | `npm run validate:short-form -- video-projects/<slug>` |
| Footage | `npm run validate:footage -- video-projects/<slug>` |
| Lint / preview | `npx hyperframes lint`, `npx hyperframes preview` |
| Draft / final | `npx hyperframes render --quality draft` / `--quality high` |
| Mirror skills | `npm run sync:skills` after editing `.claude/skills/` |

## Limits

- Validators check structure and declared timing. They do not prove a compelling
  hook, factual claims, footage rights, correct cropping, or audible sync.
- Automatic detectors propose edits; editorial judgment decides them.
- Critique scores are the reviewer's judgment of frames, not audience metrics. Never
  report them as retention or engagement.
- The kit was last verified with synthetic media; no paid service call is part of
  release QA. See [VERIFICATION.md](VERIFICATION.md).
