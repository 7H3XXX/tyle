# CLAUDE.md

## Project: Auto-évaluation du statut mitochondrial

Build a production-quality, minimal, elegant, Typeform/Tally-inspired questionnaire application using **Next.js + React + TypeScript**.

The application is being prepared for a live event happening within hours, so prioritize:

1. Reliability
2. Simplicity
3. Fast implementation
4. Excellent mobile UX
5. Clean architecture that can later evolve into a larger form platform

Do not over-engineer the first version.

---

# 1. Product concept

This is a multi-step self-assessment questionnaire.

Form title:

**Auto-évaluation du statut mitochondrial**

The respondent progresses through one topic/section at a time.

Each section contains several checkbox statements.

The respondent may:

* select zero choices
* select one choice
* select multiple choices
* select all choices

The respondent must ALWAYS be able to continue to the next section.

There must be NO requirement to select at least one checkbox.

At the end, calculate the total number of selected choices across the entire questionnaire.

Display:

**X cases cochées.**

Then:

**Consultez votre résultat.**

And display the appropriate score band.

---

# 2. Questionnaire

There are 7 sections.

The section title is the topic.

Every bullet point is a checkbox choice.

## Énergie

* Je me suis réveillé fatigué
* Je me sens épuisé après un repas
* J'ai besoin de café pour fonctionner
* Je manque d'endurance
* Je récupère très lentement après un effort

Maximum selections: 5

---

## Métabolisme

* J'ai des fringales sucrées
* Je prends du poids facilement
* Je fais de l'hypoglycémie réactionnelle
* J'ai un ventre gonflé/enflammé

Maximum selections: 4

---

## Cerveau/humeur

* J'ai du brouillard mental
* Je perds mes mots
* Je me sens anxieux sans raison claire
* J'ai du mal à me concentrer
* Je suis irrité ou à fleur de peau
* Je suis déprimé

Maximum selections: 6

---

## Muscles

* Mes muscles me font mal
* Je me fatigue rapidement
* Je ne tolère plus l'effort
* Je fais souvent des crampes

Maximum selections: 4

---

## Digestion

* Je suis balloné
* Mes gaz sont maldorants
* Je digère lentement
* Je deviens intolérant à certains aliments

Maximum selections: 4

---

## Hormones/température

* Je suis frileux
* Mon cycle est irrégulier ou difficile
* Je manque de libido
* Je gère mal le stress

Maximum selections: 4

---

## Immunité

* Je tombe souvent malade
* Je récupère lentement après un virus
* J'ai des inflammations chroniques

Maximum selections: 3

---

# 3. Total number of choices

There are NOT 28 possible choices.

The correct total is:

5 + 4 + 6 + 4 + 4 + 4 + 3 = 30

Therefore:

**Maximum score = 30**

Do not hard-code 28 anywhere.

The score must be derived programmatically from the questionnaire definition.

---

# 4. Result text

After submission, calculate:

```ts
totalSelected
```

where each checked choice contributes exactly 1 point.

Display:

```text
X cases cochées.

Consultez votre résultat.
```

Then:

### 0–5

```text
0-5 cases cochées : fluctuations normales, surveiller l'hygiène de vie.
```

### 6–12

```text
6-12 cases cochées : déséquilibre mitochondrial probable; agir sur l'alimentation, le sommeil, la lumière, le mouvement.
```

### More than 12

```text
Plus de 12 cases cochées : suspicion forte de dysfonctionnement mitochondrial, Consulter un professionnel formé + réaliser un bilan.
```

The application should make the result thresholds configurable rather than scattering magic numbers throughout the UI.

IMPORTANT:

This questionnaire is a self-assessment and should not be presented as a medical diagnosis.

Keep the provided result language as product content, but avoid adding claims that the questionnaire medically diagnoses mitochondrial dysfunction.

---

# 5. UX / visual direction

The visual design should be inspired by the product qualities of:

* Tally
* Typeform
* Linear
* Stripe

Do NOT clone their UI.

The desired aesthetic:

* minimal
* calm
* premium
* spacious
* highly readable
* mobile-first
* subtle
* modern
* extremely little visual noise

Avoid:

* excessive cards
* gradients everywhere
* unnecessary shadows
* decorative illustrations
* complicated navigation
* dense dashboards
* excessive animations

Use whitespace as a primary design element.

---

# 6. Cover screen

Before the questionnaire begins, show a cover screen.

Content:

```text
Auto-évaluation du statut mitochondrial

[short optional description]

Commencer
```

The cover should support:

