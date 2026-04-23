const loginForm = document.querySelector('form');

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const email = emailInput.value.trim().toLowerCase();
    const password = (document.getElementById('password') as HTMLInputElement).value;

    // REGEX: Only @mcgill.ca or @mail.mcgill.ca
    const mcgillRegex = /^[a-z0-9.]+@(?:mail\.)?mcgill\.ca$/;

    if (!mcgillRegex.test(email)) {
        alert("Access Denied: You must use a valid McGill email address.");
        return;
    }

    // owners are @mcgill.ca (no 'mail.')
    const isOwner = email.endsWith('@mcgill.ca') && !email.includes('@mail.');
    

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pwd: password })
        });

        if (!res.ok) throw new Error('Login failed');

        const data = await res.json();


        localStorage.setItem('userId', data);
        console.log(data);
        //console.log(localStorage.getItem('userId'))
    
        window.location.href = isOwner ? 'prof_dash.html' : 'main.html';

    } catch (err) {
        console.error(err);
        alert("Login failed");
    }
});
