import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function PrivacyPolicyPage({ onClose }) {
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
                    {t('privacy.close')}
                </button>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    marginBottom: '10px',
                    color: '#1a1a1a'
                }}>
                    {t('privacy.title')}
                </h1>
                <p style={{
                    color: '#888',
                    marginBottom: '40px'
                }}>
                    {t('privacy.last_updated')} {new Date().toLocaleDateString()}
                </p>

                {/* Human-readable summary for SEO / quick scan */}
                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '12px',
                        color: '#1a1a1a'
                    }}>
                        How Klasiz.fun handles your classroom data
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '12px'
                    }}>
                        Klasiz.fun is a classroom management platform used by teachers, schools, and families. We store class lists, behavior points, assignments, and limited contact information so that teachers can run their classes and keep families informed, but we do not sell this data or use it to build advertising profiles.
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li>We collect only the information needed to provide classroom features like rosters, behavior tracking, parent access, and analytics.</li>
                        <li>Student data is owned and controlled by the teacher or school account that created the class.</li>
                        <li>Teachers can export or delete their classes on request, and families can contact us to ask about access or deletion.</li>
                        <li>All traffic between your browser and our servers is encrypted using HTTPS.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section1_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.intro', { app: 'Klasiz.fun' }) }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section2_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.intro2') }}>
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.account_info') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.class_data') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.student_records') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.usage_data') }}></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section3_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.how_we_use') }}>
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.purpose1') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.purpose2') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.purpose3') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.purpose4') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.purpose5') }}></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section3_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.security') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section4_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.your_rights') }}>
                    </p>
                    <ul style={{
                        paddingLeft: '20px',
                        lineHeight: '1.7',
                        color: '#555'
                    }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.right_access') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.right_correction') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.right_deletion') }}></li>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('privacy.right_portability') }}></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section5_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.third_party') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section6_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.children') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section7_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.changes') }}>
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '15px',
                        color: '#1a1a1a'
                    }}>
                        {t('privacy.section8_title')}
                    </h2>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '10px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.contact') }}>
                    </p>
                    <p style={{
                        lineHeight: '1.7',
                        color: '#555',
                        marginBottom: '15px'
                    }} dangerouslySetInnerHTML={{ __html: t('privacy.email') + '<br />' + t('privacy.website') }}>
                    </p>
                </section>
            </div>
        </div>
    );
}
