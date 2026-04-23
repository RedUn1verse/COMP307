import { slots, meetings, proposals } from './api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // TEMPORARY: Bypass auth to work on dashboard
    // Set dummy values so we can test without logging in
    localStorage.setItem('accessToken', 'temp-token-for-testing');
    localStorage.setItem('userRole', 'owner');
    localStorage.setItem('userId', 'o1');
    localStorage.setItem('userEmail', 'carol@mcgill.ca');

    showDashboardView();
});

document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('new-private-slot-btn') || target.textContent?.includes('Private Slot')) {
        openNewSlotModal();
    }
    
    if (target.classList.contains('new-group-appointment-btn')) {
        openNewProposalModal();
    }

    if (target.classList.contains('new-recurring-oh-btn')) {
        openNewRecurringModal();
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

    // Select option button from group proposal
    if (target.classList.contains('select-option-btn')) {
        const proposalId = target.getAttribute('data-proposal-id');
        const optionId = target.getAttribute('data-option-id');
        if (proposalId && optionId) selectProposalOption(proposalId, optionId, target);
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
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="card-action-button new-private-slot-btn" style="width: auto;">+ Private Slot</button>
                <button class="card-action-button new-group-appointment-btn" style="width: auto;">+ Group Poll</button>
                <button class="card-action-button new-recurring-oh-btn" style="width: auto;">+ Recurring OH</button>
            </div>
        </header>

        <div class="dashboard-tabs" style="display: flex; gap: 20px; margin: 20px 0; border-bottom: 2px solid #e0e0e0; padding: 0 20px; flex-wrap: wrap;">
            <button class="tab-btn active" data-tab="private" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--mcgill-red); border-bottom: 3px solid var(--mcgill-red); font-weight: 600;">Private Slots</button>
            <button class="tab-btn" data-tab="requests" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: #666;">Meeting Requests</button>
            <button class="tab-btn" data-tab="group" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: #666;">Group Polls</button>
            <button class="tab-btn" data-tab="recurring" style="padding: 10px 0; background: none; border: none; font-size: 1rem; cursor: pointer; color: #666;">Recurring OH</button>
        </div>

        <div class="tab-content-container" style="padding: 20px;">
            <div id="private-tab" class="tab-content active" style="display: block;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading private slots...</div>
            </div>
            <div id="requests-tab" class="tab-content" style="display: none;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading meeting requests...</div>
            </div>
            <div id="group-tab" class="tab-content" style="display: none;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading group polls...</div>
            </div>
            <div id="recurring-tab" class="tab-content" style="display: none;">
                <div style="text-align: center; padding: 40px; color: #999;">Loading recurring office hours...</div>
            </div>
        </div>
    `;

    // Load data for all tabs
    await loadPrivateAppointments();
    await loadMeetingRequests();
    await loadGroupProposals();
    await loadRecurringView();
    await updateSidebarActiveSlots();
}

// Update sidebar with professor's active slots
async function updateSidebarActiveSlots() {
    const sidebarSlots = document.getElementById('sidebar-active-slots');
    if (!sidebarSlots) return;

    try {
        const data = await slots.getOwned();
        const slotsList = Array.isArray(data) ? data : data.slots || [];
        const activeSlots = slotsList.filter((slot: any) => !slot.isPrivate);

        if (activeSlots.length === 0) {
            sidebarSlots.innerHTML = '<div style="padding: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.7);">No active slots</div>';
            return;
        }

        let html = '';
        for (const slot of activeSlots) {
            const isBooked = slot.isBooked || (slot.bookings && slot.bookings.length > 0);
            const bookingCount = slot.bookings?.length || 0;
            const statusDot = isBooked ? 'Y' : 'N';
            
            html += `
                <div style="
                    padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px;
                    font-size: 0.85rem; cursor: pointer; transition: background 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    <div style="font-weight: 500; margin-bottom: 4px;">${statusDot} ${slot.title}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">${slot.date}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">${slot.startTime} - ${slot.endTime}</div>
                    ${bookingCount > 0 ? `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 4px;">Booked: ${bookingCount}</div>` : ''}
                </div>
            `;
        }
        
        sidebarSlots.innerHTML = html;
    } catch (error) {
        console.error('Failed to update sidebar slots:', error);
        sidebarSlots.innerHTML = '<div style="padding: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Error loading slots</div>';
    }
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

// Load Meeting Requests
async function loadMeetingRequests() {
    const requestsTab = document.getElementById('requests-tab');
    if (!requestsTab) return;

    try {
        const data = await meetings.getMe();
        const meetingsList = Array.isArray(data) ? data : data.meetings || [];

        if (meetingsList.length === 0) {
            requestsTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No meeting requests yet.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Students can send you direct office hour requests here.</p>
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
                            <p style="margin: 0; font-size: 0.9rem; color: #666;">From: ${meeting.userName || 'Unknown'}</p>
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
        requestsTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load meeting requests:', error);
        requestsTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading meeting requests. Please try again.</div>`;
    }
}

