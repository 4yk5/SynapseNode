document.addEventListener('DOMContentLoaded', () => {
  loadPins();
});

function loadPins() {
  const list = document.getElementById('pins-list');
  const empty = document.getElementById('pins-empty');

  chrome.storage.local.get({ pins: [] }, (res) => {
    const pins = res.pins;
    list.innerHTML = '';
    
    if (pins.length === 0) {
      list.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    list.style.display = 'block';
    empty.style.display = 'none';

    pins.forEach(pin => {
      const li = document.createElement('li');
      li.className = 'pin-item';
      
      li.innerHTML = `
        <div class="pin-text">${escapeHtml(pin.text)}</div>
        <div class="pin-meta">
          <a class="pin-source" href="${escapeHtml(pin.url)}" target="_blank" title="${escapeHtml(pin.title)}">
            ${escapeHtml(pin.title || 'Source Link')}
          </a>
          <div class="pin-actions">
            <button class="pin-btn copy" title="Copy">
              <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
            <button class="pin-btn delete" title="Delete">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      `;

      li.querySelector('.copy').addEventListener('click', (e) => {
        navigator.clipboard.writeText(pin.text).then(() => {
          const btn = e.currentTarget;
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
          btn.style.color = '#00ffff';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.color = '';
          }, 1000);
        });
      });

      li.querySelector('.delete').addEventListener('click', () => {
        deletePin(pin.id);
      });

      list.appendChild(li);
    });
  });
}

function deletePin(id) {
  chrome.storage.local.get({ pins: [] }, (res) => {
    const updated = res.pins.filter(p => p.id !== id);
    chrome.storage.local.set({ pins: updated }, () => {
      loadPins();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
