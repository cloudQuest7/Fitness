document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
});

// Toggle password visibility
document.querySelector('input[type="password"] + i').addEventListener('click', function() {
    const input = this.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    this.textContent = input.type === 'password' ? '👁' : '👁‍🗨';
});