// Load Group Polls
async function loadGroupProposals() {
    const groupTab = document.getElementById('group-tab');
    if (!groupTab) return;

    try {
        const proposalsData = await proposals.getOwned();
        const proposalsList = Array.isArray(proposalsData) ? proposalsData : [];

        if (proposalsList.length === 0) {
            groupTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No group polls created yet.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Create a group poll to let students vote on the best office hour option.</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">';

        for (const proposal of proposalsList) {
            html += `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 10px 0; color: var(--mcgill-red);">${proposal.title}</h3>
                    <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #666;"><strong>Invited:</strong> ${proposal.invitedUsers?.join(', ') || 'No students'}</p>
                    <div style="display: grid; gap: 12px; margin-top: 10px;">
            `;

            for (const option of proposal.options) {
                html += `
                    <div style="background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                            <div>
                                <p style="margin: 0 0 6px 0; font-weight: 600;">${option.date} ${option.startTime} - ${option.endTime}</p>
                                <p style="margin: 0; font-size: 0.85rem; color: #666;">Votes: ${option.voteCount}</p>
                            </div>
                            <button class="select-option-btn" data-proposal-id="${proposal.proposalId}" data-option-id="${option.optionId}" style="padding: 8px 12px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Select</button>
                        </div>
                    </div>
                `;
            }

            html += '</div></div>';
        }

        html += '</div>';
        groupTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load group polls:', error);
        groupTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading group polls. Please try again.</div>`;
    }
}

// Load Recurring OH View
async function loadRecurringView() {
    const recurringTab = document.getElementById('recurring-tab');
    if (!recurringTab) return;

    try {
        const slotData = await slots.getOwned();
        const slotsList = Array.isArray(slotData) ? slotData : slotData.slots || [];
        const activeSlots = slotsList.filter((slot: any) => !slot.isPrivate);

        if (activeSlots.length === 0) {
            recurringTab.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>No recurring office hours are currently active.</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Create a recurring OH slot to make it available to students immediately.</p>
                </div>
            `;
            return;
        }

        const slotsByDate: { [key: string]: any[] } = {};
        for (const slot of activeSlots) {
            if (!slotsByDate[slot.date]) {
                slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date].push(slot);
        }

        const sortedDates = Object.keys(slotsByDate).sort();
        let html = '<div style="display: flex; flex-direction: column; gap: 20px;">';

        for (const date of sortedDates) {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            html += `<div style="border-left: 4px solid var(--mcgill-red); padding-left: 20px;">
                <h3 style="margin: 0 0 15px 0; color: var(--mcgill-red);">${formattedDate}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">`;

            for (const slot of slotsByDate[date]) {
                const isBooked = slot.isBooked || (slot.bookings && slot.bookings.length > 0);
                const bookingCount = slot.bookings?.length || 0;
                html += `
                    <div style="background: ${isBooked ? '#fafafa' : '#f5f5f5'}; border: 1px solid #ddd; border-radius: 6px; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin: 0; color: var(--mcgill-red);">${slot.title}</h4>
                            <span style="background: ${slot.isPrivate ? '#ffe0e0' : '#e0f0ff'}; color: ${slot.isPrivate ? '#c00' : '#006'}; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; font-weight: 600;">
                                ${slot.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                            </span>
                        </div>
                        <p style="margin: 8px 0; font-size: 0.95rem;"><strong>⏰</strong> ${slot.startTime} - ${slot.endTime}</p>
                        ${isBooked ? `<p style="margin: 8px 0; font-size: 0.9rem; color: #666;"><strong>✓ Booked</strong> (${bookingCount})</p>` : `<p style="margin: 8px 0; font-size: 0.9rem; color: #999;">Available</p>`}
                        <button class="delete-slot-btn" data-slot-id="${slot.slotId}" style="margin-top: 10px; padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Cancel Slot</button>
                    </div>
                `;
            }

            html += '</div></div>';
        }

        html += '</div>';
        recurringTab.innerHTML = html;
    } catch (error) {
        console.error('Failed to load recurring office hours view:', error);
        recurringTab.innerHTML = `<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading recurring office hours. Please try again.</div>`;
    }
}

