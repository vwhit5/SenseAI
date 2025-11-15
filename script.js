// Smooth scroll functionality
function initSmoothScroll() {
    const signupLink = document.querySelector('a[href="#signup"]');
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            const signupSection = document.querySelector('#signup');
            if (signupSection) {
                signupSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Form submission with Formspree
function initFormSubmission() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all required fields are filled
        const requiredFields = ['name', 'email', 'age', 'gender', 'race', 'major', 'school-year', 'ai-familiarity'];
        let allFilled = true;
        let firstEmptyField = null;

        for (let fieldName of requiredFields) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) continue;

            if (!field.value || field.value.trim() === '') {
                allFilled = false;
                if (!firstEmptyField) {
                    firstEmptyField = field;
                }
                field.style.borderColor = '#FF2A00';
            } else {
                field.style.borderColor = '#e8ecf3';
            }
        }

        // Check if at least one interest is selected
        const interests = form.querySelectorAll('input[name="interests"]:checked');
        if (interests.length === 0) {
            allFilled = false;
            alert('Please select at least one area of interest.');
            return;
        }

        if (!allFilled) {
            alert('Please fill out all required fields (marked with *)');
            if (firstEmptyField) {
                firstEmptyField.focus();
                firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const formData = new FormData(form);
        const submitButton = form.querySelector('.submit-btn');
        if (!submitButton) return;

        const originalText = submitButton.textContent;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        submitButton.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('Thank you for signing up! We\'ll contact you when a session matches your profile.');
                form.reset();
            } else {
                alert('Oops! There was a problem submitting your form. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Oops! There was a problem submitting your form. Please try again.');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.removeAttribute('aria-busy');
        }
    });
}

// Animate stats counter on scroll
function animateCounter(element, target, suffix = '', prefix = '') {
    if (!element) return;

    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = prefix + target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = prefix + Math.floor(current) + suffix;
        }
    }, 30);
}

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Animate stat numbers (only once)
                if (entry.target.classList.contains('stat') && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    const numberElement = entry.target.querySelector('.stat-number');
                    if (!numberElement) return;

                    const text = numberElement.textContent;

                    if (text.includes('200')) {
                        numberElement.textContent = '0';
                        animateCounter(numberElement, 200, '+');
                    } else if (text.includes('60')) {
                        // Fixed: Proper dollar sign handling
                        numberElement.textContent = '0';
                        const tempTimer = setInterval(() => {
                            const current = parseInt(numberElement.textContent);
                            if (current >= 60) {
                                numberElement.textContent = '$60';
                                clearInterval(tempTimer);
                            } else {
                                numberElement.textContent = (current + 2).toString();
                            }
                        }, 30);
                    } else if (text.includes('30min')) {
                        numberElement.textContent = '0min';
                        const timer = setInterval(() => {
                            const current = parseInt(numberElement.textContent);
                            if (current >= 30) {
                                numberElement.textContent = '30min';
                                clearInterval(timer);
                            } else {
                                numberElement.textContent = (current + 1) + 'min';
                            }
                        }, 30);
                    }
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const stats = document.querySelectorAll('.stat');
    const cards = document.querySelectorAll('.step-card, .benefit-card');

    stats.forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(30px)';
        stat.style.transition = 'all 0.6s ease';
        observer.observe(stat);
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Update copyright year dynamically
function updateCopyrightYear() {
    const footer = document.querySelector('footer p');
    if (footer) {
        const currentYear = new Date().getFullYear();
        footer.textContent = `© ${currentYear} Sense AI. All rights reserved.`;
    }
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initFormSubmission();
    initAnimations();
    updateCopyrightYear();
});
