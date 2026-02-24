import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useTranslation } from '../i18n';

export default function FAQPage({ isDark = false, isMobile = false, onBack }) {
  const { isDark: themeDark } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToHome = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is Klasiz.fun?',
          a: 'Klasiz.fun is a modern classroom management platform designed to help teachers run calmer, more joyful classes. It combines behavior tracking, points and rewards, live dashboards, lesson planning tools, parent communication, and playful games—all in one place.'
        },
        {
          q: 'Is Klasiz.fun free to use?',
          a: 'Yes! Klasiz.fun is completely free for teachers to create classes, add students, track behavior, and use all core features. We believe in making classroom management accessible to every teacher.'
        },
        {
          q: 'How do I create a class?',
          a: 'After signing up, simply click "Create My Class" in your teacher portal. Give your class a name, optionally upload a class photo, and you\'re ready to start adding students and managing behavior.'
        },
        {
          q: 'How do I add students to my class?',
          a: 'In your class dashboard, click "Manage Students" and then "Add Student." Enter the student\'s name, select their gender, and optionally upload a photo. You can add as many students as you need.'
        }
      ]
    },
    {
      category: 'Features & Usage',
      questions: [
        {
          q: 'How does the points system work?',
          a: 'Teachers can award points to students for positive behaviors (WOW cards) or deduct points for behaviors that need improvement (NO-NO cards). You can customize the point values and behavior labels to match your classroom needs.'
        },
        {
          q: 'What is the Progress Meter?',
          a: 'The Progress Meter is a collaborative goal tracker that motivates your entire class. As students earn points, the meter fills up. When the class reaches milestones, you can celebrate together and reset for the next goal.'
        },
        {
          q: 'How does Lucky Draw work?',
          a: 'Lucky Draw is a gamification feature that randomly selects students for rewards. You can set how many students to select, and the system will randomly pick winners—keeping every lesson exciting and fair.'
        },
        {
          q: 'Can I create assignments in Klasiz.fun?',
          a: 'Yes! The Assignments Studio lets you create digital worksheets with multiple question types, assign them to specific students or the whole class, and grade submissions with instant feedback.'
        },
        {
          q: 'What is the Focus Timer?',
          a: 'The Focus Timer is a built-in timer for activities and tests. It provides visual cues so the whole class can see how much time remains, helping students stay focused and manage their time better.'
        }
      ]
    },
    {
      category: 'Parents & Students',
      questions: [
        {
          q: 'How do parents access their child\'s progress?',
          a: 'Parents can log in with a special parent code to view their child\'s progress, behavior history, and any messages from the teacher. This keeps families informed and engaged.'
        },
        {
          q: 'How do students join my class?',
          a: 'Students can join your class by entering a 5-digit access code that you provide. They can then see their own progress, points, and any assignments you\'ve created for them.'
        },
        {
          q: 'Can students see their points and progress?',
          a: 'Yes! Students have their own dashboard where they can see their current points, behavior history, and progress toward class goals. This transparency helps motivate them.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      questions: [
        {
          q: 'Is my student data safe?',
          a: 'Absolutely. Klasiz.fun uses industry-standard encryption (HTTPS) to protect all data in transit. Student data is owned and controlled by the teacher or school account that created the class. We never sell student data or use it for advertising.'
        },
        {
          q: 'Is Klasiz.fun COPPA compliant?',
          a: 'Yes, Klasiz.fun is designed with student privacy in mind and complies with COPPA (Children\'s Online Privacy Protection Act) and other relevant privacy regulations. See our Privacy Policy for more details.'
        },
        {
          q: 'Can I delete my class and all student data?',
          a: 'Yes. You can delete any class at any time, and all associated student data will be permanently removed. You have full control over your data.'
        },
        {
          q: 'What about GDPR compliance?',
          a: 'Klasiz.fun respects GDPR and other international privacy laws. Teachers and schools can request data exports or deletions at any time by contacting our support team.'
        }
      ]
    },
    {
      category: 'Technical & Support',
      questions: [
        {
          q: 'What devices can I use Klasiz.fun on?',
          a: 'Klasiz.fun works on any device with a web browser—computers, tablets, and smartphones. It\'s fully responsive and optimized for all screen sizes.'
        },
        {
          q: 'Do I need to install anything?',
          a: 'No! Klasiz.fun is a web-based platform. Just visit klasiz.fun, sign up, and start using it immediately. No downloads or installations required.'
        },
        {
          q: 'What if I forget my password?',
          a: 'No problem! On the login page, click "Forgot password?" and enter your email. We\'ll send you a link to reset your password.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team by emailing team@klasiz.fun. We\'re here to help with any questions or issues you encounter.'
        }
      ]
    }
  ];

  const currentDark = themeDark !== undefined ? themeDark : isDark;

  return (
    <div style={{
      minHeight: '100vh',
      background: currentDark ? '#09090b' : '#ffffff',
      color: currentDark ? '#f4f4f5' : '#1a1a1a'
    }}>
      {/* Header with Back Button */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: isMobile ? '16px' : '20px 32px',
        background: currentDark ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: currentDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <motion.button
          onClick={handleBackToHome}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '10px 16px',
            background: currentDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            border: currentDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            color: currentDark ? '#f4f4f5' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <ArrowLeft size={18} />
          {t('ui.back_to_home')}
        </motion.button>
      </div>

      {/* Hero Section */}
      <div style={{
        padding: isMobile ? '32px 16px' : '64px 32px',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '20px',
            marginBottom: '20px',
            margin: '0 auto 20px'
          }}>
            <HelpCircle size={isMobile ? 32 : 40} color="white" />
          </div>
          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: 900,
            margin: '0 0 12px',
            background: currentDark ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('faq.title')}
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: currentDark ? '#a1a1aa' : '#64748B',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {t('faq.header_desc')}
          </p>
        </motion.div>
      </div>

      {/* FAQ Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '32px 16px' : '64px 32px'
      }}>
        {faqs.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            style={{ marginBottom: '48px' }}
          >
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 800,
              marginBottom: '24px',
              color: currentDark ? '#f4f4f5' : '#1a1a1a',
              paddingBottom: '12px',
              borderBottom: currentDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)'
            }}>
              {category.category}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.questions.map((faq, qIndex) => (
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (qIndex * 0.05) }}
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === `${categoryIndex}-${qIndex}` ? null : `${categoryIndex}-${qIndex}`)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: currentDark ? '#18181b' : '#f8fafc',
                      border: currentDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = currentDark ? '#27272a' : '#f1f5f9';
                        e.currentTarget.style.borderColor = currentDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = currentDark ? '#18181b' : '#f8fafc';
                        e.currentTarget.style.borderColor = currentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                      }
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: 600,
                      color: currentDark ? '#f4f4f5' : '#1a1a1a',
                      flex: 1
                    }}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedIndex === `${categoryIndex}-${qIndex}` ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ flexShrink: 0 }}
                    >
                      <ChevronDown size={20} color={currentDark ? '#a1a1aa' : '#64748B'} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedIndex === `${categoryIndex}-${qIndex}` && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          overflow: 'hidden',
                          borderRadius: '0 0 12px 12px'
                        }}
                      >
                        <div style={{
                          padding: '16px 20px',
                          background: currentDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          borderLeft: '3px solid #3b82f6',
                          fontSize: isMobile ? '15px' : '16px',
                          color: currentDark ? '#a1a1aa' : '#64748B',
                          lineHeight: 1.7
                        }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <div style={{
        padding: isMobile ? '32px 16px' : '64px 32px',
        textAlign: 'center',
        background: currentDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderTop: currentDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        borderBottom: currentDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: 800,
            marginBottom: '12px',
            color: currentDark ? '#f4f4f5' : '#1a1a1a'
          }}>
            {t('faq.not_found')}
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: currentDark ? '#a1a1aa' : '#64748B',
            marginBottom: '24px',
            lineHeight: 1.6
          }}>
            {t('faq.support_desc')}
          </p>
          <motion.a
            href="mailto:team@klasiz.fun"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: isMobile ? '12px 24px' : '14px 32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '50px',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <Mail size={18} />
            {t('ui.contact_support')}
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
