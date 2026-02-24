/**
 * Web Push Notification Utility for Klasiz.fun
 * Safely manages browser push notifications without affecting existing functionality
 */

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your actual VAPID key
const SERVICE_WORKER_PATH = '/sw.js';

let subscription = null;
let permission = 'default';

/**
 * Check if push notifications are supported
 * @returns {boolean} Whether push notifications are supported
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Request notification permission from the user
 * @returns {Promise<string>} Permission state ('granted', 'denied', 'default')
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    permission = 'granted';
    return permission;
  }

  if (Notification.permission !== 'denied') {
    permission = await Notification.requestPermission();
    return permission;
  }

  permission = 'denied';
  return permission;
}

/**
 * Subscribe to push notifications
 * @param {string} serverPublicKey - VAPID public key from server
 * @returns {Promise<PushSubscription|null>} Push subscription object or null
 */
export async function subscribeToPush(serverPublicKey = VAPID_PUBLIC_KEY) {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.warn('Service worker not registered');
      return null;
    }

    // Subscribe to push
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(serverPublicKey)
    });

    console.log('Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>} Whether unsubscribe was successful
 */
export async function unsubscribeFromPush() {
  if (!subscription) {
    return false;
  }

  try {
    await subscription.unsubscribe();
    subscription = null;
    console.log('Push unsubscribe successful');
    return true;
  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    return false;
  }
}

/**
 * Get current push subscription
 * @returns {PushSubscription|null} Current subscription or null
 */
export function getSubscription() {
  return subscription;
}

/**
 * Get current permission state
 * @returns {string} Permission state
 */
export function getPermission() {
  return permission || Notification.permission;
}

/**
 * Show a local notification (without server push)
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification|null} Notification object or null
 */
export function showLocalNotification(title, options = {}) {
  if (permission !== 'granted' && Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  const defaultOptions = {
    icon: '/icons/icon-192.webp',
    badge: '/icons/icon-72.webp',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options
  };

  return new Notification(title, defaultOptions);
}

/**
 * Convert URL-safe base64 to Uint8Array (for VAPID)
 * @param {string} base64String - URL-safe base64 string
 * @returns {Uint8Array} Converted Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Send subscription to server
 * @param {string} apiUrl - API endpoint URL
 * @param {Object} userData - Additional user data
 * @returns {Promise<boolean>} Whether send was successful
 */
export async function sendSubscriptionToServer(apiUrl, userData = {}) {
  if (!subscription) {
    console.warn('No subscription to send');
    return false;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('classABC_pb_token') || ''}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        ...userData
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    console.log('Subscription sent to server successfully');
    return true;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  ASSIGNMENT_DUE: {
    title: 'Assignment Due Soon',
    body: 'You have an assignment due in 24 hours.',
    icon: '/icons/icon-192.webp',
    tag: 'assignment-due'
  },
  NEW_ASSIGNMENT: {
    title: 'New Assignment',
    body: 'Your teacher has assigned a new assignment.',
    icon: '/icons/icon-192.webp',
    tag: 'new-assignment'
  },
  SUBMISSION_RECEIVED: {
    title: 'New Submission',
    body: 'A student has submitted their assignment.',
    icon: '/icons/icon-192.webp',
    tag: 'submission-received'
  },
  POINTS_EARNED: {
    title: 'Points Earned!',
    body: 'You earned points for great work!',
    icon: '/icons/icon-192.webp',
    tag: 'points-earned'
  },
  CLASS_UPDATE: {
    title: 'Class Update',
    body: 'Your teacher has posted an update.',
    icon: '/icons/icon-192.webp',
    tag: 'class-update'
  }
};

/**
 * Show a notification using a template
 * @param {string} templateKey - Template key from NotificationTemplates
 * @param {Object} customData - Custom data to override template
 * @returns {Notification|null} Notification object or null
 */
export function showTemplateNotification(templateKey, customData = {}) {
  const template = NotificationTemplates[templateKey];
  if (!template) {
    console.warn(`Template not found: ${templateKey}`);
    return null;
  }

  return showLocalNotification(
    customData.title || template.title,
    {
      ...template,
      ...customData
    }
  );
}

/**
 * Initialize push notification system
 * @param {Object} options - Initialization options
 * @returns {Promise<Object>} Initialization result
 */
export async function initializePushNotifications(options = {}) {
  const {
    autoRequestPermission = false,
    serverPublicKey = VAPID_PUBLIC_KEY,
    onPermissionGranted = null,
    onPermissionDenied = null,
    onSubscriptionSuccess = null,
    onSubscriptionError = null
  } = options;

  const result = {
    supported: isPushSupported(),
    permission: null,
    subscription: null
  };

  if (!result.supported) {
    return result;
  }

  if (autoRequestPermission) {
    result.permission = await requestNotificationPermission();

    if (result.permission === 'granted' && onPermissionGranted) {
      onPermissionGranted();
    } else if (result.permission === 'denied' && onPermissionDenied) {
      onPermissionDenied();
    }
  } else {
    result.permission = getPermission();
  }

  if (result.permission === 'granted') {
    result.subscription = await subscribeToPush(serverPublicKey);

    if (result.subscription && onSubscriptionSuccess) {
      onSubscriptionSuccess(result.subscription);
    } else if (!result.subscription && onSubscriptionError) {
      onSubscriptionError('Failed to subscribe');
    }
  }

  return result;
}

export default {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscription,
  getPermission,
  showLocalNotification,
  showTemplateNotification,
  sendSubscriptionToServer,
  initializePushNotifications,
  NotificationTemplates
};
