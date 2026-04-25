/* dashboard.js — Protected dashboard page logic */

// ─── Skeleton helper ──────────────────────────────────────────────────────────
function skeletonOn(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('skeleton');
  });
}

function skeletonOff(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('skeleton');
  });
}

// ─── Set text safely ─────────────────────────────────────────────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─── Main init ────────────────────────────────────────────────────────────────
(async () => {
  // Apply skeleton loaders immediately
  skeletonOn(
    'nav-name', 'nav-avatar',
    'welcome-heading',
    'stat-account-id', 'stat-member-days', 'stat-member-since',
    'stat-logins', 'stat-last-login',
    'info-name', 'info-email', 'info-since'
  );

  // ── 1. Verify session ──────────────────────────────────────────────────────
  let meData;
  try {
    const meRes = await fetch('/api/auth/me', { credentials: 'include' });
    if (!meRes.ok) {
      window.location.replace('/login.html');
      return;
    }
    meData = await meRes.json();
  } catch {
    window.location.replace('/login.html');
    return;
  }

  const { name } = meData.user;
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Update navbar immediately
  skeletonOff('nav-name', 'nav-avatar');
  setText('nav-name', name);
  setText('nav-avatar', initials);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  skeletonOff('welcome-heading');
  setText('welcome-heading', `${timeGreet}, ${name.split(' ')[0]}! 👋`);

  // ── 2. Fetch dashboard stats ───────────────────────────────────────────────
  try {
    const statsRes = await fetch('/api/dashboard/stats', { credentials: 'include' });
    if (!statsRes.ok) throw new Error('Failed to load stats');

    const { stats } = await statsRes.json();

    skeletonOff(
      'stat-account-id', 'stat-member-days', 'stat-member-since',
      'stat-logins', 'stat-last-login',
      'info-name', 'info-email', 'info-since',
      'welcome-sub'
    );

    setText('stat-account-id',   stats.accountId);
    setText('stat-member-days',  stats.memberDays);
    setText('stat-member-since', `Since ${stats.memberSince}`);
    setText('stat-logins',       stats.loginCount);
    setText('stat-last-login',   stats.lastLogin);

    setText('info-name',  stats.name);
    setText('info-email', stats.email);
    setText('info-since', stats.memberSince);

    setText('welcome-sub', `Account ${stats.accountId} · Member since ${stats.memberSince}`);
  } catch {
    skeletonOff(
      'stat-account-id', 'stat-member-days', 'stat-member-since',
      'stat-logins', 'stat-last-login'
    );
    setText('stat-account-id', 'Error');
  }

  // ── 3. Logout button ──────────────────────────────────────────────────────
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = 'Signing out…';
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } finally {
        window.location.replace('/login.html');
      }
    });
  }
})();
