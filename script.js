// Modern JavaScript für Digital Craft Solutions Website
// Optimized for PageSpeed performance
// ES6+ Features, Accessibility, Performance optimiert

// Use requestAnimationFrame for smooth performance
const RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// Batch DOM operations for better performance
class DOMBatcher {
    constructor() {
        this.readOperations = [];
        this.writeOperations = [];
        this.scheduled = false;
    }
    
    read(fn) {
        this.readOperations.push(fn);
        this.schedule();
    }
    
    write(fn) {
        this.writeOperations.push(fn);
        this.schedule();
    }
    
    schedule() {
        if (this.scheduled) return;
        this.scheduled = true;
        
        RAF(() => {
            // Perform all reads first
            this.readOperations.forEach(fn => fn());
            this.readOperations = [];
            
            // Then all writes
            this.writeOperations.forEach(fn => fn());
            this.writeOperations = [];
            
            this.scheduled = false;
        });
    }
}

const domBatcher = new DOMBatcher();



class DigitalCraftWebsite {
    constructor() {
        this.currentSection = '';
        this.scrollTimeout = null;
        this.resizeTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.setupNavigation();
        this.setupCookieBanner();
        this.setupFormValidation();
        this.setupScrollAnimations();
        this.setupIntersectionObserver();
        this.performanceOptimizations();
        this.setupSEOFeatures();
        this.initializeAnalytics();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.showCookieBanner();
            this.updateCopyrightYear();
            this.addLocalBusinessSchema();
            this.setupKeyboardNavigation();
        });

        // Window Load
        window.addEventListener('load', () => {
            this.hideLoadingSpinner();
            this.optimizeImages();
        });

        // Scroll Events (optimized with passive listeners)
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                RAF(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Resize Events (debounced)
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Keyboard Events für Accessibility
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Visibility Change für Performance
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    // Theme Toggle Functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Set initial theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeToggleIcon(currentTheme);

        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeToggleIcon(newTheme);

            // Analytics Event
            this.trackEvent('theme_change', { theme: newTheme });

            // Announce theme change for screen readers
            this.announceToScreenReader(`Design-Modus zu ${newTheme === 'light' ? 'Hell' : 'Dunkel'} gewechselt`);
        });
    }

    updateThemeToggleIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
            themeToggle.setAttribute('aria-label', 
                theme === 'light' ? 'Zu dunklem Modus wechseln' : 'Zu hellem Modus wechseln'
            );
        }
    }

    // Navigation Setup
    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

        // Mobile menu toggle
        navToggle?.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navToggle.classList.toggle('active');
            navMenu?.classList.toggle('active');

            // Focus management
            if (!isExpanded) {
                navMenu?.querySelector('a')?.focus();
            }

            // Body scroll lock
            document.body.style.overflow = !isExpanded ? 'hidden' : '';

            // Track mobile menu usage
            this.trackEvent('mobile_menu_toggle', { expanded: !isExpanded });
        });

        // Smooth scrolling for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.smoothScrollTo(targetElement);
                    
                    // Close mobile menu
                    navMenu?.classList.remove('active');
                    navToggle?.classList.remove('active');
                    navToggle?.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';

                    // Track navigation usage
                    this.trackEvent('navigation_click', { section: targetId });
                }
            });
        });

        // Header scroll behavior
        this.setupHeaderScrollBehavior();
    }

    setupHeaderScrollBehavior() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header?.style.setProperty('transform', 'translateY(-100%)');
            } else {
                header?.style.setProperty('transform', 'translateY(0)');
            }

            lastScrollY = currentScrollY;
        });
    }

    // Cookie Banner
    setupCookieBanner() {
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');

        acceptBtn?.addEventListener('click', () => {
            this.setCookie('cookies-accepted', 'true', 365);
            this.hideCookieBanner();
            this.initializeTrackingCookies();
            this.trackEvent('cookie_consent', { consent: 'accepted' });
        });

        declineBtn?.addEventListener('click', () => {
            this.setCookie('cookies-accepted', 'false', 365);
            this.hideCookieBanner();
            this.trackEvent('cookie_consent', { consent: 'declined' });
        });
    }

    showCookieBanner() {
        const cookieConsent = this.getCookie('cookies-accepted');
        if (!cookieConsent) {
            const banner = document.getElementById('cookie-banner');
            setTimeout(() => {
                banner?.classList.add('show');
            }, 1000); // Show after 1 second
        } else if (cookieConsent === 'true') {
            this.initializeTrackingCookies();
        }
    }

    hideCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        banner?.classList.remove('show');
    }

    // Form Validation
    setupFormValidation() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
                // Auto-save form data
                this.saveFormData(input);
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Verhindert das Standard-Formularverhalten
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                this.submitForm(form);
            }
        });

        // Load saved form data
        this.loadFormData(form);
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const name = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Dieses Feld ist erforderlich.';
        }
        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            }
        }
        // Phone validation
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[\d\s\-KATEX_INLINE_OPENKATEX_INLINE_CLOSE]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein.';
            }
        }
        // Company name validation
        else if (name === 'company' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Firmenname muss mindestens 2 Zeichen lang sein.';
        }

        this.showFieldError(field, errorMessage, !isValid);
        return isValid;
    }

    showFieldError(field, message, show) {
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = show ? 'block' : 'none';
            field.setAttribute('aria-invalid', show.toString());
            
            if (show) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
    }

    clearFieldError(field) {
        this.showFieldError(field, '', false);
    }

    async submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Wird gesendet...';
            }

            // Prepare form data
            const formData = new FormData(form);
            
            // Convert FormData to regular object for JSON
            const formObject = {};
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            
            // Add calculator data if available
            const calculatorDataField = document.getElementById('calculator-data');
            if (calculatorDataField && calculatorDataField.value) {
                formObject['calculator-data'] = calculatorDataField.value;
            }
            
            console.log('Submitting form data:', formObject);
            
            // Send as JSON to API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formObject)
            });
            
            console.log('Response status:', response.status);
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                const responseText = await response.text();
                console.error('Response text:', responseText);
                throw new Error('Invalid response format from server');
            }
            
            console.log('Response result:', result);

            if (response.ok && result.success) {
                // Success message
                const message = document.createElement('div');
                message.className = 'form-message success';
                message.innerHTML = `
                    <strong>✓ Vielen Dank!</strong><br>
                    ${result.message || 'Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns innerhalb von 48 Stunden bei Ihnen.'}
                `;
                message.setAttribute('role', 'alert');
                
                // Insert message above form
                form.insertBefore(message, form.firstChild);
                
                // Scroll to message
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Reset form
                form.reset();
                
                // Clear form data from localStorage
                this.clearFormData();
                
                // Track successful submission
                this.trackEvent('form_submission_success', {
                    form_type: 'contact',
                    has_calculator_data: !!calculatorDataField?.value
                });
                
                // Remove success message after 10 seconds
                setTimeout(() => message.remove(), 10000);
            } else {
                // Server returned error
                const errorMessage = result.error || 'Ein unbekannter Fehler ist aufgetreten.';
                this.showFormError(errorMessage);
                
                // Track error
                this.trackEvent('form_submission_error', {
                    error_type: 'server_error',
                    error_message: errorMessage,
                    status_code: response.status
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
            
            let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
            
            // Provide more specific error messages
            if (error.message.includes('fetch')) {
                errorMessage = 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
            } else if (error.message.includes('JSON')) {
                errorMessage = 'Server-Antwortfehler. Bitte versuchen Sie es später erneut.';
            } else if (error.name === 'TypeError') {
                errorMessage = 'Netzwerkfehler. Bitte versuchen Sie es später erneut.';
            }
            
            // For free Vercel accounts, offer alternative contact methods
            const fallbackMessage = `
                <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                    <strong>Alternative Kontaktmöglichkeiten:</strong><br>
                    • E-Mail: <a href="mailto:clgunduz@gmail.com">clgunduz@gmail.com</a><br>
                    • Telefon: <a href="tel:+491234567890">+49 (0) 123 456 789</a><br>
                    • WhatsApp: <a href="https://wa.me/491234567890" target="_blank">Direkt kontaktieren</a>
                </div>
            `;
            
            this.showFormError(errorMessage + fallbackMessage);
            
            // Track error
            this.trackEvent('form_submission_error', {
                error_type: 'network_error',
                error_message: error.message,
                vercel_free_tier: true
            });
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }

        // Prevent default form submission
        return false;
    }

    async sendFormData(formData) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 2000);
        });
    }

    showFormSuccess() {
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.innerHTML = `
            <strong>✓ Vielen Dank!</strong><br>
            Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        `;
        message.setAttribute('role', 'alert');
        
        const form = document.querySelector('.contact-form');
        form?.insertBefore(message, form.firstChild);
        
        // Scroll to message
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => message.remove(), 10000);
    }

    showFormError(errorText) {
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.innerHTML = `<strong>⚠ Fehler:</strong> ${errorText}`;
        message.setAttribute('role', 'alert');
        
        const form = document.querySelector('.contact-form');
        
        // Remove any existing error messages
        const existingErrors = form.querySelectorAll('.form-message.error');
        existingErrors.forEach(error => error.remove());
        
        form?.insertBefore(message, form.firstChild);
        
        // Scroll to error message
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => message.remove(), 8000);
    }

    // Form Data Persistence
    saveFormData(field) {
        if (this.getCookie('cookies-accepted') === 'true') {
            const formData = JSON.parse(localStorage.getItem('formData') || '{}');
            formData[field.name] = field.value;
            localStorage.setItem('formData', JSON.stringify(formData));
        }
    }

    loadFormData(form) {
        if (this.getCookie('cookies-accepted') === 'true') {
            const formData = JSON.parse(localStorage.getItem('formData') || '{}');
            Object.keys(formData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && formData[key]) {
                    field.value = formData[key];
                }
            });
        }
    }

    clearFormData() {
        localStorage.removeItem('formData');
    }

    // Scroll Animations
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
        });
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Track section views
                    if (entry.target.id) {
                        this.trackEvent('section_view', { section: entry.target.id });
                    }
                }
            });
        }, options);

        // Observe elements
        const elementsToAnimate = document.querySelectorAll(
            '.service-card, .benefit-item, .pricing-card, .hero-content, .hero-visual, .contact-info'
        );
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }

    // SEO Features
    setupSEOFeatures() {
        this.updateMetaTags();
        this.addCanonicalURL();
    }

    updateMetaTags() {
        // Dynamic meta description based on current section
        const sections = {
            'services': 'Professionelle SHK Webseite und Handwerker Homepage Entwicklung. Spezialisiert auf Sanitär, Heizung, Klima und Elektrikbetriebe.',
            'benefits': 'Warum Handwerksbetriebe auf unsere SHK Websites vertrauen. Mehr Kunden durch professionelle Digitalisierung.',
            'calculator': 'Interaktiver Preiskalkulator für SHK Websites und Handwerker Homepages. Individuelles Angebot in 4 Schritten.',
            'pricing': 'Transparente Preise für SHK Webseiten und Handwerker Homepages. Pakete ab 399€/Monat für Ihren Betrieb.',
            'contact': 'Kostenlose Beratung für Ihre SHK Webseite. Kontaktieren Sie uns für professionelle Handwerker Website Entwicklung.'
        };

        window.addEventListener('scroll', () => {
            const currentSection = this.getCurrentSection();
            if (sections[currentSection]) {
                const metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.content = sections[currentSection];
                }
            }
        });
    }

    addLocalBusinessSchema() {
        const schema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Digital Craft Solutions",
            "description": "Professionelle SHK Webseiten und Handwerker Homepage Entwicklung für Sanitär, Heizung, Klima und Elektrikbetriebe",
            "url": "https://digitalcraft-solutions.de",
            "telephone": "+49-123-456-789",
            "email": "info@digitalcraft-solutions.de",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "DE"
            },
            "serviceArea": {
                "@type": "Country",
                "name": "Deutschland"
            },
            "priceRange": "399-2999 EUR",
            "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
            "currenciesAccepted": "EUR"
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    addCanonicalURL() {
        if (!document.querySelector('link[rel="canonical"]')) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = window.location.href.split('#')[0];
            document.head.appendChild(canonical);
        }
    }

    // Utility Functions
    smoothScrollTo(element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    handleScroll() {
        this.updateActiveNavLink();
        this.updateProgressBar();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        // Update current section for SEO
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.updatePageTitle();
        }
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        return currentSection;
    }

    updatePageTitle() {
        const sections = {
            'services': 'SHK Webseite Leistungen | Digital Craft Solutions',
            'benefits': 'Handwerker Website Vorteile | Digital Craft Solutions',
            'calculator': 'Preiskalkulator SHK Website | Digital Craft Solutions',
            'pricing': 'SHK Homepage Preise | Digital Craft Solutions',
            'contact': 'SHK Webseite Kontakt | Digital Craft Solutions'
        };
        
        if (sections[this.currentSection]) {
            document.title = sections[this.currentSection];
        } else {
            document.title = 'SHK Webseite & Handwerker Homepage | Digital Craft Solutions';
        }
    }

    updateProgressBar() {
        const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        let progressBar = document.querySelector('.scroll-progress');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: ${scrollProgress}%;
                height: 3px;
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                z-index: 1001;
                transition: width 0.3s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
    }

    handleResize() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
            navToggle?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        // Recalculate animations
        this.setupIntersectionObserver();
    }

    handleKeyboardNavigation(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            
            if (navMenu?.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle?.classList.remove('active');
                navToggle?.setAttribute('aria-expanded', 'false');
                navToggle?.focus();
                document.body.style.overflow = '';
            }
        }
    }

    setupKeyboardNavigation() {
        // Make all interactive elements focusable
        const interactiveElements = document.querySelectorAll('.service-card, .pricing-card');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause animations
            document.querySelectorAll('.floating-benefits .benefit-card').forEach(card => {
                card.style.animationPlayState = 'paused';
            });
        } else {
            // Page is visible - resume animations
            document.querySelectorAll('.floating-benefits .benefit-card').forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }
    }

    // Cookie utilities
    setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
    }

    getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    }

    // Accessibility utilities
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Performance optimizations
    performanceOptimizations() {
        // Measure and log Core Web Vitals
        this.measureWebVitals();
        
        // Lazy load images with Intersection Observer
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.onload = () => {
                                img.classList.add('loaded');
                            };
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px' // Load images 50px before they come into view
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    measureWebVitals() {
        // Measure CLS (Cumulative Layout Shift)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                let cls = 0;
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                console.log('CLS:', cls);
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
        
        // Measure LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    hideLoadingSpinner() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => {
                spinner.remove();
            }, 300);
        }
    }

    optimizeImages() {
        // Convert images to WebP if supported
        if (this.supportsWebP()) {
            const images = document.querySelectorAll('img[data-webp]');
            images.forEach(img => {
                img.src = img.dataset.webp;
            });
        }
    }

    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Analytics and tracking functions
    initializeAnalytics() {
        // Initialize analytics only if cookies are accepted
        if (this.getCookie('cookies-accepted') === 'true') {
            this.setupGoogleAnalytics();
            this.setupCustomTracking();
        }
    }

    setupGoogleAnalytics() {
        // Google Analytics 4 setup (replace GA_MEASUREMENT_ID with actual ID)
        if (typeof gtag === 'undefined') {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);
            
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
            window.gtag = gtag;
        }
    }

    setupCustomTracking() {
        // Custom event tracking setup
        this.trackPageView();
        this.setupScrollTracking();
        this.setupClickTracking();
    }

    trackEvent(eventName, parameters = {}) {
        // Track events only if analytics is initialized
        if (this.getCookie('cookies-accepted') === 'true') {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
            
            // Custom analytics endpoint (optional)
            this.sendCustomEvent(eventName, parameters);
        }
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    setupScrollTracking() {
        let scrollDepths = [25, 50, 75, 90];
        let trackedDepths = new Set();
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    this.trackEvent('scroll_depth', { depth: depth });
                }
            });
        });
    }

    setupClickTracking() {
        // Track important button clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a');
            if (target) {
                const trackingData = {
                    element_type: target.tagName.toLowerCase(),
                    element_class: target.className,
                    element_text: target.textContent.trim().substring(0, 50)
                };
                
                if (target.href) trackingData.link_url = target.href;
                if (target.id) trackingData.element_id = target.id;
                
                this.trackEvent('click', trackingData);
            }
        });
    }

    sendCustomEvent(eventName, parameters) {
        // Send to custom analytics endpoint if needed
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                parameters: parameters,
                timestamp: new Date().toISOString(),
                url: window.location.href
            })
        }).catch(() => {
            // Silently fail for analytics
        });
    }

    initializeTrackingCookies() {
        this.initializeAnalytics();
    }

    // Scroll to section function (for HTML onclick handlers)
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            this.smoothScrollTo(element);
            this.trackEvent('scroll_to_section', { section: sectionId });
        }
    }

    // Calculator functionality
    initializeCalculator() {
        this.calculatorData = {
            currentStep: 1,
            selectedBase: null,
            selectedAddons: [],
            selectedDetails: {
                'industry': 'shk',
                'company-size': 'small',
                'locations': '1',
                'support': 'email'
            },
            selectedContract: null,
            prices: {
                base: 0,
                addons: 0,
                support: 0,
                subtotal: 0,
                discount: 0,
                total: 0,
                setup: 2500
            }
        };
        
        this.setupCalculatorEventListeners();
        this.updateCalculatorNavigation();
        this.setDefaultValues();
    }
    
    setDefaultValues() {
        // Set default values in the form elements
        const industrySelect = document.querySelector('select[name="industry"]');
        if (industrySelect) industrySelect.value = 'shk';
        
        const companySizeSelect = document.querySelector('select[name="company-size"]');
        if (companySizeSelect) companySizeSelect.value = 'small';
        
        const locationsSelect = document.querySelector('select[name="locations"]');
        if (locationsSelect) locationsSelect.value = '1';
        
        const supportSelect = document.querySelector('select[name="support"]');
        if (supportSelect) supportSelect.value = 'email';
        
        // Update initial price summary
        this.updatePriceSummary();
    }

    setupCalculatorEventListeners() {
        // Skip if basic calculator already handled base selection
        const existingListeners = document.querySelector('.option-btn[data-listener="true"]');
        if (existingListeners) {
            this.setupAdvancedCalculatorFeatures();
            return;
        }
        
        // Base package selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.option-card');
                const service = card.dataset.service;
                const price = parseInt(card.dataset.price);
                
                this.selectBasePackage(service, price);
            });
        });

        this.setupAdvancedCalculatorFeatures();
    }
    
    setupAdvancedCalculatorFeatures() {
        // Addon toggles
        document.querySelectorAll('input[name="addons"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const addon = e.target.dataset.addon;
                const price = parseInt(e.target.closest('.addon-card').dataset.price);
                
                if (e.target.checked) {
                    this.addAddon(addon, price);
                } else {
                    this.removeAddon(addon, price);
                }
            });
        });

        // Detail selects
        document.querySelectorAll('select[name]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateDetail(e.target.name, e.target.value, e.target);
            });
        });

        // Contract selection
        document.querySelectorAll('.contract-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectContract(card.dataset.duration, parseFloat(card.dataset.discount));
            });
        });

        // Enhanced navigation buttons (don't override basic ones if they exist)
        const existingNext = document.querySelector('.next-btn[data-enhanced="true"]');
        if (!existingNext) {
            document.querySelector('.prev-btn')?.addEventListener('click', () => {
                this.previousStep();
            });
            
            document.querySelector('.next-btn')?.addEventListener('click', () => {
                this.nextStep();
            });
        }

        // Enhanced calculate button
        const existingCalc = document.querySelector('.calculate-btn[data-enhanced="true"]');
        if (!existingCalc) {
            const calcBtn = document.querySelector('.calculate-btn');
            if (calcBtn) {
                calcBtn.setAttribute('data-enhanced', 'true');
                calcBtn.addEventListener('click', () => {
                    this.generateQuote();
                });
            }
        }
    }

    selectBasePackage(service, price) {
        // Remove previous selections
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to current card
        document.querySelector(`[data-service="${service}"]`).classList.add('selected');
        
        this.calculatorData.selectedBase = service;
        this.calculatorData.prices.base = price;
        
        this.updatePriceSummary();
        this.updateCalculatorNavigation();
        
        this.trackEvent('calculator_base_selected', { package: service, price: price });
    }

    addAddon(addon, price) {
        if (!this.calculatorData.selectedAddons.find(a => a.addon === addon)) {
            this.calculatorData.selectedAddons.push({ addon, price });
            this.calculatorData.prices.addons += price;
            
            // Visual feedback
            document.querySelector(`[data-addon="${addon}"]`).closest('.addon-card').classList.add('selected');
        }
        
        this.updatePriceSummary();
        this.trackEvent('calculator_addon_added', { addon: addon, price: price });
    }

    removeAddon(addon, price) {
        this.calculatorData.selectedAddons = this.calculatorData.selectedAddons.filter(a => a.addon !== addon);
        this.calculatorData.prices.addons -= price;
        
        // Visual feedback
        document.querySelector(`[data-addon="${addon}"]`).closest('.addon-card').classList.remove('selected');
        
        this.updatePriceSummary();
        this.trackEvent('calculator_addon_removed', { addon: addon, price: price });
    }

    updateDetail(name, value, element) {
        this.calculatorData.selectedDetails[name] = value;
        
        // Handle price modifiers
        if (name === 'support') {
            const option = element.querySelector(`option[value="${value}"]`);
            if (option && option.dataset.price) {
                this.calculatorData.prices.support = parseInt(option.dataset.price) || 0;
            }
        }
        
        // For company-size and locations, we need to recalculate everything
        // because they affect the overall price as percentage modifiers
        
        this.updatePriceSummary();
        this.trackEvent('calculator_detail_updated', { detail: name, value: value });
    }

    selectContract(duration, discount) {
        // Remove previous selections
        document.querySelectorAll('.contract-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to current card
        document.querySelector(`[data-duration="${duration}"]`).classList.add('selected');
        
        this.calculatorData.selectedContract = { duration, discount };
        this.updatePriceSummary();
        this.updateCalculatorNavigation();
        
        this.trackEvent('calculator_contract_selected', { duration: duration, discount: discount });
    }

    updatePriceSummary() {
        const prices = this.calculatorData.prices;
        
        // Calculate base subtotal
        let baseSubtotal = prices.base + prices.addons + prices.support;
        
        // Apply company size and location modifiers
        let modifier = 1;
        
        // Company size modifier
        if (this.calculatorData.selectedDetails['company-size']) {
            const sizeSelect = document.querySelector('select[name="company-size"]');
            const selectedOption = sizeSelect?.querySelector(`option[value="${this.calculatorData.selectedDetails['company-size']}"]`);
            if (selectedOption && selectedOption.dataset.modifier) {
                const sizeModifier = parseFloat(selectedOption.dataset.modifier);
                modifier *= (1 + sizeModifier);
                console.log(`Company size modifier: ${sizeModifier}, total modifier: ${modifier}`);
            }
        }
        
        // Location modifier
        if (this.calculatorData.selectedDetails['locations']) {
            const locationSelect = document.querySelector('select[name="locations"]');
            const selectedOption = locationSelect?.querySelector(`option[value="${this.calculatorData.selectedDetails['locations']}"]`);
            if (selectedOption && selectedOption.dataset.modifier) {
                const locationModifier = parseFloat(selectedOption.dataset.modifier);
                modifier *= (1 + locationModifier);
                console.log(`Location modifier: ${locationModifier}, total modifier: ${modifier}`);
            }
        }
        
        // Apply modifiers to subtotal
        prices.subtotal = Math.round(baseSubtotal * modifier);
        
        // Apply contract discount
        if (this.calculatorData.selectedContract) {
            prices.discount = Math.round(prices.subtotal * this.calculatorData.selectedContract.discount);
        } else {
            prices.discount = 0;
        }
        
        // Calculate final total
        prices.total = prices.subtotal - prices.discount;
        
        // Update UI
        this.updatePriceSummaryUI();
        
        // Update setup fee based on package and modifiers
        if (this.calculatorData.selectedBase === 'basic-website') {
            prices.setup = Math.round(2500 * modifier);
        } else if (this.calculatorData.selectedBase === 'professional-website') {
            prices.setup = Math.round(4500 * modifier);
        } else if (this.calculatorData.selectedBase === 'premium-website') {
            prices.setup = Math.round(7500 * modifier);
        }
        
        // Update setup fee in UI
        const setupPriceElement = document.querySelector('.setup-price');
        if (setupPriceElement) {
            setupPriceElement.textContent = `${prices.setup}€`;
        }
    }

    updatePriceSummaryUI() {
        const prices = this.calculatorData.prices;
        
        document.querySelector('.base-price').textContent = `${prices.base}€`;
        document.querySelector('.addons-price').textContent = `${prices.addons}€`;
        document.querySelector('.support-price').textContent = `${prices.support}€`;
        document.querySelector('.subtotal-price').textContent = `${prices.subtotal}€`;
        document.querySelector('.total-price').textContent = `${prices.total}€`;
        document.querySelector('.setup-price').textContent = `${prices.setup}€`;
        
        const discountLine = document.querySelector('.price-line.discount');
        if (prices.discount > 0) {
            document.querySelector('.discount-price').textContent = `-${prices.discount}€`;
            discountLine.style.display = 'flex';
        } else {
            discountLine.style.display = 'none';
        }
        
        // Show modifier information if applicable
        this.updateModifierInfo();
        
        // Update selected items display
        this.updateSelectedItemsDisplay();
    }
    
    updateModifierInfo() {
        // Calculate current modifiers for display
        let modifierText = '';
        let totalModifier = 1;
        
        if (this.calculatorData.selectedDetails['company-size']) {
            const sizeSelect = document.querySelector('select[name="company-size"]');
            const selectedOption = sizeSelect?.querySelector(`option[value="${this.calculatorData.selectedDetails['company-size']}"]`);
            if (selectedOption && selectedOption.dataset.modifier) {
                const modifier = parseFloat(selectedOption.dataset.modifier);
                if (modifier > 0) {
                    totalModifier *= (1 + modifier);
                    modifierText += `Unternehmensgröße: +${Math.round(modifier * 100)}% `;
                }
            }
        }
        
        if (this.calculatorData.selectedDetails['locations']) {
            const locationSelect = document.querySelector('select[name="locations"]');
            const selectedOption = locationSelect?.querySelector(`option[value="${this.calculatorData.selectedDetails['locations']}"]`);
            if (selectedOption && selectedOption.dataset.modifier) {
                const modifier = parseFloat(selectedOption.dataset.modifier);
                if (modifier > 0) {
                    totalModifier *= (1 + modifier);
                    modifierText += `Standorte: +${Math.round(modifier * 100)}% `;
                }
            }
        }
        
        // Update or create modifier display
        let modifierDisplay = document.querySelector('.modifier-info');
        if (!modifierDisplay && modifierText) {
            modifierDisplay = document.createElement('div');
            modifierDisplay.className = 'modifier-info';
            modifierDisplay.style.cssText = 'font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic;';
            
            const priceBreakdown = document.querySelector('.price-breakdown');
            priceBreakdown.appendChild(modifierDisplay);
        }
        
        if (modifierDisplay) {
            if (modifierText) {
                modifierDisplay.textContent = `Aufschläge: ${modifierText.trim()}`;
                modifierDisplay.style.display = 'block';
            } else {
                modifierDisplay.style.display = 'none';
            }
        }
    }

    updateSelectedItemsDisplay() {
        const container = document.querySelector('.selected-items');
        if (!container) return;
        
        let html = '';
        
        if (this.calculatorData.selectedBase) {
            const baseNames = {
                'basic-website': 'Essential Website',
                'professional-website': 'Professional Website', 
                'premium-website': 'Premium Website'
            };
            html += `<div class="item"><span>${baseNames[this.calculatorData.selectedBase] || this.calculatorData.selectedBase}</span><span>${this.calculatorData.prices.base}€</span></div>`;
        }
        
        this.calculatorData.selectedAddons.forEach(addon => {
            const addonNames = {
                'ai-integration': 'KI-Integration',
                'booking-system': 'Online Terminbuchung',
                'crm-integration': 'CRM & Analytics',
                'whatsapp-integration': 'WhatsApp Business',
                'multilingual': 'Mehrsprachigkeit',
                'workflow-automation': 'Workflow Automatisierung'
            };
            html += `<div class="item"><span>${addonNames[addon.addon] || addon.addon}</span><span>+${addon.price}€</span></div>`;
        });
        
        if (this.calculatorData.prices.support > 0) {
            html += `<div class="item"><span>Support</span><span>+${this.calculatorData.prices.support}€</span></div>`;
        }
        
        container.innerHTML = html;
    }

    nextStep() {
        if (this.canProceedToNextStep()) {
            this.calculatorData.currentStep++;
            this.showStep(this.calculatorData.currentStep);
            this.updateCalculatorNavigation();
            
            this.trackEvent('calculator_step_next', { step: this.calculatorData.currentStep });
        }
    }

    previousStep() {
        if (this.calculatorData.currentStep > 1) {
            this.calculatorData.currentStep--;
            this.showStep(this.calculatorData.currentStep);
            this.updateCalculatorNavigation();
            
            this.trackEvent('calculator_step_prev', { step: this.calculatorData.currentStep });
        }
    }

    canProceedToNextStep() {
        switch (this.calculatorData.currentStep) {
            case 1:
                return this.calculatorData.selectedBase !== null;
            case 2:
                return true; // Addons are optional
            case 3:
                return true; // Details have defaults
            case 4:
                return this.calculatorData.selectedContract !== null;
            default:
                return false;
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.calculator-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.querySelector(`[data-step="${stepNumber}"]`)?.classList.add('active');
        
        // Update step indicators
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                dot.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                dot.classList.add('active');
            }
        });
    }

    updateCalculatorNavigation() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const calculateBtn = document.querySelector('.calculate-btn');
        
        // Previous button
        if (prevBtn) {
            prevBtn.disabled = this.calculatorData.currentStep === 1;
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.disabled = !this.canProceedToNextStep() || this.calculatorData.currentStep === 4;
            nextBtn.style.display = this.calculatorData.currentStep === 4 ? 'none' : 'inline-flex';
        }
        
        // Calculate button
        if (calculateBtn) {
            const canCalculate = this.calculatorData.selectedBase && this.calculatorData.selectedContract;
            calculateBtn.disabled = !canCalculate;
            calculateBtn.style.display = this.calculatorData.currentStep === 4 ? 'inline-flex' : 'none';
        }
    }

    generateQuote() {
        // Prepare calculator data for form submission
        const calculatorData = {
            ...this.calculatorData,
            timestamp: new Date().toISOString()
        };
        
        // Update hidden form field
        const hiddenField = document.getElementById('calculator-data');
        if (hiddenField) {
            hiddenField.value = JSON.stringify(calculatorData);
        }
        
        // Scroll to contact form
        this.scrollToSection('contact');
        
        // Show success message
        this.showCalculatorComplete();
        
        this.trackEvent('calculator_completed', {
            base_package: this.calculatorData.selectedBase,
            addons_count: this.calculatorData.selectedAddons.length,
            total_price: this.calculatorData.prices.total
        });
    }

    showCalculatorComplete() {
        const message = document.createElement('div');
        message.className = 'calculator-complete-message';
        message.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Konfiguration abgeschlossen!</h3>
            <p>Ihre Auswahl wurde gespeichert. Füllen Sie jetzt das Kontaktformular aus, um Ihr individuelles Angebot zu erhalten.</p>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            z-index: 2000;
            max-width: 400px;
            animation: slideInDown 0.3s ease-out;
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1999;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(message);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            message.remove();
            overlay.remove();
        }, 3000);
        
        // Remove on click
        overlay.addEventListener('click', () => {
            message.remove();
            overlay.remove();
        });
    }

    // Initialize everything when DOM is ready
    setupCalculator() {
        if (document.querySelector('.calculator-section')) {
            this.initializeCalculator();
        }
    }
}

// Global scroll function for HTML onclick handlers
function scrollToSection(sectionId) {
    if (window.digitalCraftWebsite) {
        window.digitalCraftWebsite.scrollToSection(sectionId);
    } else {
        // Fallback if class not initialized yet
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.digitalCraftWebsite = new DigitalCraftWebsite();
    window.digitalCraftWebsite.setupCalculator();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalCraftWebsite;
}

