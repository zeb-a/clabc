import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({ lang: 'en', setLang: () => { } });

const TRANSLATIONS = {
	en: {
		'nav.help': 'Help',
		'nav.login': 'Login',
		'nav.signup': 'Get Started Free',
		'hero.title.line1': 'Classroom management',
		'hero.title.gradient': 'made magical.',
		'hero.subtext': 'The all-in-one platform for behavior tracking, engaging goals, and instant parent communication.',
		'help.label': 'Help',
		'search.placeholder': 'Search features...',
		'guide.badge': 'Classroom Manual',
		'hero.tag': 'Trusted by Modern Teachers',
		'cta.create_class': 'Create My Class',
		'features.title': 'Everything you need to run your class.',
		'modal.who': 'Choose your role',
		'role.teacher': 'Teacher',
		'role.teacher.desc': 'Create classes, assign behaviors, and track progress.',
		'role.parent': 'Parent',
		'role.parent.desc': "View your child's progress and receive updates.",
		'role.student': 'Student',
		'role.student.desc': 'Enter your class access code to see assignments.',
		'student.instructions': 'Enter your 5-digit class code to continue.',
		'student.verifying': 'Verifying...',
		'student.enter': 'Enter',
		'auth.create_btn': 'Create account',
		'auth.login_btn': 'Login',
		'auth.fullname': 'Full name',
		'auth.email': 'Email address',
		'auth.password': 'Password',
		'auth.confirm': 'Confirm password',
		'auth.forgot': 'Forgot password?',
		'auth.already': 'Already have an account?',
		'auth.newhere': 'New here?',
		'auth.create_account': 'Create account',
		'auth.login': 'Login',
		'nav.back': 'Back',
		'cta.join_today': 'Join today',
		'cta.ready': 'Ready to level up your classroom?',

		// --- Email Verification ---
		'auth.account_created': 'Account Created!',
		'auth.verify_msg': 'Please check your email and click the verification link to activate your account.',
		'auth.verify_block': 'You will not be able to log in until your email is verified.',
		'auth.goto_login': 'Go to Login',

		// --- Feature Section ---
		'features.avatars.title': 'Custom Avatars',
		'features.avatars.desc': 'Let students express themselves with unique, fun avatars.',
		'features.reports.title': 'Instant Reports',
		'features.reports.desc': 'Track progress and share beautiful reports with parents.',
		'features.egg.title': 'Progress Meter',
		'features.egg.desc': 'Motivate your class with a collaborative progress journey.',
		'features.lucky.title': 'Lucky Draw',
		'features.lucky.desc': 'Random rewards to keep every lesson exciting.',
		'mockup.class_name': 'Class 4-B',
		'mockup.progress': 'Progress',
		'features.meter.title': 'Progress Meter',
		'features.meter.desc': 'Track your class\'s journey together. Celebrate milestones and motivate students with a real-time progress meter.',
		'features.lucky.title': 'Lucky Draw',
		'features.lucky.desc': 'Gamify your lessons! Randomly reward students for participation and effort with a single click.',
		'features.reports.title': 'Reports & Analytics',
		'features.reports.desc': 'Instantly visualize class and student progress. Export beautiful, parent-friendly reports in any language.',
		'features.avatars.title': 'Custom Avatars',
		'features.avatars.desc': 'Let every student express themselves with unique, fun avatars. Build classroom identity and belonging.',
		'features.studio.title': 'Assignments Studio',
		'features.studio.desc': 'Create, assign, and grade digital worksheets in seconds. Support all question types and instant feedback.',
		'features.codes.title': 'Access Codes',
		'features.codes.desc': 'Secure, simple logins for every student and parent. No more forgotten passwords or lost accounts.',
		'features.timer.title': 'Focus Timer',
		'features.timer.desc': 'Boost productivity with built-in timers for activities and tests. Visual cues for the whole class.',
		'features.buzzer.title': 'Attention Buzzer',
		'features.buzzer.desc': 'Regain focus instantly. Use the buzzer to get everyone\'s attention in a fun, non-disruptive way.',
		'features.whiteboard.title': 'Whiteboard',
		'features.whiteboard.desc': 'Draw, type, and export. Use the digital whiteboard for group work and creative lessons.',
		'features.grading.title': 'Messages & Grading',
		'features.grading.desc': 'Review, grade, and send feedback on student submissions. Keep communication clear and actionable.',
		'features.mgmt.title': 'Class Management',
		'features.mgmt.desc': 'Add or edit students instantly. Update names, avatars, and access codes with automatic saving.',
		'features.settings.title': 'Customization',
		'features.settings.desc': 'Configure points, cards, and class options. Fine-tune the platform for your specific teaching style.',
	},
	zh: {
		'nav.help': '帮助',
		'nav.login': '登录',
		'nav.signup': '免费注册',
		'hero.title.line1': '课堂管理',
		'hero.title.gradient': '让教学更有魔力。',
		'hero.subtext': '一站式平台，用于行为追踪、趣味化目标以及即时家长沟通。',
		'help.label': '帮助',
		'search.placeholder': '搜索功能...',
		'guide.badge': '课堂手册',
		'hero.tag': '受现代教师信赖',
		'cta.create_class': '创建我的班级',
		'features.title': '运行课堂所需的一切。',
		'modal.who': '选择角色',
		'role.teacher': '教师',
		'role.teacher.desc': '创建班级、分配行为并跟踪进度。',
		'role.parent': '家长',
		'role.parent.desc': '查看孩子的进步并接收更新。',
		'role.student': '学生',
		'role.student.desc': '输入班级访问码以查看作业。',
		'student.instructions': '输入您的5位班级代码以继续。',
		'student.verifying': '验证中...',
		'student.enter': '进入',
		'auth.create_btn': '创建账户',
		'auth.login_btn': '登录',
		'auth.fullname': '姓名',
		'auth.email': '电子邮件',
		'auth.password': '密码',
		'auth.confirm': '确认密码',
		'auth.already': '已有账户？',
		'auth.newhere': '新用户？',
		'auth.create_account': '创建账户',
		'auth.login': '登录',
		'nav.back': '返回',
		'cta.join_today': '立即加入',
		'cta.ready': '准备好提升你的课堂了吗？',

		// --- Email Verification ---
		'auth.account_created': '账户已创建！',
		'auth.verify_msg': '请检查您的邮箱并点击验证链接以激活账户。',
		'auth.verify_block': '在邮箱验证之前，您无法登录。',
		'auth.goto_login': '前往登录',

		// --- Feature Section ---
		'features.title': '助力高效教学的全方位功能',
		'features.meter.title': '班级进度条',
		'features.meter.desc': '共同见证班级成长。通过实时进度显示激励学生，共同庆祝每一个里程碑。',
		'features.egg.title': '进度仪表', // Preserved your key
		'features.egg.desc': '用全班协作进度之旅激励学生。', // Preserved your text
		'features.lucky.title': '幸运抽奖',
		'features.lucky.desc': '随机奖励让每节课都充满惊喜。',
		'features.reports.title': '即时报告',
		'features.reports.desc': '追踪进步并与家长分享精美报告。',
		'features.avatars.title': '自定义头像',
		'features.avatars.desc': '让学生用独特有趣的头像表达自我。',

		// --- New Additions (Natural Chinese) ---
		'features.studio.title': '数字化作业',
		'features.studio.desc': '秒级发布数字化练习题，支持即时反馈与评分。',
		'features.codes.title': '快捷访问码',
		'features.codes.desc': '学生专属安全登录码，告别记不住密码的烦恼。',
		'features.timer.title': '专注计时器',
		'features.timer.desc': '内置课堂计时工具，帮学生更好地掌控学习节奏。',
		'features.buzzer.title': '注意力铃声',
		'features.buzzer.desc': '用趣味铃声快速吸引全班注意，让课堂管理更轻松。',
		'features.whiteboard.title': '互动白板',
		'features.whiteboard.desc': '自由书写与绘图，适合小组讨论与创意展示。',
		'features.grading.title': '评价与反馈',
		'features.grading.desc': '即时批改作业并发送评语，让沟通更高效。',
		'features.mgmt.title': '班级管理',
		'features.mgmt.desc': '快速编辑学生名单与头像，所有更改实时保存。',
		'features.settings.title': '自定义设置',
		'features.settings.desc': '随心配置积分规则与评价卡片，适配您的教学风格。',
	}
};

export function LanguageProvider({ children }) {
	const [lang, setLang] = useState(() => {
		try { return localStorage.getItem('classABC_lang') || 'en'; } catch { return 'en'; }
	});

	useEffect(() => {
		try { localStorage.setItem('classABC_lang', lang); } catch {
			// Intentionally ignore localStorage errors
		}
	}, [lang]);

	return React.createElement(
		LanguageContext.Provider,
		{ value: { lang, setLang } },
		children
	);
}

export function useTranslation() {
	const ctx = useContext(LanguageContext) || { lang: 'en', setLang: () => { } };
	const t = (key) => {
		const dict = TRANSLATIONS[ctx.lang] || TRANSLATIONS.en;
		return dict[key] || TRANSLATIONS.en[key] || key;
	};
	return { t, lang: ctx.lang, setLang: ctx.setLang };
}

export default LanguageContext;

