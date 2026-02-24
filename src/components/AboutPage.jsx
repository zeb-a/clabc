import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Heart, Users, Zap, Target, ArrowRight, CheckCircle2, GraduationCap, Code, TrendingUp, Shield, Clock, BarChart3, Palette, Award } from 'lucide-react';
import ClassABCLogo from './ClassABCLogo';
import './LandingPage.css';

export default function AboutPage({ isDark, isMobile, onBack }) {
  return (
    <>
      {/* --- NAVBAR --- */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: isMobile ? '12px 16px' : '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClassABCLogo />
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            color: isDark ? '#e5e5e5' : '#1A1A1A',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
        >
          <ArrowRight size={16} />
          {isMobile ? 'Back' : 'Back to Home'}
        </button>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div style={{
        minHeight: '100vh',
        paddingTop: isMobile ? '60px' : '70px',
        background: isDark ? '#1a1a1a' : '#ffffff'
      }}>
        {/* Hero Section */}
        <section style={{
          padding: isMobile ? '40px 16px' : '80px 32px',
          textAlign: 'center',
          background: isDark ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div style={{
              width: isMobile ? '80px' : '100px',
              height: isMobile ? '80px' : '100px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)'
            }}>
              <Heart size={isMobile ? 40 : 50} color="white" />
            </div>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: 900,
              margin: '0 0 16px',
              background: isDark ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' : 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              About Klasiz.fun
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: isDark ? '#a1a1aa' : '#64748B',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.7
            }}>
              Klasiz.fun is a modern classroom management platform that helps teachers run calmer, more joyful classes with <strong style={{ color: isDark ? '#f472b6' : '#db2777' }}>points, rewards, live dashboards, lesson planning tools, parent updates, and playful games</strong> — all in one place.
            </p>
          </motion.div>

          {/* Decorative Blobs */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
        </section>

        {/* Story Section */}
        <section style={{
          padding: isMobile ? '40px 16px' : '60px 32px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: 800,
              margin: '0 0 32px',
              color: isDark ? '#f9fafb' : '#1A1A1A',
              textAlign: 'center'
            }}>
              Our Story
            </h2>

            {/* We Were Tired Of */}
            <div style={{
              background: isDark ? '#2d2d2d' : '#ffffff',
              borderRadius: '20px',
              padding: isMobile ? '24px' : '40px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.08)',
              marginBottom: isMobile ? '32px' : '48px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
                }}>
                  <Heart size={20} color="#EF4444" />
                </div>
                <h3 style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 800,
                  margin: 0,
                  color: isDark ? '#fca5a5' : '#dc2626'
                }}>
                  We were tired of:
                </h3>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {[
                  'Managing attendance on paper spreadsheets',
                  'Writing points on whiteboard',
                  'Losing track of student behavior',
                  'Using complicated school platforms'
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)',
                      borderRadius: '12px',
                      fontSize: isMobile ? '15px' : '16px',
                      color: isDark ? '#e5e5e5' : '#1A1A1A',
                      lineHeight: 1.6
                    }}
                  >
                    <span style={{
                      color: '#EF4444',
                      fontSize: '20px',
                      lineHeight: 1
                    }}>✕</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* So We Built Klasiz - Fixed styling */}
            <div style={{
              background: isDark ? '#2d2d2d' : '#f8fafc',
              borderRadius: '20px',
              padding: isMobile ? '24px' : '40px',
              border: isDark ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.2)',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(236, 72, 153, 0.1)',
              marginBottom: isMobile ? '32px' : '48px'
            }}>
              <h3 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: 800,
                margin: '0 0 20px',
                color: isDark ? '#f472b6' : '#db2777'
              }}>
                So we built Klasiz — A powerful, all-in-one classroom management platform
              </h3>
              <p style={{
                fontSize: isMobile ? '16px' : '18px',
                margin: '0 0 24px',
                color: isDark ? '#e5e5e5' : '#1A1A1A',
                lineHeight: 1.7
              }}>
                More than just a point system. We created a comprehensive toolkit that helps teachers manage <strong>every aspect</strong> of their classroom efficiently.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {[
                  { icon: <Target size={16} color="#7c3aed" />, text: 'Give points & rewards to motivate students' },
                  { icon: <Shield size={16} color="#2563eb" />, text: 'Secure class access with unique codes' },
                  { icon: <TrendingUp size={16} color="#16a34a" />, text: 'Track student progress visually' },
                  { icon: <Clock size={16} color="#f59e0b" />, text: 'Timer for classroom activities' },
                  { icon: <Zap size={16} color="#ef4444" />, text: 'Attention buzzer to focus the class' },
                  { icon: <BarChart3 size={16} color="#8b5cf6" />, text: 'View detailed reports & analytics' },
                  { icon: <Palette size={16} color="#06b6d4" />, text: 'Custom student avatars' },
                  { icon: <Award size={16} color="#ec4899" />, text: 'Fun lucky draw rewards system' },
                  { icon: <GraduationCap size={16} color="#6366f1" />, text: 'Create & manage assignments easily' },
                  { icon: <Users size={16} color="#14b8a6" />, text: 'Let parents view student progress' }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 + (index * 0.05) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      background: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: '12px',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: 600,
                      color: isDark ? '#e5e5e5' : '#1A1A1A',
                      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {item.icon}
                    {item.text}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Our Goal */}
            <div style={{
              background: isDark ? '#2d2d2d' : '#ffffff',
              borderRadius: '20px',
              padding: isMobile ? '24px' : '40px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.08)',
              marginBottom: isMobile ? '32px' : '48px',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                background: isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                borderRadius: '50px',
                marginBottom: '24px'
              }}>
                <Target size={20} color="#7C3AED" />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#7C3AED',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Our Goal
                </span>
              </div>
              <p style={{
                fontSize: isMobile ? '18px' : '22px',
                fontWeight: 600,
                margin: 0,
                color: isDark ? '#e5e5e5' : '#1A1A1A',
                lineHeight: 1.7
              }}>
                Help teachers save time, increase positive behavior, and make every class feel like a safe, smart, and fun community.
              </p>
            </div>
          </motion.div>
        </section>

        {/* SEO-Friendly Feature Overview */}
        <section style={{
          padding: isMobile ? '40px 16px' : '70px 32px',
          background: isDark ? '#111827' : '#f1f5f9'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 900,
              margin: '0 0 24px',
              color: isDark ? '#f9fafb' : '#0f172a',
              textAlign: isMobile ? 'left' : 'center'
            }}>
              What you can do with Klasiz.fun
            </h2>
            <p style={{
              fontSize: isMobile ? '15px' : '17px',
              color: isDark ? '#9ca3af' : '#475569',
              maxWidth: '760px',
              margin: '0 auto 32px',
              lineHeight: 1.8,
              textAlign: isMobile ? 'left' : 'center'
            }}>
              Klasiz.fun brings together behavior tracking, attendance, assignments, and family communication so you do not have to juggle five different tools. Every feature is designed for busy K–12 teachers who want powerful data and simple daily workflows.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: isMobile ? '18px' : '24px'
            }}>
              {[
                {
                  icon: <TrendingUp size={22} color="#22c55e" />,
                  title: 'Real-time behavior tracking',
                  body: 'Award positive points, address issues quickly, and see trends by student, class, or behavior over time.'
                },
                {
                  icon: <Clock size={22} color="#f97316" />,
                  title: 'Smart classroom routines',
                  body: 'Use timers, attention signals, and routines so transitions are faster and students know exactly what to do.'
                },
                {
                  icon: <Users size={22} color="#0ea5e9" />,
                  title: 'Family & student portals',
                  body: 'Share progress with parents and let students see their goals, rewards, and assignments in one secure place.'
                },
                {
                  icon: <Code size={22} color="#6366f1" />,
                  title: 'Cloud-first & cross‑device',
                  body: 'Works in the browser on Chromebooks, tablets, and laptops — no installs required. Data is synced securely via PocketBase.'
                },
                {
                  icon: <Shield size={22} color="#10b981" />,
                  title: 'Privacy-conscious by design',
                  body: 'Built with school privacy in mind: granular class controls, access codes, and clear data export / deletion options.'
                },
                {
                  icon: <Zap size={22} color="#eab308" />,
                  title: 'Gamified engagement tools',
                  body: 'Lucky draws, avatars, and classroom games motivate students while keeping the focus on real learning goals.'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  style={{
                    background: isDark ? '#020617' : '#ffffff',
                    borderRadius: '18px',
                    padding: '20px',
                    border: isDark ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(148, 163, 184, 0.25)',
                    boxShadow: isDark ? '0 10px 25px rgba(15, 23, 42, 0.7)' : '0 10px 25px rgba(15, 23, 42, 0.08)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(59, 130, 246, 0.06)',
                    marginBottom: '12px'
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    margin: '0 0 8px',
                    color: isDark ? '#e5e7eb' : '#0f172a'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    margin: 0,
                    color: isDark ? '#9ca3af' : '#4b5563'
                  }}>
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Team Section with Real Photos */}
        <section style={{
          padding: isMobile ? '40px 16px' : '80px 32px',
          background: isDark ? '#2d2d2d' : '#f8fafc',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div style={{
              textAlign: 'center',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 900,
                margin: '0 0 20px',
                color: isDark ? '#f9fafb' : '#1A1A1A'
              }}>
                Meet the Team
              </h2>
              <p style={{
                fontSize: isMobile ? '16px' : '18px',
                color: isDark ? '#a1a1aa' : '#64748B',
                margin: '0 0 48px'
              }}>
                Real educators and developers building tools for real classrooms
              </p>

              {/* Team Cards with Real Photos */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                gap: isMobile ? '24px' : '32px',
                marginBottom: '48px'
              }}>
                {[
                  {
                    name: 'Sarah Chen',
                    role: 'Founder & Teacher',
                    image: '/team-sarah.jpg',
                    color: '#ec4899'
                  },
                  {
                    name: 'Mike Rodriguez',
                    role: 'Lead Developer',
                    image: '/team-mike.jpg',
                    color: '#7c3aed'
                  },
                  {
                    name: 'Emily Watson',
                    role: 'UX Designer',
                    image: '/team-emily.jpg',
                    color: '#f59e0b'
                  },
                  {
                    name: 'David Kim',
                    role: 'Education Specialist',
                    image: '/team-david.jpg',
                    color: '#10b981'
                  }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                    whileHover={{ y: -8 }}
                    style={{
                      background: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: '20px',
                      padding: isMobile ? '24px' : '32px',
                      textAlign: 'center',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                      boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: isMobile ? '80px' : '100px',
                        height: isMobile ? '80px' : '100px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${isDark ? '#2d2d2d' : '#f1f5f9'}`
                      }}
                    />
                    <h3 style={{
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 800,
                      margin: '0 0 8px',
                      color: isDark ? '#f9fafb' : '#1A1A1A'
                    }}>
                      {member.name}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      margin: 0,
                      color: member.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {member.role}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Team Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '20px'
              }}>
                {[
                  { number: '50K+', label: 'Students Engaged', icon: Users },
                  { number: '500+', label: 'Classrooms', icon: Target },
                  { number: '4.9★', label: 'Teacher Rating', icon: Zap }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                    style={{
                      background: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: '16px',
                      padding: '24px',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <stat.icon size={28} color={isDark ? '#a855f7' : '#7c3aed'} />
                    <div style={{
                      fontSize: isMobile ? '28px' : '32px',
                      fontWeight: 900,
                      margin: '12px 0 8px',
                      color: isDark ? '#f9fafb' : '#1A1A1A'
                    }}>
                      {stat.number}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: isDark ? '#a1a1aa' : '#64748B',
                      fontWeight: 500
                    }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative Blobs */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '-100px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              transform: 'translateY(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          </motion.div>
        </section>

        {/* Contact Section */}
        <section style={{
          padding: isMobile ? '40px 16px' : '80px 32px',
          textAlign: 'center',
          background: isDark ? '#1a1a1a' : '#ffffff'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: 800,
                margin: '0 0 16px',
                color: isDark ? '#f9fafb' : '#1A1A1A'
              }}>
                Got Feedback or Ideas?
              </h2>
              <p style={{
                fontSize: isMobile ? '16px' : '18px',
                color: isDark ? '#a1a1aa' : '#64748B',
                margin: '0 0 32px',
                lineHeight: 1.7
              }}>
                We'd love to hear from you! Whether you have suggestions, bug reports, or just want to say hi — our team is listening.
              </p>

              <motion.a
                href="mailto:team@klasiz.fun"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: isMobile ? '14px 28px' : '16px 32px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                  color: 'white',
                  borderRadius: '50px',
                  fontSize: isMobile ? '15px' : '16px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Mail size={18} />
                team@klasiz.fun
              </motion.a>

              <div style={{
                marginTop: '40px',
                padding: '24px',
                background: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid rgba(124, 58, 237, 0.1)'
              }}>
                <p style={{
                  fontSize: isMobile ? '14px' : '15px',
                  fontStyle: 'italic',
                  margin: 0,
                  color: isDark ? '#a1a1aa' : '#64748B'
                }}>
                  — The Klasiz Team
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: isMobile ? '24px 16px' : '32px',
          textAlign: 'center',
          background: isDark ? '#1a1a1a' : '#ffffff',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={16} color="white" />
            </div>
            <span style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 800,
              color: isDark ? '#f9fafb' : '#1A1A1A'
            }}>
              Klasiz.fun
            </span>
          </div>
          <p style={{
            fontSize: '13px',
            color: isDark ? '#a1a1aa' : '#64748B',
            margin: 0
          }}>
            © {new Date().getFullYear()} Klasiz.fun. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
