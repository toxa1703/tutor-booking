// app.js — Tutor Booking Frontend

let selectedTutorId = null;

// ── Load tutors on page load ─────────────────────────────────
async function loadTutors() {
  const list = document.getElementById('tutor-list');

  try {
    const res    = await fetch('/api/tutors');
    const tutors = await res.json();

    if (!tutors.length) {
      list.innerHTML = '<p class="loading">No tutors available yet.</p>';
      return;
    }

    list.innerHTML = tutors.map(t => `
      <div class="tutor-card">
        <div class="card-img-wrap">
          <img src="${t.photo_url || 'https://i.pravatar.cc/300'}" alt="${t.full_name}" loading="lazy">
          <span class="card-subject">${t.subject}</span>
        </div>
        <div class="card-body">
          <div class="card-name">${t.full_name}</div>
          <div class="card-about">${t.about || ''}</div>
          <div class="card-footer">
            <div class="card-rate">${Number(t.rate).toLocaleString()} ₸<span> / hour</span></div>
            <button class="btn-book" onclick="openModal(${t.id}, '${t.full_name}', '${t.subject}')">Book</button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    list.innerHTML = '<p class="loading">Could not load tutors. Please try again later.</p>';
    console.error(err);
  }
}

// ── Open booking modal ───────────────────────────────────────
function openModal(id, name, subject) {
  selectedTutorId = id;
  document.getElementById('modal-tutor-name').textContent = `with ${name} · ${subject}`;
  document.getElementById('modal-message').textContent = '';
  document.getElementById('modal-message').className   = '';
  document.getElementById('input-name').value  = '';
  document.getElementById('input-phone').value = '';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('input-name').focus();
}

// ── Close modal ──────────────────────────────────────────────
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── Submit booking ───────────────────────────────────────────
document.getElementById('btn-submit').addEventListener('click', async () => {
  const name  = document.getElementById('input-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const msg   = document.getElementById('modal-message');

  if (!name || !phone) {
    msg.className   = 'msg-error';
    msg.textContent = 'Please fill in both fields.';
    return;
  }
  if (phone.replace(/\D/g, '').length < 7) {
    msg.className   = 'msg-error';
    msg.textContent = 'Please enter a valid phone number.';
    return;
  }

  const btn = document.getElementById('btn-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res  = await fetch('/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        tutor_id:     selectedTutorId,
        student_name: name,
        phone:        phone,
      }),
    });
    const data = await res.json();

    if (data.success) {
      msg.className   = 'msg-success';
      msg.textContent = '✓ ' + data.message;
      setTimeout(closeModal, 2200);
    } else {
      msg.className   = 'msg-error';
      msg.textContent = data.error || 'Something went wrong.';
    }
  } catch {
    msg.className   = 'msg-error';
    msg.textContent = 'Network error. Please try again.';
  } finally {
    btn.textContent = 'Send request';
    btn.disabled = false;
  }
});

// ── Start ────────────────────────────────────────────────────
loadTutors();
