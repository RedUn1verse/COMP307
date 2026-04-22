import { slots, meetings } from './api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        showLoginRequiredMessage();
        return;
    }

    if (userRole !== 'owner') {
        showOwnerRequiredMessage();
        return;
    }

    showDashboardView();
});

document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('new-private-slot-btn') || target.textContent?.includes('Private Slot')) {
        openNewSlotModal();
    }
    
    if (target.classList.contains('new-group-appointment-btn')) {
        openNewMeetingModal();
    }

    // Tab switching
    if (target.classList.contains('tab-btn')) {
        switchTab(target.getAttribute('data-tab') || 'private');
    }

    // Activate slot button
    if (target.classList.contains('activate-slot-btn')) {
        const slotId = target.getAttribute('data-slot-id');
        if (slotId) activateSlot(slotId, target);
    }

    // Accept meeting button
    if (target.classList.contains('accept-meeting-btn')) {
        const meetingId = target.getAttribute('data-meeting-id');
        if (meetingId) acceptMeeting(meetingId, target);
    }

    // Decline meeting button
    if (target.classList.contains('decline-meeting-btn')) {
        const meetingId = target.getAttribute('data-meeting-id');
        if (meetingId) declineMeeting(meetingId, target);
    }

    // Delete slot button
    if (target.classList.contains('delete-slot-btn')) {
        const slotId = target.getAttribute('data-slot-id');
        if (slotId) deleteSlot(slotId, target);
    }
});

document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('sidebar-link')) {
        e.preventDefault();

        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        target.classList.add('active');

        const section = target.textContent?.trim();
        switch (section) {
            case 'My Dashboard':
                showDashboardView();
                break;
            case 'Help & Support':
                showHelpAndSupportView();
                break;
            case 'Settings':
                showSettingsView();
                break;
        }
    }
});

// Main Dashboard View
async function showDashboardView() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <header class="content-header">
            <div>
                <h1 class="page-title">Welcome, Dr. Alberini</h1>
                <p class="page-description">Manage your appointments and availability.</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="card-action-button new-private-slot-btn" style="width: auto;">+ Private Slot</button>
                <button class="card-action-button new-group-appointment-btn" style="width: auto;">+ Group Meeting</button>
            </div>
        </header>

        <div class="dashboard-tabs" style="display: flex; gap: 20px; margin: 20px 0; border-bottom: 2px solid #e0e0e0; padding: 0 20px;">
            <button class="tab-btn active" data-tab="private" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--mcgill-red); border-bottom: 3px solid var(--mcgill-red); font-weight: 600;">Private Appointments</button>
            <button class="tab-btn" data-tab="group" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: #666;">Group Appointments</button>
            <button class="tab-btn" data-tab="calendar" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: #666;">Calendar View</button>
        </div>

        <div class="tab-content-container" style="padding: 20px;">
            <div id="private-tab" class="tab-content active" style="display: block;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading private appointments...</div>
            </div>
            <div id="group-tab" class="tab-content" style="display: none;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading group appointments...</div>
            </div>
            <div id="calendar-tab" class="tab-content" style="display: none;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading calendar view...</div>
            </div>
        </div>
    `;

    // Load data for all tabs
    await loadPrivateAppointments();
    await loadGroupAppointments();
    await loadCalendarView();
}

// Load Private Appointments
async function loadPrivateAppointments() {
    const privateTab = document.getElementById('private-tab');
    if (!privateTab) return;

    try {
        const data = await slots.getOwned();
        const slotsList = Array.isArray(data) ? data : data.slots || [];

        if (slotsList.length === 0) {
            privateTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No private slots created yet.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Create your first private appointment to get started.</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        for (const slot of slotsList) {
            const isPrivate = slot.isPrivate;
            const isBooked = slot.isBooked || (slot.bookings && slot.bookings.length > 0);
            const bookingInfo = isBooked && slot.bookings && slot.bookings.length > 0 
                ? `<p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #666;"><strong>Booked by:</strong> ${slot.bookings[0].userName} (${slot.bookings[0].userEmail})</p>`
                : '';

            html += `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: var(--mcgill-red);">${slot.title}</h3>
                            <p style="margin: 0; font-size: 0.9rem; color: #666;">${slot.date}</p>
                        </div>
                        <span style="background: ${isPrivate ? '#ffe0e0' : '#e0f0ff'}; color: ${isPrivate ? '#c00' : '#006'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                            ${isPrivate ? 'PRIVATE' : 'PUBLIC'}
                        </span>
                    </div>

                    <p style="margin: 10px 0; font-size: 0.95rem;"><strong>Time:</strong> ${slot.startTime} - ${slot.endTime}</p>
                    ${bookingInfo}

                    <div style="display: flex; gap: 8px; margin-top: 15px;">
                        ${isPrivate ? `
                            <button class="activate-slot-btn" data-slot-id="${slot.slotId}" style="flex: 1; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Publish</button>
                        ` : ''}
                        <button class="delete-slot-btn" data-slot-id="${slot.slotId}" style="flex: ${isPrivate ? '1' : '0'}; padding: 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Delete</button>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        privateTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load private appointments:', error);
        privateTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading appointments. Please try again.</div>`;
    }
}

