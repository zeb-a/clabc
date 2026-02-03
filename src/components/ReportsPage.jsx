import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleWysiwyg from 'react-simple-wysiwyg';
import { Bar, Doughnut } from 'react-chartjs-2';
import { X, Download, Printer } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { boringAvatar } from '../utils/avatar'; // Ensure this path is correct
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
import InlineHelpButton from './InlineHelpButton';

/* ================= 🌐 LANGUAGE SELECTION ================= */
const translations = {
    en: {
        mainTitle: (isParentView, className) => isParentView ? 'Student Progress Report' : `${className} Reports`,
        week: 'Week',
        month: 'Month',
        year: 'Year',
        emptyState: 'No records found for this selection.',
        aiSummary: 'Teacher Feedback:',
        positive: 'Positive',
        needsWork: 'Needs Work',
        behaviorDistribution: 'Behavior Distribution',
        ratio: 'Ratio',
        totalPoints: 'Total Points'
    },
    zh: {
        mainTitle: (isParentView, className) => isParentView ? '学生成长报告' : `${className} 报告`,
        week: '周',
        month: '月',
        year: '年',
        emptyState: '未找到此选择的记录。',
        aiSummary: '教师反馈：',
        positive: '积极表现',
        needsWork: '需要改进',
        behaviorDistribution: '行为分布',
        ratio: '比例',
        totalPoints: '总分'
    }
};

/* ================= 🧠 ADVANCED TEACHER-LIKE TEXT GENERATION ================= */
// Check if student has participated (has points)
function hasParticipated(behavior) {
    return behavior.positive.total > 0 || behavior.negative.total < 0;
}

// Analyze behavior patterns in depth
function analyzeBehaviorPattern(behavior) {
    const analysis = {
        positiveDominant: behavior.positive.total > Math.abs(behavior.negative.total),
        balanced: Math.abs(behavior.positive.total - Math.abs(behavior.negative.total)) <= 5,
        concerning: behavior.negative.total < 0 && Math.abs(behavior.negative.total) > behavior.positive.total,
        highlyActive: behavior.positive.total + Math.abs(behavior.negative.total) > 20,
        consistent: behavior.positive.total > 10 && behavior.negative.total === 0,
        improving: behavior.positive.total > 0 && behavior.negative.total === 0 && behavior.positive.total < 10
    };

    return analysis;
}

// Generate descriptive feedback based on behavior categories
function describeBehaviors(behavior, count = 2, language = 'en') {
    const allBehaviors = [];

    // Add positive behaviors
    Object.entries(behavior.positive.byCard || {}).forEach(([card, points]) => {
        if (points > 0) {
            allBehaviors.push({ type: 'positive', card, points });
        }
    });

    // Add negative behaviors
    Object.entries(behavior.negative.byCard || {}).forEach(([card, points]) => {
        if (points > 0) {
            allBehaviors.push({ type: 'negative', card, points });
        }
    });

    // Sort by points (descending)
    allBehaviors.sort((a, b) => b.points - a.points);

    // Return top behaviors with context
    return allBehaviors.slice(0, count).map(item => {
        if (item.type === 'positive') {
            if (language === 'zh') {
                const chinesePositives = {
                    "Great work": "表现出色",
                    "Homework": "作业完成得好",
                    "Helping others": "乐于助人",
                    "Participation": "积极参与",
                    "Kindness": "善良友善"
                };

                const behaviorZh = chinesePositives[item.card] || item.card;
                if (item.points >= 10) return `${behaviorZh}（表现优异，获得${item.points}分）`;
                else if (item.points >= 5) return `${behaviorZh}（表现突出，获得${item.points}分）`;
                else return `${behaviorZh}（积极贡献，获得${item.points}分）`;
            } else {
                if (item.points >= 10) return `${item.card} (excellent performance with ${item.points} points)`;
                else if (item.points >= 5) return `${item.card} (strong showing with ${item.points} points)`;
                else return `${item.card} (positive contribution with ${item.points} points)`;
            }
        } else {
            if (language === 'zh') {
                const chineseNegatives = {
                    "Off-task": "注意力不集中",
                    "Disrespectful": "不尊重他人",
                    "Late": "迟到",
                    "Incomplete work": "作业未完成",
                    "Disruptive": "扰乱秩序"
                };

                const behaviorZh = chineseNegatives[item.card] || item.card;
                if (item.points >= 10) return `${behaviorZh}（需要关注，扣${item.points}分）`;
                else if (item.points >= 5) return `${behaviorZh}（存在问题，扣${item.points}分）`;
                else return `${behaviorZh}（小问题，扣${item.points}分）`;
            } else {
                if (item.points >= 10) return `${item.card} (needs attention, ${item.points} points deducted)`;
                else if (item.points >= 5) return `${item.card} (some issues, ${item.points} points deducted)`;
                else return `${item.card} (minor issues, ${item.points} points deducted)`;
            }
        }
    }).join(', ');
}

