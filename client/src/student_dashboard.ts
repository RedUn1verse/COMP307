/**
 * Student Dashboard for the main.html page
 * Self-contained implementation with its own modal and button handlers
 */

import { meetings, bookings, proposals, users, slots} from './api';

// --- Interfaces ---

interface Appointment {
  bookingId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerEmail: string;
  ownerPublicId: string;
}

interface ActiveOwner {
  name: string;
  email: string;
  job: string;
  publicId?: string;
}

interface AvailableSlot {
  slotId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isPrivate: boolean;
}

interface MeetingRequest {
  ownerName: string;
  title: string;
  message: string;
  date: string;
  startTime: string;
  endTime: string;
}

// --- Init ---

export function initializeStudentDashboard() {
  setupSidebarNavigation();
  setupViewAndBookButtons();
  showBrowseProfessorsView();
}

// --- Sidebar ---

function setupSidebarNavigation() {
  const sidebarLinks = document.querySelectorAll<HTMLElement>('.sidebar-link');

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      sidebarLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      handleSidebarNavigation(link.innerText.trim());
    });
  });
}

function handleSidebarNavigation(linkText: string) {
  switch (linkText) {
    case 'Browse Professors':
      showBrowseProfessorsView();
      break;
    case 'My Appointments':
      showMyAppointmentsView();
      break;
    case 'Group Polls':
      showGroupPollsView();
      break;
    case 'My Courses':
      window.location.href = 'https://mycourses2.mcgill.ca/';
      break;
    case 'Help & Support':
      showHelpAndSupportView();
      break;
    case 'Settings':
      showSettingsView();
      break;
  }
}

// --- Button Handlers ---─

// function setupViewAndBookButtons() {
//   // Remove existing listeners to avoid duplicates
//   const buttons = document.querySelectorAll('.view-and-book-btn');
//   buttons.forEach((btn) => {
//     const newBtn = btn.cloneNode(true);
//     btn.parentNode?.replaceChild(newBtn, btn);
//   });

//   // Add fresh listeners using event delegation
//   document.addEventListener('click', (e) => {
//     const target = e.target as HTMLElement;
//     if (target.classList.contains('view-and-book-btn')) {
//       e.preventDefault();
//       const professorName = target.getAttribute('data-professor') || '';
//       openBookingModal(professorName);
//     }
//   });
// }
let viewAndBookListenerAttached = false;

function setupViewAndBookButtons() {
  if (viewAndBookListenerAttached) return;
  viewAndBookListenerAttached = true;

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest(
      '.view-and-book-btn',
    ) as HTMLElement | null;
    if (!target) return;
    e.preventDefault();
    const professorName = target.getAttribute('data-professor') || '';
    const publicId = target.getAttribute('data-owner-public-id') || '';
    const ownerEmail = target.getAttribute('data-owner-email') || '';
    if (!publicId) {
      console.warn('No publicId on professor card; cannot fetch slots.');
      openBookingModal(professorName, ownerEmail);
      return;
    }
    showOwnerSlotsView(publicId, professorName, ownerEmail);
  });
}

