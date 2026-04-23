/**
 * Student Dashboard for the main.html page
 * Self-contained implementation with its own modal and button handlers
 */

import { meetings, bookings } from './api';

// --- Interfaces ---

// interface Appointment {
//   _id: string;
//   studentId: string;
//   slotId: string;
//   professorName: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   status: string;
// }

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

// --- Init ---

export function initializeStudentDashboard() {
  setupSidebarNavigation();
  setupViewAndBookButtons();
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

function setupViewAndBookButtons() {
  // Remove existing listeners to avoid duplicates
  const buttons = document.querySelectorAll('.view-and-book-btn');
  buttons.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode?.replaceChild(newBtn, btn);
  });

  // Add fresh listeners using event delegation
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('view-and-book-btn')) {
      e.preventDefault();
      const professorName = target.getAttribute('data-professor') || '';
      openBookingModal(professorName);
    }
  });
}

function openBookingModal(professorName: string) {
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
    await handleBookingSubmit(form, modal);
  });
}

async function handleBookingSubmit(form: HTMLFormElement, modal: HTMLElement) {
  const title = (form.querySelector('#booking-title') as HTMLInputElement).value;
  const date = (form.querySelector('#booking-date') as HTMLInputElement).value;
  const startTime = (form.querySelector('#booking-start-time') as HTMLInputElement).value;
  const endTime = (form.querySelector('#booking-end-time') as HTMLInputElement).value;
  const notes = (form.querySelector('#booking-notes') as HTMLTextAreaElement).value;

  if (!title || !date || !startTime || !endTime) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const bookingData = {
      ownerEmail: 'carol@mcgill.ca',
      title,
      message: notes || 'Office hours booking',
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

function showBrowseProfessorsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  // Card markup matches the compact style defined in style.css
  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">Browse Professors</h1>
      <p class="page-description">Find and book office hours with your professors</p>
    </header>

    <section class="search-filter-bar">
      <div class="search-input-container">
        <span class="search-icon-placeholder"></span>
        <input type="text" class="search-input"
          placeholder="Search by name, department, or expertise...">
      </div>
      <div class="filter-container">
        <span class="filter-icon-placeholder"></span>
        All Departments
      </div>
    </section>

    <section class="card-grid">
      <div class="prof-card">
        <h2 class="prof-name">Dr. Guilia Alberini</h2>
        <p class="prof-department">Computer Science</p>
        <div class="prof-detail">Engineering Building, Room 301</div>
        <div class="prof-detail">guilia.alberini@mcgill.ca</div>
        <div class="prof-hours-label">Office Hours</div>
        <div class="prof-hours-list">
          Mon 10:00-12:00 &nbsp;|&nbsp; Wed 14:00-16:00
          <br><a href="#">+1 more</a>
        </div>
        <button class="card-action-button view-and-book-btn"
          data-professor="Dr. Guilia Alberini">View &amp; Book</button>
      </div>

      <div class="prof-card">
        <h2 class="prof-name">Dr. Jackie Chen</h2>
        <p class="prof-department">Computer Science</p>
        <div class="prof-detail">Math Building, Room 205</div>
        <div class="prof-detail">jackie.chen@mcgill.ca</div>
        <div class="prof-hours-label">Office Hours</div>
        <div class="prof-hours-list">
          Tue 13:00-15:00 &nbsp;|&nbsp; Thu 13:00-15:00
        </div>
        <button class="card-action-button view-and-book-btn"
          data-professor="Dr. Jackie Chen">View &amp; Book</button>
      </div>

      <div class="prof-card">
        <h2 class="prof-name">Dr. Jeremy MacDonald</h2>
        <p class="prof-department">Mathematics</p>
        <div class="prof-detail">Burnside Hall, Room 1120</div>
        <div class="prof-detail">j.macdonald@mcgill.ca</div>
        <div class="prof-hours-label">Office Hours</div>
        <div class="prof-hours-list">
          Mon 14:00-16:00 &nbsp;|&nbsp; Fri 10:00-12:00
        </div>
        <button class="card-action-button view-and-book-btn"
          data-professor="Dr. Jeremy MacDonald">View &amp; Book</button>
      </div>

      <div class="prof-card">
        <h2 class="prof-name">Dr. Djivede Kelome</h2>
        <p class="prof-department">Mathematics</p>
        <div class="prof-detail">Rutherford Physics, Room 311</div>
        <div class="prof-detail">d.kelome@mcgill.ca</div>
        <div class="prof-hours-label">Office Hours</div>
        <div class="prof-hours-list">
          Wed 10:00-11:30 &nbsp;|&nbsp; Thu 15:00-16:30
        </div>
        <button class="card-action-button view-and-book-btn"
          data-professor="Dr. Djivede Kelome">View &amp; Book</button>
      </div>
    </section>
  `;

  // Re-attach "View & Book" listeners to the freshly rendered cards
  setupViewAndBookButtons();
}

async function showMyAppointmentsView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <header class="content-header">
      <h1 class="page-title">My Appointments</h1>
      <p class="page-description">Your booked office hour appointments</p>
    </header>
    <div id="appointments-container" style="padding: 20px;">
      <p>Loading appointments...</p>
    </div>
  `;
  console.log("hello");
  try {
    const appointments: Appointment[] = await bookings.getMyBookings();
    
    const container = document.getElementById('appointments-container')!;

    if (appointments && appointments.length > 0) {
      let html = '<div style="display:grid;gap:15px;">';
      appointments.forEach((apt) => {
        html += `
          <div style="border:1px solid #ddd;padding:15px;border-radius:8px;background:#f9f9f9;">
            <h3 style="margin:0 0 10px 0;">${apt.ownerName}</h3>
            <p style="margin:5px 0;"><strong>Date:</strong>
              ${new Date(apt.date).toLocaleDateString()}</p>
            <p style="margin:5px 0;"><strong>Time:</strong>
              ${apt.startTime} - ${apt.endTime}</p>
            <p style="margin:5px 0;"><strong>Status:</strong>
              <span style="color:${'orange'};">
                ${"confirmed"}
              <p style="margin:5px 0;"><strong>Email:</strong>
              <a href="mailto:${apt.ownerEmail}">${apt.ownerEmail}</a></p>
              </span>
            </p>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    } else {
      container.innerHTML =
        '<p style="padding:20px;text-align:center;color:#666;">No appointments booked yet.</p>';
    }
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    document.getElementById('appointments-container')!.innerHTML =
      '<p style="padding:20px;color:red;">Failed to load appointments.</p>';
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
