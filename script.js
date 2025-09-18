// Modern JavaScript für Digital Craft Solutions Website
// ES6+ Features, Accessibility, Performance optimiert
// Erweitert mit SEO-Funktionen und Handwerker-spezifischen Features

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

        // Scroll Events (throttled)
        window.addEventListener('scroll', () => {
            if (!this.scrollTimeout) {
                this.scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    this.scrollTimeout = null;
                }, 16); // ~60fps
            }
        });

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
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                this.submitForm(form);
            } else {
                // Focus first invalid field
                const firstError = form.querySelector('.error-message:not([style*="display: none"])');
                if (firstError) {
                    const fieldId = firstError.id.replace('-error', '');
                    document.getElementById(fieldId)?.focus();
                }
                this.trackEvent('form_validation_error');
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
            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Wird gesendet...';
            }

            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData);
            
            // Track form submission attempt
            this.trackEvent('form_submit_attempt', {
                industry: formObject.industry,
                website_type: formObject['website-type']
            });

            // Simulate form submission (replace with actual endpoint)
            await this.sendFormData(formObject);
            
            // Show success message
            this.showFormSuccess();
            form.reset();
            this.clearFormData();
            
            // Track successful submission
            this.trackEvent('form_submit_success', formObject);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.');
            this.trackEvent('form_submit_error', { error: error.message });
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
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
        form?.insertBefore(message, form.firstChild);
        
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
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Preconnect to external domains
        this.addPreconnectLinks([
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ]);
    }

    addPreconnectLinks(domains) {
        domains.forEach(domain => {
            if (!document.querySelector(`link[href="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                document.head.appendChild(link);
            }
        });
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt) {
                console.warn('Image missing alt text:', img.src);
            }
        });
    }

    // Analytics (only if cookies accepted)
    initializeAnalytics() {
        if (this.getCookie('cookies-accepted') === 'true') {
            this.initializeTrackingCookies();
        }
    }

    initializeTrackingCookies() {
        // Initialize Google Analytics or other tracking
        console.log('Analytics initialized');
        
        // Track page view
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (this.getCookie('cookies-accepted') === 'true') {
            console.log('Event tracked:', eventName, parameters);
            
            // Example for Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
        }
    }

    hideLoadingSpinner() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.remove(), 300);
        }
    }

    updateCopyrightYear() {
        const yearElements = document.querySelectorAll('.current-year');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(element => {
            element.textContent = currentYear.toString();
        });
    }
}

// Preiskalkulator Klasse - KOMPLETT KORRIGIERT
class PriceCalculator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedBase = null;
        this.selectedAddons = [];
        this.selectedDetails = {};
        this.selectedContract = null;
        this.prices = {
            base: 0,
            addons: 0,
            support: 0,
            setup: 2500
        };
        this.init();
    }

    init() {
        // Warte kurz, bis DOM vollständig geladen ist
        setTimeout(() => {
            this.bindEvents();
            this.updateNavigation();
            this.updatePriceSummary();
        }, 100);
    }

    bindEvents() {
        // Option Cards - Event Delegation für bessere Performance
        const optionsGrid = document.querySelector('.options-grid');
        if (optionsGrid) {
            optionsGrid.addEventListener('click', (e) => {
                const button = e.target.closest('.option-btn');
                if (button) {
                    e.preventDefault();
                    const card = button.closest('.option-card');
                    if (card) {
                        this.selectBaseOption(card);
                    }
                }
            });
        }

        // Add-on Toggles
        document.querySelectorAll('.addon-card input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const card = e.target.closest('.addon-card');
                if (card) {
                    this.toggleAddon(card);
                }
            });
        });

        // Details Selects
        document.querySelectorAll('.detail-group select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateDetail(select.name, select.value, select);
            });
        });

        // Contract Cards
        const contractOptions = document.querySelector('.contract-options');
        if (contractOptions) {
            contractOptions.addEventListener('click', (e) => {
                const card = e.target.closest('.contract-card');
                if (card) {
                    this.selectContract(card);
                }
            });
        }

        // Navigation Buttons
        const prevBtn = document.querySelector('.calculator-navigation .prev-btn');
        const nextBtn = document.querySelector('.calculator-navigation .next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousStep();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextStep();
            });
        }

        // Calculate Button
        const calculateBtn = document.querySelector('.calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateQuote();
            });
        }
    }

    selectBaseOption(card) {
        // Deselect all cards
        document.querySelectorAll('.option-card').forEach(c => {
            c.classList.remove('selected');
            const btn = c.querySelector('.option-btn');
            if (btn) btn.textContent = 'Auswählen';
        });
        
        // Select clicked card
        card.classList.add('selected');
        const btn = card.querySelector('.option-btn');
        if (btn) btn.textContent = 'Ausgewählt';
        
        // Store selection
        this.selectedBase = {
            service: card.dataset.service,
            price: parseInt(card.dataset.price) || 0,
            name: card.querySelector('h4')?.textContent || 'Unbekannt'
        };

        this.prices.base = this.selectedBase.price;
        
        // Update UI
        this.updatePriceSummary();
        this.updateNavigation();
    }

    toggleAddon(card) {
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        const addonData = {
            addon: card.dataset.addon,
            price: parseInt(card.dataset.price) || 0,
            name: card.querySelector('h4')?.textContent || 'Unbekannt'
        };

        if (checkbox.checked) {
            card.classList.add('selected');
            this.selectedAddons.push(addonData);
        } else {
            card.classList.remove('selected');
            this.selectedAddons = this.selectedAddons.filter(a => a.addon !== addonData.addon);
        }

        // Calculate total addons price
        this.prices.addons = this.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        
        this.updatePriceSummary();
    }

    updateDetail(name, value, selectElement) {
        this.selectedDetails[name] = value;

        // Handle support price
        if (name === 'support') {
            const selectedOption = selectElement.querySelector(`option[value="${value}"]`);
            if (selectedOption) {
                this.prices.support = parseInt(selectedOption.dataset.price) || 0;
            }
        }

        // Update setup fee
        this.calculateSetupFee();
        this.updatePriceSummary();
        this.updateNavigation();
    }

    selectContract(card) {
        // Deselect all contracts
        document.querySelectorAll('.contract-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Select clicked contract
        card.classList.add('selected');
        
        this.selectedContract = {
            duration: card.dataset.duration,
            discount: parseFloat(card.dataset.discount) || 0,
            name: card.querySelector('h4')?.textContent || 'Unbekannt'
        };

        this.updatePriceSummary();
        this.updateNavigation();
    }

    calculateSetupFee() {
        let setupFee = 2500;

        // Company size modifier
        const companySize = this.selectedDetails['company-size'];
        if (companySize === 'medium') {
            setupFee += 1000;
        } else if (companySize === 'large') {
            setupFee += 2500;
        }

        // Locations modifier
        const locations = this.selectedDetails['locations'];
        if (locations === '2-3') {
            setupFee += 1500;
        } else if (locations === '4+') {
            setupFee += 3000;
        }

        this.prices.setup = setupFee;
    }

    updatePriceSummary() {
        const subtotal = this.prices.base + this.prices.addons + this.prices.support;
        const discount = this.selectedContract?.discount || 0;
        const discountAmount = Math.round(subtotal * discount);
        const total = subtotal - discountAmount;

        // Update all price displays
        this.updatePriceElement('.base-price', `${this.prices.base}€`);
        this.updatePriceElement('.addons-price', `${this.prices.addons}€`);
        this.updatePriceElement('.support-price', `${this.prices.support}€`);
        this.updatePriceElement('.subtotal-price', `${subtotal}€`);
        this.updatePriceElement('.total-price', `${total}€`);
        this.updatePriceElement('.setup-price', `${this.prices.setup}€`);

        // Handle discount display
        const discountLine = document.querySelector('.price-line.discount');
        if (discountLine) {
            if (discount > 0) {
                discountLine.style.display = 'flex';
                this.updatePriceElement('.discount-price', `-${discountAmount}€`);
            } else {
                discountLine.style.display = 'none';
            }
        }

        // Update selected items list
        this.updateSelectedItems();
    }

    updatePriceElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    updateSelectedItems() {
        const container = document.querySelector('.selected-items');
        if (!container) return;
        
        container.innerHTML = '';

        // Add base package
        if (this.selectedBase) {
            container.innerHTML += `
                <div class="item">
                    <span>${this.selectedBase.name}</span>
                    <span>${this.selectedBase.price}€</span>
                </div>
            `;
        }

        // Add selected addons
        this.selectedAddons.forEach(addon => {
            container.innerHTML += `
                <div class="item">
                    <span>${addon.name}</span>
                    <span>+${addon.price}€</span>
                </div>
            `;
        });

        // Add support if selected
        if (this.prices.support > 0 && this.selectedDetails.support) {
            const supportText = {
                'email': 'E-Mail Support',
                'phone': 'Telefon Support',
                'priority': 'Priority Support'
            };
            container.innerHTML += `
                <div class="item">
                    <span>${supportText[this.selectedDetails.support] || 'Support'}</span>
                    <span>+${this.prices.support}€</span>
                </div>
            `;
        }

        // Add contract info
        if (this.selectedContract) {
            const discountText = this.selectedContract.discount > 0 
                ? `${this.selectedContract.discount * 100}% Rabatt` 
                : '';
            container.innerHTML += `
                <div class="item">
                    <span>Laufzeit: ${this.selectedContract.name}</span>
                    <span>${discountText}</span>
                </div>
            `;
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.calculator-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update step indicators
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                dot.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                dot.classList.add('active');
            }
        });

        // Update current step
        this.currentStep = stepNumber;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps && this.canProceed()) {
            this.showStep(this.currentStep + 1);
            this.updateNavigation();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
            this.updateNavigation();
        }
    }

    canProceed() {
        switch (this.currentStep) {
            case 1:
                return this.selectedBase !== null;
            case 2:
                return true; // Add-ons are optional
            case 3:
                // At least 2 details should be selected
                return Object.keys(this.selectedDetails).length >= 2;
            case 4:
                return this.selectedContract !== null;
            default:
                return false;
        }
    }

    updateNavigation() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const calculateBtn = document.querySelector('.calculate-btn');

        // Previous button
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        // Next button
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
                nextBtn.disabled = !this.canProceed();
            }
        }

        // Calculate button
        if (calculateBtn) {
            const isComplete = this.selectedBase && this.selectedContract;
            calculateBtn.disabled = !isComplete;
        }
    }

    generateQuote() {
        const subtotal = this.prices.base + this.prices.addons + this.prices.support;
        const discount = this.selectedContract?.discount || 0;
        const total = subtotal - (subtotal * discount);

        const quoteData = {
            base: this.selectedBase,
            addons: this.selectedAddons,
            details: this.selectedDetails,
            contract: this.selectedContract,
            prices: this.prices,
            total: Math.round(total),
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('priceCalculatorQuote', JSON.stringify(quoteData));

        // Track event
        if (window.digitalCraft) {
            window.digitalCraft.trackEvent('price_calculator_completed', {
                base_package: this.selectedBase?.service,
                total_monthly: quoteData.total,
                addons_count: this.selectedAddons.length
            });
        }

        // Show quote modal
        this.showQuoteModal(quoteData);
    }

    showQuoteModal(quoteData) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.quote-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'quote-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Ihr individuelles Angebot</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="quote-summary">
                        <h3>${quoteData.base?.name || 'Ihr Paket'}</h3>
                        <p>Monatlich: <strong>${quoteData.total}€</strong></p>
                        <p>Setup-Gebühr: <strong>${quoteData.prices.setup}€</strong></p>
                        <p>Laufzeit: <strong>${quoteData.contract?.name || 'Flexibel'}</strong></p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="scrollToSection('contact'); document.querySelector('.quote-modal').remove();">
                            Jetzt Angebot anfordern
                        </button>
                        <button class="btn btn-secondary" onclick="document.querySelector('.quote-modal').remove()">
                            Weiter konfigurieren
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind close events
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Global scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Track event
        if (window.digitalCraft) {
            window.digitalCraft.trackEvent('cta_click', { 
                section: sectionId,
                button_type: 'scroll_to_section'
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize main website
        window.digitalCraft = new DigitalCraftWebsite();
        
        // Initialize price calculator if present
        if (document.querySelector('.calculator-section')) {
            window.priceCalculator = new PriceCalculator();
        }
    });
} else {
    // DOM already loaded
    window.digitalCraft = new DigitalCraftWebsite();
    
    if (document.querySelector('.calculator-section')) {
        window.priceCalculator = new PriceCalculator();
    }
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    if (window.digitalCraft) {
        window.digitalCraft.trackEvent('javascript_error', {
            error_message: e.message,
            error_filename: e.filename,
            error_lineno: e.lineno
        });
    }
});

// Add dynamic styles
const additionalStyles = `
.form-message {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    border-left: 4px solid;
}

.form-message.success {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    color: #047857;
    border-color: var(--accent-color);
}

.form-message.error {
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
    border-color: var(--error-color);
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.nav-menu a.active {
    color: var(--secondary-color);
    font-weight: 600;
}

.selected-items .item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.9rem;
}

.selected-items .item:last-child {
    border-bottom: none;
}
`;

// Inject styles
if (!document.querySelector('#dynamic-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dynamic-styles';
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}