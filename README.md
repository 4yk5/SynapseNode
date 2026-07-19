# SynapseNode

> Web browsing, reinvented. An offline-first, AI-free, ultra-fast browser assistant for power users.

## 📌 Overview
**SynapseNode** is a minimalist, high-performance Chrome extension designed for developers and power users who demand speed and efficiency. It eliminates the friction of web navigation by providing a context-aware, "slate-sapphire" UI that summarizes, searches, and manages web content locally.

**Zero API. Zero Latency. Zero Tracking. 100% Local.**

---

## 🚀 Key Features

### 🔍 Local Search & Routing
*   **Intelligent Routing:** Automatically detects technical error codes (e.g., `0x...`) and redirects to **StackOverflow** for instant debugging.
*   **Pinned Content Querying:** Instantly search through your own pinned content and history directly on your device. No external data lookup required.

### 🧠 "Simplify" Summarizer
*   **No AI APIs:** Uses a native, high-speed JavaScript extraction algorithm to analyze and summarize text locally.
*   **Distraction-Free:** Provides a clean, "slate-sapphire" modal overlay that highlights key sentences and technical terms.

### 📌 Fast Pin & Export
*   **Persistent Storage:** Organize your research using `chrome.storage.local`. Access all your pinned content via the sleek, native extension panel.
*   **Multi-Format Exporter:** Export your saved data as `.txt`, `.pdf`, `.md`, or `.json` with a single click. Your data belongs to you.

---

## 🛠 Technical Architecture
SynapseNode is engineered for absolute performance:
*   **Shadow DOM:** Isolated UI rendering to prevent CSS conflicts with host websites.
*   **Manifest V3:** Adheres to modern browser security and performance standards.
*   **Offline-First:** All processing (TF-IDF summarization, Jaccard similarity indexing) happens strictly on-device.

---

## 📥 Installation

1. Download the latest release from the [Releases](https://github.com/4yk5/Velox-Browser/releases) page.
2. Unzip the package.
3. Navigate to `chrome://extensions/` in your browser.
4. Enable **"Developer mode"** in the top right corner.
5. Click **"Load unpacked"** and select the unzipped directory.

---

## 🎨 Design Philosophy
SynapseNode follows a strict aesthetic:
*   **Background:** `#2f4f4f` (Slate Sapphire)
*   **Accents:** `#00ffff` (Neon Cyan)
*   **Typography:** Plus Jakarta Sans

Built by developers, for developers.

---

## ⚡ Ecosystem
**SynapseNode** is proud to be part of the **Terenax** ecosystem—a collective dedicated to high-performance, minimalist, and offline-first software solutions. Built with the same rigorous standards of speed, privacy, and architectural precision that define all Terenax projects.

---
## ⚖️ License
MIT License - Feel free to fork, modify, and integrate.