* logo
* optional cover image
* form title
* optional description

Build this as reusable configuration, not hard-coded markup.

Example configuration:

```ts
type FormBranding = {
  logoUrl?: string;
  coverImageUrl?: string;
  accentColor?: string;
};
```

For the first version, use a simple placeholder/logo area if no logo asset is provided.

---

# 7. Multi-step interaction

The respondent should see ONE section at a time.

Do not display all seven sections simultaneously.

Flow:

```text
Cover
↓
Énergie
↓
Métabolisme
↓
Cerveau/humeur
↓
Muscles
↓
Digestion
↓
Hormones/température
↓
Immunité
↓
Result
```

Each section has:

* section title
* checkbox choices
* Back button
* Next button

On the final section:

* Back
* Submit

The respondent may click Next with zero selections.

This is critical.

Never block progression because no checkbox was selected.

---

# 8. Progress indicator

Display a Typeform-style progress indicator.

Example:

```text
3 / 7
━━━━━━━━━━━━━━━━
```

or a subtle progress bar.

Progress must represent section progress.

For section index `i`:

```ts
progress = (i + 1) / totalSections
```

Do not make the progress indicator visually dominant.

It should be subtle and always understandable.

On the cover, do not show questionnaire progress.

---

# 9. Checkbox UX

Checkboxes should feel tactile and modern.

Requirements:

* large click target
* entire label should be clickable
* clear selected state
* keyboard accessible
* visible focus state
* works well on mobile
* minimum comfortable touch target around 44px

Do not use tiny native checkbox targets.

A selected option should have a clear but restrained visual state.

Example behavior:

```text
○ Je me suis réveillé fatigué

becomes

✓ Je me suis réveillé fatigué
```

The selection should animate subtly.

Do not use large bouncing animations.

---

# 10. Motion

Use smooth, restrained motion.

Preferred:

* opacity
* translateX
* slight scale
* progress bar interpolation

Section transitions should feel like a form moving forward.

Forward:

```text
current → left
next → from right
```

Backward:

```text
current → right
previous → from left
```

Keep animations short, approximately 180–300ms.

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled, remove transform-heavy transitions and use simple opacity changes.

Do not introduce a heavy animation library unless genuinely necessary.

Prefer CSS transitions or a very small focused motion dependency.

---

# 11. React architecture

Use modern React and Next.js App Router.

Keep the application data-driven.

Do NOT create seven manually duplicated page components.

Use reusable components such as:

```text
FormShell
CoverScreen
ProgressBar
SectionStep
CheckboxOption
StepNavigation
ResultScreen
```

Suggested structure:

```text
app/
  page.tsx
  admin/
    page.tsx
  api/
    responses/
      route.ts

components/
  form/
    FormShell.tsx
    CoverScreen.tsx
    ProgressBar.tsx
    SectionStep.tsx
    CheckboxOption.tsx
    StepNavigation.tsx
    ResultScreen.tsx

  admin/
    Dashboard.tsx
    MetricCard.tsx
    DomainBreakdown.tsx
    ScoreDistribution.tsx

lib/
  form/
    questionnaire.ts
    scoring.ts
    types.ts

  storage/
    submissions.ts
    blob.ts

  analytics/
    aggregate.ts

types/
  index.ts
```

Adapt the structure if the project already has conventions.

Do not create unnecessary abstraction layers.

---

# 12. Questionnaire data model

The questionnaire must be data-driven.

Example:

```ts
export type Choice = {
  id: string;
  label: string;
};

export type Section = {
  id: string;
  title: string;
  choices: Choice[];
};

export type Questionnaire = {
  id: string;
  title: string;
  sections: Section[];
};
```

The actual questionnaire should live in:

```text
lib/form/questionnaire.ts
```

Do not put questionnaire content inside JSX.

---

# 13. Response state

Represent selections as stable IDs.

Example:

```ts
type Answers = Record<string, string[]>;
```

Example:

```ts
{
  energie: ["energie-1", "energie-4"],
  metabolisme: ["metabolisme-2"],
  cerveau-humeur: [],
}
```

Do not store the full text of the answer as the primary state.

Store IDs.

This makes future questionnaire editing safer.

---

# 14. Scoring

Create a pure function:

```ts
calculateScore(answers, questionnaire)
```

It should:

1. iterate through all sections
2. count selected choice IDs
3. return totalSelected
4. calculate domain scores
5. calculate domain percentages
6. calculate result band

Example result:

