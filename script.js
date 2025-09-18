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
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Wird gesendet...';
            }

            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();

            if (result.success) {
                // Erfolgsmeldung anzeigen
                this.showFormSuccess();
                form.reset();
                this.clearFormData();
            } else {
                this.showFormError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            this.showFormError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        } finally {
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
    }
}

// ...DigitalCraftWebsite-Klasse...

class PriceCalculator {
    constructor() {
        this.baseOption = null;
        this.addons = [];
        this.details = {};
        this.contract = { duration: null, discount: 0 };
        this.prices = {
            base: 0,
            addons: 0,
            support: 0,
            subtotal: 0,
            discount: 0,
            total: 0,
            setup: 2500
        };
        this.currentStep = 0;
        this.steps = [];
        this.summary = null;
        this.selectedItems = null;
        this.calculateBtn = null;
        this.nextBtn = null;
        this.prevBtn = null;
    }

    init() {
        this.steps = Array.from(document.querySelectorAll('.calculator-step'));
        this.summary = document.querySelector('.price-summary');
        this.selectedItems = document.querySelector('.selected-items');
        this.calculateBtn = document.querySelector('.calculate-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.setupEventListeners();
        this.updateStep();
        this.updatePriceSummary();
    }

    setupEventListeners() {
        // Basisoptionen (Cards oder Buttons)
        document.querySelectorAll('.option-card, .option-btn').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.baseOption = card.dataset.service || card.value;
                this.prices.base = parseInt(card.dataset.price, 10) || 0;
                this.updatePriceSummary();
                this.updateSelectedItems();
                this.nextBtn && (this.nextBtn.disabled = false);
            });
        });

        // Add-ons (Checkboxen in Cards)
        document.querySelectorAll('.addon-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const card = checkbox.closest('.addon-card');
                const addon = card.dataset.addon;
                if (checkbox.checked) {
                    if (!this.addons.includes(addon)) this.addons.push(addon);
                } else {
                    this.addons = this.addons.filter(a => a !== addon);
                }
                this.updatePriceSummary();
                this.updateSelectedItems();
            });
        });

        // Details (Selects)
        document.querySelectorAll('.details-grid select').forEach(select => {
            select.addEventListener('change', () => {
                this.details[select.name] = select.value;
                this.updatePriceSummary();
                this.updateSelectedItems();
            });
        });

        // Vertragslaufzeit (Cards)
        document.querySelectorAll('.contract-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.contract-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.contract.duration = card.dataset.duration;
                this.contract.discount = parseFloat(card.dataset.discount) || 0;
                this.updatePriceSummary();
                this.updateSelectedItems();
                this.calculateBtn && (this.calculateBtn.disabled = false);
            });
        });

        // Navigation
        this.nextBtn && this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn && this.prevBtn.addEventListener('click', () => this.prevStep());

        // Angebot anfordern
        this.calculateBtn && this.calculateBtn.addEventListener('click', () => {
            if (!this.calculateBtn.disabled) {
                this.generateQuote();
            }
        });
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStep();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        this.steps.forEach((step, idx) => {
            step.classList.toggle('active', idx === this.currentStep);
        });
        document.querySelectorAll('.step-dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === this.currentStep);
        });
        this.prevBtn && (this.prevBtn.disabled = this.currentStep === 0);
        this.nextBtn && (this.nextBtn.disabled = (this.currentStep === this.steps.length - 1) || (this.currentStep === 0 && !this.baseOption));
        this.calculateBtn && (this.calculateBtn.disabled = this.currentStep !== this.steps.length - 1 || !this.contract.duration);
    }

    updatePriceSummary() {
        // Add-ons Preis
        let addonsPrice = 0;
        this.addons.forEach(addon => {
            const card = document.querySelector(`.addon-card[data-addon="${addon}"]`);
            if (card) addonsPrice += parseInt(card.dataset.price, 10) || 0;
        });
        this.prices.addons = addonsPrice;

        // Support Preis (optional)
        const supportSelect = document.querySelector('select[name="support"]');
        const supportOption = supportSelect ? supportSelect.selectedOptions[0] : null;
        this.prices.support = supportOption ? parseInt(supportOption.dataset.price, 10) || 0 : 0;

        // Modifiers für Unternehmensgröße und Standorte
        let modifier = 1;
        const companySizeSelect = document.querySelector('select[name="company-size"]');
        const companySizeMod = companySizeSelect ? parseFloat(companySizeSelect.selectedOptions[0].dataset.modifier) || 0 : 0;
        modifier += companySizeMod;

        const locationsSelect = document.querySelector('select[name="locations"]');
        const locationsMod = locationsSelect ? parseFloat(locationsSelect.selectedOptions[0].dataset.modifier) || 0 : 0;
        modifier += locationsMod;

        // Subtotal
        this.prices.subtotal = Math.round((this.prices.base + this.prices.addons + this.prices.support) * modifier);

        // Rabatt
        this.prices.discount = this.contract.discount ? Math.round(this.prices.subtotal * this.contract.discount) : 0;

        // Total
        this.prices.total = this.prices.subtotal - this.prices.discount;

        // Setup Fee mit Modifier
        this.prices.setup = Math.round(2500 * modifier);

        // DOM aktualisieren
        this.setText('.base-price', this.prices.base + '€');
        this.setText('.addons-price', this.prices.addons + '€');
        this.setText('.support-price', this.prices.support + '€');
        this.setText('.subtotal-price', this.prices.subtotal + '€');
        this.setText('.discount-price', '-' + this.prices.discount + '€');
        this.setText('.total-price', this.prices.total + '€');
        this.setText('.setup-price', this.prices.setup + '€');

        // Rabattzeile ein-/ausblenden
        const discountLine = document.querySelector('.price-line.discount');
        if (discountLine) discountLine.style.display = this.prices.discount > 0 ? 'flex' : 'none';
    }

    setText(selector, text) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    updateSelectedItems() {
        if (!this.selectedItems) return;
        let html = '';
        // Basis
        if (this.baseOption) {
            const card = document.querySelector(`.option-card[data-service="${this.baseOption}"]`);
            if (card) {
                html += `<div class="item"><span>${card.querySelector('h4').textContent}</span><span>${card.dataset.price}€</span></div>`;
            }
        }
        // Add-ons
        this.addons.forEach(addon => {
            const card = document.querySelector(`.addon-card[data-addon="${addon}"]`);
            if (card) {
                html += `<div class="item"><span>${card.querySelector('h4').textContent}</span><span>+${card.dataset.price}€</span></div>`;
            }
        });
        // Support
        const supportSelect = document.querySelector('select[name="support"]');
        const supportOption = supportSelect ? supportSelect.selectedOptions[0] : null;
        if (supportOption && parseInt(supportOption.dataset.price, 10) > 0) {
            html += `<div class="item"><span>${supportOption.textContent}</span><span>+${supportOption.dataset.price}€</span></div>`;
        }
        // Vertragslaufzeit
        if (this.contract.duration) {
            let label = '';
            if (this.contract.duration === 'monthly') label = 'Monatlich';
            if (this.contract.duration === 'annual') label = 'Jährlich';
            if (this.contract.duration === 'biannual') label = '2 Jahre';
            html += `<div class="item"><span>Vertragslaufzeit</span><span>${label}</span></div>`;
        }
        this.selectedItems.innerHTML = html;
    }

    generateQuote() {
        const quoteData = {
            base: this.baseOption,
            addons: this.addons,
            details: this.details,
            contract: this.contract,
            prices: this.prices,
            total: this.prices.total,
            setup: this.prices.setup,
            timestamp: new Date().toISOString()
        };

        // Schreibe Daten ins Kontaktformular, falls Feld existiert
        const hiddenField = document.getElementById('calculator-data');
        if (hiddenField) {
            hiddenField.value = JSON.stringify(quoteData);
        }

        // Kontaktformular anzeigen und Fokus setzen
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstInput = contactForm.querySelector('input, textarea, select');
            firstInput?.focus();
        }
    }
}

// Kalkulator initialisieren, wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    const calculatorSection = document.querySelector('.calculator-section');
    if (calculatorSection) {
        const calculator = new PriceCalculator();
        calculator.init();
    }
    // ...weitere Initialisierungen...
});
