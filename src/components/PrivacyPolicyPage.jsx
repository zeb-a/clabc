import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Lock, Eye, Database, CheckCircle, Globe, Mail } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useTheme } from '../ThemeContext';

export default function PrivacyPolicyPage({ onClose }) {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    const sections = [
        {
            icon: <Shield size={24} />,
            title: 'Data Collection',
            summary: 'We collect only information needed to provide classroom features.',
            color: '#3B82F6'
        },
        {
            icon: <Lock size={24} />,
            title: 'Data Security',
            summary: 'All traffic is encrypted using HTTPS to protect your data.',
            color: '#10B981'
        },
        {
            icon: <Eye size={24} />,
            title: 'Your Rights',
            summary: 'You can access, correct, or delete your personal data anytime.',
            color: '#8B5CF6'
        },
        {
            icon: <Database size={24} />,
            title: 'Data Ownership',
            summary: 'Student data is owned and controlled by the teacher or school.',
            color: '#F59E0B'
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
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    <Shield size={24} color="#3B82F6" />
                    Privacy Policy
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
                    {t('privacy.close')}
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
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                    }}>
                        <Shield size={40} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 42px)',
                        fontWeight: 900,
                        marginBottom: '16px',
                        background: isDark ? 'linear-gradient(135deg, #fff 0%, #60a5fa 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {t('privacy.title')}
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: isDark ? '#a1a1aa' : '#64748B',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        {t('privacy.last_updated')} {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                        gap: '32px'
                    }}
                >
                    {[
                        { id: 1, title: t('privacy.section1_title'), content: t('privacy.intro', { app: 'Klasiz.fun' }) },
                        { id: 2, title: t('privacy.section2_title'), content: t('privacy.intro2') },
                        { id: 3, title: t('privacy.section3_title'), content: t('privacy.how_we_use') },
                        { id: 4, title: t('privacy.section4_title'), content: t('privacy.your_rights') },
                        { id: 5, title: t('privacy.section5_title'), content: t('privacy.third_party') },
                        { id: 6, title: t('privacy.section6_title'), content: t('privacy.children') },
                        { id: 7, title: t('privacy.section7_title'), content: t('privacy.changes') },
                        { id: 8, title: t('privacy.section8_title'), content: t('privacy.contact') }
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#fff'
                                }}>
                                    {item.id}
                                </div>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    color: isDark ? '#f4f4f5' : '#1a1a1a'
                                }}>
                                    {item.title}
                                </h2>
                            </div>
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

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                        marginTop: '60px',
                        padding: '32px',
                        background: 'linear-gradient(135deg, #DCFE7F 0%, #DCFCE7 100%)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        border: '2px solid #10B981',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <CheckCircle size={48} color="#10B981" />
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#065F46', maxWidth: '500px', lineHeight: 1.5 }}>
                        Your privacy is our priority. We never sell your data.
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    style={{
                        marginTop: '40px',
                        padding: '40px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        borderRadius: '24px',
                        textAlign: 'center',
                        color: '#fff',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <Mail size={40} style={{ marginBottom: '20px', opacity: 0.9 }} />
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        margin: '0 0 12px'
                    }}>
                        Privacy Questions?
                    </h3>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px',
                        lineHeight: 1.6
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.email') + '<br />' + t('privacy.website') }}>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