// Helper reload methods
async function loadCalendarView() {
    await loadPrivateAppointments();
}

async function loadGroupAppointments() {
    await loadMeetingRequests();
    await loadGroupProposals();
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

// New Group Poll Modal
function openNewProposalModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('proposal-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'proposal-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; border-radius: 12px; padding: 30px;
            max-width: 580px; width: 95%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-height: 90vh; overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 1.5rem;">Create Group Poll</h2>
                <button id="close-proposal-modal" style="
                    background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
                ">&times;</button>
            </div>

            <form id="proposal-form" style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="proposal-title" style="display: block; margin-bottom: 5px; font-weight: 500;">Poll Title</label>
                    <input type="text" id="proposal-title" placeholder="e.g., Final Project Time" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                </div>

                <div>
                    <label for="proposal-invitees" style="display: block; margin-bottom: 5px; font-weight: 500;">Invite Students</label>
                    <textarea id="proposal-invitees" placeholder="Enter student names separated by commas or new lines" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 80px;
                    "></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label for="proposal-option-1-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Option 1 Date</label>
                        <input type="date" id="proposal-option-1-date" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label for="proposal-option-1-start" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                        <input type="time" id="proposal-option-1-start" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label for="proposal-option-1-end" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                        <input type="time" id="proposal-option-1-end" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div></div>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 10px;">
                    <div style="margin-bottom: 10px; font-weight: 600;">Optional second option</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label for="proposal-option-2-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Option 2 Date</label>
                            <input type="date" id="proposal-option-2-date" style="
                                width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div>
                            <label for="proposal-option-2-start" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                            <input type="time" id="proposal-option-2-start" style="
                                width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                                box-sizing: border-box;
                            ">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div>
                            <label for="proposal-option-2-end" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                            <input type="time" id="proposal-option-2-end" style="
                                width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                                box-sizing: border-box;
                            ">
                        </div>
                        <div></div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" style="
                        flex: 1; padding: 12px; background: var(--mcgill-red); color: white; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
                    ">Create Poll</button>
                    <button type="button" id="cancel-proposal" style="
                        flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-proposal-modal') as HTMLElement;
    const cancelBtn = modal.querySelector('#cancel-proposal') as HTMLElement;
    const form = modal.querySelector('#proposal-form') as HTMLFormElement;

    closeBtn?.addEventListener('click', () => modal.remove());
    cancelBtn?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleProposalCreation(form, modal);
    });
}

function openNewRecurringModal() {
    const existingModal = document.getElementById('recurring-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'recurring-modal';
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
                <h2 style="margin: 0; font-size: 1.5rem;">Create Recurring OH Slot</h2>
                <button id="close-recurring-modal" style="
                    background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
                ">&times;</button>
            </div>

            <form id="recurring-form" style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="recurring-title" style="display: block; margin-bottom: 5px; font-weight: 500;">Title</label>
                    <input type="text" id="recurring-title" placeholder="e.g., Weekly Office Hours" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                </div>

                <div>
                    <label for="recurring-date" style="display: block; margin-bottom: 5px; font-weight: 500;">Date</label>
                    <input type="date" id="recurring-date" required style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label for="recurring-start-time" style="display: block; margin-bottom: 5px; font-weight: 500;">Start Time</label>
                        <input type="time" id="recurring-start-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div>
                        <label for="recurring-end-time" style="display: block; margin-bottom: 5px; font-weight: 500;">End Time</label>
                        <input type="time" id="recurring-end-time" required style="
                            width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div>
                    <label for="recurring-frequency" style="display: block; margin-bottom: 5px; font-weight: 500;">Frequency</label>
                    <select id="recurring-frequency" style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                        <option value="single">Single public slot</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>

                <div>
                    <label for="recurring-count" style="display: block; margin-bottom: 5px; font-weight: 500;">Repeat Count</label>
                    <input type="number" id="recurring-count" min="1" value="4" style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit;
                    ">
                    <p style="margin: 6px 0 0 0; font-size: 0.85rem; color: #666;">Number of weekly occurrences to create.</p>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" style="
                        flex: 1; padding: 12px; background: var(--mcgill-red); color: white; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer; font-weight: 500;
                    ">Create Recurring OH</button>
                    <button type="button" id="cancel-recurring" style="
                        flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none;
                        border-radius: 6px; font-size: 1rem; cursor: pointer;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-recurring-modal') as HTMLElement;
    const cancelBtn = modal.querySelector('#cancel-recurring') as HTMLElement;
    const form = modal.querySelector('#recurring-form') as HTMLFormElement;

    closeBtn?.addEventListener('click', () => modal.remove());
    cancelBtn?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRecurringCreation(form, modal);
    });
}

