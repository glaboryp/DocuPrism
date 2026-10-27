---
name: DocuPrism
description: On-device document analysis on a reading desk of paper and ink.
colors:
  ground: "#EFEFEB"
  sheet: "#F8F8F4"
  inset: "#E7E7E1"
  ink: "#171614"
  ink-muted: "#5B5B55"
  rule: "#D6D6CF"
  accent: "#1B3FD8"
  danger: "#A3231C"
  success: "#1F6B3A"
  ground-dark: "#141413"
  sheet-dark: "#1C1C19"
  inset-dark: "#252521"
  ink-dark: "#EDECE7"
  ink-muted-dark: "#A8A8A0"
  rule-dark: "#34342E"
  accent-dark: "#93A9FF"
  danger-dark: "#F08A80"
  success-dark: "#7FC79B"
typography:
  display:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.2vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  reading:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  ui:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  meta:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.005em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#2E2C27"
    textColor: "{colors.sheet}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 8px"
    height: "44px"
  field:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
    height: "40px"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "28px"
---

# Design System: DocuPrism

## Overview

**Creative North Star: "The reading desk"**

DocuPrism is a desk, not a dashboard. Two pages sit side by side: the document the visitor brought, and the reading the device produces. The desk is a low-chroma stone paper; the pages are a half-step lighter; the ink is warm black. Nothing floats, nothing glows, nothing blurs. The only colour on the desk is the prism's blue, and it appears where the machine has just written something or where the keyboard is.

The interface is built for a long reading followed by a short decision, on a desktop, often offline. It should feel like a well-set working document: generous margins, one large question, small honest metadata, controls that look like controls. The old glass/blue SaaS language is the explicit anti-reference.

**Key characteristics:**
- Paper ground, sheet pages, square corners, zero elevation.
- Literata for everything that is read; IBM Plex Sans for everything that is operated.
- One accent, under 3% of the screen, reserved for generated content and focus.
- Text-first composition; no photography, illustration or decorative iconography.
- Density is calm rather than airy: 64 px rows, 44 px controls, 24 px inner padding.

## Colors

A two-temperature neutral desk with a single ink-blue signal. Warmth comes from the paper tone, never from cream or terracotta.

