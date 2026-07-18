(function() {
  let host = null;
  let skipMouse = false;

  function clear() {
    if (host) {
      host.remove();
      host = null;
    }
  }

  function splitSent(text) {
    const abbrevs = [
      'e.g', 'i.e', 'etc', 'vs', 'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr',
      'co', 'corp', 'inc', 'ltd', 'approx', 'min', 'max', 'vol', 'ed',
      'al', 'ca', 'av', 'st', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug',
      'sep', 'oct', 'nov', 'dec', 'org', 'com', 'net', 'gov', 'edu',
      'vb', 'vs', 'dr', 'prof', 'bkz', 'sf', 'sk', 'cad', 'mah', 'no', 'tel'
    ];

    const clean = text.replace(/\s+/g, ' ').trim();
    const list = [];
    let curr = '';
    const words = clean.split(' ');

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w) continue;
      curr += (curr ? ' ' : '') + w;

      if (/[.!?]$/.test(w)) {
        const base = w.replace(/[.!?]$/, '').toLowerCase();
        const isDec = /^\d+$/.test(base);
        const isAbb = abbrevs.includes(base);
        
        if (!isDec && !isAbb) {
          list.push(curr.trim());
          curr = '';
        }
      }
    }

    if (curr.trim()) {
      list.push(curr.trim());
    }

    return list;
  }

  function getFreq(sentences) {
    const stops = new Set([
      've', 'veya', 'ama', 'fakat', 'lakin', 'ancak', 'oysa', 'ile', 'ise', 'ki', 'da', 'de',
      'bir', 'bu', 'şu', 'o', 'ne', 'için', 'gibi', 'kadar', 'daha', 'en', 'her', 'hep', 'hiç',
      'mı', 'mi', 'mu', 'mü', 'göre', 'karşı', 'sonra', 'önce', 'beri', 'üzere', 'olarak',
      'olan', 'oldu', 'olduğu', 'olur', 'olacak', 'olanlar', 'kendi', 'tarafından', 'birkaç',
      'the', 'and', 'a', 'of', 'to', 'is', 'in', 'it', 'that', 'this', 'for', 'on', 'with', 'as',
      'at', 'by', 'an', 'be', 'are', 'was', 'were', 'or', 'from', 'but', 'not', 'your', 'my'
    ]);

    const freq = {};
    sentences.forEach(s => {
      const words = s.toLowerCase().split(/[^a-z0-9ıışşğğüüööçç]+/);
      words.forEach(w => {
        if (w && w.length > 2 && !stops.has(w)) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
    });
    return freq;
  }

  function jaccard(s1, s2) {
    const w1 = new Set(s1.toLowerCase().split(/[^a-z0-9ıışşğğüüööçç]+/).filter(w => w.length > 2));
    const w2 = new Set(s2.toLowerCase().split(/[^a-z0-9ıışşğğüüööçç]+/).filter(w => w.length > 2));
    const inter = new Set([...w1].filter(x => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    return union.size === 0 ? 0 : inter.size / union.size;
  }

  function summarize(text, limit = 3) {
    const sents = splitSent(text);
    const words = text.split(/\s+/).filter(Boolean).length;
    const count = sents.length;

    if (sents.length === 0) {
      return {
        points: ["Text structure could not be resolved for summarization."],
        words: 0,
        count: 0
      };
    }

    const freq = getFreq(sents);

    if (sents.length <= limit) {
      return {
        points: sents.map(s => /[.!?]$/.test(s) ? s : s + "."),
        words: words,
        count: count
      };
    }

    const weights = {
      'error': 30, 'exception': 30, 'failed': 25, 'bug': 25, 'issue': 20, 'crash': 30,
      'const': 20, 'let': 15, 'function': 20, 'class': 20, 'async': 20, 'await': 20,
      'null': 20, 'undefined': 20, 'return': 15, 'method': 15, 'api': 20,
      'database': 20, 'sql': 25, 'json': 20, 'http': 20, 'server': 20, 'client': 20
    };

    const scored = sents.map((s, idx) => {
      const len = s.length;
      if (len < 25 || len > 350) return { text: s, score: -1, idx };
      if (!/^[a-zA-Z0-9"'\-“«<\s]/.test(s)) return { text: s, score: -1, idx };

      let parens = 0, quotes = 0;
      for (let char of s) {
        if (char === '(' || char === '[' || char === '{') parens++;
        if (char === ')' || char === ']' || char === '}') parens--;
        if (char === '"' || char === "'") quotes++;
      }
      if (parens !== 0 || quotes % 2 !== 0) return { text: s, score: -1, idx };

      let score = 0;
      if (len >= 55 && len <= 185) {
        score += 40;
      } else if (len > 185 && len <= 260) {
        score += 20;
      }

      const tokens = s.toLowerCase().split(/[^a-z0-9]+/);
      let tf = 0;
      let matches = 0;
      tokens.forEach(t => {
        if (freq[t]) {
          tf += freq[t];
          matches++;
        }
      });
      if (matches > 0) {
        score += (tf / matches) * 15;
      }

      tokens.forEach(t => {
        if (weights.hasOwnProperty(t)) {
          score += weights[t];
        }
      });

      if (idx === 0) {
        score += 35;
      } else if (idx === 1) {
        score += 15;
      } else if (idx === sents.length - 1) {
        score += 25;
      }

      return { text: s, score, idx };
    });

    const valid = scored.filter(item => item.score > 0);
    valid.sort((a, b) => b.score - a.score);

    const selected = [];
    for (let i = 0; i < valid.length; i++) {
      const candidate = valid[i];
      let dup = false;
      for (let s of selected) {
        if (jaccard(candidate.text, s.text) > 0.45) {
          dup = true;
          break;
        }
      }
      if (!dup) {
        selected.push(candidate);
        if (selected.length === limit) break;
      }
    }

    if (selected.length < 2) {
      return {
        points: sents.slice(0, limit).map(s => /[.!?]$/.test(s) ? s : s + "."),
        words: words,
        count: count
      };
    }

    selected.sort((a, b) => a.idx - b.idx);

    return {
      points: selected.map(item => /[.!?]$/.test(item.text) ? item.text : item.text + "."),
      words: words,
      count: count
    };
  }

  document.addEventListener('mouseup', (e) => {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      return;
    }

    if (skipMouse) {
      skipMouse = false;
      return;
    }

    const rHost = document.getElementById('context-aware-action-reader-host');
    if (rHost && (rHost === e.target || rHost.contains(e.target))) {
      return;
    }

    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection) return;

      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      if (host && host.contains(e.target)) {
        return;
      }

      clear();

      if (selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const el = document.createElement('div');
      el.id = 'context-aware-action-drawer-host';
      host = el;

      const shadow = el.attachShadow({ mode: 'open' });

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('style.css');
      shadow.appendChild(link);

      const container = document.createElement('div');
      container.className = 'drawer-container';

      const btnSearch = document.createElement('button');
      btnSearch.className = 'drawer-btn';
      btnSearch.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>Search</span>
      `;
      btnSearch.addEventListener('click', () => {
        skipMouse = true;
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
          clear();
          return;
        }

        const query = selectedText.trim();
        let url;

        if (/^0x/i.test(query)) {
          url = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
        } else if (/^(https?:\/\/|www\.)/i.test(query) || /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/i.test(query)) {
          url = query.startsWith('http') ? query : 'https://' + query;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }

        chrome.runtime.sendMessage({ action: 'open_tab', url });
        clear();
      });
      container.appendChild(btnSearch);

      const d1 = document.createElement('div');
      d1.className = 'drawer-divider';
      container.appendChild(d1);

      const btnSimplify = document.createElement('button');
      btnSimplify.className = 'drawer-btn';
      btnSimplify.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M4 9h16v2H4zm0 4h10v2H4zm0-8h16v2H4zm0 12h14v2H4z"/></svg>
        <span>Simplify</span>
      `;
      btnSimplify.addEventListener('click', () => {
        skipMouse = true;
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          clear();
          return;
        }

        clear();

        try {
          window.getSelection().removeAllRanges();
        } catch (err) {}

        const rough = selectedText.split(/\s+/).filter(Boolean).length;
        let limit = 3;
        if (rough >= 150 && rough < 600) {
          limit = 5;
        } else if (rough >= 600) {
          limit = 7;
        }

        const res = summarize(selectedText, limit);
        const points = res.points;
        const wCount = res.words;
        const sCount = res.count;
        const read = Math.max(1, Math.round(wCount / 220));

        chrome.storage.local.set({
          latest_summary: {
            text: selectedText,
            points: points,
            title: document.title,
            timestamp: new Date().toISOString()
          }
        });

        const mHost = document.createElement('div');
        mHost.id = 'context-aware-action-reader-host';
        
        const mShadow = mHost.attachShadow({ mode: 'open' });

        const mLink = document.createElement('link');
        mLink.rel = 'stylesheet';
        mLink.href = chrome.runtime.getURL('style.css');
        mShadow.appendChild(mLink);

        const backdrop = document.createElement('div');
        backdrop.className = 'reader-backdrop';

        const modal = document.createElement('div');
        modal.className = 'reader-modal';
        
        let html = `
          <div class="reader-stats-grid">
            <div class="reader-stat-card">
              <div class="reader-stat-val">${wCount}</div>
              <div class="reader-stat-lbl">Words</div>
            </div>
            <div class="reader-stat-card">
              <div class="reader-stat-val">${read} min</div>
              <div class="reader-stat-lbl">Read Time</div>
            </div>
            <div class="reader-stat-card">
              <div class="reader-stat-val">${sCount}</div>
              <div class="reader-stat-lbl">Sentences</div>
            </div>
          </div>
        `;

        if (wCount >= 150 && points.length > 0) {
          html += `
            <div class="reader-section-title">Main Concept</div>
            <div class="reader-concept-text">"${points[0].replace(/\.$/, '')}"</div>
          `;
        }

        html += `
          <div class="reader-section-title">${wCount >= 150 ? 'Key Insights' : 'Summary Details'}</div>
          <ul class="reader-list"></ul>
        `;

        modal.innerHTML = `
          <div class="reader-header">
            <span class="reader-title">Simplify - Executive Summary</span>
            <button class="reader-close" title="Close">✕</button>
          </div>
          <div class="reader-content">
            ${html}
          </div>
        `;

        backdrop.appendChild(modal);
        mShadow.appendChild(backdrop);
        document.body.appendChild(mHost);

        const closeM = () => {
          mHost.remove();
        };

        modal.querySelector('.reader-close').addEventListener('click', closeM);
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            closeM();
          }
        });

        const list = modal.querySelector('.reader-list');
        const listPoints = wCount >= 150 ? points.slice(1) : points;

        listPoints.forEach((pt, i) => {
          const li = document.createElement('li');
          list.appendChild(li);
          
          let idx = 0;
          function type() {
            if (idx < pt.length) {
              li.textContent += pt.charAt(idx);
              idx++;
              setTimeout(type, 8);
            }
          }
          setTimeout(type, i * 350);
        });
      });
      container.appendChild(btnSimplify);

      const d2 = document.createElement('div');
      d2.className = 'drawer-divider';
      container.appendChild(d2);

      const exportWrap = document.createElement('div');
      exportWrap.className = 'drawer-btn-container';

      const btnExport = document.createElement('button');
      btnExport.className = 'drawer-btn';
      btnExport.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        <span>Export</span>
      `;

      const menu = document.createElement('div');
      menu.className = 'drawer-dropdown';

      const itemTxt = document.createElement('button');
      itemTxt.className = 'dropdown-item';
      itemTxt.textContent = 'as Text File (.txt)';
      itemTxt.addEventListener('click', () => {
        skipMouse = true;
        const blob = new Blob([selectedText], { type: 'text/plain;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `extracted_note_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        clear();
      });

      const itemPdf = document.createElement('button');
      itemPdf.className = 'dropdown-item';
      itemPdf.textContent = 'as Document (.pdf)';
      itemPdf.addEventListener('click', () => {
        skipMouse = true;
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.zIndex = '-9999';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Export PDF</title>
            <style>
              body {
                font-family: Georgia, serif;
                padding: 40px;
                line-height: 1.6;
                color: #111;
                background-color: #fff;
              }
              .title {
                font-size: 12px;
                color: #666;
                border-bottom: 1px solid #ddd;
                padding-bottom: 6px;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .content {
                font-size: 15px;
                white-space: pre-wrap;
                word-break: break-word;
              }
            </style>
          </head>
          <body>
            <div class="title">Exported from: ${escapeHtml(document.title)}</div>
            <div class="content">${escapeHtml(selectedText)}</div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          iframe.remove();
        }, 1500);

        clear();
      });

      const itemMd = document.createElement('button');
      itemMd.className = 'dropdown-item';
      itemMd.textContent = 'as Markdown (.md)';
      itemMd.addEventListener('click', () => {
        skipMouse = true;
        const md = `# Exported Note\n\n- **Source**: [${document.title}](${window.location.href})\n- **Date**: ${new Date().toLocaleString()}\n\n---\n\n${selectedText}`;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `extracted_note_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        clear();
      });

      const itemJson = document.createElement('button');
      itemJson.className = 'dropdown-item';
      itemJson.textContent = 'as JSON (.json)';
      itemJson.addEventListener('click', () => {
        skipMouse = true;
        const jsonObj = {
          title: document.title,
          url: window.location.href,
          exported_at: new Date().toISOString(),
          text: selectedText
        };
        const json = JSON.stringify(jsonObj, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `extracted_note_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        clear();
      });

      menu.appendChild(itemTxt);
      menu.appendChild(itemPdf);
      menu.appendChild(itemMd);
      menu.appendChild(itemJson);
      exportWrap.appendChild(btnExport);
      exportWrap.appendChild(menu);

      btnExport.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });

      container.appendChild(exportWrap);

      const d3 = document.createElement('div');
      d3.className = 'drawer-divider';
      container.appendChild(d3);

      const btnPin = document.createElement('button');
      btnPin.className = 'drawer-btn';
      btnPin.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2zM8.9 12l1.1-1.1V4h4v6.9l1.1 1.1h-6.2z"/></svg>
        <span>Pin</span>
      `;
      btnPin.addEventListener('click', () => {
        skipMouse = true;
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          clear();
          return;
        }

        const pinData = {
          id: Date.now().toString(),
          text: selectedText,
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };

        chrome.storage.local.get({ pins: [] }, (result) => {
          const updatedPins = [pinData, ...result.pins];
          chrome.storage.local.set({ pins: updatedPins }, () => {
            btnPin.innerHTML = `
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              <span>Pinned!</span>
            `;
            btnPin.style.color = '#00ffff';
            setTimeout(clear, 850);
          });
        });
      });
      container.appendChild(btnPin);

      container.addEventListener('click', (e) => {
        const path = e.composedPath();
        const isExport = path.some(el => el.classList && el.classList.contains('drawer-btn-container'));
        if (!isExport) {
          menu.classList.remove('active');
        }
      });

      shadow.appendChild(container);
      document.body.appendChild(el);

      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      let topPos = rect.top + scrollY - 42;
      
      if (rect.top < 55) {
        topPos = rect.bottom + scrollY + 8;
      }

      let leftPos = rect.left + scrollX + (rect.width / 2);
      const drawerWidth = 280;
      const maxLeft = window.innerWidth + scrollX - (drawerWidth / 2) - 10;
      const minLeft = scrollX + (drawerWidth / 2) + 10;
      leftPos = Math.max(minLeft, Math.min(maxLeft, leftPos));

      el.style.top = `${topPos}px`;
      el.style.left = `${leftPos}px`;
      el.style.transform = 'translateX(-50%)';
    }, 10);
  });

  document.addEventListener('mousedown', (e) => {
    if (host && !host.contains(e.target)) {
      clear();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key === 'Meta' || e.ctrlKey || e.metaKey) {
      clear();
    }
  });

  window.addEventListener('scroll', () => {
    clear();
  }, { passive: true });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();