async function handleSlotCreation(form: HTMLFormElement, modal: HTMLElement) {
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
        
        await loadPrivateAppointments();
        await loadRecurringView();
    } catch (error) {
        console.error('Slot creation failed:', error);
        alert('Failed to create slot. Please try again.');
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Slot';
    }
}

async function handleRecurringCreation(form: HTMLFormElement, modal: HTMLElement) {
    const title = (form.querySelector('#recurring-title') as HTMLInputElement).value;
    const date = (form.querySelector('#recurring-date') as HTMLInputElement).value;
    const startTime = (form.querySelector('#recurring-start-time') as HTMLInputElement).value;
    const endTime = (form.querySelector('#recurring-end-time') as HTMLInputElement).value;
    const frequency = (form.querySelector('#recurring-frequency') as HTMLSelectElement).value;
    const recurrenceCount = parseInt((form.querySelector('#recurring-count') as HTMLInputElement).value, 10) || 1;

    if (!title || !date || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
    }

    if (frequency === 'weekly' && recurrenceCount < 1) {
        alert('Repeat count must be at least 1');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        if (frequency === 'single') {
            // Single slot - just create and activate it
            const slot = await slots.create({
                title,
                date,
                startTime,
                endTime
            });
            await slots.activate(slot.slotId);
            alert(`Public slot "${title}" created successfully!`);
        } else if (frequency === 'weekly') {
            // Recurring slots - use the count provided
            const slots_created = await slots.createRecurring({
                title,
                date,
                startTime,
                endTime,
                reccurence: recurrenceCount // Note: backend uses 'reccurence' spelling
            });
            
            // Activate all the slots
            for (const slot of slots_created) {
                await slots.activate(slot.slotId);
            }
            alert(`Weekly recurring OH "${title}" created for ${recurrenceCount} weeks and published!`);
        }

        modal.remove();
        await loadPrivateAppointments();
        await loadRecurringView();
    } catch (error) {
        console.error('Recurring slot creation failed:', error);
        alert('Failed to create recurring OH. Please try again.');
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Recurring OH';
    }
}

async function handleProposalCreation(form: HTMLFormElement, modal: HTMLElement) {
    const title = (form.querySelector('#proposal-title') as HTMLInputElement).value;
    const inviteesRaw = (form.querySelector('#proposal-invitees') as HTMLTextAreaElement).value;
    const option1Date = (form.querySelector('#proposal-option-1-date') as HTMLInputElement).value;
    const option1Start = (form.querySelector('#proposal-option-1-start') as HTMLInputElement).value;
    const option1End = (form.querySelector('#proposal-option-1-end') as HTMLInputElement).value;
    const option2Date = (form.querySelector('#proposal-option-2-date') as HTMLInputElement).value;
    const option2Start = (form.querySelector('#proposal-option-2-start') as HTMLInputElement).value;
    const option2End = (form.querySelector('#proposal-option-2-end') as HTMLInputElement).value;

    const invitees = inviteesRaw
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);

    const options = [] as Array<{ date: string; startTime: string; endTime: string }>;
    if (option1Date && option1Start && option1End) {
        options.push({ date: option1Date, startTime: option1Start, endTime: option1End });
    }
    if (option2Date && option2Start && option2End) {
        options.push({ date: option2Date, startTime: option2Start, endTime: option2End });
    }

    if (!title || invitees.length === 0 || options.length === 0) {
        alert('Please provide a title, at least one student, and at least one option.');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        await proposals.create({
            title,
            userNames: invitees,
            options,
        });

        alert('Group poll created successfully!');
        modal.remove();
        await loadGroupProposals();
    } catch (error) {
        console.error('Proposal creation failed:', error);
        alert('Failed to create group poll. Please try again.');
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Poll';
    }
}

async function selectProposalOption(proposalId: string, optionId: string, button: HTMLElement) {
    try {
        const btn = button as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Selecting...';

        await proposals.select(proposalId, optionId);

        alert('Option selected successfully!');
        await loadGroupProposals();
    } catch (error) {
        console.error('Failed to select proposal option:', error);
        alert('Failed to select option. Please try again.');
        const btn = button as HTMLButtonElement;
        btn.disabled = false;
        btn.textContent = 'Select';
    }
}

// Authentication check functions (TEMPORARY - Disabled for development)
/*
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
*/
