(() => {
  if (document.body.dataset.page !== 'author') return;
  const detail = document.getElementById('detail');
  if (!detail) return;
  function formatProfile() {
    const info = detail.querySelector('.profile-info');
    if (!info || info.dataset.typographyReady) return;
    info.dataset.typographyReady = 'true';
    const paragraph = info.querySelector('p');
    if (!paragraph) return;
    const text = paragraph.textContent || '';
    const lines = text.split(/\r?\n/);
    // Первую строку выделяем только при явном разделении биографии.
    if (lines.length < 2 || !lines[0].trim()) return;
    const heading = document.createElement('p');
    heading.className = 'profile-summary';
    heading.textContent = lines.shift().trim();
    paragraph.textContent = lines.join('\n').replace(/^\s*\n/, '');
    paragraph.before(heading);
  }
  const observer = new MutationObserver(formatProfile);
  observer.observe(detail, { childList: true, subtree: true });
  formatProfile();
})();
