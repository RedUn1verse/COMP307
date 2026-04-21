
document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('new-private-slot-btn') || target.textContent?.includes('New Private Slot')) {
        openNewSlotModal();
    }
});

// Sidebar navigation
document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('sidebar-link')) {
        e.preventDefault();

        // Remove active class from all links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        target.classList.add('active');

        // Handle navigation
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

// View functions
function showDashboardView() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <header class="content-header">
            <div>
                <h1 class="page-title">Welcome, Dr. Alberini</h1>
                <p class="page-description">Welcome to your professor dashboard.</p>
            </div>
            <button class="card-action-button new-private-slot-btn" style="width: auto;">+ New Private Slot</button>
        </header>

        <section class="welcome-section" style="padding: 40px; text-align: center;">
            <h2 style="color: var(--mcgill-red); margin-bottom: 20px;">Professor Dashboard</h2>
            <p style="font-size: 1.1rem; color: var(--text-color); max-width: 600px; margin: 0 auto;">
                Welcome to your professor portal. Use the sidebar to navigate to different sections.
            </p>
        </section>
    `;
}

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
                    <label for="slot-description" style="display: block; margin-bottom: 5px; font-weight: 500;">Description (optional)</label>
                    <textarea id="slot-description" placeholder="Brief description of the slot..." style="
                        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
                        box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 80px;
                    "></textarea>
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

    // Event listeners
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

async function handleSlotCreation(form: HTMLFormElement, modal: HTMLElement) {
    const title = (form.querySelector('#slot-title') as HTMLInputElement).value;
    const date = (form.querySelector('#slot-date') as HTMLInputElement).value;
    const startTime = (form.querySelector('#slot-start-time') as HTMLInputElement).value;
    const endTime = (form.querySelector('#slot-end-time') as HTMLInputElement).value;

    if (!title || !date || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        // For now, just show a success message since the backend slot creation isn't implemented
        alert(`Private slot "${title}" created successfully!\nDate: ${date}\nTime: ${startTime} - ${endTime}`);
        modal.remove();
    } catch (error) {
        console.error('Slot creation failed:', error);
        alert('Failed to create slot. Please try again.');
    }
}