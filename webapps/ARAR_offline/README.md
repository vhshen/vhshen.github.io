# Clip Response Study

A static web app for an async user study: participants read a consent form,
then watch a series of video clip pairs, writing what they hear/feel about
each clip, clicking **Next**, and repeating until done. At the end they
download a CSV of their responses and email it to you.

No build step, no backend server required — just static files.

## 1. Consent form

The consent screen displays a PDF (embedded inline, with an "Open in a new
tab" fallback link for browsers/devices that can't render PDFs inline) and
asks the participant to type their full name and the date as a digital
signature. The "Accept and Continue" button stays disabled until both fields
are filled in.

To use a different consent PDF, replace
`consent/consent-form.pdf` with your file (keep the same filename, or update
the `data`/`href` paths in the `<!-- Consent screen -->` section of
[index.html](index.html)).

## 2. Likert scale statements

Each pair screen shows a 7-point Likert scale (1 = Strongly Disagree, 7 =
Strongly Agree) for both clips, asking participants to rate 8 statements
(e.g. "The audio was interesting") before they can type their free-text
answer. Edit the statements in [config.js](config.js) under
`likertStatements` — the `key` becomes the CSV column suffix, so keep it
short and unique.

## 3. Add your video clips

Drop your video files into `videos/` and list them in [config.js](config.js)
under `pairs`. Add or remove entries to change how many pairs the study has.
Each pair also needs a `comparisonWord` — it fills the blank in a
forced-choice question shown at the bottom of that pair's screen: "Which clip
would you describe as '**comparisonWord**'?" (participant picks Clip 1 or
Clip 2). This can be a different word/phrase per pair:

```js
pairs: [
  { id: "pair1", clip1: "videos/pair1_clip1.mp4", clip2: "videos/pair1_clip2.mp4", comparisonWord: "more realistic" },
  { id: "pair2", clip1: "videos/pair2_clip1.mp4", clip2: "videos/pair2_clip2.mp4", comparisonWord: "louder" },
  // add as many as you like...
],
```

## 4. Run it locally to test

Any static file server works, e.g.:

```
npx serve .
```

or

```
python3 -m http.server 8000
```

Then open the printed local URL in your browser and click through the whole
flow: consent → welcome → each pair → download the CSV at the end and check
it opens correctly in a spreadsheet app.

## 5. Host it online

Since this is just static files (`index.html`, `style.css`, `app.js`,
`config.js`, `videos/`, `consent/`), you can drop the whole folder onto any
static host:

- **GitHub Pages** — push this folder to a repo, enable Pages on the branch.
- **Netlify / Vercel** — drag-and-drop the folder in their web UI, or connect
  the repo.
- **Any S3 bucket / static file host** — upload the files as-is.

For an async study, send participants the hosted link. You can optionally
append `?pid=SOMEID` to the URL (e.g. from Prolific/MTurk) and it will be
recorded as the participant ID; otherwise a random ID is generated per
session.

## How responses are collected

At the end of the study, participants click "Download my responses (CSV)".
This generates a CSV file (one row per clip pair) with columns:
participantId, consentName, consentDate, consentedAt, startedAt, finishedAt,
pairId, clip1, clip2, one `clip1_<key>`/`clip2_<key>` column per Likert
statement (7-point scale), response1, response2, comparisonWord,
comparisonAnswer (`1` or `2`, which clip the participant picked), answeredAt.
It downloads to
their computer, and they then email that file to **vhshen@cmu.edu** —
nothing is transmitted automatically, so make sure your instructions to
participants (e.g. in the consent form or a follow-up message) reinforce
where to send it.