async function showOwnerSlotsView(
  publicId: string,
  professorName: string,
  ownerEmail: string,
) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <button id="back-to-browse" style="
        background:none;border:none;color:var(--mcgill-red);cursor:pointer;
        font-size:0.95rem;padding:0;margin-bottom:10px;
      ">&larr; Back to Browse Professors</button>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:15px;">
        <div>
          <h1 class="page-title">${professorName}</h1>
          <p class="page-description">Available office hour slots</p>
        </div>
        <button id="request-meeting-btn" style="
          padding:10px 20px;background:#D20A11;color:white;border:none;
          border-radius:6px;cursor:pointer;font-weight:500;
        ">Request Meeting</button>
      </div>
    </header>
    <div id="owner-slots-container" style="padding:20px;">
      <p>Loading available slots...</p>
    </div>
  `;

  document
    .getElementById('back-to-browse')
    ?.addEventListener('click', () => showBrowseProfessorsView());

  document
    .getElementById('request-meeting-btn')
    ?.addEventListener('click', () => openBookingModal(professorName, ownerEmail));

  const container = document.getElementById('owner-slots-container')!;

  let slotsList: AvailableSlot[] = [];
  try {
    const data = await slots.getAvailableByOwner(publicId);
    slotsList = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch slots:', error);
    container.innerHTML =
      '<p style="color:red;">Failed to load available slots.</p>';
    return;
  }

  const bookable = slotsList.filter((s) => !s.isBooked);

  if (bookable.length === 0) {
    container.innerHTML =
      '<p style="color:#666;">No available slots at this time.</p>';
    return;
  }

  container.innerHTML = `
    <div style="display:grid;gap:15px;">
      ${bookable
        .map(
          (slot) => `
        <div style="border:1px solid #ddd;padding:15px;border-radius:8px;background:#f9f9f9;
          display:flex;justify-content:space-between;align-items:center;gap:15px;">
          <div>
            <h3 style="margin:0 0 8px 0;">${slot.title}</h3>
            <p style="margin:3px 0;"><strong>Date:</strong>
              ${new Date(slot.date).toLocaleDateString()}</p>
            <p style="margin:3px 0;"><strong>Time:</strong>
              ${slot.startTime} - ${slot.endTime}</p>
          </div>
          <button class="book-slot-btn" data-slot-id="${slot.slotId}" style="
            padding:10px 20px;background:#D20A11;color:white;border:none;
            border-radius:6px;cursor:pointer;font-weight:500;
          ">Book</button>
        </div>
      `,
        )
        .join('')}
    </div>
  `;

  container.querySelectorAll('.book-slot-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const button = e.currentTarget as HTMLButtonElement;
      const slotId = button.getAttribute('data-slot-id');
      if (!slotId) return;
      button.disabled = true;
      button.textContent = 'Booking...';
      try {
        await slots.book(slotId);
        alert('Slot booked successfully!');
        showOwnerSlotsView(publicId, professorName, ownerEmail);
      } catch (error) {
        console.error('Failed to book slot:', error);
        alert('Failed to book slot. Please try again.');
        button.disabled = false;
        button.textContent = 'Book';
      }
    });
  });
}


function openBookingModal(professorName: string, ownerEmail: string) {
  // Remove any existing modal
  const existingModal = document.getElementById('booking-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'booking-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
  `;

  modal.innerHTML = `
    <div style="
      background: white; border-radius: 12px; padding: 30px;
      max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 1.5rem;">Book Appointment</h2>
        <button id="close-modal" style="
          background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
        ">&times;</button>
      </div>

      <form id="booking-form" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Professor</label>
          <input type="text" value="${professorName}" disabled style="
            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
            background: #f5f5f5; box-sizing: border-box;
          ">
        </div>

        <div>
          <label for="booking-title" style="display: block; margin-bottom: 5px; font-weight: 500;">Title</label>
          <input type="text" id="booking-title" required placeholder="e.g., Discuss project proposal" style="
            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
            box-sizing: border-box;
          ">
        </div>

        <div>
          <label for="booking-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Date</label>
          <input type="date" id="booking-date" required style="
            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
            box-sizing: border-box;
          ">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label for="booking-start-time" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
            <input type="time" id="booking-start-time" required style="
              width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
              box-sizing: border-box;
            ">
          </div>
          <div>
            <label for="booking-end-time" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
            <input type="time" id="booking-end-time" required style="
              width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
              box-sizing: border-box;
            ">
          </div>
        </div>

        <div>
          <label for="booking-notes" style="display: block; margin-bottom: 5px; font-weight: 500;">Notes (optional)</label>
          <textarea id="booking-notes" placeholder="What would you like to discuss?" style="
            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
            box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 80px;
          "></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" style="
            flex: 1; padding: 12px; background: #D20A11; color: white; border: none;
            border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
          ">Confirm Booking</button>
          <button type="button" id="cancel-booking" style="
            flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none;
            border-radius: 6px; font-size: 1rem; cursor: pointer;
          ">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  const closeBtn = modal.querySelector('#close-modal') as HTMLElement;
  const cancelBtn = modal.querySelector('#cancel-booking') as HTMLElement;
  const form = modal.querySelector('#booking-form') as HTMLFormElement;

  closeBtn?.addEventListener('click', () => modal.remove());
  cancelBtn?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleBookingSubmit(form, modal, ownerEmail);
  });
}

async function handleBookingSubmit(
  form: HTMLFormElement,
  modal: HTMLElement,
  ownerEmail: string,
) {
  const title = (form.querySelector('#booking-title') as HTMLInputElement).value;
  const date = (form.querySelector('#booking-date') as HTMLInputElement).value;
  const startTime = (form.querySelector('#booking-start-time') as HTMLInputElement).value;
  const endTime = (form.querySelector('#booking-end-time') as HTMLInputElement).value;
  const notes = (form.querySelector('#booking-notes') as HTMLTextAreaElement).value;

  if (!title || !date || !startTime || !endTime) {
    alert('Please fill in all required fields');
    return;
  }

  if (!ownerEmail) {
    alert('Cannot determine the professor for this request.');
    return;
  }

  try {
    const bookingData = {
      ownerEmail,
      title,
      message: notes || 'No notes',
      date,
      startTime,
      endTime,
    };

    await meetings.create(bookingData);

    alert('Appointment booked successfully!');
    modal.remove();
    // Refresh appointments view if we're on that page
    if (document.querySelector('.sidebar-link.active')?.textContent?.trim() === 'My Appointments') {
      showMyAppointmentsView();
    }
  } catch (error) {
    console.error('Booking failed:', error);
    alert('Failed to book appointment. Please try again.');
  }
}
// --- Views ---─

// 
async function showBrowseProfessorsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Browse Professors</h1>
      <p class="page-description">Find and book office hours with your professors</p>
    </header>

    <section class="search-filter-bar">
      <div class="search-input-container">
        <span class="search-icon-placeholder"></span>
        <input type="text" id="prof-search-input" class="search-input"
          placeholder="Search by name or email...">
      </div>
      <div class="filter-container">
        <span class="filter-icon-placeholder"></span>
        All Departments
      </div>
    </section>

    <section id="prof-card-grid" class="card-grid">
      <p style="padding:20px;color:#666;">Loading professors...</p>
    </section>
  `;

  const grid = document.getElementById('prof-card-grid')!;

  let owners: ActiveOwner[] = [];
  try {
    const data = await users.getActive();
    owners = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch active owners:', error);
    grid.innerHTML =
      '<p style="padding:20px;color:red;">Failed to load professors.</p>';
    return;
  }

  const renderCards = (list: ActiveOwner[]) => {
    if (list.length === 0) {
      grid.innerHTML =
        '<p style="padding:20px;color:#666;">No professors with active office hours right now.</p>';
      return;
    }

    grid.innerHTML = list
      .map(
        (owner) => `
      <div class="prof-card">
        <h2 class="prof-name">${owner.name}</h2>
        <p class="prof-department">${owner.job ?? ''}</p>
        <div class="prof-detail"><a href="mailto:${owner.email}">${owner.email}</a></p></div>
        <button class="card-action-button view-and-book-btn"
          data-professor="${owner.name}"
          data-owner-email="${owner.email}"
          data-owner-public-id="${owner.publicId ?? ''}">View &amp; Book</button>
      </div>
    `,
      )
      .join('');

    setupViewAndBookButtons();
  };

  renderCards(owners);

  
}


