/* auth.js — Frontend authentication logic for login & signup pages */

// ─── Utility helpers ──────────────────────────────────────────────────────────

function showAlert(alertEl, msgEl, message, type = 'error') {
  alertEl.className = `alert alert-${type} visible`;
  msgEl.textContent = message;
}

function hideAlert(alertEl) {
  alertEl.classList.remove('visible');
}

function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('error');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('error');
  errorEl.classList.remove('visible');
}

function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ─── Password visibility toggle ───────────────────────────────────────────────

function initPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!toggle || !input) return;
  let visible = false;
  toggle.addEventListener('click', () => {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? '🙈' : '👁️';
  });
}

// ─── Password strength meter ─────────────────────────────────────────────────

function initStrengthMeter(inputId, fillId, labelId) {
  const input = document.getElementById(inputId);
  const fill = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (!input || !fill || !label) return;

  input.addEventListener('input', () => {
    const val = input.value;
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { w: '0%',   color: 'transparent', text: '' },
      { w: '25%',  color: '#f43f5e',     text: 'Weak' },
      { w: '50%',  color: '#f59e0b',     text: 'Fair' },
      { w: '75%',  color: '#06b6d4',     text: 'Good' },
      { w: '100%', color: '#10b981',     text: 'Strong' },
    ];

    const lvl = levels[Math.min(score, 4)];
    fill.style.width = val.length === 0 ? '0%' : lvl.w;
    fill.style.background = lvl.color;
    label.textContent = val.length === 0 ? '' : lvl.text;
    label.style.color = lvl.color;
  });
}

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────

const loginForm = document.getElementById('login-form');
if (loginForm) {
  initPasswordToggle('toggle-pw', 'password');

  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError    = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const alertEl       = document.getElementById('login-alert');
  const alertMsg      = document.getElementById('login-alert-msg');
  const btn           = document.getElementById('login-btn');

  // Clear errors on input
  emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    let valid = true;
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldError(passwordInput, passwordError, 'Password is required.');
      valid = false;
    }
    if (!valid) return;

    setLoading(btn, true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.replace('/dashboard.html');
      } else {
        showAlert(alertEl, alertMsg, data.error || 'Login failed. Please try again.');
      }
    } catch {
      showAlert(alertEl, alertMsg, 'Network error. Please check your connection.');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ─── SIGNUP FORM ──────────────────────────────────────────────────────────────

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  initPasswordToggle('toggle-pw', 'password');
  initStrengthMeter('password', 'strength-fill', 'strength-label');

  const nameInput     = document.getElementById('name');
  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput  = document.getElementById('confirm-password');
  const nameError     = document.getElementById('name-error');
  const emailError    = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError  = document.getElementById('confirm-error');
  const alertEl       = document.getElementById('signup-alert');
  const alertMsg      = document.getElementById('signup-alert-msg');
  const btn           = document.getElementById('signup-btn');

  // Clear errors on input
  nameInput.addEventListener('input',     () => clearFieldError(nameInput, nameError));
  emailInput.addEventListener('input',    () => clearFieldError(emailInput, emailError));
  passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));
  confirmInput.addEventListener('input',  () => clearFieldError(confirmInput, confirmError));

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    let valid = true;
    const name     = nameInput.value.trim();
    const email    = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm  = confirmInput.value;

    if (name.length < 2) {
      setFieldError(nameInput, nameError, 'Name must be at least 2 characters.');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    }
    if (password.length < 6) {
      setFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      valid = false;
    }
    if (password !== confirm) {
      setFieldError(confirmInput, confirmError, 'Passwords do not match.');
      valid = false;
    }
    if (!valid) return;

    setLoading(btn, true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.replace('/dashboard.html');
      } else {
        showAlert(alertEl, alertMsg, data.error || 'Signup failed. Please try again.');
      }
    } catch {
      showAlert(alertEl, alertMsg, 'Network error. Please check your connection.');
    } finally {
      setLoading(btn, false);
    }
  });
}
