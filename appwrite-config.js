// Appwrite Configuration for Mood Tracker Journal
// Handles authentication, database operations, storage, and functions

class AppwriteService {
    constructor() {
        // Appwrite configuration
        this.projectId = 'your-project-id'; // Replace with your Appwrite project ID
        this.endpoint = 'https://cloud.appwrite.io/v1'; // Replace with your Appwrite endpoint
        this.databaseId = 'mood-journal-db'; // Replace with your database ID
        this.collectionId = 'mood-entries'; // Replace with your collection ID
        this.bucketId = 'mood-photos'; // Replace with your storage bucket ID
        
        this.client = null;
        this.account = null;
        this.databases = null;
        this.storage = null;
        this.functions = null;
        
        this.init();
        this.setupAuthListeners();
    }
    
    init() {
        // Initialize Appwrite SDK
        if (typeof Appwrite !== 'undefined') {
            this.client = new Appwrite.Client();
            this.client
                .setEndpoint(this.endpoint)
                .setProject(this.projectId);
            
            this.account = new Appwrite.Account(this.client);
            this.databases = new Appwrite.Databases(this.client);
            this.storage = new Appwrite.Storage(this.client);
            this.functions = new Appwrite.Functions(this.client);
            
            console.log('Appwrite initialized successfully');
        } else {
            console.warn('Appwrite SDK not loaded. Using local storage fallback.');
        }
    }
    
    setupAuthListeners() {
        // Setup authentication form handlers
        this.setupLoginForm();
        this.setupSignupForm();
        this.setupOAuthHandlers();
        this.checkAuthStatus();
    }
    