async function showMyAppointmentsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Your Appointments</h1>
      <p class="page-description">Your booked office hour appointments</p>
    </header>
    <div id="appointments-container" style="padding: 20px;">
      <p>Loading appointments...</p>
    </div>
  `;
  try {
    const [appointmentsData, meetingsData] = await Promise.all([
      bookings.getMyBookings().catch(() => []),
      meetings.getMe().catch(() => []),
    ]);
    const appointments: Appointment[] = Array.isArray(appointmentsData)
      ? appointmentsData
      : [];
    const pendingMeetings: MeetingRequest[] = Array.isArray(meetingsData)
      ? meetingsData
      : [];

    const container = document.getElementById('appointments-container')!;

    if (appointments.length === 0 && pendingMeetings.length === 0) {
      container.innerHTML =
        '<p style="padding:20px;text-align:center;color:#666;">No appointments booked yet.</p>';
      return;
    }

    let html = '<div style="display:grid;gap:15px;">';

    appointments.forEach((apt) => {
      html += `
        <div style="border:1px solid #ddd;padding:15px;border-radius:8px;background:#f9f9f9;
          display:flex;justify-content:space-between;align-items:flex-start;gap:15px;">
          <div>
            <h3 style="margin:0 0 10px 0;">${apt.ownerName}</h3>
            <p style="margin:5px 0;"><strong>Title:</strong> ${apt.title}</p>
            <p style="margin:5px 0;"><strong>Date:</strong>
              ${new Date(apt.date).toLocaleDateString()}</p>
            <p style="margin:5px 0;"><strong>Time:</strong>
              ${apt.startTime} - ${apt.endTime}</p>
            <p style="margin:5px 0;"><strong>Status:</strong>
              <span style="color:green;">confirmed</span></p>
            <p style="margin:5px 0;"><strong>Email:</strong>
              <a href="mailto:${apt.ownerEmail}">${apt.ownerEmail}</a></p>
          </div>
          <button class="cancel-booking-btn" data-booking-id="${apt.bookingId}" style="
            padding:10px 20px;background:#fff;color:#D20A11;border:1px solid #D20A11;
            border-radius:6px;cursor:pointer;font-weight:500;
          ">Cancel Booking</button>
        </div>
      `;
    });

    pendingMeetings.forEach((mtg) => {
      html += `
        <div style="border:1px solid #ddd;padding:15px;border-radius:8px;background:#fffaf0;">
          <h3 style="margin:0 0 10px 0;">${mtg.ownerName}</h3>
          <p style="margin:5px 0;"><strong>Title:</strong> ${mtg.title}</p>
          <p style="margin:5px 0;"><strong>Date:</strong>
            ${new Date(mtg.date).toLocaleDateString()}</p>
          <p style="margin:5px 0;"><strong>Time:</strong>
            ${mtg.startTime} - ${mtg.endTime}</p>
          <p style="margin:5px 0;"><strong>Message:</strong> ${mtg.message ?? ''}</p>
          <p style="margin:5px 0;"><strong>Status:</strong>
            <span style="color:#b58900;">pending</span></p>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.cancel-booking-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement;
        const bookingId = button.getAttribute('data-booking-id');
        if (!bookingId) return;
        if (!confirm('Cancel this booking?')) return;
        button.disabled = true;
        button.textContent = 'Cancelling...';
        try {
          await bookings.cancelBooking(bookingId);
          alert('Booking cancelled.');
          showMyAppointmentsView();
        } catch (error) {
          console.error('Failed to cancel booking:', error);
          alert('Failed to cancel booking. Please try again.');
          button.disabled = false;
          button.textContent = 'Cancel Booking';
        }
      });
    });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    document.getElementById('appointments-container')!.innerHTML =
      '<p style="padding:20px;color:red;">Failed to load appointments.</p>';
  }
}