function generateTeacherNote(student, behavior, period, language = 'en') {
    if (!hasParticipated(behavior)) {
        if (language === 'zh') {
            return `${student.name} 尚未参与任何活动或获得分数。请鼓励孩子积极参与课堂活动，以便更好地了解其发展情况。`;
        }
        return `${student.name} has not yet participated in any activities or earned any points. Please encourage your child to engage in class activities so we can better assess their progress.`;
    }

    const pattern = analyzeBehaviorPattern(behavior);
    const behaviorDescription = describeBehaviors(behavior, 3, language);
    const timeFrame = period === 'week' ? 'this past week' : (period === 'month' ? 'the last month' : 'this year');
    const timeFrameZh = period === 'week' ? '本周' : (period === 'month' ? '本月' : '本年度');

    let feedback;

    if (pattern.consistent) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现非常出色！在${behaviorDescription}等方面展现了卓越的能力。继续保持这种积极的学习态度！`;
        } else {
            feedback = `${student.name} has shown exceptional performance ${timeFrame}! They excelled in ${behaviorDescription}. Keep up this excellent work!`;
        }
    } else if (pattern.improving) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现积极，特别是在${behaviorDescription}方面。继续保持这种良好的势头！`;
        } else {
            feedback = `${student.name} showed positive engagement ${timeFrame}, particularly in ${behaviorDescription}. Keep building on this momentum!`;
        }
    } else if (pattern.positiveDominant) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}整体表现良好，在${behaviorDescription}等方面做得不错。继续加强这些优势，同时注意改善不足之处。`;
        } else {
            feedback = `${student.name} showed good overall performance ${timeFrame} with strengths in ${behaviorDescription}. Continue building these strengths while working on areas needing improvement.`;
        }
    } else if (pattern.balanced) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}表现较为均衡，在${behaviorDescription}等方面有亮点，但也有需要改进的地方。我们将继续引导学生平衡发展。`;
        } else {
            feedback = `${student.name} showed a mixed performance ${timeFrame} with highlights in ${behaviorDescription} but also areas needing improvement. We'll continue guiding balanced development.`;
        }
    } else if (pattern.concerning) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}需要更多关注和支持。在${behaviorDescription}等方面存在挑战，我们正与学生一起努力改善这些问题。`;
        } else {
            feedback = `${student.name} needs additional support ${timeFrame}. Challenges appeared in ${behaviorDescription}, and we're working with the student to address these issues.`;
        }
    } else if (pattern.highlyActive) {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}参与度很高，活动频繁，涉及${behaviorDescription}等多个方面。我们将帮助学生更好地管理自己的行为，发挥优势。`;
        } else {
            feedback = `${student.name} was very active ${timeFrame} across multiple areas including ${behaviorDescription}. We'll help channel this energy positively.`;
        }
    } else {
        if (language === 'zh') {
            feedback = `${student.name}在${timeFrameZh}的表现反映了${behaviorDescription}等情况。我们将继续观察并支持学生的成长。`;
        } else {
            feedback = `${student.name}'s performance ${timeFrame} reflected ${behaviorDescription}. We'll continue monitoring and supporting their growth.`;
        }
    }

    return feedback;
}

