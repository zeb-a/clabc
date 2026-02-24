import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function TestimonialsSection({ isMobile = false }) {
  const { isDark } = useTheme();

  const testimonials = [
    {
      name: 'Sarah Chen',
      title: 'Grade 4 Teacher',
      school: 'Lincoln Elementary',
      image: '👩‍🏫',
      quote: 'Klasiz.fun has transformed how I manage my classroom. My students are more engaged, and parents love getting updates. It\'s a game-changer!',
      rating: 5
    },
    {
      name: 'James Rodriguez',
      title: 'Middle School Teacher',
      school: 'Jefferson Middle School',
      image: '👨‍🏫',
      quote: 'The points system and Lucky Draw keep my students motivated all year long. I\'ve never seen them this excited about good behavior!',
      rating: 5
    },
    {
      name: 'Emily Watson',
      title: 'Special Education Teacher',
      school: 'Riverside Academy',
      image: '👩‍🏫',
      quote: 'As a special ed teacher, I love how customizable Klasiz.fun is. I can track individual goals and celebrate every small win with my students.',
      rating: 5
    },
    {
      name: 'Michael Park',
      title: 'High School Teacher',
      school: 'Central High School',
      image: '👨‍🏫',
      quote: 'The assignments feature saves me hours every week. Creating and grading digital worksheets is so much faster, and students get instant feedback.',
      rating: 5
    }
  ];

  return (
    <section style={{
      padding: isMobile ? '48px 16px' : '80px 32px',
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? '40px' : '60px'
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 900,
            margin: '0 0 16px',
            color: isDark ? '#f4f4f5' : '#1a1a1a'
          }}>
            Loved by Teachers Worldwide
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: isDark ? '#a1a1aa' : '#64748B',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            See what educators are saying about Klasiz.fun and how it's transforming their classrooms.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? '20px' : '28px'
        }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: isMobile ? 0 : -8 }}
              style={{
                background: isDark ? '#18181b' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                borderRadius: '20px',
                padding: isMobile ? '24px' : '32px',
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Rating */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '16px'
              }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill="#fbbf24"
                    color="#fbbf24"
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{
                fontSize: isMobile ? '15px' : '16px',
                color: isDark ? '#a1a1aa' : '#64748B',
                lineHeight: 1.7,
                margin: '0 0 24px',
                fontStyle: 'italic',
                borderLeft: '3px solid #3b82f6',
                paddingLeft: '16px'
              }}>
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {testimonial.image}
                </div>
                <div>
                  <div style={{
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: 700,
                    color: isDark ? '#f4f4f5' : '#1a1a1a',
                    margin: 0
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: isDark ? '#a1a1aa' : '#64748B',
                    margin: '4px 0 0'
                  }}>
                    {testimonial.title} • {testimonial.school}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            marginTop: isMobile ? '48px' : '64px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '16px' : '24px'
          }}
        >
          {[
            { number: '50K+', label: 'Students Engaged' },
            { number: '500+', label: 'Active Classrooms' },
            { number: '4.9★', label: 'Average Rating' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: isMobile ? '20px' : '24px',
                background: isDark ? '#27272a' : '#f8fafc',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <div style={{
                fontSize: isMobile ? '28px' : '32px',
                fontWeight: 900,
                color: '#3b82f6',
                margin: '0 0 8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: isMobile ? '14px' : '15px',
                color: isDark ? '#a1a1aa' : '#64748B',
                fontWeight: 500
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
