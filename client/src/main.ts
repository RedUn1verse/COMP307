const searchInput = document.querySelector('.search-input') as HTMLInputElement;
searchInput?.addEventListener('input', (e) => {
    const term = (e.target as HTMLInputElement).value.toLowerCase();
    document.querySelectorAll('.prof-card').forEach(card => {
        const name = (card.querySelector('.prof-name') as HTMLElement).innerText.toLowerCase();
        (card as HTMLElement).style.display = name.includes(term) ? 'flex' : 'none';
    });
});

document.querySelectorAll('.card-action-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const profName = btn.closest('.prof-card')?.querySelector('.prof-name')?.innerHTML;
        alert(`Redirecting to ${profName}'s available slots...`);
        // TODO:  this should route to a dynamic booking page 
    });
});