```ts
{
  total: 17,
  maximum: 30,
  percentage: 56.67,
  band: "6-12",
  domains: {
    energie: {
      selected: 3,
      maximum: 5,
      percentage: 60
    }
  }
}
```

Do not calculate scores directly inside React rendering.

Keep scoring pure and independently testable.

---

# 15. Submission model

Every completed questionnaire should create a submission.

Example:

```ts
type Submission = {
  id: string;
  questionnaireId: string;
  createdAt: string;

  answers: Record<string, string[]>;

  totalSelected: number;

  domainScores: Record<
    string,
    {
      selected: number;
      maximum: number;
      percentage: number;
    }
  >;
};
```

Generate a unique ID server-side.

Never trust a client-provided score.

The server should recalculate the score from the answers before saving.

---

# 16. Persistence strategy

Do NOT introduce Supabase, Neon, Prisma, or another database for the first event version.

Keep persistence deliberately simple.

Use **Vercel Blob** as object storage.

Store each submission independently.

Example:

```text
submissions/{submissionId}.json
```

Do NOT maintain one giant mutable `responses.json` file.

Independent objects prevent multiple simultaneous submissions from overwriting each other.

Create a small storage abstraction:

```ts
saveSubmission(submission)
listSubmissions()
getSubmission(id)
```

The rest of the application must not know that Vercel Blob is being used.

This makes it possible to replace storage with Postgres/Supabase later without rewriting the questionnaire.

Use private storage for respondent data.

Never expose the Blob token to the browser.

The browser talks only to:

```text
POST /api/responses
```

The server handles persistence.

---

# 17. API

Create:

```text
POST /api/responses
```

The request should contain answers only.

The server must:

1. validate the request
2. validate section IDs
3. validate choice IDs
4. remove unknown IDs
5. calculate the score server-side
6. calculate domain metrics
7. create a submission ID
8. persist the submission
9. return the calculated result

Example response:

```json
{
  "submissionId": "...",
  "total": 17,
  "maximum": 30,
  "band": "6-12"
}
```

Never accept a client-supplied total as authoritative.

---

# 18. Error handling

The questionnaire should still feel polished if submission fails.

If saving fails:

Display a calm message:

```text
Impossible d'enregistrer votre réponse pour le moment.
Veuillez réessayer.
```

Provide:

```text
Réessayer
```

Do not silently lose responses.

Do not show raw server errors to respondents.

Log useful server-side diagnostic information.

---

# 19. Submission UX

When the respondent presses Submit:

1. disable submit button
2. show subtle loading state
3. prevent duplicate submissions
4. POST answers
5. wait for server confirmation
6. show ResultScreen

Do not show the result before the server successfully saves the response.

This guarantees that displayed results correspond to persisted responses.

---

# 20. Admin dashboard

Create:

```text
/admin
```

The first version does NOT need authentication if this is only being tested locally.

Before the event, add a simple authentication mechanism.

Do NOT expose submissions publicly.

The dashboard should show:

## Overview

```text
Répondants
247

Score moyen
9.7 / 30

Score médian
9 / 30

Taux de complétion
79%
```

## Score distribution

Show the number and percentage of respondents by score band.

## Domain breakdown

Show:

```text
Énergie
2.8 / 5
56%

Métabolisme
1.7 / 4
43%

Cerveau/humeur
3.1 / 6
52%

Muscles
1.4 / 4
35%

Digestion
2.5 / 4
63%

Hormones/température
1.9 / 4
48%

Immunité
1.2 / 3
40%
```

Use percentages when comparing domains because domains contain different numbers of choices.

## Individual choice frequency

Calculate how often each choice was selected.

Example:

```text
Je me suis réveillé fatigué       42%
J'ai du brouillard mental         38%
Je manque d'endurance             36%
...
```

Sort descending.

## Response table

Display:

```text
Date
Total
Énergie
Métabolisme
Cerveau/humeur
Muscles
Digestion
Hormones
Immunité
```

Do not expose individual answers publicly.

---

# 21. Analytics

Calculate these metrics:

### Overall

* respondent count
* average score
* median score
* minimum score
* maximum score
* score percentage
* score distribution
* result-band distribution

### Per domain

* number of respondents
* average selected choices
* average percentage
* median selected choices
* percentage of respondents selecting at least one choice
* percentage of respondents selecting at least 50% of choices

### Per choice

* number selected
* percentage selected

### Form behavior

For future use, structure the data model so we can later track:

* form started
* section viewed
* section completed
* time per section
* total completion time
* abandonment section

Do not overbuild event analytics for the first release unless implementation is trivial.

---