    setupLoginForm() {
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');
                
                await this.login(email, password);
            });
        }
    }
    
    setupSignupForm() {
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(signupForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const password = formData.get('password');
                
                await this.signup(name, email, password);
            });
        }
    }
    
    setupOAuthHandlers() {
        // Google OAuth
        const googleBtn = document.querySelector('button:has(svg path[d*="M21 21l-6-6"])');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.loginWithOAuth('google');
            });
        }
        
        // GitHub OAuth
        const githubBtn = document.querySelector('button:has(svg path[d*="M12 0c-6.626"])');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => {
                this.loginWithOAuth('github');
            });
        }
    }
    
    async checkAuthStatus() {
        try {
            if (this.account) {
                const user = await this.account.get();
                this.handleAuthenticatedUser(user);
            } else {
                // Fallback to local storage check
                const user = localStorage.getItem('currentUser');
                if (user) {
                    this.handleAuthenticatedUser(JSON.parse(user));
                }
            }
        } catch (error) {
            // User not authenticated
            this.handleUnauthenticatedUser();
        }
    }
    
    async login(email, password) {
        this.showAuthLoading('Signing in...');
        
        try {
            if (this.account) {
                const session = await this.account.createEmailPasswordSession(email, password);
                const user = await this.account.get();
                
                this.handleAuthenticatedUser(user);
                this.showNotification('Login successful!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } else {
                // Fallback to local storage
                const users = JSON.parse(localStorage.getItem('moodJournalUsers') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.showNotification('Login successful!', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    throw new Error('Invalid credentials');
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please check your credentials.', 'error');
        } finally {
            this.hideAuthLoading();
        }
    }
    
    async signup(name, email, password) {
        this.showAuthLoading('Creating account...');
        
        try {
            if (this.account) {
                await this.account.create('unique()', email, password, name);
                await this.account.createEmailPasswordSession(email, password);
                
                const user = await this.account.get();
                this.handleAuthenticatedUser(user);
                this.showNotification('Account created successfully!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } else {
                // Fallback to local storage
                const users = JSON.parse(localStorage.getItem('moodJournalUsers') || '[]');
                
                // Check if user already exists
                if (users.find(u => u.email === email)) {
                    throw new Error('User already exists');
                }
                
                const newUser = {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    password: password, // In real app, never store plain passwords
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('moodJournalUsers', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                
                this.showNotification('Account created successfully!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Failed to create account. Please try again.', 'error');
        } finally {
            this.hideAuthLoading();
        }
    }
    
    async loginWithOAuth(provider) {
        this.showAuthLoading(`Connecting with ${provider}...`);
        
        try {
            if (this.account) {
                // Generate OAuth URL
                const successUrl = window.location.origin + '/index.html';
                const failureUrl = window.location.origin + '/login.html';
                
                const oauthUrl = await this.account.createOAuth2Token(
                    provider,
                    successUrl,
                    failureUrl
                );
                
                // Redirect to OAuth provider
                window.location.href = oauthUrl;
                
            } else {
                // Fallback - simulate OAuth
                this.showNotification(`${provider} OAuth not available in demo mode`, 'info');
            }
            
        } catch (error) {
            console.error('OAuth error:', error);
            this.showNotification(`Failed to connect with ${provider}`, 'error');
        } finally {
            this.hideAuthLoading();
        }
    }
    
    async logout() {
        try {
            if (this.account) {
                await this.account.deleteSession('current');
            }
            
            // Clear local storage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('moodEntries');
            
            this.showNotification('Logged out successfully', 'success');
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed', 'error');
        }
    }
    
    // Database Operations
    async saveMoodEntry(entry) {
        try {
            if (this.databases) {
                // Save to Appwrite database
                const response = await this.databases.createDocument(
                    this.databaseId,
                    this.collectionId,
                    'unique()',
                    {
                        userId: entry.userId,
                        date: entry.date,
                        mood: entry.mood,
                        notes: entry.notes,
                        tags: entry.tags,
                        photoId: entry.photoId || null
                    }
                );
                
                return response;
            } else {
                // Fallback to local storage
                const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                entries.unshift({
                    ...entry,
                    id: Date.now().toString(),
                    $id: Date.now().toString()
                });
                localStorage.setItem('moodEntries', JSON.stringify(entries));
                
                return { $id: Date.now().toString() };
            }
            
        } catch (error) {
            console.error('Save entry error:', error);
            throw error;
        }
    }
    
    async getMoodEntries(userId, limit = 50, offset = 0) {
        try {
            if (this.databases) {
                const response = await this.databases.listDocuments(
                    this.databaseId,
                    this.collectionId,
                    [
                        Query.equal('userId', userId),
                        Query.orderDesc('date'),
                        Query.limit(limit),
                        Query.offset(offset)
                    ]
                );
                
                return response.documents;
            } else {
                // Fallback to local storage
                const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                return entries.slice(offset, offset + limit);
            }
            
        } catch (error) {
            console.error('Get entries error:', error);
            throw error;
        }
    }
    
    async updateMoodEntry(entryId, updates) {
        try {
            if (this.databases) {
                const response = await this.databases.updateDocument(
                    this.databaseId,
                    this.collectionId,
                    entryId,
                    updates
                );
                
                return response;
            } else {
                // Fallback to local storage
                const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                const index = entries.findIndex(e => e.id === entryId || e.$id === entryId);
                
                if (index !== -1) {
                    entries[index] = { ...entries[index], ...updates };
                    localStorage.setItem('moodEntries', JSON.stringify(entries));
                }
                
                return entries[index];
            }
            
        } catch (error) {
            console.error('Update entry error:', error);
            throw error;
        }
    }
    
    async deleteMoodEntry(entryId) {
        try {
            if (this.databases) {
                await this.databases.deleteDocument(
                    this.databaseId,
                    this.collectionId,
                    entryId
                );
            } else {
                // Fallback to local storage
                const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                const filteredEntries = entries.filter(e => e.id !== entryId && e.$id !== entryId);
                localStorage.setItem('moodEntries', JSON.stringify(filteredEntries));
            }
            
        } catch (error) {
            console.error('Delete entry error:', error);
            throw error;
        }
    }
    
    // Storage Operations
    async uploadPhoto(file) {
        try {
            if (this.storage) {
                const response = await this.storage.createFile(
                    this.bucketId,
                    'unique()',
                    file
                );
                
                return response.$id;
            } else {
                // Fallback - store in local storage (base64)
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const photoId = Date.now().toString();
                        const photos = JSON.parse(localStorage.getItem('photos') || '{}');
                        photos[photoId] = e.target.result;
                        localStorage.setItem('photos', JSON.stringify(photos));
                        resolve(photoId);
                    };
                    reader.readAsDataURL(file);
                });
            }
            
        } catch (error) {
            console.error('Upload photo error:', error);
            throw error;
        }
    }
    
    async getPhotoUrl(photoId) {
        try {
            if (this.storage) {
                return await this.storage.getFileView(this.bucketId, photoId);
            } else {
                // Fallback - get from local storage
                const photos = JSON.parse(localStorage.getItem('photos') || '{}');
                return photos[photoId] || null;
            }
            
        } catch (error) {
            console.error('Get photo error:', error);
            return null;
        }
    }
    
    // Functions
    async generateWeeklyReport(userId) {
        try {
            if (this.functions) {
                const response = await this.functions.createExecution(
                    'weekly-report-function', // Replace with your function ID
                    JSON.stringify({ userId })
                );
                
                return JSON.parse(response.response);
            } else {
                // Fallback - generate simple report
                const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                const userEntries = entries.filter(e => e.userId === userId);
                
                const weekEntries = userEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return entryDate >= weekAgo;
                });
                
                const averageMood = weekEntries.length > 0 
                    ? weekEntries.reduce((sum, entry) => sum + entry.mood, 0) / weekEntries.length
                    : 0;
                
                return {
                    averageMood: Math.round(averageMood * 10) / 10,
                    totalEntries: weekEntries.length,
                    bestDay: weekEntries.length > 0 
                        ? weekEntries.reduce((best, entry) => entry.mood > best.mood ? entry : entry).date
                        : null,
                    streak: this.calculateStreak(userEntries)
                };
            }
            
        } catch (error) {
            console.error('Generate report error:', error);
            throw error;
        }
    }
    
    calculateStreak(entries) {
        if (entries.length === 0) return 0;
        
        const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (let entry of sortedEntries) {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
                currentDate = new Date(entryDate);
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Utility Methods
    handleAuthenticatedUser(user) {
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI elements
        this.updateUIForAuthenticatedUser(user);
        
        console.log('User authenticated:', user);
    }
    
    handleUnauthenticatedUser() {
        // Clear any stored user data
        localStorage.removeItem('currentUser');
        
        // Redirect to login if not already there
        const currentPage = this.getCurrentPage();
        if (currentPage !== 'login' && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
    
    updateUIForAuthenticatedUser(user) {
        // Update user name in UI if elements exist
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = user.name || 'User';
        });
        
        // Show/hide appropriate UI elements
        const authElements = document.querySelectorAll('[data-auth="required"]');
        authElements.forEach(element => {
            element.style.display = 'block';
        });
        
        const noAuthElements = document.querySelectorAll('[data-auth="none"]');
        noAuthElements.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('journal.html')) return 'journal';
        if (path.includes('analytics.html')) return 'analytics';
        if (path.includes('login.html')) return 'login';
        return 'index';
    }
    
    showAuthLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');
        
        if (overlay && text) {
            text.textContent = message;
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }
    }
    
    hideAuthLoading() {
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
        if (typeof anime !== 'undefined') {
            anime({
                targets: notification,
                translateX: [300, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuart'
            });
        }
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: notification,
                    translateX: [0, 300],
                    opacity: [1, 0],
                    duration: 400,
                    easing: 'easeInQuart',
                    complete: () => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }
                });
            } else {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }
        }, 3000);
    }
}

// Initialize Appwrite service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appwriteService = new AppwriteService();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppwriteService;
}