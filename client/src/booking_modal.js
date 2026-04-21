/**
 * booking_modal.js
 * Handles the "View & Book" modal with three appointment types:
 *   1. Request   – student sends a meeting request; prof approves/declines
 *   2. Group     – prof defines slots; students vote; prof picks winner
 *   3. Recurring OH – calendar-style recurring slots, any student can reserve
 *
 * Exposes `window.openBookingModal(professorName)` so student_dashboard.ts
 * (compiled to JS) and inline HTML can call it without a module import.
 * Also exposes `window.attachViewAndBookButtons()` so the dashboard can
 * re-attach listeners after re-rendering the professor card grid.
 */

// ─── Utility ────────────────────────────────────────────────────────────────

function apiCall(endpoint, options = {}) {
  return fetch(endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

function showToast(message, isError = false) {
  const existing = document.getElementById('bm-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'bm-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:${isError ? '#c0392b' : '#27ae60'};
    color:white;padding:12px 20px;border-radius:8px;
    font-size:0.88rem;box-shadow:0 4px 16px rgba(0,0,0,0.18);
    z-index:2000;opacity:0;transition:opacity 0.25s;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────

function openBookingModal(professorName) {
  document.getElementById('booking-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'booking-modal-overlay';
  overlay.className = 'booking-modal-overlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const modal = document.createElement('div');
  modal.className = 'booking-modal';

  // Header
  const header = document.createElement('div');
  header.className = 'booking-modal-header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'booking-modal-title';
  titleEl.textContent = 'Book Appointment';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'booking-modal-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => overlay.remove());

  header.append(titleEl, closeBtn);

  // Professor read-only field
  const profField = document.createElement('div');
  profField.className = 'form-field';
  profField.innerHTML = `
    <label class="form-label">Professor</label>
    <input class="form-input" type="text" value="${professorName}" disabled>
  `;

  // Type tabs
  const tabBar = document.createElement('div');
  tabBar.className = 'appt-type-tabs';

  const types = [
    { id: 'request',   label: '📩 Request' },
    { id: 'group',     label: '👥 Group' },
    { id: 'recurring', label: '🔁 Recurring OH' },
  ];

  const bodyContainer = document.createElement('div');
  bodyContainer.id = 'modal-body';

  function activateTab(typeId) {
    tabBar.querySelectorAll('.appt-type-tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.type === typeId)
    );
    bodyContainer.innerHTML = '';
    const renderers = {
      request:   renderRequestForm,
      group:     renderGroupForm,
      recurring: renderRecurringForm,
    };
    renderers[typeId](bodyContainer, professorName, overlay);
  }

  types.forEach(({ id, label }) => {
    const tab = document.createElement('button');
    tab.className = 'appt-type-tab';
    tab.dataset.type = id;
    tab.textContent = label;
    tab.addEventListener('click', () => activateTab(id));
    tabBar.appendChild(tab);
  });

  modal.append(header, profField, tabBar, bodyContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  activateTab('request');
}

// ─── Type 1: Request ─────────────────────────────────────────────────────────

function renderRequestForm(container, professorName, overlay) {
  container.innerHTML = `
    <div class="info-box">
      Send a meeting request to <strong>${professorName}</strong>. They will receive an email
      notification and can accept or decline. You'll be notified once they respond.
    </div>
    <div class="form-field">
      <label class="form-label">Preferred Date</label>
      <input type="date" id="req-date" class="form-input" required>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">Start Time</label>
        <input type="time" id="req-start" class="form-input" required>
      </div>
      <div class="form-field">
        <label class="form-label">End Time</label>
        <input type="time" id="req-end" class="form-input" required>
      </div>
    </div>
    <div class="form-field">
      <label class="form-label">Reason / Topic</label>
      <textarea id="req-notes" class="form-textarea"
        placeholder="Brief description of what you'd like to discuss…"></textarea>
    </div>
    <div class="form-actions">
      <button class="btn-primary" id="req-submit">Send Request</button>
      <button class="btn-secondary" id="req-cancel">Cancel</button>
    </div>
  `;

  container.querySelector('#req-cancel').addEventListener('click', () => overlay.remove());
  container.querySelector('#req-submit').addEventListener('click', async () => {
    const date  = container.querySelector('#req-date').value;
    const start = container.querySelector('#req-start').value;
    const end   = container.querySelector('#req-end').value;
    const notes = container.querySelector('#req-notes').value;

    if (!date || !start || !end) { alert('Please fill in all required fields.'); return; }
    if (start >= end)            { alert('End time must be after start time.'); return; }

    try {
      await apiCall('/proposals', {
        method: 'POST',
        body: JSON.stringify({
          professorName, date, startTime: start, endTime: end, message: notes,
          studentId: localStorage.getItem('userId'),
        }),
      });
      showToast("Request sent! You'll be notified once the professor responds.");
      overlay.remove();
    } catch (err) {
      showToast('Failed to send request: ' + err.message, true);
    }
  });
}

// ─── Type 2: Group ────────────────────────────────────────────────────────────

function renderGroupForm(container, professorName, overlay) {
  const mockSlots = [
    { slotId: 'g1', label: 'Mon Apr 28 · 14:00–15:00', votes: 4 },
    { slotId: 'g2', label: 'Mon Apr 28 · 17:00–18:00', votes: 2 },
    { slotId: 'g3', label: 'Tue Apr 29 · 09:00–10:00', votes: 7 },
    { slotId: 'g4', label: 'Wed Apr 30 · 13:00–14:00', votes: 1 },
  ];

  const selected = new Set();

  container.innerHTML = `
    <div class="info-box">
      <strong>${professorName}</strong> has opened a group scheduling poll.
      Select <em>all times that work for you</em>. The professor will pick the most popular slot.
    </div>
    <div class="form-field">
      <label class="form-label">Available Slots (select all that work)</label>
      <div class="slot-picker" id="group-slot-picker"></div>
    </div>
    <div class="form-actions">
      <button class="btn-primary" id="group-submit">Submit Availability</button>
      <button class="btn-secondary" id="group-cancel">Cancel</button>
    </div>
  `;

  const picker = container.querySelector('#group-slot-picker');
  mockSlots.forEach(({ slotId, label, votes }) => {
    const row   = document.createElement('div');
    row.className = 'slot-option';
    row.dataset.slot = slotId;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.id = `slot-${slotId}`;

    const lbl = document.createElement('label');
    lbl.htmlFor = `slot-${slotId}`;
    lbl.style.cssText = 'flex:1;cursor:pointer;';
    lbl.textContent = label;

    const badge = document.createElement('span');
    badge.className = 'slot-count-badge';
    badge.textContent = `${votes} ✓`;

    check.addEventListener('change', () => {
      if (check.checked) { selected.add(slotId); row.classList.add('selected'); }
      else               { selected.delete(slotId); row.classList.remove('selected'); }
    });

    row.append(check, lbl, badge);
    picker.appendChild(row);
  });

  container.querySelector('#group-cancel').addEventListener('click', () => overlay.remove());
  container.querySelector('#group-submit').addEventListener('click', async () => {
    if (selected.size === 0) { alert('Please select at least one slot.'); return; }
    try {
      await apiCall('/bookings/group-vote', {
        method: 'POST',
        body: JSON.stringify({
          professorName,
          slotIds: Array.from(selected),
          studentId: localStorage.getItem('userId'),
        }),
      });
      showToast("Availability submitted! You'll be notified when the professor finalises the meeting.");
      overlay.remove();
    } catch (err) {
      showToast('Failed to submit: ' + err.message, true);
    }
  });
}

// ─── Type 3: Recurring OH ────────────────────────────────────────────────────

function renderRecurringForm(container, professorName, overlay) {
  const mockSlots = [
    { slotId: 'r1', label: 'Mon 10:00-10:30  (Apr 28 - Jun 2)', available: true  },
    { slotId: 'r2', label: 'Mon 10:30-11:00  (Apr 28 - Jun 2)', available: false },
    { slotId: 'r3', label: 'Tue 10:00-10:30  (Apr 29 - Jun 3)', available: true  },
    { slotId: 'r4', label: 'Tue 10:30-11:00  (Apr 29 - Jun 3)', available: true  },
  ];

  container.innerHTML = `
    <div class="info-box">
      Reserve one of <strong>${professorName}</strong>'s recurring office-hour slots.
      Slots marked <em>Booked</em> are no longer available.
    </div>
    <div class="form-field">
      <label class="form-label">Available OH Slots</label>
      <div class="slot-picker" id="oh-slot-picker"></div>
    </div>
    <div class="form-field">
      <label class="form-label">Notes (optional)</label>
      <textarea id="oh-notes" class="form-textarea"
        placeholder="What would you like to discuss?"></textarea>
    </div>
    <div class="form-actions">
      <button class="btn-primary" id="oh-submit">Reserve Slot</button>
      <button class="btn-secondary" id="oh-cancel">Cancel</button>
    </div>
  `;

  let chosenSlot = null;
  const picker = container.querySelector('#oh-slot-picker');

  mockSlots.forEach(({ slotId, label, available }) => {
    const row = document.createElement('div');
    row.className = 'slot-option';
    if (!available) {
      row.style.opacity = '0.45';
      row.style.cursor = 'not-allowed';
      row.style.pointerEvents = 'none';
    }
    row.dataset.slot = slotId;

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'oh-slot';
    radio.id   = `oh-${slotId}`;
    if (!available) radio.disabled = true;

    const lbl = document.createElement('label');
    lbl.htmlFor = `oh-${slotId}`;
    lbl.style.cssText = `flex:1;cursor:${available ? 'pointer' : 'not-allowed'};`;
    lbl.textContent = label;

    const badge = document.createElement('span');
    badge.className = 'slot-count-badge';
    badge.style.background = available ? '#d4edda' : '#f8d7da';
    badge.style.color       = available ? '#155724' : '#721c24';
    badge.textContent = available ? 'Open' : 'Booked';

    radio.addEventListener('change', () => {
      chosenSlot = slotId;
      picker.querySelectorAll('.slot-option').forEach((r) => r.classList.remove('selected'));
      row.classList.add('selected');
    });

    row.append(radio, lbl, badge);
    picker.appendChild(row);
  });

  container.querySelector('#oh-cancel').addEventListener('click', () => overlay.remove());
  container.querySelector('#oh-submit').addEventListener('click', async () => {
    if (!chosenSlot) { alert('Please select a slot.'); return; }
    const notes = container.querySelector('#oh-notes').value;
    try {
      await apiCall('/bookings/book', {
        method: 'POST',
        body: JSON.stringify({
          professorName, slotId: chosenSlot, notes,
          studentId: localStorage.getItem('userId'),
        }),
      });
      showToast('Slot reserved! Check "My Appointments" for details.');
      overlay.remove();
    } catch (err) {
      showToast('Failed to reserve slot: ' + err.message, true);
    }
  });
}

// ─── Button wiring ───────────────────────────────────────────────────────────

/**
 * Attach click listeners to every .view-and-book-btn currently in the DOM.
 * Clones the node first to drop any previously attached listeners, preventing
 * double-fires when student_dashboard.ts calls this after re-rendering cards.
 */
function attachViewAndBookButtons() {
  document.querySelectorAll('.view-and-book-btn').forEach((btn) => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal(fresh.getAttribute('data-professor') || '');
    });
  });
}

// Initial attach for cards already present in the static HTML
document.addEventListener('DOMContentLoaded', attachViewAndBookButtons);

// ─── Global exports ───────────────────────────────────────────────────────────
// student_dashboard.ts compiles to a plain IIFE/script; it cannot use ES
// imports to reach this file.  Expose both functions on window so the TS
// output can call them as  window.openBookingModal(...)  and
// window.attachViewAndBookButtons().

window.openBookingModal         = openBookingModal;
window.attachViewAndBookButtons = attachViewAndBookButtons;