# 22. Privacy

This questionnaire contains health-related self-reported information.

Treat responses as sensitive.

Do not collect:

* name
* email
* phone
* IP address
* location
* unnecessary device identifiers

unless explicitly required.

For the initial event version, keep the questionnaire anonymous.

Do not expose individual responses in the public application.

Admin data must be protected.

Do not put submissions in localStorage as the source of truth.

---

# 23. Accessibility

Follow semantic HTML and WCAG principles.

Requirements:

* keyboard navigation
* visible focus
* proper labels
* accessible checkbox semantics
* buttons must be actual `<button>` elements
* appropriate heading hierarchy
* sufficient contrast
* reduced motion support
* screen-reader-friendly progress indication

The entire checkbox label must be clickable.

Do not rely only on color to communicate selection.

---

# 24. Mobile-first

Most event respondents will probably use phones.

Optimize for:

* iPhone Safari
* Android Chrome
* modern mobile browsers

The form should feel excellent at approximately:

```text
320px+
```

Use:

```css
min-height: 100svh;
```

where appropriate.

Avoid viewport-height bugs caused by mobile browser chrome.

Do not make the user pinch or zoom.

---

# 25. Desktop

On desktop, keep the form intentionally narrow.

A good target:

```text
max-width: 720px
```

The form should feel like a focused experience rather than a traditional dashboard.

Use a wider layout only for the admin dashboard.

---

# 26. URL structure

Use:

```text
/
```

for the questionnaire.

Use:

```text
/admin
```

for the dashboard.

If the application later supports multiple forms, evolve toward:

```text
/f/{formId}
/admin/forms/{formId}
```

Do not implement multi-form architecture now unless it is cheap.

However, keep the internal questionnaire model ready for it.

---

# 27. Branding

Keep branding configurable.

Do not hard-code colors deeply throughout components.

Use CSS variables:

```css
--background
--foreground
--muted
--border
--accent
--accent-foreground
```

The initial design should use a restrained neutral palette.

Avoid making the application look like a medical SaaS dashboard.

The questionnaire should feel calm and premium.

---

# 28. Typography

Use a clean modern sans-serif.

Prioritize:

* excellent readability
* generous line height
* large question titles
* comfortable checkbox labels

The main question/section title should be visually dominant.

Do not use overly small text.

---

# 29. Component principles

Components should be:

* small
* composable
* predictable
* accessible
* independently testable

Avoid:

* giant components
* deeply nested prop chains
* duplicated questionnaire markup
* business logic mixed into presentation
* unnecessary global state

Use local state where possible.

Use React context only if there is a demonstrated need.

Do not introduce Redux.

---

# 30. State management

The questionnaire only needs:

```text
currentStep
answers
submissionStatus
result
```

Keep it local to the form experience.

Prefer:

```ts
useState
useReducer
```

over an external state-management library.

A reducer is appropriate if the interaction logic becomes complex.

---

# 31. Performance

The questionnaire is small.

Do not prematurely optimize.

However:

* avoid unnecessary re-renders
* use stable keys
* use memoization only where justified
* keep client components limited
* keep server components server-side where possible
* do not ship unnecessary libraries

The interactive questionnaire will necessarily be a client component.

The admin dashboard can use server-side data fetching where appropriate.

---

# 32. Next.js architecture

Use the current Next.js App Router.

Keep server-side storage access in server-only modules.

Never import storage credentials into client components.

Use Route Handlers for the submission endpoint.

Follow Next.js conventions for `app/`, layouts, metadata, loading and error handling.

Use the current stable Next.js release available when the project is initialized.

---

# 33. Security

Minimum requirements:

* validate every submission server-side
* never trust client scores
* never expose storage credentials
* sanitize/validate IDs
* reject malformed payloads
* prevent duplicate submissions where practical
* rate-limit the submission endpoint if practical
* protect admin route

Do not rely on obscurity for `/admin`.

---

# 34. Duplicate submissions

For the first version, do not attempt sophisticated identity tracking.

A respondent may submit more than once.

Treat every successful submission as a separate response.

Later we can add:

* respondent IDs
* event IDs
* session IDs
* deduplication

Do not collect personally identifying information merely to prevent duplicates.

---

# 35. Result calculation

Implement:

```ts
type ResultBand = {
  id: string;
  min: number;
  max?: number;
  title: string;
  description: string;
};
```

Initial bands:

