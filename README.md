# DocuPrism 🔮

A privacy-first, offline-capable PWA for on-device document analysis using the Chrome Built-in AI API.

*Project submitted for the Google Chrome Built-in AI Challenge 2025.*

---

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://docuprism.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Chrome AI](https://img.shields.io/badge/Chrome-Built--in%20AI-orange?style=for-the-badge&logo=google-chrome)](https://developer.chrome.com/docs/ai/built-in)
[![Tests](https://img.shields.io/badge/tests-64%2F64%20passing-brightgreen?style=for-the-badge)](tests/README.md)

> **Note:** This application requires desktop Chrome 148+ or Microsoft Edge. The Summarizer and Language Detector APIs are stable since Chrome 138, and the Prompt API used by the chat is stable since Chrome 148. No flags are required. Other Chromium browsers (Brave, Opera, Vivaldi) keep the API names but ship no model, so DocuPrism reports them as unsupported. See [Setup Instructions](#-getting-started-running-locally) below.

## 🎯 The Problem

In the age of AI, powerful language models have become essential for productivity. However, they come with significant drawbacks:
* **Connectivity Dependence:** They are useless without a stable internet connection.
* **Privacy Risks:** Users must upload potentially sensitive or proprietary documents to third-party servers.
* **Cost:** API calls and server infrastructure can be expensive for developers and, ultimately, for users.

## ✨ The Solution: DocuPrism

**DocuPrism** solves these problems by leveraging Google Chrome's new built-in, on-device AI. It's a Progressive Web App (PWA) that brings powerful document analysis capabilities directly into your browser, ensuring your data never leaves your machine.

It's fast, secure, and works anytime, anywhere—even on a plane.

## 🚀 Key Features

### Core Functionality
* **✨ On-Device Summarization:** Instantly get the gist of long texts using the built-in `Summarizer API`
  - Multiple summary types: TL;DR, Key Points, Teaser, Headline
  - Configurable length: Short, Medium, Long
  - Format options: Plain Text or Markdown
* **📁 File Upload Support:** Load documents directly from your device
  - Drag & drop interface
  - Support for TXT and MD files (PDF/DOCX coming soon)
  - File size validation and error handling
* **📜 Analysis History:** View and manage your saved document analyses
  - Local storage with offline access
  - Search and filter capabilities
  - Export and share summaries
* **🌐 Multi-language Support:** Automatic language detection and summary generation
  - Supports 40+ languages
  - Maintains original language in summaries

### Privacy & Performance
* **🔒 Privacy by Design:** All processing happens locally. Your documents are never uploaded, ensuring 100% confidentiality
* **✈️ Offline-First:** As a PWA, DocuPrism is fully functional without an internet connection
* **📦 Installable:** Install it on your desktop or mobile device for a native-app-like experience
* **⚡ Fast & Efficient:** No server round-trips, instant results

### User Experience
* **🎨 Modern UI:** Beautiful, responsive design with dark mode support
* **🔔 Smart Notifications:** Toast notifications for all actions
* **♿ Accessible:** ARIA labels and keyboard navigation support
* **📱 Responsive:** Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

* **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **PWA / Offline Capability:** [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/)
* **Core AI Engine:** Google Chrome's Built-in AI APIs:
  * [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api): For the core text summarization feature.
  * [Prompt API](https://developer.chrome.com/docs/ai/prompt-api): To power the interactive "Chat with your Document" functionality.
  * [Language Detection API](https://developer.chrome.com/docs/ai/language-detection): Used internally to ensure summaries are generated in the source text's language.

## 🔗 Links

* **Live Demo:** https://docuprism.vercel.app/
* **GitHub Repository:** https://github.com/glaboryp/DocuPrism
* **Video Walkthrough:** *(Coming soon)*

## ⚙️ Getting Started (Running Locally)

To run this project on your local machine, please follow these steps:

**Prerequisites:**
* Node.js (LTS version)
* `pnpm` package manager
* A compatible version of Google Chrome that supports the Built-in AI APIs.

**Installation & Setup:**

1.  Clone the repository:
    ```bash
    git clone https://github.com/glaboryp/DocuPrism.git
    ```

2.  Navigate to the project directory:
    ```bash
    cd DocuPrism
    ```

3.  Install the dependencies:
    ```bash
    pnpm install
    ```

4.  Run the development server:
    ```bash
    pnpm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

**Chrome Built-in AI requirements:**

To use DocuPrism, you need a Chrome version with the Built-in AI APIs and the on-device model installed:

1. **Use Chrome 148 or newer** (desktop, any channel)
   - Requires ~22 GB of free disk space and a GPU with >4 GB VRAM (or 16 GB RAM and 4+ CPU cores)
   - Chrome 138+ is enough for summaries: the Summarizer and Language Detector APIs are stable since Chrome 138
   - The chat needs Chrome 148+, where the Prompt API became stable

2. **No flags required**
   - All the APIs DocuPrism uses ship enabled by default in current Chrome
   - If the model is still missing, Chrome downloads it on first use
   - On older Chrome versions the chat reports the Prompt API as unsupported and summaries keep working

3. **Verify Installation**
   - Open DevTools Console
   - Type: `await Summarizer.availability()` and `await LanguageModel.availability()`
   - Should return `"available"` (or `"downloadable"` if the model still needs to be downloaded)
   - Model status and errors: `chrome://on-device-internals`

**Microsoft Edge (Windows/macOS):**
   - On recent Stable builds both APIs are enabled by default
   - On older builds (138+) the Summarizer works out of the box and the chat needs `edge://flags` → **Prompt API for on-device language model** set to **Enabled**, then a restart
   - Model status and device performance class (must be High or greater): `edge://on-device-internals`

4. **Other Chromium browsers**
   - Brave, Opera and Vivaldi expose `window.Summarizer` in some builds but do not ship the Gemini Nano component; creating a summarizer fails. DocuPrism checks the browser before trusting the API, shows **Model unavailable** in the masthead and disables Summarize.

5. **Download AI Model (if needed)**
   - The first time you use the app, Chrome may need to download the Gemini Nano model
   - This happens automatically when you click "Summarize"
   - Model size: ~1.5GB (one-time download)

**Experimental: Multi-Token Prediction (MTP)**

Chrome Canary can speed up warm decode throughput by +20–30% with on-device speculative decoding (`chrome://flags/#on-device-model-speculative-decoding`). MTP only runs on greedy sessions:
   - Summaries benefit automatically: the Summarizer is created without sampling overrides, so it uses greedy sampling by default
   - The chat creates its Prompt API session with `samplingMode: "most-predictable"` so it is MTP-eligible (the legacy `temperature`/`topK` options are Extensions-only and deprecated on the web)
   - Note: on stable Chrome, sampling parameters are gated behind the [Sampling Parameters origin trial](https://developer.chrome.com/origintrials). Without the token the option is ignored and the default "balanced" sampling applies, so the chat simply behaves as before

**Available Scripts:**

```bash
# Development
pnpm run dev          # Start development server

# Testing
pnpm test             # Run unit tests (57 tests)
pnpm test:ui          # Interactive test UI
pnpm test:coverage    # Coverage reports
pnpm test:e2e         # Run E2E tests (4 tests)
pnpm test:e2e:ui      # Playwright UI mode

# Production
pnpm run build        # Build for production
pnpm run generate     # Generate static site
pnpm run preview      # Preview production build

# Maintenance
pnpm run postinstall  # Prepare Nuxt
```

## 🏗️ Project Structure

```
DocuPrism/
├── app.vue                 # Nuxt app entry point
├── assets/                 # Static assets (CSS, images)
├── components/             # Vue components
│   ├── AIRequirementsModal.vue
│   ├── ChatInterface.vue  # Chat with document (Prompt API)
│   ├── DevOfflineInfo.vue
│   ├── FileUploader.vue
│   ├── MobileMenu.vue
│   ├── PWAInstallPrompt.vue
│   ├── SensitiveDataDialog.vue # Confirmation before saving sensitive data
│   ├── ThemeToggle.vue
│   └── ToastContainer.vue
├── composables/            # Vue composables
│   ├── useChromeAI.ts     # Summarizer + Language Detector integration
│   ├── useChromePrompt.ts # Prompt API chat sessions
│   ├── useKeyboardShortcuts.ts
│   ├── useOfflineStorage.ts
│   ├── useSemanticGates.ts # Quality + sensitive-data pre-checks
│   ├── useSummaryCache.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── config/                 # Configuration files
│   └── constants.ts
├── layouts/                # Nuxt layouts
│   └── default.vue
├── middleware/             # Route middleware
│   └── ignore-sw.global.ts
├── pages/                  # Nuxt pages
│   ├── index.vue          # Main analysis page
│   └── history.vue        # History page
├── plugins/                # Nuxt plugins
│   └── offline-cache.client.ts
├── public/                 # Public static files
├── sections/               # Page sections
│   ├── FooterView.vue
│   ├── HeaderView.vue
│   └── SummaryView.vue
├── types/                  # TypeScript types
│   ├── chrome-ai.ts
│   └── storage.ts
├── utils/                  # Utility functions
│   ├── browser.ts
│   ├── decisionModel.ts   # Optional Decisions API bridge
│   ├── documentParser.ts
│   ├── errorHandler.ts
│   ├── markdownFormatter.ts
│   ├── sanitizer.ts
│   ├── semanticChecks.ts  # Local quality, PII and routing heuristics
│   └── validators.ts
├── tests/                  # Test suite
│   ├── composables/        # Unit tests
│   │   ├── useChromeAI.test.ts
│   │   ├── useChromePrompt.test.ts
│   │   ├── useKeyboardShortcuts.test.ts
│   │   ├── useOfflineStorage.test.ts
│   │   ├── useSemanticGates.test.ts
│   │   ├── useSummaryCache.test.ts
│   │   └── useToast.test.ts
│   ├── utils/              # Unit tests for utilities
│   │   └── semanticChecks.test.ts
│   ├── e2e/                # E2E tests
│   │   └── basic-navigation.spec.ts
│   ├── setup.ts            # Test setup & mocks
│   └── README.md           # Testing documentation
└── nuxt.config.ts         # Nuxt configuration
```

## 🧠 Semantic pre-checks

Two cheap on-device checks run before the generative model gets involved:

- **Document quality** (`utils/semanticChecks.ts`): flags empty or garbled extractions, code/table dumps and placeholder repetition. The UI shows a warning but never blocks summarizing, since the user may know better.
- **Sensitive data**: emails, API keys, private keys, passwords and card numbers (Luhn-checked) are detected before an analysis is saved to local history. Previews are redacted and the app asks for confirmation instead of persisting silently.

Chat is routed too: obvious small talk (`hi`, `thanks`, `hola`) skips the document context, while anything mentioning the document keeps it. The check is deliberately conservative so a misclassification cannot drop context from a real question.

When Chrome exposes the experimental Decisions API (`window.DecisionModel`, behind `chrome://flags/#ai-decisions-api` in Canary), `utils/decisionModel.ts` runs the same questions through it and layers the confidence-gated answers on top of the heuristics. The API is still an intent to prototype, so any failure falls back to the local checks and stable Chrome behaves exactly as before.

## 🧪 Testing

DocuPrism includes a comprehensive test suite to ensure reliability and quality:

### Unit Tests (Vitest)
- ✅ **57 tests** covering composables and utilities
- ✅ **100% passing** with proper isolation
- ✅ Coverage reports available

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage
```

### E2E Tests (Playwright)
- ✅ **4 tests** for basic navigation
- ✅ Automated browser testing
- ✅ CI-ready configuration

```bash
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Interactive mode
```

**Test Coverage:**
- `useToast` - Toast notifications (7 tests)
- `useOfflineStorage` - Local storage (8 tests)
- `useSummaryCache` - Summary caching (10 tests)
- `useChromeAI` - Summarizer integration (2 tests)
- `useChromePrompt` - Prompt API session, sampling and context routing (4 tests)
- `useKeyboardShortcuts` - Keyboard navigation (4 tests)
- `semanticChecks` - Quality, PII and routing heuristics (15 tests)
- `useSemanticGates` - Heuristics + Decisions API fallback (7 tests)
- Basic navigation - Page routing (4 tests)

See [`tests/README.md`](tests/README.md) for detailed testing documentation.

## 🎯 Use Cases

- **Students:** Quickly summarize research papers, articles, and study materials
- **Professionals:** Get key points from long reports, emails, and documents
- **Researchers:** Analyze multiple documents while maintaining privacy
- **Content Creators:** Extract main ideas from source materials
- **Anyone:** Who values privacy and wants AI without internet dependency

## 🔒 Privacy & Security

DocuPrism is built with privacy as a core principle:

- ✅ **100% Local Processing:** All AI operations run on your device
- ✅ **No Data Collection:** We don't collect, store, or transmit any user data
- ✅ **No Analytics:** No tracking, no cookies, no third-party scripts
- ✅ **No Server Calls:** Works completely offline after installation
- ✅ **Open Source:** Full transparency - inspect the code yourself
- ✅ **Local Storage Only:** Your history stays on your device

## 🚀 Roadmap

### Completed ✅
- [x] On-device text summarization
- [x] Multiple summary types and formats
- [x] File upload support (TXT, MD)
- [x] Analysis history with local storage
- [x] Multi-language support
- [x] Dark mode
- [x] PWA with offline support
- [x] Toast notifications
- [x] Responsive design
- [x] PDF file support
- [x] DOCX file support

### In Progress 🚧
- [ ] Export summaries (PDF, TXT, MD)
- [ ] Chat with document (Prompt API)
- [ ] Batch processing

### Planned 📋
- [ ] Advanced search in history
- [ ] Custom summary templates
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimizations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Resources

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Summarizer API Guide](https://developer.chrome.com/docs/ai/summarizer-api)
- [Prompt API Guide](https://developer.chrome.com/docs/ai/prompt-api)
- [Language Detector API Guide](https://developer.chrome.com/docs/ai/language-detection)
- [Nuxt 3 Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)

## 💬 Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/glaboryp/DocuPrism/issues) on GitHub
- Check the [Chrome AI documentation](https://developer.chrome.com/docs/ai/built-in)
- Review the [setup instructions](#-getting-started-running-locally)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Chrome team for the Built-in AI APIs
- Nuxt and Vue communities
- All contributors and testers

---

**Made with ❤️ for the Google Chrome Built-in AI Challenge 2025**

*Empowering privacy-first AI, one document at a time.*