async function showGroupPollsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Group Polls</h1>
      <p class="page-description">Vote on available office hour time slots</p>
    </header>
    <div id="polls-container" style="padding: 20px;">
      <p>Loading group polls...</p>
    </div>
  `;

  try {
    // Fetch proposals where the student is invited
    const proposalsData = await proposals.getForUser();
    const pollsList = Array.isArray(proposalsData) ? proposalsData : [];

    const container = document.getElementById('polls-container')!;

    if (pollsList && pollsList.length > 0) {
      let html = '<div style="display:grid;gap:20px;">';
      
      for (const poll of pollsList) {
        html += `
          <div style="border:1px solid #ddd;border-radius:8px;padding:20px;background:#f9f9f9;">
            <h3 style="margin:0 0 15px 0;color:var(--mcgill-red);">${poll.title}</h3>
            <p style="margin:0 0 15px 0;font-size:0.95rem;color:#666;">
              <strong>Professor:</strong> ${poll.ownerName || 'Unknown'}
            </p>
            
            <div style="margin-bottom:15px;">
              <p style="margin:0 0 10px 0;font-weight:600;font-size:0.95rem;">Available Time Slots:</p>
              <div style="display:grid;gap:10px;">
        `;

        const hasVoted = (poll.options || []).some((o: any) => o.myVote);

        // Display voting options
        for (const option of poll.options || []) {
          const voted = !!option.myVote;
          const cardBorder = voted ? '2px solid var(--mcgill-red)' : '1px solid #e0e0e0';

          let rightHtml: string;
          if (hasVoted) {
            rightHtml = voted
              ? `<span style="padding:8px 16px;background:#fff;color:var(--mcgill-red);
                  border:1px solid var(--mcgill-red);border-radius:4px;font-weight:600;">✓ Voted</span>`
              : `<span style="color:#999;font-style:italic;">Not selected</span>`;
          } else {
            rightHtml = `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500;">
              <input type="checkbox" class="vote-option-checkbox"
                data-proposal-id="${poll.proposalId}" data-option-id="${option.optionId}"
                style="width:18px;height:18px;cursor:pointer;accent-color:var(--mcgill-red);">
              Select
            </label>`;
          }

          html += `
                <div style="background:white;border:${cardBorder};border-radius:6px;padding:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <p style="margin:0;font-weight:500;">${option.date}</p>
                      <p style="margin:0;font-size:0.9rem;color:#666;">${option.startTime} - ${option.endTime}</p>
                    </div>
                    ${rightHtml}
                  </div>
                </div>
          `;
        }

        if (!hasVoted) {
          html += `
                <button class="submit-votes-btn" data-proposal-id="${poll.proposalId}" style="
                  margin-top:10px;padding:10px 20px;background:var(--mcgill-red);color:white;
                  border:none;border-radius:6px;cursor:pointer;font-weight:500;align-self:flex-start;
                ">Submit Votes</button>
          `;
        }

        html += `
              </div>
            </div>
          </div>
        `;
      }
      
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.submit-votes-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const button = e.currentTarget as HTMLButtonElement;
          const proposalId = button.getAttribute('data-proposal-id');
          if (!proposalId) return;

          const checked = container.querySelectorAll<HTMLInputElement>(
            `.vote-option-checkbox[data-proposal-id="${proposalId}"]:checked`,
          );
          const optionIds = Array.from(checked)
            .map((cb) => cb.getAttribute('data-option-id'))
            .filter((id): id is string => !!id);

          if (optionIds.length === 0) {
            alert('Please select at least one option.');
            return;
          }

          button.disabled = true;
          button.textContent = 'Submitting...';
          try {
            await proposals.vote(proposalId, optionIds);
            await showGroupPollsView();
          } catch (error) {
            console.error('Failed to vote:', error);
            alert('Failed to record your votes. Please try again.');
            button.disabled = false;
            button.textContent = 'Submit Votes';
          }
        });
      });
    } else {
      container.innerHTML =
        '<p style="padding:20px;text-align:center;color:#666;">No active group polls at this time.</p>';
    }
  } catch (error) {
    console.error('Failed to fetch group polls:', error);
    document.getElementById('polls-container')!.innerHTML =
      '<p style="padding:20px;color:red;">Failed to load group polls.</p>';
  }
}


function showHelpAndSupportView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Help &amp; Support</h1>
      <p class="page-description">Get assistance with the platform</p>
    </header>
    <div style="padding:40px;text-align:center;">
      <p style="font-size:1.2rem;color:var(--medium-grey);font-weight:500;">TBD!</p>
    </div>
  `;
}

function showSettingsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">Manage your preferences</p>
    </header>
    <div style="padding:40px;text-align:center;">
      <p style="font-size:1.2rem;color:var(--medium-grey);font-weight:500;">
        Sorry. You have no options. Take it or leave it.
      </p>
    </div>
  `;
}

// --- Bootstrap ---

document.addEventListener('DOMContentLoaded', initializeStudentDashboard);