// Load Group Appointments (Meeting Requests)
async function loadGroupAppointments() {
    const groupTab = document.getElementById('group-tab');
    if (!groupTab) return;

    try {
        const data = await meetings.getMe();
        const meetingsList = Array.isArray(data) ? data : data.meetings || [];

        if (meetingsList.length === 0) {
            groupTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No group appointment requests yet.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Students can send you group meeting requests.</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        for (const meeting of meetingsList) {
            html += `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: var(--mcgill-red);">${meeting.title || 'Meeting Request'}</h3>
                            <p style="margin: 0; font-size: 0.9rem; color: #666;">From: ${meeting.requesterName || 'Unknown'}</p>
                        </div>
                        <span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                            PENDING
                        </span>
                    </div>

                    <p style="margin: 10px 0; font-size: 0.95rem;"><strong>Requested:</strong> ${meeting.date} ${meeting.startTime} - ${meeting.endTime}</p>
                    <p style="margin: 10px 0; font-size: 0.9rem; color: #666;">${meeting.message || 'No message provided'}</p>

                    <div style="display: flex; gap: 8px; margin-top: 15px;">
                        <button class="accept-meeting-btn" data-meeting-id="${meeting.meetingId}" style="flex: 1; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Accept</button>
                        <button class="decline-meeting-btn" data-meeting-id="${meeting.meetingId}" style="flex: 1; padding: 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Decline</button>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        groupTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load group appointments:', error);
        groupTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading appointments. Please try again.</div>`;
    }
}

// Load Calendar View
async function loadCalendarView() {
    const calendarTab = document.getElementById('calendar-tab');
    if (!calendarTab) return;

    try {
        const slotData = await slots.getOwned();
        const slotsList = Array.isArray(slotData) ? slotData : slotData.slots || [];

        // Group slots by date
        const slotsByDate: { [key: string]: any[] } = {};
        for (const slot of slotsList) {
            if (!slotsByDate[slot.date]) {
                slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date].push(slot);
        }

        // Sort dates
        const sortedDates = Object.keys(slotsByDate).sort();

        if (sortedDates.length === 0) {
            calendarTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No appointments scheduled yet.</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 20px;">';

        for (const date of sortedDates) {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            html += `<div style="border-left: 4px solid var(--mcgill-red); padding-left: 20px;">
                <h3 style="margin: 0 0 15px 0; color: var(--mcgill-red);">${formattedDate}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">`;

            for (const slot of slotsByDate[date]) {
                const isBooked = slot.isBooked || (slot.bookings && slot.bookings.length > 0);
                html += `
                    <div style="background: ${isBooked ? '#fafafa' : '#f5f5f5'}; border: 1px solid #ddd; border-radius: 6px; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin: 0; color: var(--mcgill-red);">${slot.title}</h4>
                            <span style="background: ${slot.isPrivate ? '#ffe0e0' : '#e0f0ff'}; color: ${slot.isPrivate ? '#c00' : '#006'}; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; font-weight: 600;">
                                ${slot.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                            </span>
                        </div>
                        <p style="margin: 8px 0; font-size: 0.95rem;"><strong>⏰</strong> ${slot.startTime} - ${slot.endTime}</p>
                        ${isBooked ? `<p style="margin: 8px 0; font-size: 0.9rem; color: #666;"><strong>✓ Booked</strong></p>` : `<p style="margin: 8px 0; font-size: 0.9rem; color: #999;">Available</p>`}
                    </div>
                `;
            }

            html += '</div></div>';
        }

        html += '</div>';
        calendarTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load calendar view:', error);
        calendarTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading calendar. Please try again.</div>`;
    }
}

// Tab Switching
function switchTab(tabName: string) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        (tab as HTMLElement).style.display = 'none';
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        (btn as HTMLElement).style.color = '#666';
        (btn as HTMLElement).style.borderBottom = 'none';
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // Add active class to clicked button
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`) as HTMLElement;
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--mcgill-red)';
        activeBtn.style.borderBottom = '3px solid var(--mcgill-red)';
    }
}

// Activate Slot (make it public)
async function activateSlot(slotId: string, button: HTMLElement) {
    try {
        const btn = button as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Publishing...';

        await slots.activate(slotId);
        
        alert('Slot published successfully!');
        await loadPrivateAppointments();
    } catch (error) {
        console.error('Failed to activate slot:', error);
        alert('Failed to publish slot. Please try again.');
        const btn = button as HTMLButtonElement;
        btn.disabled = false;
        btn.textContent = 'Publish';
    }
}

// Delete Slot
async function deleteSlot(slotId: string, button: HTMLElement) {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
        const btn = button as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Deleting...';

        await slots.deleteSlot(slotId);
        
        alert('Slot deleted successfully!');
        await loadPrivateAppointments();
        await loadCalendarView();
    } catch (error) {
        console.error('Failed to delete slot:', error);
        alert('Failed to delete slot. Please try again.');
        const btn = button as HTMLButtonElement;
        btn.disabled = false;
        btn.textContent = 'Delete';
    }
}

