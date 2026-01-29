import React from 'react';
import { Bell, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

const AssignmentSubmissionNotification = ({ submissions, onNotificationClick }) => {
  // Derive notifications and unreadCount from submissions prop
  const newSubmissions = Array.isArray(submissions)
    ? submissions.filter(sub => sub.status === 'submitted')
    : [];

  // Group notifications by assignment
  const groupedNotifications = newSubmissions.reduce((acc, submission) => {
    const assignmentTitle = submission.assignmentTitle || 'Unknown Assignment';
    if (!acc[assignmentTitle]) {
      acc[assignmentTitle] = {
        title: assignmentTitle,
        count: 0,
        submissions: [],
        latest: submission.submittedAt
      };
    }
    acc[assignmentTitle].count += 1;
    acc[assignmentTitle].submissions.push(submission);
    // Update latest timestamp if this submission is newer
    if (
      !acc[assignmentTitle].latest ||
      new Date(submission.submittedAt) > new Date(acc[assignmentTitle].latest)
    ) {
      acc[assignmentTitle].latest = submission.submittedAt;
    }
    return acc;
  }, {});

  const notifications = Object.values(groupedNotifications).map(notification => ({
    id: notification.title,
    title: `${notification.count} new submission${notification.count > 1 ? 's' : ''}`,
    subtitle: `for ${notification.title}`,
    timestamp: notification.latest,
    type: 'submission',
    unread: true,
    submissionCount: notification.count
  }));

  const unreadCount = newSubmissions.length;

  const handleNotificationClick = (notification) => {
    onNotificationClick(notification);
    // In a real app, you would mark as read in backend or parent state
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Bell size={24} style={{ cursor: 'pointer' }} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '350px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
            New Submissions
          </div>
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                padding: '12px 15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: notification.unread ? '#F0F9FF' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertTriangle size={18} color="#F59E0B" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{notification.title}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{notification.subtitle}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {notification.unread && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#3B82F6'
                }}></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionNotification;