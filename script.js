// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const contactForm = document.getElementById('contact-form');
const navbar = document.querySelector('.navbar');

// Mobile Navigation Toggle
function toggleMobileNav() {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) bar.style.opacity = '0';
            if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        }
    });
}

// Close mobile menu when clicking on nav links
function closeMobileNav() {
    navMenu.classList.remove('active');
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.style.transform = 'none';
        bar.style.opacity = '1';
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileNav();
            }
        });
    });
}

// Navbar Background on Scroll
function handleNavbarScroll() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .stat');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Parallax Effect for Hero Section
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${rate * 0.3}px)`;
        }
        
        if (heroVisual) {
            heroVisual.style.transform = `translateY(${rate * 0.2}px)`;
        }
    });
}

// Form Handling
function initFormHandling() {
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.textContent = 'Sending...';
            
            try {
                // Simulate form submission (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Show success message
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                contactForm.reset();
                
            } catch (error) {
                // Show error message
                showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button state
                submitButton.classList.remove('loading');
                submitButton.textContent = 'Send Message';
            }
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        max-width: 350px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Typing Animation for Hero Title
function initTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.innerHTML;
    const gradientText = heroTitle.querySelector('.gradient-text');
    
    if (gradientText) {
        const gradientContent = gradientText.textContent;
        gradientText.textContent = '';
        
        let index = 0;
        const typeText = () => {
            if (index < gradientContent.length) {
                gradientText.textContent += gradientContent.charAt(index);
                index++;
                setTimeout(typeText, 100);
            }
        };
        
        // Start typing animation after initial page load
        setTimeout(typeText, 1000);
    }
}

// Counter Animation for Stats
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = target.textContent;
                
                // Extract number from text (e.g., "500+" -> 500)
                const numericValue = parseInt(finalNumber.replace(/\D/g, ''));
                const suffix = finalNumber.replace(/\d/g, '');
                
                let current = 0;
                const increment = numericValue / 50;
                
                const counter = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        target.textContent = finalNumber;
                        clearInterval(counter);
                    } else {
                        target.textContent = Math.floor(current) + suffix;
                    }
                }, 50);
                
                observer.unobserve(target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Floating Cards Animation Enhancement
function enhanceFloatingCards() {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    floatingCards.forEach((card, index) => {
        // Add mouse interaction
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.05)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
        
        // Add random movement
        setInterval(() => {
            const randomX = Math.random() * 10 - 5;
            const randomY = Math.random() * 10 - 5;
            card.style.transform += ` translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });
}

// Initialize Theme Toggle (for future enhancement)
function initThemeToggle() {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Create theme toggle button (if needed in future)
    // This is a placeholder for potential dark mode functionality
}

// Performance Optimization - Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize all functionality
function init() {
    // Navigation
    navToggle?.addEventListener('click', toggleMobileNav);
    
    // Scroll effects
    window.addEventListener('scroll', throttle(handleNavbarScroll, 16));
    
    // Initialize features
    initSmoothScrolling();
    initScrollAnimations();
    initParallaxEffect();
    initFormHandling();
    initCounterAnimation();
    enhanceFloatingCards();
    initThemeToggle();
    
    // 3D Effects
    initAll3DEffects();
    
    // Delayed animations
    setTimeout(() => {
        initTypingAnimation();
    }, 500);
    
    // Add loaded class to body for CSS animations
    document.body.classList.add('loaded');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Could send error reports to analytics service
});

// Performance Monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    }, 0);
});

// 3D Effects Functions
function init3DEffects() {
    // Add 3D perspective to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.transformStyle = 'preserve-3d';
    });
    
    // Enhance floating cards with 3D movement
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        // Random 3D movement
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            const randomZ = (Math.random() - 0.5) * 10;
            const randomRotX = (Math.random() - 0.5) * 10;
            const randomRotY = (Math.random() - 0.5) * 10;
            
            card.style.transform += ` translate3d(${randomX}px, ${randomY}px, ${randomZ}px) rotateX(${randomRotX}deg) rotateY(${randomRotY}deg)`;
        }, 4000 + index * 1000);
    });
}

function initMouseFollowing3D() {
    const heroVisual = document.querySelector('.hero-visual');
    const floatingCards = document.querySelectorAll('.floating-card');
    
    if (heroVisual) {
        heroVisual.setAttribute('data-mouse-3d', 'true');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            // Calculate rotation based on mouse position
            const rotateX = (mouseY - 0.5) * 20;
            const rotateY = (mouseX - 0.5) * -20;
            
            // Apply 3D transform to hero visual
            heroVisual.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Apply subtle movement to floating cards
            floatingCards.forEach((card, index) => {
                const multiplier = (index + 1) * 0.5;
                const cardRotateX = (mouseY - 0.5) * (10 * multiplier);
                const cardRotateY = (mouseX - 0.5) * (-10 * multiplier);
                const translateZ = (mouseX + mouseY) * (5 * multiplier);
                
                card.style.transform += ` rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg) translateZ(${translateZ}px)`;
            });
        });
        
        // Reset on mouse leave
        document.addEventListener('mouseleave', () => {
            heroVisual.style.transform = '';
            floatingCards.forEach(card => {
                card.style.transform = '';
            });
        });
    }
}

function initTiltEffects() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            element.style.transition = 'transform 0.2s ease-out';
        });
        
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            const rotateX = (deltaY / rect.height) * -30;
            const rotateY = (deltaX / rect.width) * 30;
            
            element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(20px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
            element.style.transition = 'transform 0.5s ease-out';
        });
    });
}

// Enhanced 3D Parallax
function init3DParallax() {
    const bg3DElements = document.querySelectorAll('.bg-3d-shape, .cube-3d, .shape-3d');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        bg3DElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const rotateSpeed = 0.1 + (index * 0.05);
            
            const yPos = -(scrolled * speed);
            const rotateX = scrolled * rotateSpeed;
            const rotateY = scrolled * (rotateSpeed * 0.5);
            
            element.style.transform = `translate3d(0, ${yPos}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });
}

// 3D Card Flip Effect
function init3DCardFlip() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        let isFlipped = false;
        
        card.addEventListener('dblclick', () => {
            isFlipped = !isFlipped;
            
            if (isFlipped) {
                card.style.transform = 'rotateY(180deg) translateZ(20px)';
                card.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
                card.style.color = 'white';
            } else {
                card.style.transform = '';
                card.style.background = 'white';
                card.style.color = '';
            }
        });
    });
}

// 3D Scroll Reveal
function init3DScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
                element.style.opacity = '1';
            } else {
                const element = entry.target;
                element.style.transform = 'translateZ(-100px) rotateX(45deg) rotateY(-45deg)';
                element.style.opacity = '0.7';
            }
        });
    }, observerOptions);
    
    // Observe 3D elements
    const elements3D = document.querySelectorAll('.feature-card, .testimonial-card, .floating-card');
    elements3D.forEach(el => {
        el.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
}

// Initialize all 3D effects
function initAll3DEffects() {
    init3DEffects();
    initMouseFollowing3D();
    initTiltEffects();
    init3DParallax();
    init3DCardFlip();
    init3DScrollReveal();
}

// Export functions for potential module usage
window.LandingPage = {
    showNotification,
    hideNotification,
    toggleMobileNav,
    closeMobileNav,
    initAll3DEffects
};