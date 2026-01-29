// Google OAuth 2.0 helper for ClassABC
// Uses Google Identity Services SDK

class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.scriptLoaded = false;
    this.scriptLoading = false;
  }

  // Load Google Identity Services SDK
  loadScript() {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      if (this.scriptLoading) {
        // Wait for existing load
        const checkInterval = setInterval(() => {
          if (this.scriptLoaded) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      this.scriptLoading = true;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve();
      };

      script.onerror = () => {
        this.scriptLoading = false;
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  // Initialize Google Sign-In
  async initialize() {
    await this.loadScript();

    if (!window.google) {
      throw new Error('Google Identity Services not loaded');
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  // Handle Google credential response
  async handleCredentialResponse(response) {
    if (this.currentResolve) {
      this.currentResolve(response.credential);
      this.currentResolve = null;
    }
  }

  // Trigger Google Sign-In popup
  async signIn() {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          // Fall back to button click method
          window.google.accounts.id.prompt();
        }
      });
    });
  }

  // Sign out
  signOut() {
    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // Decode JWT token (for debugging/user info)
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }
}

export default new GoogleAuthService();
