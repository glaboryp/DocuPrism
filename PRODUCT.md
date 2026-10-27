# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Nuxt 4 (Vue 3), TypeScript, Tailwind CSS 3, `@vite-pwa/nuxt`. Existing codebase; no migration.

## Users

People who work with long documents and cannot or will not send them to a server: students with papers, professionals with reports and contracts, researchers with source material, and anyone handling confidential text. They arrive on desktop Chrome 148+ (or a recent Edge) with a document already open elsewhere, often on a slow or unavailable connection, and want the gist without an account, an upload, or a wait for a server.

## Product Purpose

DocuPrism summarizes and answers questions about a document entirely on the device using Chrome's Built-in AI (Gemini Nano). Success means the visitor reads a useful summary within seconds of pasting a document, understands that nothing left the machine, and can find that reading again later without a network.

## Positioning

The analysis, the chat and the history all run locally, and the app says so with behaviour rather than a badge: no upload path exists, the history is local storage, and sensitive content is detected before it is persisted. A neighbouring product can copy the feature list but not the absence of a server.

## Operating Context

- Paste text or open TXT, MD, PDF or DOCX (10 MB limit).
- Choose summary type (TL;DR, Key points, Teaser, Headline), length and format; read the result; optionally chat with the same document.
- Analyses are written to a local history (max 10, about 5 MB) and can be copied, revisited or deleted.
- The app is an installable PWA and keeps working offline once the model is on the device.
- The on-device model needs desktop Chrome 148+ (or recent Edge), roughly 22 GB of free disk and a capable GPU; the chat needs the Prompt API.
- Keyboard shortcuts: Ctrl+Enter summarize, Ctrl+K clear, Ctrl+Shift+C copy, Alt+1/2 switch summary/chat.
- The interface is English; there is no localization layer.

## Capabilities and Constraints

- Summarizer, Prompt API and Language Detector are feature-detected; older browsers keep summaries when possible and report the chat as unavailable.
- Semantic pre-checks flag poor extractions and route small talk away from document context; sensitive findings (emails, keys, passwords, Luhn-valid card numbers) ask before saving.
- No backend, no analytics, no accounts, no third-party runtime services. Fonts must be self-hosted so offline still works.
- `@tailwindcss/typography` is not installed; reading styles are part of this design system, not a plugin dependency.
- Summary output is sanitized markdown rendered with `v-html`.

## Brand Commitments

- Name: DocuPrism. The prism is the product's own object: white light entering, meaning separated out.
- Privacy is a product promise, not a marketing tone. Copy never overclaims ("private" means no network path).
- On 2026-10-26 the owner approved replacing the incumbent blue/glass interface with the "Reading desk" identity, including a new prism monogram, paper/ink palette and self-hosted type. The legacy raster icon may be retired.

## Evidence on Hand

- Working app in this repository; 57 unit tests and 4 Playwright navigation tests.
- `public/ai-sample-paper.pdf` as a real document for manual testing.
- `README.md` documents the Chrome requirements, limitations and privacy model.
- No customers, testimonials, press, benchmarks or usage statistics exist; none may be invented.

## Product Principles

1. **Show the local path.** Every claim of privacy is matched by visible behaviour: no upload, no account, local history, offline.
2. **The document is the interface.** The text and its reading carry the screen; chrome recedes.
3. **One decision forward.** The primary action is always the next useful one, named for what it does.
4. **Reveal the machine's work.** Quality warnings, redaction and model state are shown plainly at the moment they matter.
5. **Quiet precision over decoration.** Space, type and tone do the work; effects never substitute for substance.

## Accessibility & Inclusion

WCAG 2.2 AA. Full keyboard operation with visible focus, one `h1` per page, real landmarks and labelled controls, 44 px touch targets, contrast checked in both themes, reduced-motion fallbacks, and no meaning carried by colour alone.
