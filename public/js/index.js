(async () => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      window.location.replace('/dashboard.html');
    } else {
      window.location.replace('/login.html');
    }
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.replace('/login.html');
  }
})();