/* ================= 📊 MAIN COMPONENT ================= */

export default function ReportsPage({ activeClass, studentId, isParentView, onBack }) {
    // Editable feedback state
    const [editingFeedback, setEditingFeedback] = useState({}); // { [studentId]: true/false }
    const [feedback, setFeedback] = useState({}); // { [studentId]: text }
    const [timePeriod, setTimePeriod] = useState('week'); // 'week', 'month', 'year'
    const [language, setLanguage] = useState('en'); // 'en' or 'zh'
    const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');
    const [realStats, setRealStats] = useState({});
    const reportContentRef = useRef(null);

    // Responsive Hooks
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;

    // 1. SECURITY FILTER
    const displayStudents = useMemo(() => {
        if (!activeClass || !activeClass.students) return [];
        if (studentId) {
            return activeClass.students.filter(s => s.id.toString() === studentId.toString());
        }
        if (selectedStudentId) {
            return activeClass.students.filter(s => s.id.toString() === selectedStudentId.toString());
        }
        return activeClass.students;
    }, [activeClass, studentId, selectedStudentId]);

    // Fetch real behavior data
    useEffect(() => {
        const fetchRealStats = async () => {
            const stats = {};

            for (const student of displayStudents) {
                const studentHistory = student.history || [];
                // eslint-disable-next-line react-hooks/immutability
                const filteredHistory = filterHistoryByTimePeriod(studentHistory, timePeriod);
                const positiveBehaviors = filteredHistory.filter(h => h.pts > 0);
                const negativeBehaviors = filteredHistory.filter(h => h.pts < 0);
                const positiveTotal = positiveBehaviors.reduce((sum, h) => sum + h.pts, 0);
                const negativeTotal = negativeBehaviors.reduce((sum, h) => sum + h.pts, 0);

                const positiveByCard = {};
                const negativeByCard = {};

                positiveBehaviors.forEach(h => {
                    positiveByCard[h.label] = (positiveByCard[h.label] || 0) + h.pts;
                });

                negativeBehaviors.forEach(h => {
                    negativeByCard[h.label] = (negativeByCard[h.label] || 0) + Math.abs(h.pts);
                });

                stats[student.id] = {
                    positive: {
                        total: positiveTotal,
                        byCard: positiveByCard,
                        wowCount: positiveBehaviors.length
                    },
                    negative: {
                        total: negativeTotal,
                        byCard: negativeByCard,
                        nonoCount: negativeBehaviors.length
                    }
                };
            }
            setRealStats(stats);
        };

        if (displayStudents.length > 0) {
            fetchRealStats();
        }
    }, [displayStudents, timePeriod]);

    const filterHistoryByTimePeriod = (history, period) => {
        const now = new Date();
        let cutoffDate;

        switch (period) {
            case 'week':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'year':
                cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoffDate;
        });
    };

    const getStudentStats = (student) => {
        return realStats[student.id] || {
            positive: { total: 0, byCard: {}, wowCount: 0 },
            negative: { total: 0, byCard: {}, nonoCount: 0 }
        };
    };

    const getDailyBehaviorData = (student) => {
        const studentHistory = student.history || [];
        const filteredHistory = filterHistoryByTimePeriod(studentHistory, timePeriod);
        const dailyTotals = {};

        filteredHistory.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            let dateKey;

            if (timePeriod === 'week') {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dateKey = days[entryDate.getDay()];
            } else if (timePeriod === 'month') {
                dateKey = `Day ${entryDate.getDate()}`;
            } else {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                dateKey = months[entryDate.getMonth()];
            }

            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + entry.pts;
        });

        let labels = [];
        if (timePeriod === 'week') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        } else if (timePeriod === 'month') {
            labels = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`);
        } else {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        const data = labels.map(label => dailyTotals[label] || 0);

        return {
            labels: labels,
            datasets: [{
                label: 'Total Points',
                data: data,
                backgroundColor: '#4CAF50',
                borderRadius: 8
            }]
        };
    };

    const t = translations[language];

    // Download as PDF
    const handleDownload = async () => {
        if (!reportContentRef.current) return;

        try {
            // Temporarily hide the buttons and Edit buttons during capture
            const buttons = document.querySelector('[style*="position: absolute"]');
            const editButtons = reportContentRef.current.querySelectorAll('button[style*="color: #6366f1"], button[style*="color: #4CAF50"]');
            
            const originalButtonDisplay = buttons ? buttons.style.display : '';
            const editButtonDisplays = Array.from(editButtons).map(btn => btn.style.display);
            
            // Hide elements
            if (buttons) buttons.style.display = 'none';
            editButtons.forEach(btn => btn.style.display = 'none');

            const canvas = await html2canvas(reportContentRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true,
                width: reportContentRef.current.scrollWidth,
                height: reportContentRef.current.scrollHeight,
                windowWidth: reportContentRef.current.scrollWidth,
                windowHeight: reportContentRef.current.scrollHeight
            });
            
            // Restore elements
            if (buttons) buttons.style.display = originalButtonDisplay;
            editButtons.forEach((btn, index) => {
                btn.style.display = editButtonDisplays[index];
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate PDF dimensions (A4 ratio)
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add additional pages if needed
            while (heightLeft > 0) {
                position = -heightLeft;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const filename = selectedStudentId 
                ? `${activeClass?.students?.find(s => s.id === selectedStudentId)?.name || 'student'}_${timePeriod}_report.pdf`
                : `${activeClass?.name || 'class'}_${timePeriod}_report.pdf`;
            
            pdf.save(filename);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Print
    const handlePrint = () => {
        if (!reportContentRef.current) return;

        // Create print-specific styles
        const printStyles = `
            <style>
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #report-content, #report-content * {
                        visibility: visible;
                    }
                    #report-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    #report-content button[style*="color: #6366f1"],
                    #report-content button[style*="color: #4CAF50"] {
                        display: none !important;
                    }
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            </style>
        `;

        // Add print styles to head
        const styleSheet = document.createElement('style');
        styleSheet.innerHTML = printStyles.replace('#report-content', '.print-content');
        document.head.appendChild(styleSheet);

        // Add ID to report content for print targeting
        const originalId = reportContentRef.current.id;
        reportContentRef.current.id = 'print-content';
        reportContentRef.current.className = 'print-content';

        // Trigger print
        window.print();

        // Clean up after print dialog closes
        setTimeout(() => {
            document.head.removeChild(styleSheet);
            reportContentRef.current.id = originalId;
            reportContentRef.current.className = '';
        }, 1000);
    };

    return (
        <div className="safe-area-top" style={{ ...styles.container, padding: isMobile ? '20px' : '40px' }}>
            <div className="safe-area-top" style={{
                ...styles.header,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '10px' : '0',
                position: 'relative',
                paddingBottom: isMobile ? '10px' : '20px',
            }}>
                {/* Header Left: Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    {!isParentView && !isMobile && (
                        <h1 style={{ ...styles.mainTitle, fontSize: isMobile ? '18px' : '24px', margin: 0 }}>
                            {selectedStudentId && !isParentView
                                ? `${activeClass?.students?.find(s => s.id === selectedStudentId)?.name || ''} - ${t.mainTitle(isParentView, activeClass?.name)}`
                                : t.mainTitle(isParentView, activeClass?.name)}
                        </h1>
                    )}
                </div>
                {/* Header Right: Select Menus and X Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, position: 'relative', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 'calc(100% - 40px)' : 'auto' }}>
                    {/* Language Select */}
                    <div style={{ position: isMobile ? 'relative' : 'static', flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : 'auto', marginLeft: isMobile ? '-55px' : 0 }}>
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            style={{
                                width: isMobile ? '90%' : undefined,
                                padding: isMobile ? '6px 10px' : '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                fontWeight: 700,
                                fontSize: isMobile ? '13px' : '15px',
                                background: '#f5f5f7',
                                color: '#333',
                                marginRight: isMobile ? 0 : 4,
                                textAlign: 'left',
                            }}
                            aria-label="Select language"
                        >
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                    {/* Period Select (week as default) */}
                    <div style={{ position: isMobile ? 'relative' : 'static', flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : 'auto' }}>
                        <select
                            value={timePeriod || 'week'}
                            onChange={e => setTimePeriod(e.target.value)}
                            style={{
                                width: isMobile ? '85%' : undefined,
                                padding: isMobile ? '6px 10px' : '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                fontWeight: 700,
                                fontSize: isMobile ? '13px' : '15px',
                                background: '#f5f5f7',
                                color: '#333',
                                marginRight: isMobile ? 0 : 4,
                                textAlign: 'left',
                            }}
                            aria-label="Select period"
                        >
                            <option value="week">{t.week}</option>
                            <option value="month">{t.month}</option>
                            <option value="year">{t.year}</option>
                        </select>
                    </div>
                    {/* Student Select (if not parent and >1 student) */}
                    {!studentId && activeClass && activeClass.students && activeClass.students.length > 1 && (
                        <div style={{ position: isMobile ? 'relative' : 'static', flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : 'auto' }}>
                            <select
                                value={selectedStudentId}
                                onChange={e => setSelectedStudentId(e.target.value)}
                                style={{
                                    width: isMobile ? '95%' : undefined,
                                    padding: isMobile ? '6px 10px' : '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    fontWeight: 600,
                                    fontSize: isMobile ? '13px' : '14px',
                                    background: '#fff',
                                    color: '#333',
                                    minWidth: isMobile ? 0 : '100px',
                                    marginRight: isMobile ? 0 : 4,
                                    textAlign: 'left',
                                }}
                                aria-label="Select student"
                            >
                                <option value="">Select Students</option>
                                {activeClass.students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* X Button (Go Back) - always visible, floats right on mobile */}
                    {!isParentView && (
                        <button
                            onClick={onBack || (() => window.history.back())}
                            style={{
                                ...styles.goBackBtn,
                                padding: isMobile ? '0px 0px' : '2px 4ßpx',
                                fontSize: isMobile ? '16px' : '18px',
                                marginLeft: isMobile ? 1 : 1, // <-- increased from 2 to 7 for mobile
                                position: isMobile ? 'absolute' : 'static',
                                right: isMobile ? -15 : undefined, // <-- add 5px right offset
                                top: isMobile ? -27 : undefined,
                                zIndex: 2,
                                background: '#fff',
                                border: '1.5px solid #e0e0e0',
                                boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.07)' : undefined
                            }}
                            aria-label="Go back"
                        >
                            <X size={isMobile ? 22 : 24} />
                        </button>
                    )}
                </div>
            </div>

            {displayStudents.length === 0 ? (
                <div style={styles.emptyState}>{t.emptyState}</div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {/* Download and Print Buttons - Top Right of Body */}
                    <div style={{
                        position: 'absolute',
                        top: isMobile ? '10px' : '20px',
                        right: isMobile ? '10px' : '20px',
                        zIndex: 10,
                        display: 'flex',
                        gap: isMobile ? 6 : 8
                    }}>
                        <button 
                            onClick={handleDownload} 
                            style={{ 
                                ...styles.downloadPrintBtn,
                                padding: isMobile ? '8px 12px' : '10px 16px',
                                fontSize: isMobile ? '12px' : '14px',
                                minWidth: isMobile ? 'auto' : '80px'
                            }}
                            title="Download PDF"
                        >
                            <Download size={isMobile ? 14 : 16} />
                            {!isMobile && <span style={{ marginLeft: '6px' }}>PDF</span>}
                        </button>
                        <button 
                            onClick={handlePrint} 
                            style={{ 
                                ...styles.downloadPrintBtn,
                                padding: isMobile ? '8px 12px' : '10px 16px',
                                fontSize: isMobile ? '12px' : '14px',
                                minWidth: isMobile ? 'auto' : '80px'
                            }}
                            title="Print"
                        >
                            <Printer size={isMobile ? 14 : 16} />
                            {!isMobile && <span style={{ marginLeft: '6px' }}>Print</span>}
                        </button>
                    </div>

                    {/* Report Content - for PDF capture */}
                    <div ref={reportContentRef} style={{ paddingTop: isMobile ? '60px' : '80px' }}>
                        {displayStudents.map(student => {
                    const stats = getStudentStats(student);
                    const teacherNote = generateTeacherNote(student, stats, timePeriod, language);
                    const doughnutData = {
                        labels: [
                            language === 'zh' ? '积极行为' : 'Positive Behaviors',
                            language === 'zh' ? '需改进行为' : 'Needs Work'
                        ],
                        datasets: [{
                            data: [Math.abs(stats.positive.total) || 0, Math.abs(stats.negative.total) || 0],
                            backgroundColor: ['#4CAF50', '#FF5252'],
                            borderWidth: 0,
                        }]
                    };
                    
                    return (
                        <div key={student.id} style={{ ...styles.reportCard, padding: isMobile ? '20px' : '30px' }}>
                            
                            <div style={styles.cardTop}>
                                <div style={styles.studentMeta}>
                                    <div style={styles.avatarCircle}>
                                        {student.avatar && student.avatar.trim() !== '' ? (
                                            <img
                                                src={student.avatar}
                                                alt={student.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    // If the image fails to load, replace it with the letter
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.innerText = student.name.charAt(0);
                                                }}
                                            />
                                        ) : student.character ? (
                                            <img
                                                src={boringAvatar(student.gender || 'boy', student.id)}
                                                alt={student.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.innerText = student.name.charAt(0);
                                                }}
                                            />
                                        ) : (
                                            <span>{student.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={styles.sName}>{student.name}</h2>
                                        <div style={styles.idTag}>ID: {student.id}</div>
                                    </div>
                                </div>
                                <div style={styles.scoreBox}>
                                    <div style={styles.bigScore}>{student.score || 0}</div>
                                    <div style={styles.scoreLabel}>{t.totalPoints}</div>
                                </div>
                            </div>

                            <div style={styles.aiInsightSection}>
                                <div style={styles.aiPulse} />
                                <p style={styles.aiText}><strong>{t.aiSummary}</strong></p>
                                {/* Editable feedback section (read-only for parents) */}
                                {isParentView ? (
                                    <div style={{ marginTop: 8, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: feedback[student.id] || teacherNote }} />
                                ) : (
                                    <>
                                        {editingFeedback[student.id] ? (
                                            <SimpleWysiwyg
                                                value={typeof feedback[student.id] === 'string' ? feedback[student.id] : (typeof teacherNote === 'string' ? teacherNote : '')}
                                                onChange={e => setFeedback(f => ({ ...f, [student.id]: e && e.target && typeof e.target.value === 'string' ? e.target.value : '' }))}
                                                style={{ width: '100%', minHeight: 80, marginTop: 8, borderRadius: 8 }}
                                            />
                                        ) : (
                                            <div style={{ marginTop: 8, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: feedback[student.id] || teacherNote }} />
                                        )}
                                        <div style={{ marginTop: 8 }}>
                                            {editingFeedback[student.id] ? (
                                                <button
                                                    style={{ ...styles.goBackBtn, color: '#4CAF50', borderColor: '#4CAF50', marginRight: 8 }}
                                                    onClick={() => setEditingFeedback(e => ({ ...e, [student.id]: false }))}
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    style={{ ...styles.goBackBtn, color: '#6366f1', borderColor: '#6366f1', marginRight: 8 }}
                                                    onClick={() => setEditingFeedback(e => ({ ...e, [student.id]: true }))}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{
                                ...styles.bentoGrid,
                                flexDirection: isTablet ? 'column' : 'row'
                            }}>
                                <div style={styles.gridItemLarge}>
                                    <h4 style={styles.chartTitle}>{t.behaviorDistribution}</h4>
                                    <div style={{ height: '200px' }}>
                                        <Bar
                                            data={getDailyBehaviorData(student)}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: true },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                return `${context.dataset.label}: ${context.parsed.y} points`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={styles.gridItemSmall}>
                                    <h4 style={styles.chartTitle}>{t.ratio}</h4>
                                    <div style={{ height: '140px' }}>
                                        <Doughnut
                                            data={doughnutData}
                                            options={{
                                                maintainAspectRatio: false,
                                                cutout: '70%',
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            boxWidth: 12,
                                                            padding: 10,
                                                            font: { size: 10 }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 14 }}>
                                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                            {t.positive}: {Math.abs(stats.positive.total) || 0}
                                        </span>
                                        {' '}|{' '}
                                        <span style={{ color: '#FF5252', fontWeight: 'bold' }}>
                                            {t.needsWork}: {Math.abs(stats.negative.total) || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { background: '#fff', minHeight: '100vh', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
    goBackBtn: {
        padding: '8px 16px',
        border: '1px solid #e0e0e0',
        background: '#fff',
        cursor: 'pointer',
        borderRadius: '8px',
        fontWeight: '900',
        color: '#e93535ff',
        fontSize: '14px',
        width: 'fit-content'
    },
    mainTitle: { fontWeight: '900', color: '#1a1a1a', margin: 0 },
    langSelector: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px', width: 'fit-content' },
    langBtn: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '700', color: '#888' },
    langBtnActive: { background: '#fff', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    rightControls: { display: 'flex', gap: '10px', alignItems: 'center' },
    studentSelect: {
        padding: '8px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        background: '#fff',
        cursor: 'pointer',
        minWidth: '150px'
    },
    filterBar: { display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '12px' },
    periodBtn: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '700', color: '#888' },
    periodBtnActive: { background: '#fff', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    reportCard: { background: '#fff', borderRadius: '24px', border: '1px solid #eee', padding: '30px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' },
    studentMeta: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatarCircle: {
        width: '60px',
        height: '60px',
        background: '#E8F5E9', // Light green background for the letter
        color: '#2E7D32',      // Dark green color for the letter
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',      // Size of the letter
        fontWeight: '900',     // Boldness of the letter
        border: '2px solid #4CAF50',
        overflow: 'hidden',
        flexShrink: 0,          // Prevents the circle from squishing on mobile
        position: 'relative'
    },
    sName: { margin: 0, fontSize: '20px', fontWeight: '800' },
    idTag: { fontSize: '12px', color: '#aaa' },
    scoreBox: { textAlign: 'center', background: '#F8FFF8', padding: '10px 20px', borderRadius: '16px', border: '1px solid #E8F5E9' },
    bigScore: { fontSize: '28px', fontWeight: '900', color: '#4CAF50' },
    scoreLabel: { fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#888' },
    aiInsightSection: { background: '#F8F9FA', padding: '20px', borderRadius: '18px', border: '1px solid #EDF2F7', marginBottom: '25px', position: 'relative' },
    aiText: { fontSize: '15px', lineHeight: '1.6', color: '#4A5568', margin: 0 },
    aiPulse: { position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1' },
    bentoGrid: { display: 'flex', gap: '20px' },
    gridItemLarge: { flex: 2, background: '#fcfcfc', padding: '20px', borderRadius: '24px', border: '1px solid #f0f0f0' },
    gridItemSmall: { flex: 1, background: '#fcfcfc', padding: '20px', borderRadius: '24px', border: '1px solid #f0f0f0', textAlign: 'center' },
    chartTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#444' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#ccc' },
    printBtn: { padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    downloadPrintBtn: {
        padding: '8px 12px',
        border: '1px solid #e0e0e0',
        background: '#fff',
        cursor: 'pointer',
        borderRadius: '8px',
        fontWeight: '600',
        color: '#6366f1',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
};