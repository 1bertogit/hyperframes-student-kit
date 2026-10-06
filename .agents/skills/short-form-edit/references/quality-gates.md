# Short-form quality gates

Apply these to the encoded final, not only the source composition.

| Gate | Required evidence | Fail examples |
|---|---|---|
| Priority 1: reason to stay | "In the first 3 seconds is someone convinced they need to watch until the end?" Specific benefit, unresolved question, and actual ending payoff | Attention grabbed with no reason to continue, vague teasing, promise not delivered |
| Story | Exact retained script, hook, complete argument, payoff, CTA | Repeated retake, missing qualification, unrelated insert |
| Open loops | Viewer question, planted unresolved state, timed partial answers, earned closure before CTA | Random question mark, recurring decoration, withheld basic context, promise never answered |
| Asset discovery | Inspected shortlist before concept lock, exact intervals, legible action and consequence | Storyboard locked before reviewing supplied assets, dense UI shown too briefly to understand |
| Rough edit | Three distinct opening drafts and a moving animatic reviewed before final polish | Choosing by impact loudness, polishing a predictable slideshow |
| Rhythm and reading load | Sequence-level density changes, anticipation/payoff, caption-versus-heading audit | Metronomic cuts, three copies of the same sentence, simultaneous competing reveals |
| Entertainment review | Timestamped critique separate from technical QA, review modality stated | Playback completion reported as audience engagement, fabricated retention score |
| First three seconds | Encoded first frame, immediately meaningful image, specific reason to stay by 3 s, sound/impact alignment, clear opening word | Caption-only opening, long audio lead-in, masked consonant, unrelated bumper |
| Word timing | EDL-derived words, fresh final-audio ASR, spot checks | Cut consonant, missing word, caption ahead of speech |
| Cadence | Shot durations and semantic visual-event map | Repeated template, >2.2 s gap without a deliberate story hold |
| Layout | Every hero frame at full size and phone scale | Face cropped, mouth covered, text beyond safe region |
| Motion | Contiguous encoded frames across every transition | Black flash, one-frame pop, unexpected freeze, conflicting moves |
| Paper depth (paper briefs only) | Close inspection of object edges, shadows, perspective | Flat rectangles used as decorative slide containers |
| Dimensional typography (when chosen) | Full-size and phone-size major headings, bevel/edge, cast shadow, readable perspective | Flat titles above dimensional objects, muddy extrusion, glowing text |
| Layered entertainment | Encoded action-to-result sequences, foreground/background separation, moving object shadows | Same idle bob on every card, title changes without consequence, settle-and-freeze beats |
| Product authenticity | Saved source URLs and reviewed real page interactions or official marks when used | Approximate invented logo, fabricated product evidence, private data in a screen capture |
| Named entities | Transcript audit, verified portrait or authentic source material where recognition matters, saved provenance | Name-only treatment when a recognizable person is central, synthetic portrait presented as real |
| Editorial variety | Adjacent silhouettes and action mechanisms compared; encoded setup, action, and consequence | Repeated card reveal with different words, identical bobbing, visual activity without a story outcome |
| Logo fidelity | Exact supplied or official asset, checksum, and every encoded occurrence compared with it | Generic star used for Claude, traced or generated brand mark, distorted proportions |
| Footage balance | Duration ledger for the supporting track and total runtime; story-based selection rationale, authentic and synthetic separated | Shot-count-only percentage, counting facecam or still-image zooms as B-roll, repetitive diagram run |
| Material realism (physical material briefs) | Encoded close-ups and motion showing fibers, imperfect edges, contact and cast shadows, directional light | Flat cream fills with blur shadows, texture that disappears at phone size, noise obscuring words |
| B-roll | Probed moving footage, sufficient source duration at the chosen speed, reviewed selected interval, exact encoded frame count per segment | Ken Burns still, irrelevant action, synthetic proof, short source clip truncating the final export |
| No repeated footage | Scene identity and file-hash/interval ledger; duplicate and overlap negative controls | Same scene replayed, renamed, recropped, reversed, or regraded as a new insert |
| Action framing | Start, middle, end, and action peaks in each ratio; full subject, action, and result visible at phone size | Enlarged B-roll hides context, captions cover evidence, unreadable UI is the only explanation |
| Minimal dimensional craft (when requested) | Readable focal object, thickness, perspective, restrained type, light and contact shadows; sequence variety | Tiny object on an empty slide, harsh strokes, repeated flat cards, decorative motion |
| Audio revision | Measured bed reduction relative to reviewed version; varied purposeful SFX with inspected contact times | Master merely quieter, bed still masks voice, more music substituted for SFX |
| Sound | Actual listening when supported, plus stem and mix measurements | Voice buried, repeated loud whoosh, onset unaligned, clipping |
| Delivery | Every requested ratio (default 1080x1920; 1920x1080 when requested), independently framed and reviewed, correct duration, fast-start MP4, final hash | Wrong aspect ratio, missing final syllable, stale export |

The artistic test: each shot advances the story or changes the emotional emphasis.
Remove an effect that only demonstrates the renderer. Most graphics should show
an object doing something: a spec filling, a test resolving, a workspace assembling.
At least one metaphor returns with a changed meaning or completed state.

Calibrate new validators with negative controls. A caption shifted by 0.3 seconds,
a one-frame scene gap, and an omitted spoken word should fail the relevant checks.
Do not make the validator accept the current output merely to reach green.

