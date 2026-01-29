import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Driver.js based guided tour system
 * Professional, feature-rich tour library with overlay highlighting
 */

export const portalTour = {
  config: {
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: '🎉 Done',
    showProgress: true,
  },
  steps: [
    {
      element: '.add-class-button',
      popover: {
      title: '👋 Welcome to classABC!',
        description: 'Click here to create your first class.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'input[type="text"]',
      popover: {
        title: '📝 Enter Class Name',
        description: 'Type your class name (e.g., "Room 4A", "Class 2B"). Be creative! 🎨',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button[style*="#4CAF50"]',
      popover: {
        title: '✅ Create Class',
        description: 'Click "Create Class" to save your classroom!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '📚 Select Your Class',
        description: 'Click on your newly created class to enter the classroom dashboard and start adding students.',
        side: 'center',
        align: 'center',
      },
    },
  ],
};

export const dashboardTour = {
  config: {
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: '🎉 Done',
    showProgress: true,
  },
  steps: [
    {
      element: '.add-student-button',
      popover: {
        title: '👥 Add First Student',
        description: 'Click "Add Student" to enroll your first student to the class.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '📝 Enter Student Name',
        description: 'Type the student\'s name to create their profile.',
        side: 'center',
        align: 'center',
      },
    },
    {
      popover: {
        title: '🦁 Choose Avatar',
        description: 'Pick a cute animal avatar that represents your student. Click "Choose character" to see all options!',
        side: 'center',
        align: 'center',
      },
    },
    {
      popover: {
        title: '💾 Save Student',
        description: 'Click the "Save" button to add the student to your classroom.',
        side: 'center',
        align: 'center',
      },
    },
    {
      element: '.student-cards-container > div:first-child',
      popover: {
        title: '🎯 Student Card',
        description: 'Click on any student card to open behavior selection and award points!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '⭐ Behavior Cards',
        description: '🟢 Green cards = positive behaviors (award points)\n🔴 Red cards = behaviors to improve (deduct points)\n\nClick any card to apply it to the student!',
        side: 'center',
        align: 'center',
      },
    },
    {
      element: '[data-navbar-icon="attendance"]',
      popover: {
        title: '✓ Attendance Mode',
        description: 'Click the checkmark icon to mark students absent/present each day. Click students to toggle their status.',
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '[data-navbar-icon="lucky-draw"]',
      popover: {
        title: '🎲 Lucky Draw',
        description: 'Click the dice icon to randomly select a student for classroom activities!',
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '[data-navbar-icon="egg-road"]',
      popover: {
        title: '🥚 Egg Road - Rewards',
        description: 'Click the trophy to track your class\'s progress toward earning rewards!',
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '[data-navbar-icon="settings"]',
      popover: {
        title: '⚙️ Settings',
        description: 'Click the gear icon to customize behavior cards and manage your classroom settings.',
        side: 'right',
        align: 'center',
      },
    },
    {
      popover: {
        title: '🎉 You\'re Ready!',
        description: 'Congratulations! You\'ve learned all the basics. Start awarding points and celebrating student achievements! 🌟\n\nNeed help? Click the ? button anytime to restart this tour.',
        side: 'center',
        align: 'center',
      },
    },
  ],
};

/**
 * Create and start a Driver.js tour
 */
export const startTour = (tourConfig, onComplete) => {
  const driverInstance = driver({
    ...tourConfig.config,
    onDestroyStarted: () => {
      if (onComplete) onComplete();
    },
  });

  driverInstance.setSteps(tourConfig.steps);
  driverInstance.start();
  return driverInstance;
};

/**
 * Check if tour has been completed
 */
export const hasTourBeenCompleted = (email, tourName) => {
  if (!email) return false;
  const key = `classABC_tour_${tourName}_${email}`;
  return localStorage.getItem(key) === 'true';
};

/**
 * Mark tour as completed
 */
export const markTourAsCompleted = (email, tourName) => {
  if (!email) return;
  const key = `classABC_tour_${tourName}_${email}`;
  localStorage.setItem(key, 'true');
};

/**
 * Reset tour completion for user
 */
export const resetTours = (email) => {
  if (!email) return;
  localStorage.removeItem(`classABC_tour_portal_${email}`);
  localStorage.removeItem(`classABC_tour_dashboard_${email}`);
};
