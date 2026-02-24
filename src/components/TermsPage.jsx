import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Shield, FileText, UserCheck, AlertTriangle, Globe, Mail } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useTheme } from '../ThemeContext';

export default function TermsPage({ onClose }) {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    const sections = [
        {
            icon: <Shield size={24} />,
            title: 'What you agree to',
            summary: 'Use Klasiz.fun for educational purposes, keep your login details safe, and follow school and local privacy rules.',
            color: '#10B981'
        },
        {
            icon: <FileText size={24} />,
            title: 'Acceptance of Terms',
            summary: 'By accessing or using Klasiz.fun, you agree to be bound by these Terms of Service.',
            color: '#3B82F6'
        },
        {
            icon: <UserCheck size={24} />,
            title: 'User Accounts',
            summary: 'You are responsible for maintaining the confidentiality of your account and password.',
            color: '#8B5CF6'
        },
        {
            icon: <AlertTriangle size={24} />,
            title: 'Acceptable Use',
            summary: 'You agree not to misuse the service or attempt to gain unauthorized access.',
            color: '#F59E0B'
        },
        {
            icon: <Globe size={24} />,
            title: 'Intellectual Property',
            summary: 'All content, trademarks, and data are owned by Klasiz.fun or its licensors.',
            color: '#EC4899'
        }
    ];

    return (
        <div className="safe-area-top" style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? '#09090b' : '#fff',
            color: isDark ? '#f4f4f5' : '#1a1a1a',
            zIndex: 9999,
            overflowY: 'auto'
        }}>
            {/* Floating Navigation Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10000
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: 800,
                    fontSize: '18px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    <Shield size={24} color="#10B981" />
                    Terms
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: isDark ? '#f4f4f5' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        fontSize: '14px'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <X size={16} />
                    {t('terms.close')}
                </button>
            </motion.div>

            {/* Main Content */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '100px 24px 60px'
            }}>
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                    }}>
                        <Shield size={40} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 42px)',
                        fontWeight: 900,
                        marginBottom: '16px',
                        background: isDark ? 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {t('terms.title')}
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: isDark ? '#a1a1aa' : '#64748B',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        {t('terms.last_updated')} {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>

                {/* Quick Overview Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '60px'
                    }}
                >
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + (index * 0.08) }}
                            whileHover={{ y: -4 }}
                            style={{
                                padding: '20px',
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    background: `${section.color}20`,
                                    borderRadius: '12px'
                                }}>
                                    {React.cloneElement(section.icon, { color: section.color })}
                                </div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: isDark ? '#f4f4f5' : '#1a1a1a'
                                }}>
                                    {section.title}
                                </h3>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '14px',
                                color: isDark ? '#a1a1aa' : '#64748B',
                                lineHeight: 1.6
                            }}>
                                {section.summary}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Detailed Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '40px'
                    }}
                >
                    {[
                        { id: 1, title: t('terms.section1_title'), content: t('terms.acceptance', { app: 'Klasiz.fun' }) },
                        { id: 2, title: t('terms.section2_title'), content: t('terms.description', { app: 'Klasiz.fun' }) },
                        { id: 3, title: t('terms.section3_title'), content: t('terms.user_accounts') },
                        { id: 4, title: t('terms.section4_title'), content: t('terms.acceptable_use', { app: 'Klasiz.fun' }) },
                        { id: 5, title: t('terms.section5_title'), content: t('terms.intellectual', { app: 'Klasiz.fun' }) },
                        { id: 6, title: t('terms.section6_title'), content: t('terms.user_content') },
                        { id: 7, title: t('terms.section7_title'), content: t('terms.privacy', { app: 'Klasiz.fun' }) },
                        { id: 8, title: t('terms.section8_title'), content: t('terms.disclaimers', { app: 'Klasiz.fun' }) },
                        { id: 9, title: t('terms.section9_title'), content: t('terms.liability', { app: 'Klasiz.fun' }) },
                        { id: 10, title: t('terms.section10_title'), content: t('terms.termination') },
                        { id: 11, title: t('terms.section11_title'), content: t('terms.governing', { app: 'Klasiz.fun' }) },
                        { id: 12, title: t('terms.section12_title'), content: t('terms.changes') },
                        { id: 13, title: t('terms.section13_title'), content: t('terms.contact') }
                    ].map((item, index) => (
                        <motion.section
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 + (index * 0.05) }}
                            style={{
                                padding: '28px',
                                background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
                                borderRadius: '20px',
                                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                marginBottom: '16px',
                                color: isDark ? '#f4f4f5' : '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#fff'
                                }}>
                                    {item.id}
                                </span>
                                {item.title}
                            </h2>
                            <div
                                style={{
                                    lineHeight: '1.8',
                                    color: isDark ? '#a1a1aa' : '#64748B',
                                    fontSize: '15px'
                                }}
                                dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                        </motion.section>
                    ))}
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    style={{
                        marginTop: '80px',
                        padding: '40px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        borderRadius: '24px',
                        textAlign: 'center',
                        color: '#fff',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <Mail size={40} style={{ marginBottom: '20px', opacity: 0.9 }} />
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        margin: '0 0 12px'
                    }}>
                        Questions? Contact Us
                    </h3>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px',
                        lineHeight: 1.6
                    }} dangerouslySetInnerHTML={{ __html: t('terms.email') + '<br />' + t('terms.website') }}>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
