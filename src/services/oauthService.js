/**
 * OAuth 2.0 Service for Azure AD and GitHub
 * Handles OAuth authentication flow for multiple providers
 */

const OAUTH_PROVIDERS = {
  azure: {
    name: 'Microsoft Azure AD',
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'openid profile email',
    redirectUri: `${window.location.origin}/api/oauth2-redirect`,
    responseType: 'code',
    tokenEndpoint: '/collections/_pb_users_auth_/oauth2-redirect'
  },
  github: {
    name: 'GitHub',
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'user:email',
    redirectUri: `${window.location.origin}/api/oauth2-redirect`,
    responseType: 'code'
  }
};

/**
 * Generate OAuth authorization URL
 * @param {string} provider - 'azure' or 'github'
 * @returns {string} Authorization URL
 */
export function generateOAuthUrl(provider) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config || !config.clientId) {
    throw new Error(`OAuth provider '${provider}' not configured or missing client ID`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: config.responseType,
    state: generateState(provider)
  });

  // Azure-specific parameters
  if (provider === 'azure') {
    params.append('response_mode', 'query');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Generate a secure state parameter for OAuth
 * @param {string} provider - OAuth provider name
 * @returns {string} State string
 */
function generateState(provider) {
  const state = {
    provider,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  };
  const stateString = btoa(JSON.stringify(state));
  localStorage.setItem('oauth_state', stateString);
  return stateString;
}

/**
 * Validate OAuth state parameter
 * @param {string} state - State string from OAuth callback
 * @returns {Object|null} Parsed state or null if invalid
 */
export function validateState(state) {
  try {
    const storedState = localStorage.getItem('oauth_state');
    localStorage.removeItem('oauth_state');

    if (!storedState || storedState !== state) {
      return null;
    }

    return JSON.parse(atob(state));
  } catch (error) {
    console.error('Invalid OAuth state:', error);
    return null;
  }
}

/**
 * Initiate OAuth login flow
 * @param {string} provider - 'azure' or 'github'
 */
export function initiateOAuth(provider) {
  try {
    const url = generateOAuthUrl(provider);
    window.location.href = url;
  } catch (error) {
    console.error(`Failed to initiate ${provider} OAuth:`, error);
    throw error;
  }
}

/**
 * Handle OAuth callback from PocketBase
 * This is called when PocketBase redirects back with the OAuth code
 * @param {string} provider - OAuth provider name
 * @returns {Promise<Object>} Auth response with token and user data
 */
export async function handleOAuthCallback(provider, code) {
  try {
    // The OAuth code is handled by PocketBase directly
    // We just need to let PocketBase process it and return the result
    // This will be called after PocketBase has already processed the OAuth flow

    const state = validateState(code);
    if (!state || state.provider !== provider) {
      throw new Error('Invalid OAuth state');
    }

    // Check if PocketBase has already set the auth token
    const token = localStorage.getItem('classABC_pb_token');
    if (token) {
      // Return the token to the caller
      return {
        token,
        provider
      };
    }

    throw new Error('OAuth callback processing failed');
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

/**
 * Check if OAuth provider is configured
 * @param {string} provider - 'azure' or 'github'
 * @returns {boolean} Whether provider is configured
 */
export function isProviderConfigured(provider) {
  const config = OAUTH_PROVIDERS[provider];
  return config && !!config.clientId;
}

/**
 * Get provider display name
 * @param {string} provider - 'azure' or 'github'
 * @returns {string} Provider name
 */
export function getProviderName(provider) {
  return OAUTH_PROVIDERS[provider]?.name || provider;
}

/**
 * Get all available providers
 * @returns {Array} Array of available provider configs
 */
export function getAvailableProviders() {
  return Object.entries(OAUTH_PROVIDERS)
    .filter(([_, config]) => !!config.clientId)
    .map(([key, config]) => ({
      key,
      name: config.name,
      clientId: config.clientId
    }));
}

export default {
  initiateOAuth,
  handleOAuthCallback,
  isProviderConfigured,
  getProviderName,
  getAvailableProviders,
  generateOAuthUrl
};
