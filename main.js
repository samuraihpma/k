// Mood Tracker Journal - Main JavaScript
// Handles all frontend interactions and animations

class MoodTracker {
    constructor() {
        this.currentMood = 5;
        this.selectedTags = [];
        this.photoFile = null;
        this.entries = [];
        this.filters = {
            mood: null,
            tags: [],
            time: null,
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadSampleData();
        this.initializeBackground();
        
        // Page-specific initialization
        const currentPage = this.getCurrentPage();
        switch(currentPage) {
            case 'index':
                this.initializeDashboard();
                break;
            case 'journal':
                this.initializeJournal();
                break;
            case 'analytics':
                this.initializeAnalytics();
                break;
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('journal.html')) return 'journal';
        if (path.includes('analytics.html')) return 'analytics';
        if (path.includes('login.html')) return 'login';
        return 'index';
    }
    
    setupEventListeners() {
        // Mood slider functionality
        const moodSlider = document.getElementById('mood-slider');
        const moodThumb = document.getElementById('mood-thumb');
        
        if (moodSlider && moodThumb) {
            this.setupMoodSlider(moodSlider, moodThumb);
        }
        
        // Photo upload functionality
        const photoUpload = document.getElementById('photo-upload');
        const photoInput = document.getElementById('photo-input');
        
        if (photoUpload && photoInput) {
            this.setupPhotoUpload(photoUpload, photoInput);
        }
        
        // Tag selection
        const moodTags = document.getElementById('mood-tags');
        if (moodTags) {
            this.setupTagSelection(moodTags);
        }
        
        // Save mood button
        const saveMoodBtn = document.getElementById('save-mood-btn');
        if (saveMoodBtn) {
            saveMoodBtn.addEventListener('click', () => this.saveMoodEntry());
        }
        
        // Character counter for notes
        const moodNotes = document.getElementById('mood-notes');
        const charCount = document.getElementById('char-count');
        
        if (moodNotes && charCount) {
            moodNotes.addEventListener('input', (e) => {
                charCount.textContent = e.target.value.length;
            });
        }
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Logout buttons
        const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-mobile');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleLogout());
        });
    }
    
    setupMoodSlider(slider, thumb) {
        let isDragging = false;
        
        const updateMood = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const moodValue = Math.round(percentage * 9) + 1; // 1-10 scale
            
            this.currentMood = moodValue;
            thumb.style.left = `${percentage * 100}%`;
            
            this.updateMoodDisplay(moodValue);
        };
        
        // Click on slider
        slider.addEventListener('click', (e) => {
            updateMood(e.clientX);
        });
        
        // Drag functionality
        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateMood(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Touch events for mobile
        thumb.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                updateMood(e.touches[0].clientX);
            }
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    updateMoodDisplay(moodValue) {
        const moodEmoji = document.getElementById('mood-emoji');
        const moodText = document.getElementById('mood-text');
        
        if (moodEmoji && moodText) {
            const moodData = this.getMoodData(moodValue);
            moodEmoji.textContent = moodData.emoji;
            moodText.textContent = moodData.text;
        }
    }
    
    getMoodData(value) {
        const moods = {
            1: { emoji: '😔', text: 'Very Low' },
            2: { emoji: '😞', text: 'Low' },
            3: { emoji: '😐', text: 'Below Average' },
            4: { emoji: '🙂', text: 'Average' },
            5: { emoji: '😐', text: 'Neutral' },
            6: { emoji: '😊', text: 'Good' },
            7: { emoji: '😄', text: 'Very Good' },
            8: { emoji: '😁', text: 'Great' },
            9: { emoji: '🤩', text: 'Excellent' },
            10: { emoji: '🥳', text: 'Outstanding' }
        };
        
        return moods[value] || moods[5];
    }
    
    setupPhotoUpload(uploadZone, input) {
        // Click to upload
        uploadZone.addEventListener('click', () => {
            input.click();
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handlePhotoUpload(files[0]);
            }
        });
        
        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handlePhotoUpload(e.target.files[0]);
            }
        });
    }
    
    handlePhotoUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file.', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('File size must be less than 5MB.', 'error');
            return;
        }
        
        this.photoFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            const previewImage = document.getElementById('preview-image');
            
            if (preview && previewImage) {
                previewImage.src = e.target.result;
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
        
        // Setup remove photo button
        const removeBtn = document.getElementById('remove-photo');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removePhoto();
            });
        }
    }
    
    removePhoto() {
        this.photoFile = null;
        const preview = document.getElementById('photo-preview');
        const input = document.getElementById('photo-input');
        
        if (preview) {
            preview.classList.add('hidden');
        }
        
        if (input) {
            input.value = '';
        }
    }
    
    setupTagSelection(tagsContainer) {
        tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-chip')) {
                const tag = e.target.dataset.tag;
                
                if (e.target.classList.contains('selected')) {
                    e.target.classList.remove('selected');
                    this.selectedTags = this.selectedTags.filter(t => t !== tag);
                } else {
                    e.target.classList.add('selected');
                    this.selectedTags.push(tag);
                }
            }
        });
    }
    
    async saveMoodEntry() {
        const notes = document.getElementById('mood-notes')?.value || '';
        
        const entry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mood: this.currentMood,
            notes: notes,
            tags: [...this.selectedTags],
            photo: this.photoFile
        };
        
        this.showLoading('Saving your mood entry...');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save to local storage (in real app, this would be Appwrite)
            this.saveEntryToStorage(entry);
            
            this.hideLoading();
            this.showNotification('Mood entry saved successfully!', 'success');
            this.resetForm();
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Failed to save entry. Please try again.', 'error');
        }
    }
    
    saveEntryToStorage(entry) {
        let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        entries.unshift(entry); // Add to beginning
        localStorage.setItem('moodEntries', JSON.stringify(entries));
    }
    
    resetForm() {
        // Reset mood slider
        const moodThumb = document.getElementById('mood-thumb');
        if (moodThumb) {
            moodThumb.style.left = '50%';
        }
        
        this.currentMood = 5;
        this.updateMoodDisplay(5);
        
        // Reset notes
        const moodNotes = document.getElementById('mood-notes');
        const charCount = document.getElementById('char-count');
        if (moodNotes) {
            moodNotes.value = '';
        }
        if (charCount) {
            charCount.textContent = '0';
        }
        
        // Reset tags
        this.selectedTags = [];
        document.querySelectorAll('.tag-chip.selected').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        // Reset photo
        this.removePhoto();
    }
    
    initializeAnimations() {
        // Animate elements on page load
        anime({
            targets: '.entry-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuart'
        });
        
        // Animate stats cards
        anime({
            targets: '.stat-card',
            scale: [0.9, 1],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 600,
            easing: 'easeOutBack'
        });
    }
    
    initializeBackground() {
        // P5.js background animation
        if (typeof p5 !== 'undefined' && document.getElementById('p5-background')) {
            new p5((p) => {
                let particles = [];
                
                p.setup = () => {
                    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                    canvas.parent('p5-background');
                    
                    // Create particles
                    for (let i = 0; i < 50; i++) {
                        particles.push({
                            x: p.random(p.width),
                            y: p.random(p.height),
                            vx: p.random(-0.5, 0.5),
                            vy: p.random(-0.5, 0.5),
                            size: p.random(2, 6)
                        });
                    }
                };
                
                p.draw = () => {
                    p.clear();
                    
                    // Update and draw particles
                    particles.forEach(particle => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        
                        // Wrap around edges
                        if (particle.x < 0) particle.x = p.width;
                        if (particle.x > p.width) particle.x = 0;
                        if (particle.y < 0) particle.y = p.height;
                        if (particle.y > p.height) particle.y = 0;
                        
                        // Draw particle
                        p.fill(135, 169, 107, 50);
                        p.noStroke();
                        p.circle(particle.x, particle.y, particle.size);
                    });
                };
                
                p.windowResized = () => {
                    p.resizeCanvas(p.windowWidth, p.windowHeight);
                };
            });
        }
    }
    
    initializeDashboard() {
        // Update recent entries
        this.loadRecentEntries();
        
        // Animate mood slider
        const moodThumb = document.getElementById('mood-thumb');
        if (moodThumb) {
            anime({
                targets: moodThumb,
                scale: [0.8, 1],
                duration: 800,
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }
    
    initializeJournal() {
        this.setupJournalFilters();
        this.loadJournalEntries();
        this.setupEntryModal();
    }
    
    setupJournalFilters() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const filterType = chip.dataset.filter;
                const filterValue = chip.dataset.value;
                
                if (chip.classList.contains('active')) {
                    chip.classList.remove('active');
                    this.filters[filterType] = null;
                } else {
                    // Remove active from same filter type
                    document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(c => {
                        c.classList.remove('active');
                    });
                    
                    chip.classList.add('active');
                    this.filters[filterType] = filterValue;
                }
                
                this.filterEntries();
            });
        });
        
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.filterEntries();
            });
        }
        
        // Clear filters
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }
    
    filterEntries() {
        const entries = document.querySelectorAll('.entry-card');
        
        entries.forEach(entry => {
            let shouldShow = true;
            
            // Search filter
            if (this.filters.search) {
                const text = entry.textContent.toLowerCase();
                if (!text.includes(this.filters.search)) {
                    shouldShow = false;
                }
            }
            
            // Mood filter
            if (this.filters.mood && shouldShow) {
                const moodText = entry.querySelector('.text-xs.text-warm-gray:last-child').textContent;
                const moodValue = parseInt(moodText.split('/')[0]);
                
                switch(this.filters.mood) {
                    case '1-3':
                        shouldShow = moodValue >= 1 && moodValue <= 3;
                        break;
                    case '4-6':
                        shouldShow = moodValue >= 4 && moodValue <= 6;
                        break;
                    case '7-10':
                        shouldShow = moodValue >= 7 && moodValue <= 10;
                        break;
                }
            }
            
            // Show/hide entry
            if (shouldShow) {
                entry.style.display = 'block';
                anime({
                    targets: entry,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 400,
                    easing: 'easeOutQuart'
                });
            } else {
                entry.style.display = 'none';
            }
        });
    }
    
    clearAllFilters() {
        // Clear filter chips
        document.querySelectorAll('.filter-chip.active').forEach(chip => {
            chip.classList.remove('active');
        });
        
        // Clear search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset filters
        this.filters = {
            mood: null,
            tags: [],
            time: null,
            search: ''
        };
        
        // Show all entries
        this.filterEntries();
    }
    
    setupEntryModal() {
        const modal = document.getElementById('entry-modal');
        const closeBtn = document.getElementById('close-modal');
        
        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
        
        // Entry card clicks
        document.querySelectorAll('.entry-card').forEach(card => {
            card.addEventListener('click', () => {
                const entryId = card.dataset.entryId;
                this.showEntryModal(entryId);
            });
        });
    }
    
    showEntryModal(entryId) {
        const modal = document.getElementById('entry-modal');
        const modalContent = document.getElementById('modal-content');
        
        if (modal && modalContent) {
            // Find entry data
            const entry = this.entries.find(e => e.id === entryId) || this.getSampleEntry(entryId);
            
            if (entry) {
                modalContent.innerHTML = this.generateModalContent(entry);
                modal.classList.remove('hidden');
                
                // Animate modal
                anime({
                    targets: modal.querySelector('.modal-content'),
                    scale: [0.9, 1],
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutQuart'
                });
            }
        }
    }
    
    generateModalContent(entry) {
        return `
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm text-warm-gray">${this.formatDate(entry.date)}</span>
                    <div class="text-3xl">${this.getMoodData(entry.mood).emoji}</div>
                </div>
                <div class="text-xl font-semibold text-charcoal mb-4">${entry.title || 'Mood Entry'}</div>
                <p class="text-warm-gray mb-4">${entry.notes}</p>
                <div class="flex items-center space-x-2 mb-4">
                    <span class="text-sm text-warm-gray">Mood Rating:</span>
                    <span class="font-semibold text-charcoal">${entry.mood}/10</span>
                </div>
                ${entry.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-2">
                        ${entry.tags.map(tag => `<span class="filter-chip">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    initializeAnalytics() {
        // Initialize charts are handled in analytics.html
        this.animateStats();
    }
    
    animateStats() {
        // Animate stat numbers
        document.querySelectorAll('.stat-card .text-3xl').forEach(stat => {
            const finalValue = stat.textContent;
            stat.textContent = '0';
            
            anime({
                targets: stat,
                innerHTML: [0, finalValue],
                duration: 2000,
                easing: 'easeOutQuart',
                round: finalValue.includes('.') ? 10 : 1
            });
        });
    }
    
    loadSampleData() {
        this.entries = [
            {
                id: '1',
                date: new Date().toISOString(),
                mood: 8,
                title: 'Great day!',
                notes: 'Had an amazing morning walk in the park. The weather was perfect and I felt so peaceful. Got some great photos of the sunrise and enjoyed the quiet moments before the day got busy.',
                tags: ['exercise', 'personal']
            },
            {
                id: '2',
                date: new Date(Date.now() - 86400000).toISOString(),
                mood: 6,
                title: 'Productive but tired',
                notes: 'Work was busy today. Got a lot done but feeling a bit drained. Need to rest more and take better care of myself. Planning to go to bed early tonight.',
                tags: ['work']
            },
            {
                id: '3',
                date: new Date(Date.now() - 172800000).toISOString(),
                mood: 4,
                title: 'Challenging day',
                notes: 'Feeling a bit overwhelmed with everything going on. Taking it one step at a time and trying to practice self-compassion. Tomorrow is a new day.',
                tags: ['personal', 'health']
            }
        ];
    }
    
    loadRecentEntries() {
        const container = document.getElementById('recent-entries');
        if (!container) return;
        
        // Entries are already in HTML for demo
        // In real app, would load from storage/API
    }
    
    loadJournalEntries() {
        // Entries are already in HTML for demo
        // In real app, would load from storage/API and populate dynamically
    }
    
    getSampleEntry(id) {
        return this.entries.find(entry => entry.id === id) || {
            id: id,
            date: new Date().toISOString(),
            mood: 5,
            title: 'Sample Entry',
            notes: 'This is a sample entry for demonstration purposes.',
            tags: []
        };
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = overlay?.querySelector('p');
        
        if (overlay) {
            if (text) text.textContent = message;
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white max-w-sm ${
            type === 'success' ? 'bg-sage-green' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-warm-gray'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuart'
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 400,
                easing: 'easeInQuart',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }
    
    handleLogout() {
        // Clear any stored data
        localStorage.removeItem('moodEntries');
        
        // Show loading
        this.showLoading('Signing out...');
        
        // Redirect to login after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoodTracker();
});

// Handle page visibility changes for animations
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Resume animations when page becomes visible
        anime.remove('.entry-card, .stat-card');
    }
});

// Utility functions for global use
window.MoodTrackerUtils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    getMoodColor: (mood) => {
        const colors = {
            1: '#FF6B6B', 2: '#FF8E53', 3: '#FF9F43',
            4: '#FFC048', 5: '#FFD93D', 6: '#E6D75C',
            7: '#A8E6CF', 8: '#7FCDCD', 9: '#5C7AEA', 10: '#3D5A80'
        };
        return colors[mood] || '#8B8680';
    },
    
    debounce: (func, wait) => {
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
};