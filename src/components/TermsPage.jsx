import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function TermsPage({ onClose }) {
    const { t } = useTranslation();

    return (
        <div className="safe-area-top" style={{
            position: 'fixed',
            inset: 0,
            background: '#fff',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        padding: '10px 16px',
                        border: '1px solid #e0e0e0',
                        background: '#fff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 10000
                    }}
                >
                    <X size={18} />
                    {t('terms.close')}
                </button>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    marginBottom: '10px',
                    color: '#1a1a1a'
                }}>
                    {t('terms.title')}
                </h1>
                <p style={{
                    color: '#888',
                    marginBottom: '40px'
                }}>
                    {t('terms.last_updated')} {new Date().toLocaleDateString()}
                </p>

                {/* Human-readable summary for SEO / quick scan */}
                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '12px',
                        color: '#1a1a1a'
                    }}>
                        What you agree to when you use Klasiz.fun
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '12px'
                    }}>
                        Klasiz.fun is a classroom management tool for teachers, schools, students, and families. By creating an account or joining a class, you agree to use the service for educational purposes, to keep your login details safe, and to follow school and local privacy rules when you add student information.
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li>Klasiz.fun provides software only; teachers and schools remain responsible for how they use it with their students.</li>
                        <li>You must have permission to upload any student names, photos, or class data that you add to the platform.</li>
                        <li>You agree not to misuse the service (for example, by trying to break security, spam other users, or share offensive content).</li>
                        <li>We may update these terms as we add features or respond to new regulations, and we will note the last updated date at the top of this page.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section1_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.acceptance', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section2_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.description', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section3_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.user_accounts') }}>
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.responsibility1') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.responsibility2') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.responsibility3') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.responsibility4') }}></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section4_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.acceptable_use', { app: 'Klasiz.fun' }) }}>
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.prohibited1') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.prohibited2') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.prohibited3') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.prohibited4') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('terms.prohibited5') }}></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section5_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.intellectual', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section6_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.user_content') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section7_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.privacy', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section8_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.disclaimers', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section9_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.liability', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section10_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.termination') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section11_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.governing', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section12_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.changes') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('terms.section13_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.contact') }}>
                    </p>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('terms.email') + '<br />' + t('terms.website') }}>
                    </p>
                </section>
            </div>
        </div>
    );
}