```ts
[
  {
    id: "normal",
    min: 0,
    max: 5,
    title: "0-5 cases cochées",
    description:
      "fluctuations normales, surveiller l'hygiène de vie."
  },
  {
    id: "probable",
    min: 6,
    max: 12,
    title: "6-12 cases cochées",
    description:
      "déséquilibre mitochondrial probable; agir sur l'alimentation, le sommeil, la lumière, le mouvement."
  },
  {
    id: "strong",
    min: 13,
    title: "Plus de 12 cases cochées",
    description:
      "suspicion forte de dysfonctionnement mitochondrial, Consulter un professionnel formé + réaliser un bilan."
  }
]
```

Keep this configuration separate from rendering.

---

# 36. Important content correction

The questionnaire has 30 total choices.

Do not refer to:

```text
28
```

anywhere in the application.

The correct maximum is:

```text
30
```

Therefore the result screen should say:

```text
17 cases cochées sur 30.
```

not:

```text
17 cases cochées sur 28.
```

---

# 37. Dashboard interpretation

The dashboard should be descriptive, not diagnostic.

Good:

```text
42% des répondants ont sélectionné au moins un symptôme dans la catégorie Énergie.
```

Good:

```text
La moyenne de sélection dans Énergie est de 2.8 / 5.
```

Avoid automatically generating medical conclusions such as:

```text
42% ont une dysfonction mitochondriale.
```

The data measures responses to this questionnaire, not confirmed medical diagnoses.

---

# 38. Testing

Before shipping, test:

### Selection

* zero selections
* one selection
* all selections
* multiple selections

### Navigation

* next
* previous
* first section
* last section
* returning to a previous section preserves selections

### Scoring

Test:

```text
0 → 0
1 → 1
30 → 30
```

and several mixed combinations.

### Submission

* successful submission
* failed submission
* double click on submit
* malformed request
* server storage failure

### Responsive

Test:

* 320px mobile
* 375px mobile
* 390px mobile
* 768px tablet
* desktop

### Accessibility

Test keyboard-only navigation.

Test screen reader semantics.

Test reduced motion.

---

# 39. Deployment

Target deployment:

**Vercel**

Use environment variables for storage configuration.

Never commit secrets.

Before production:

```bash
npm run lint
npm run build
```

Both must pass.

Do not ship with TypeScript errors.

Do not disable linting or type checking to make the deployment succeed.

---

# 40. Event-day reliability

Prioritize reliability over feature count.

Before the event:

1. Submit a real test response.
2. Confirm it appears in the dashboard.
3. Confirm the score is correct.
4. Test from a phone.
5. Test from a second phone/network.
6. Test multiple simultaneous submissions.
7. Verify the admin dashboard loads.
8. Verify the result screen appears after submission.
9. Verify storage permissions.
10. Verify production environment variables.

Keep the questionnaire available even if the dashboard experiences a problem.

A dashboard failure must not prevent questionnaire submission.

---

# 41. Future architecture

This project may eventually become a Typeform/Tally-style form builder.

Do not implement that now.

However, make current architecture compatible with future concepts:

```text
Form
 ├── Branding
 ├── Theme
 ├── Steps
 │    ├── Question
 │    ├── Question
 │    └── Question
 ├── Logic
 ├── Result
 └── Responses
```

Future features may include:

* form builder
* drag and drop
* question types
* conditional logic
* scoring
* custom themes
* custom domains
* multiple forms
* workspaces
* team members
* analytics
* exports
* authentication
* respondent identifiers

Do not build those features today.

---

# 42. Engineering philosophy

Act as a senior frontend engineer and software engineer.

Priorities:

1. Correctness
2. Simplicity
3. Accessibility
4. Maintainability
5. Performance
6. Visual polish

Do not add dependencies without a reason.

Do not over-engineer.

Do not create abstractions before they are useful.

Prefer boring, reliable solutions.

Keep business logic separate from UI.

Keep questionnaire content separate from components.

Keep storage behind an abstraction.

Keep server secrets on the server.

Build the smallest version that can become the foundation for a much larger form product.

---

# 43. Definition of done

The project is ready when:

* questionnaire loads
* cover screen works
* logo can be configured
* progress bar works
* all 7 sections work
* zero selections are allowed
* multiple selections work
* previous/next navigation works
* selections persist when going backwards
* score is calculated correctly
* maximum is 30
* result screen works
* response is persisted
* admin dashboard shows aggregate metrics
* individual response data is protected
* mobile UX is polished
* keyboard navigation works
* reduced motion works
* production build passes
* no TypeScript errors
* no console errors
* production deployment has been tested

Do not stop at a static mockup.

Implement the complete working flow end-to-end.