// Accept Meeting Request
async function acceptMeeting(meetingId: string, button: HTMLElement) {
    try {
        const btn = button as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Accepting...';

        await meetings.accept(meetingId);
        
        alert('Meeting request accepted!');
        await loadGroupAppointments();
    } catch (error) {
        console.error('Failed to accept meeting:', error);
        alert('Failed to accept meeting. Please try again.');
        const btn = button as HTMLButtonElement;
        btn.disabled = false;
        btn.textContent = 'Accept';
    }
}

// Decline Meeting Request
async function declineMeeting(meetingId: string, button: HTMLElement) {
    try {
        const btn = button as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Declining...';

        await meetings.decline(meetingId);
        
        alert('Meeting request declined.');
        await loadGroupAppointments();
    } catch (error) {
        console.error('Failed to decline meeting:', error);
        alert('Failed to decline meeting. Please try again.');
        const btn = button as HTMLButtonElement;
        btn.disabled = false;
        btn.textContent = 'Decline';
    }
}

// Other Views
function showHelpAndSupportView() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <header class="content-header">
            <h1 class="page-title">Help & Support</h1>
            <p class="page-description">Get assistance with the platform</p>
        </header>
        <div style="padding: 40px; text-align: center;">
            <p style="font-size: 1.2rem; color: var(--medium-grey); font-weight: 500;">TBD!</p>
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
        <div style="padding: 40px; text-align: center;">
            <p style="font-size: 1.2rem; color: var(--medium-grey); font-weight: 500;">
                Sorry. You have no options. Take it or leave it.
            </p>
        </div>
    `;
}

// New Private Slot Modal
function openNewSlotModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('slot-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'slot-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; border-radius: 12px; padding: 30px;
            max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-height: 90vh; overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 1.5rem;">Create New Private Slot</h2>
                <button id="close-modal" style="
                    background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
                ">&times;</button>
            </div>

            <form id="slot-form" style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="slot-title" style="display: block; margin-bottom: 5px; font-weight: 500;">Title</label>
                    <input type="text" id="slot-title" placeholder="e.g., Office Hours" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                </div>

                <div>
                    <label for="slot-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Date</label>
                    <input type="date" id="slot-date" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label for="slot-start-time" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                        <input type="time" id="slot-start-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label for="slot-end-time" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                        <input type="time" id="slot-end-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" style="
                        flex: 1; padding: 12px; background: var(--mcgill-red); color: white; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
                    ">Create Slot</button>
                    <button type="button" id="cancel-slot" style="
                        flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-modal') as HTMLElement;
    const cancelBtn = modal.querySelector('#cancel-slot') as HTMLElement;
    const form = modal.querySelector('#slot-form') as HTMLFormElement;

    closeBtn?.addEventListener('click', () => modal.remove());
    cancelBtn?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSlotCreation(form, modal);
    });
}

// New Group Meeting Modal
function openNewMeetingModal() {
    /*
    * This function creates and displays a modal for proposing a new group meeting. 
    * It includes form fields for the meeting title, recipient email, date, start time, end time, and an optional message. 
    * The modal also has "Send Request" and "Cancel" buttons. When the form is submitted,
    * it will call the handleMeetingCreation function to process the meeting request.
    */ 
    // Remove any existing modal
    const existingModal = document.getElementById('meeting-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'meeting-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; border-radius: 12px; padding: 30px;
            max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-height: 90vh; overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 1.5rem;">Propose Group Meeting</h2>
                <button id="close-meeting-modal" style="
                    background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
                ">&times;</button>
            </div>

            <form id="meeting-form" style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="meeting-title" style="display: block; margin-bottom: 5px; font-weight: 500;">Meeting Title</label>
                    <input type="text" id="meeting-title" placeholder="e.g., Group Project Discussion" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                </div>

                <div>
                    <label for="meeting-email" style="display: block; margin-bottom: 5px; font-weight: 500;">Recipient Email</label>
                    <input type="email" id="meeting-email" placeholder="e.g., carol@mcgill.ca" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                </div>

                <div>
                    <label for="meeting-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Date</label>
                    <input type="date" id="meeting-date" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label for="meeting-start-time" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                        <input type="time" id="meeting-start-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label for="meeting-end-time" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                        <input type="time" id="meeting-end-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div>
                    <label for="meeting-message" style="display: block; margin-bottom: 5px; font-weight: 500;">Message</label>
                    <textarea id="meeting-message" placeholder="Describe the purpose of the meeting..." style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 80px;
                    "></textarea>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" style="
                        flex: 1; padding: 12px; background: var(--mcgill-red); color: white; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
                    ">Send Request</button>
                    <button type="button" id="cancel-meeting" style="
                        flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-meeting-modal') as HTMLElement;
    const cancelBtn = modal.querySelector('#cancel-meeting') as HTMLElement;
    const form = modal.querySelector('#meeting-form') as HTMLFormElement;

    closeBtn?.addEventListener('click', () => modal.remove());
    cancelBtn?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleMeetingCreation(form, modal);
    });
}

async function handleSlotCreation(form: HTMLFormElement, modal: HTMLElement) {
    /*
    * Validate form inputs, then call API to create slot. On success, close modal and refresh private appointments and calendar view.
    */
    const title = (form.querySelector('#slot-title') as HTMLInputElement).value;
    const date = (form.querySelector('#slot-date') as HTMLInputElement).value;
    const startTime = (form.querySelector('#slot-start-time') as HTMLInputElement).value;
    const endTime = (form.querySelector('#slot-end-time') as HTMLInputElement).value;

    if (!title || !date || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        await slots.create({
            title,
            date,
            startTime,
            endTime
        });

        alert(`Private slot "${title}" created successfully!`);
        modal.remove();
        
        // Reload private appointments
        await loadPrivateAppointments();
        await loadCalendarView();
    } catch (error) {
        console.error('Slot creation failed:', error);
        alert('Failed to create slot. Please try again.');
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Slot';
    }
}

// Handle Meeting Creation
async function handleMeetingCreation(form: HTMLFormElement, modal: HTMLElement) {
    const title = (form.querySelector('#meeting-title') as HTMLInputElement).value;
    const ownerEmail = (form.querySelector('#meeting-email') as HTMLInputElement).value;
    const date = (form.querySelector('#meeting-date') as HTMLInputElement).value;
    const startTime = (form.querySelector('#meeting-start-time') as HTMLInputElement).value;
    const endTime = (form.querySelector('#meeting-end-time') as HTMLInputElement).value;
    const message = (form.querySelector('#meeting-message') as HTMLTextAreaElement).value;

    if (!title || !ownerEmail || !date || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        await meetings.create({
            title,
            ownerEmail,
            date,
            startTime,
            endTime,
            message
        });

        alert('Meeting request sent successfully!');
        modal.remove();
        
        // Reload group appointments
        await loadGroupAppointments();
    } catch (error) {
        console.error('Meeting creation failed:', error);
        alert('Failed to send meeting request. Please try again.');
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Request';
    }
}

// Authentication check functions
function showLoginRequiredMessage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <header class="content-header">
            <h1 class="page-title">Authentication Required</h1>
            <p class="page-description">Please login to access the professor dashboard.</p>
        </header>

        <section class="welcome-section" style="padding: 40px; text-align: center;">
            <h2 style="color: var(--mcgill-red); margin-bottom: 20px;">Login Required</h2>
            <p style="font-size: 1.1rem; color: var(--text-color); max-width: 600px; margin: 0 auto; margin-bottom: 30px;">
                You need to be logged in as a professor to access this dashboard.
            </p>
            <button onclick="window.location.href='signin.html'" style="
                padding: 12px 24px; background: var(--mcgill-red); color: white; border: none;
                border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
            ">Go to Login</button>
        </section>
    `;
}

function showOwnerRequiredMessage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <header class="content-header">
            <h1 class="page-title">Access Denied</h1>
            <p class="page-description">Professor access required.</p>
        </header>

        <section class="welcome-section" style="padding: 40px; text-align: center;">
            <h2 style="color: var(--mcgill-red); margin-bottom: 20px;">Professor Access Required</h2>
            <p style="font-size: 1.1rem; color: var(--text-color); max-width: 600px; margin: 0 auto; margin-bottom: 30px;">
                This dashboard is only accessible to professors. Please login with a professor account.
            </p>
            <button onclick="window.location.href='signin.html'" style="
                padding: 12px 24px; background: var(--mcgill-red); color: white; border: none;
                border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
            ">Go to Login</button>
        </section>
    `;
}