### Primary
- **Prism Ink** (#1B3FD8): focus rings, the generated-content mark, the loading beam, the storage meter. It never fills a large surface and never sets running text.

### Neutral
- **Archival Paper** (#EFEFEB): the page ground in light mode, a neutral stone rather than a yellow cream.
- **Sheet** (#F8F8F4): document and reading pages; one tone step above the ground, no border.
- **Inset** (#E7E7E1): fields, hovers and zones sunk into a page.
- **Press Ink** (#171614): all running text, headings and the primary action in light mode.
- **Pencil** (#5B5B55): metadata, captions, placeholders and secondary prose.
- **Rule** (#D6D6CF): functional lines only — form fields, list separators, real tables.

Dark mode inverts the same roles: ground #141413, sheet #1C1C19, ink #EDECE7, muted #A8A8A0, accent #93A9FF. The metaphor is a desk lamp at night, not a neon product.

**The One Signal Rule.** Blue marks the machine's output and the current focus, nothing else. If a screen needs a second colour to explain itself, the composition is wrong.

## Typography

**Display Font:** Literata Variable (fallback Literata, Georgia, serif)
**Body Font:** IBM Plex Sans Variable (fallback IBM Plex Sans, system-ui, sans-serif)

**Character:** Literata is the voice of the document — a reading serif with sturdy serifs and a slightly warm rhythm. Plex Sans is the instrument — plain, technical, legible at 13 px. Neither is used decoratively; the serif never appears in navigation, labels or buttons, and the sans never sets a paragraph of reading.

### Hierarchy
- **Display** (400, clamp 36–52 px, 0.98): the one question each screen answers, in `h1`; maximum two lines at any width.
- **Title** (500, 28 px, 1.15): document, reading and section titles.
- **Reading** (400, 19 px, 1.65): document text, summaries and assistant messages; 66–70ch measure.
- **UI** (400/500, 16 px, 1.5): navigation, buttons, fields, tabs, supporting sentences.
- **Meta** (400, 13 px, 1.4): counts, dates, model state, captions; tabular figures where numbers align.

No uppercase tracked labels, no monospace outside real code, no italic or coloured word inside a headline.

## Layout

- Max width 1400 px, with equal outer margins `clamp(20px, 4vw, 56px)` on every section.
- 12-column grid, 24 px gutters. Home is 7 columns of document to 5 columns of reading; the primary action sits on that seam.
- The masthead pairs the `h1` across 8 columns with the supporting sentence across 4, aligned to the same baseline.
- Vertical rhythm: 24 px inside a page, 32–48 px between blocks, 96–120 px between major sections. App screens are denser than marketing pages.
- Mobile is one composition, not a squeezed desktop: masthead, document, options in 2×2, full-width action, reading, chat. Nothing important hides behind a tab.
- History is a list of 64 px rows with fixed metadata columns, never a card grid.

## Elevation & Depth

Everything is flat. Surfaces separate by a tone step and space; there are no shadows at rest, no blur, no glass and no gradients. The only elements allowed to sit above the page are the scrim and sheet of a dialog, and the toast strip; even those are flat fills, distinguished by a scrim and square edges, not by shadow.

## Shapes

Square. Radii are 0 on buttons, fields, pages, sheets, dialogs, toasts and icons. The form language is a printed page and a straight rule. Circles appear only where the browser draws them (radio inputs), never as decoration. Lines are 1 px only for real form fields, list separators and tables; 2 px is reserved for focus, active tabs and the redaction/error edge.

## Components

- **Primary button:** ink fill, sheet text, 44 px, 0 radius, sentence case, named for the action ("Summarize", "Copy", "Install"). Hover steps the ink tone; focus draws a 2 px accent outline with 2 px offset.
- **Secondary action:** text at 15 px/500 with a 44 px hit area, no box, no underline until hover.
- **Field:** inset fill or 1 px rule, 0 radius, 40 px, label above at 13 px; focus uses a 2 px accent border, never a glow.
- **Tabs:** text plus a 2 px solid ink underline on the active item. No pills, no counts, no icons.
- **Page/sheet:** sheet tone, 28–32 px padding, no border, no shadow. Two pages may sit side by side; they are never called cards.
- **Reading block:** Literata 19 px, headings at title/UI scale, code in mono, lists with real markers, blockquotes with a 2 px ink left edge.
- **List row:** 64 px, 1 px rule between rows, metadata in 13 px tabular figures, actions revealed on hover/focus but always reachable by keyboard.
- **Status:** words, not badges. "Ready", "Checking…", "Not available — Requirements". A 6 px filled square in `success` or `danger` may precede it; never a pill.
- **Toast:** ink strip, sheet text, square, bottom-left, 4 s, `aria-live`, no icon.
- **Dialog:** right-side sheet 520–640 px on desktop, bottom sheet on mobile, flat 40% scrim, Esc closes, focus enters and returns.

## Do's and Don'ts

**Do**
- Let the document and the summary be the largest things on the screen.
- Write plain, specific copy; name the action; say what runs where.
- Keep one `h1` per page and give every section a heading.
- Use tone, space and scale to separate; use the accent only for generated content and focus.
- Check both themes, keyboard-only use, 200% zoom and reduced motion.

**Don't**
- Reintroduce gradients, glass, backdrop blur, drop shadows, rounded cards or coloured badges.
- Use emoji, decorative icons, icon-topped headings, eyebrows or tiny tracked uppercase labels.
- Set running text below 16 px or wider than 75ch.
- Use cream + terracotta, violet/indigo, or a monospace voice outside code.
- Add photography, stock imagery or fake dashboards; this product's imagery is the document itself.
- Animate content into legibility; every motion has a reduced-motion fallback that keeps the content.
