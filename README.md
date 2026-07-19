# SynapseNode

> Web browsing, reinvented. An offline-first, AI-free, ultra-fast browser assistant for power users.


## 📌 Overview
**SynapseNode** is a minimalist, high-performance Chrome extension designed for developers and power users who demand speed and efficiency. It eliminates the friction of web navigation by providing a context-aware, "slate-sapphire" UI that summarizes, searches, and manages web content locally.

**Zero API. Zero Latency. Zero Tracking.**

---

## 🚀 Key Features

### 🔍 Smart Search
*   **Intelligent Routing:** Detects if your selection is a technical error code (e.g., `0x...`) and redirects to **StackOverflow** automatically.
*   **Context-Aware:** Handles URLs and plain text seamlessly, opening results in the background to maintain your workflow.

### 🧠 Offline Executive Summarizer
*   **No AI APIs:** Uses a native, high-speed JavaScript extraction algorithm to analyze text locally.
*   **Reader Overlay:** Highlights key sentences and technical terms in a clean, distraction-free "slate-sapphire" modal.

### 📌 Fast Pin
*   **Persistent Storage:** Keep your research organized using `chrome.storage.local`. Access your pinned content via the eklenti ikonuna tıklandığında açılan şık panel.

### 📤 Multi-Format Exporter
*   **Export anything:** Save your selections as `.txt`, `.pdf`, `.md`, or `.json` with a single click.

---

## 🛠 Technical Architecture
SynapseNode is engineered for performance and compatibility:
*   **Shadow DOM:** Isolated UI rendering to prevent CSS conflicts with host websites.
*   **Manifest V3:** Adheres to modern browser security and performance standards.
*   **Offline-First:** All processing (TF-IDF summarization, Jaccard similarity indexing) happens strictly on-device.

---

## 📥 Installation

1.  Download the latest release from the [Releases](https://github.com/your-username/SynapseNode/releases) page.
2.  Unzip the package.
3.  Navigate to `chrome://extensions/` in your browser.
4.  Enable **"Developer mode"** in the top right corner.
5.  Click **"Load unpacked"** and select the unzipped directory.

---

## 🎨 Design Philosophy
SynapseNode follows a strict aesthetic:
*   **Background:** `#2f4f4f` (Slate Sapphire)
*   **Accents:** `#00ffff` (Neon Cyan)
*   **Typography:** Plus Jakarta Sans

Built by developers, for developers.

---

## ⚖️ License
MIT License - Feel free to fork, modify, and integrate.