The original workspace motion checklist has brief-dependent defaults. A warm
paper reel deliberately overrides black canvas, chrome text, halos, grids, and a
long outro. Preserve timing discipline, coherent materials, callback, full timeline
coverage, and rendered visual inspection.

If a review modality is unavailable, state it explicitly. A waveform establishes
levels and timing, not whether music is emotionally right. ASR establishes spoken
content, not whether every audio edit sounds natural. Never count one as the other.

## Scored critique loop

Run before every final render, on the encoded draft, never on the composition source.
Look at the frames, then judge them as a harsh motion director, not the author.

1. Build the sheets from the draft (use the SSD for temp files):
   - Contact sheet, 2 frames per second:
     `ffmpeg -i draft.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 contact.png`
   - Strip of 12 consecutive frames around each fast action or transition (catches pops and overlaps the contact sheet misses):
     `ffmpeg -ss <t-0.1> -i draft.mp4 -vf "scale=320:-1,tile=12x1" -frames:v 1 strip.png`
   - Phone scale, 360 px wide:
     `ffmpeg -i draft.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 phone.png`
   - Measured checks. Every hit is a timestamp to inspect, not an automatic fail:
     `ffmpeg -i draft.mp4 -vf "blackdetect=d=0.04:pix_th=0.10,freezedetect=n=-50dB:d=1" -an -f null - 2>&1 | grep -E "black_start|freeze_start"`
     `blackdetect` catches black flashes down to one frame at 25 fps; `freezedetect`
     catches static runs over 1 s. For a graphics-only pass whose audio was
     stream-copied, also compare `ffmpeg -i <cut>.mp4 -map 0:a -f md5 -` with the
     draft's. A different hash means the audio changed.
2. Open every image with Read and score 1-10: hook in the first 2 s, readability
   at phone size, motion quality (easing, no dead frames), variety (something new
   every 2-4 s), composition, brand accuracy, sound sync. Apply the caps below
   before writing a score; a cap is a ceiling, not a penalty.

   | Criterion | Cap |
   |---|---|
   | Hook | Frame 0 empty or near-blank: max 6 |
   | Readability | CTA or must-read text illegible in `phone.png`: max 6. Key text inside the platform UI zone: max 7 |
   | Motion quality | The same fade used as every enter and exit: max 6. A visible pop or jump in a strip: max 7 |
   | Variety | A gap over 2.2 s with nothing new and no deliberate story hold, or a `freezedetect` hit that is not a planned hold: max 7 |
   | Brand accuracy | Invented UI, logo, or font where the real one exists, or a second accent color: max 6 |
   | Sound sync | A hit more than 80 ms off its picture, or loudness off target: max 6. Not listened to: do not score |
   | Polish | Any `blackdetect` hit mid-reel, a blank frame in a handoff, or a double-exposed caption: max 7 |
3. Write the 3 worst problems with timestamps. Hunt specifically for: text
   overlapping during swaps, anything sliding instead of easing, corner labels and
   frame borders, centered title on a gradient, blurry scaled text, a dead beat
   with nothing happening. Also check these recurring failures: frame 0 empty or
   the first word readable only after frame 3; a sound hit that lands before its
   visual is readable (3-6 frames early); an end card static for over 1.5 s; a loop
   seam that jumps; a third of the 9:16 frame empty for over 1 s; a caption lifting
   out while the next lands on it; a caret that outlives its line; a hold longer
   than one bar with nothing new.

   Motion craft, for any graphic that moves more than a fade. Judge from the strips:
   - Anticipation: a big move starts with a small counter-move or a beat of tension.
     Skip it for quick pops and hover-sized nudges.
   - Follow-through: children, shadows, and secondary elements trail the lead by
     roughly 50-150 ms instead of landing on the same frame.
   - Hero leads: the focal element gets the largest displacement and the strongest
     easing; supporting elements are subtler in every dimension.
   - Simultaneity: with three or more animated elements, no more than a third move
     at once. Stagger so the first has settled as the third starts.
   - Settle: the move ends with a short overshoot or ease-out, then 100-200 ms of
     stillness before the next one. A snap straight into the next move reads rushed.
4. Fix them, re-render only the affected seconds, rebuild the sheets, rescore.
   Repeat until every score is 8 or higher, minimum 2 rounds.
5. Save the scores, problems, and fixes per round in VERIFY.md.

Optional independent verifier, only when the user asks for subagents: the agent
that edited the reel is biased toward its own work. Hand the sheets and step 3's
hunt list to a fresh-context subagent, without your scores or reasoning. It returns
only defects, each with timestamp, severity, and required correction. After the
fixes, use a new subagent instance for the next round, never a continuation. Stop
when a fresh verifier reports no relevant defects. Without subagents, do the loop
yourself and record that the review was not independent.

These scores are the reviewer's judgment of the frames. They are not audience
metrics and never stand in for retention, engagement, or listening review. Say
which modalities were actually reviewed, and mark sound sync "not reviewed" when
no listening or onset check happened.

When replacing a paper scene with footage, choose caption contrast from the
actual background, including qualifiers and small secondary text. Inspect the
first encoded frame of every inserted screen recording: fractional source seeks
must not leave an empty viewport before the footage appears. Review the entire
selected generated-video interval for malformed hands, gibberish focal text,
unintended marks, and implausible actions; generation success is not asset QA.
