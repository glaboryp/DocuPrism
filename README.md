# DocuPrism 🔮

A privacy-first, offline-capable PWA for on-device document analysis using the Chrome Built-in AI API.

*Project submitted for the Google Chrome Built-in AI Challenge 2025.*

---

![DocuPrism Demo GIF](https://[ENLACE-A-TU-GIF-DE-DEMO].gif)

## 🎯 The Problem

In the age of AI, powerful language models have become essential for productivity. However, they come with significant drawbacks:
* **Connectivity Dependence:** They are useless without a stable internet connection.
* **Privacy Risks:** Users must upload potentially sensitive or proprietary documents to third-party servers.
* **Cost:** API calls and server infrastructure can be expensive for developers and, ultimately, for users.

## ✨ The Solution: DocuPrism

**DocuPrism** solves these problems by leveraging Google Chrome's new built-in, on-device AI. It's a Progressive Web App (PWA) that brings powerful document analysis capabilities directly into your browser, ensuring your data never leaves your machine.

It's fast, secure, and works anytime, anywhere—even on a plane.

## 🚀 Key Features

* **✨ On-Device Summarization:** Instantly get the gist of long texts using the built-in `Summarizer API`.
* **🔒 Privacy by Design:** All processing happens locally. Your documents are never uploaded, ensuring 100% confidentiality.
* **✈️ Offline-First:** As a PWA, DocuPrism is fully functional without an internet connection.
* **📦 Installable:** Install it on your desktop or mobile device for a native-app-like experience.
* **💬 Chat with your Document (Coming Soon):** The groundwork is laid to use the `Prompt API` to ask questions directly about the document's content.

## 🛠️ Tech Stack

* **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **PWA / Offline Capability:** [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/)
* **Core AI Engine:** Google Chrome's Built-in AI APIs (`window.ai`)

## 🔗 Links

* **Live Demo:** **https://docuprism.app**
* **Video Walkthrough:** **https://[ENLACE-AL-VIDEO].com**

## ⚙️ Getting Started (Running Locally)

To run this project on your local machine, please follow these steps:

**Prerequisites:**
* Node.js (LTS version)
* `pnpm` package manager
* A compatible version of Google Chrome that supports the Built-in AI APIs.

**Installation & Setup:**

1.  Clone the repository:
    ```bash
    git clone [https://github.com/](https://github.com/)[TU-USUARIO-DE-GITHUB]/DocuPrism.git
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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
*Made with ❤️ for the Google Chrome Dev Community.*