# DocuPrism 🔮

A privacy-first, offline-capable PWA for on-device document analysis using the Chrome Built-in AI API.

*Project submitted for the Google Chrome Built-in AI Challenge 2025.*

---

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://docuprism.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Chrome AI](https://img.shields.io/badge/Chrome-Built--in%20AI-orange?style=for-the-badge&logo=google-chrome)](https://developer.chrome.com/docs/ai/built-in)
[![Tests](https://img.shields.io/badge/tests-24%2F24%20passing-brightgreen?style=for-the-badge)](tests/README.md)

> **Note:** This application requires Chrome Canary/Dev (v127+) with specific flags enabled. See [Setup Instructions](#-getting-started-running-locally) below.

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
  * [Translator API](https://developer.chrome.com/docs/ai/translator-api): To provide multilingual support for summaries.
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

**Enabling Chrome Built-in AI:**

To use DocuPrism, you need to enable Chrome's Built-in AI features:

1. **Use Chrome 138 or newer** (desktop, any channel)
   - Requires ~22 GB of free disk space and a GPU with >4 GB VRAM (or 16 GB RAM and 4+ CPU cores)

2. **Enable Required Flags (chat feature only)**
   - The Summarizer and Language Detector APIs are stable since Chrome 138 and need no flags
   - The Prompt API (used by the chat) is not yet stable on the web. Navigate to `chrome://flags` and enable:
     - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
     - `#prompt-api-for-gemini-nano` → **Enabled**
   - Relaunch Chrome

3. **Verify Installation**
   - Open DevTools Console
   - Type: `await Summarizer.availability()` and `await LanguageModel.availability()`
   - Should return `"available"` (or `"downloadable"` if the model still needs to be downloaded)
   - Model status and errors: `chrome://on-device-internals`

**Microsoft Edge (Canary or Dev 138+, Windows/macOS):**
   - The Summarizer API is enabled by default
   - For the chat, enable `edge://flags` → **Prompt API for on-device language model** and restart
   - Model status and device performance class (must be High or greater): `edge://on-device-internals`

4. **Download AI Model (if needed)**
   - The first time you use the app, Chrome may need to download the Gemini Nano model
   - This happens automatically when you click "Summarize"
   - Model size: ~1.5GB (one-time download)

**Available Scripts:**

```bash
# Development
pnpm run dev          # Start development server

# Testing
pnpm test             # Run unit tests (19 tests)
pnpm test:ui          # Interactive test UI
pnpm test:coverage    # Coverage reports
pnpm test:e2e         # Run E2E tests (5 tests)
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
├── app/                    # Main app entry point
├── assets/                 # Static assets (CSS, images)
├── components/             # Vue components
│   ├── AIRequirementsModal.vue
│   ├── DevOfflineInfo.vue
│   ├── FileUploader.vue
│   ├── PWAInstallPrompt.vue
│   ├── ThemeToggle.vue
│   └── ToastContainer.vue
├── composables/            # Vue composables
│   ├── useChromeAI.ts     # Chrome AI integration
│   ├── useOfflineStorage.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── config/                 # Configuration files
│   └── constants.ts
├── layouts/                # Nuxt layouts
│   └── default.vue
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
│   └── errorHandler.ts
├── tests/                  # Test suite
│   ├── composables/        # Unit tests
│   │   ├── useToast.test.ts
│   │   ├── useOfflineStorage.test.ts
│   │   └── useKeyboardShortcuts.test.ts
│   ├── e2e/                # E2E tests
│   │   └── basic-navigation.spec.ts
│   ├── setup.ts            # Test setup & mocks
│   └── README.md           # Testing documentation
└── nuxt.config.ts         # Nuxt configuration
```

## 🧪 Testing

DocuPrism includes a comprehensive test suite to ensure reliability and quality:

### Unit Tests (Vitest)
- ✅ **19 tests** covering all composables
- ✅ **100% passing** with proper isolation
- ✅ Coverage reports available

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage
```

### E2E Tests (Playwright)
- ✅ **5 tests** for basic navigation
- ✅ Automated browser testing
- ✅ CI-ready configuration

```bash
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Interactive mode
```

**Test Coverage:**
- `useToast` - Toast notifications (7 tests)
- `useOfflineStorage` - Local storage (8 tests)
- `useKeyboardShortcuts` - Keyboard navigation (4 tests)
- Basic navigation - Page routing (5 tests)

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
- [Chrome AI Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/2971108594873614337)
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