import React, { useState, useMemo, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, X, Home, UserPlus, ClipboardCheck, GraduationCap, Clock, Award, Gift, Settings, FileText, Brush, Users, BarChart3, Zap, ChevronRight, BookOpen, Menu, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../i18n';
import useWindowSize from '../hooks/useWindowSize';
import useDarkMode from '../hooks/useDarkMode';

function buildGuideContent(lang) {
  const en = [
    {
      category: '0. Getting Started',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'signup',
          title: 'Create Teacher Account',
          description: 'Sign up to start managing your classroom.',
          content: `### Create Your Teacher Account
Click the **Get Started Free** button on the landing page to create your teacher account.

**What You'll Need:**
- Your name
- Email address
- A secure password

**After Account Creation:**
- Your classes and data are automatically saved to the cloud
- You can access your classroom from any device
- Email verification is required for security

[Create Account](#action:signup)
`
        },
        {
          id: 'login',
          title: 'Login to Your Portal',
          description: 'How to sign in and access your classes.',
          content: `### Login to ClassABC
Click the **Login** button on the landing page, then enter your email and password.

**Login Options:**
- **Teacher**: Use email + password
- **Parent**: Use the 5-digit parent code (provided by teacher)
- **Student**: Use the 5-digit student code (provided by teacher)

**Trouble Logging In?**
- Check your email is verified
- Use the "Forgot Password" link to reset
- Contact support if issues persist

[Open Login](#action:login)
`
        },
        {
          id: 'create-class',
          title: 'Create Your First Class',
          description: 'Set up a new class and add students.',
          content: `### Create Your First Class
After logging in, you'll see your Teacher Portal. Click **+ Add Class** to create your first classroom.

**Class Setup Steps:**
1. Enter a class name (e.g., "Grade 3 - Morning", "Math 101")
2. Choose a class avatar
3. Click **Create Class**

**Next Steps:**
- Add your students with names and avatars
- Customize behavior cards for points
- Start your first activity!

[Go to Portal](#action:home)
`
        }
      ]
    },
    {
      category: '1. Class Dashboard',
      icon: <GraduationCap size={18} />,
      topics: [
        {
          id: 'dashboard-overview',
          title: 'Dashboard Overview',
          description: 'Understanding your main workspace.',
          content: `### Your Class Dashboard
The dashboard is your main classroom command center where you manage students, assign points, and access all tools.

**Main Features:**
- **Student Cards**: View all students with current points
- **Quick Actions**: Click any student to award/remove points
- **Sidebar Tools**: Access all classroom features
- **Search**: Find students quickly by name

**Auto-Save:**
All changes are saved automatically. No need to look for a save button!

[View Dashboard](#action:home)
`
        },
        {
          id: 'add-students',
          title: 'Add Students',
          description: 'Adding new students to your class.',
          content: `### Add Students to Your Class
Click the **+ Add Student** placeholder card to add new students.

**Student Information:**
- Student name (required)
- Avatar selection (optional - default provided)
- Automatically assigned 5-digit access code

**After Adding:**
- Students can log in with their code
- Parents get a separate 5-digit code for their portal
- Points history starts at 0

[Go to Dashboard](#action:home)
`
        },
        {
          id: 'edit-students',
          title: 'Edit Student Info',
          description: 'Change names, avatars, or remove students.',
          content: `### Edit Student Information
To modify a student's details:

**Change Name or Avatar:**
1. Click the pencil icon on any student card
2. Edit the name in the popup
3. Choose a new avatar if desired
4. Click **Save**

**Delete a Student:**
1. Click the trash icon on the student card
2. Confirm deletion in the popup
3. ⚠️ Warning: This permanently deletes the student and all their point history

Alternatively, use **Settings → Students** tab for bulk edits.

[Open Settings](#action:settings)
`
        }
      ]
    },
    {
      category: '2. Points & Behaviors',
      icon: <Award size={18} />,
      topics: [
        {
          id: 'awarding-points',
          title: 'Awarding Points',
          description: 'Give rewards and consequences to students.',
          content: `### Award Points to Students
Recognize good behavior or address issues with the points system.

**How to Award Points:**
1. Click on any student card
2. Select a behavior card from the popup
3. Points are automatically applied

**Behavior Cards:**
- **Green Cards (Positive)**: +1, +2, +3, +5 points
- **Red Cards (Negative)**: -1, -2 points

**Whole Class Rewards:**
Click the "Whole Class" card to award all students at once! Perfect for class-wide achievements.

[Go to Dashboard](#action:home)
`
        },
        {
          id: 'custom-behaviors',
          title: 'Custom Behavior Cards',
          description: 'Create your own reward and penalty cards.',
          content: `### Customize Behavior Cards
Create personalized behavior cards that match your classroom culture.

**Steps to Create Cards:**
1. Go to **Settings**
2. Click the **Behavior Cards** tab
3. Click **+ Add Reward Card** or **+ Add Penalty Card**
4. Enter:
   - Card name (e.g., "Helped a classmate", "Late to class")
   - Point value
   - Choose an emoji sticker
5. Click **Save**

**Default Cards:**
If you want to start fresh, click **Reset to Defaults** to restore the original behavior cards.

[Open Settings](#action:settings)
`
        },
        {
          id: 'import-behaviors',
          title: 'Import Behaviors',
          description: 'Copy cards from another class.',
          content: `### Import Behavior Cards
Save time by copying behavior cards from your existing classes.

**How to Import:**
1. Go to **Settings → Behavior Cards**
2. Click **Import from Class**
3. Select a class from your list
4. The cards are copied to your current class

**Tips:**
- Great for maintaining consistency across multiple classes
- You can still add custom cards after importing
- Import doesn't overwrite existing cards

[Open Settings](#action:settings)
`
        }
      ]
    },
    {
      category: '3. Attendance',
      icon: <Clock size={18} />,
      topics: [
        {
          id: 'taking-attendance',
          title: 'Taking Attendance',
          description: 'Mark students as present, absent, or tardy.',
          content: `### Smart Attendance System
Track student attendance with just a few taps.

**How to Mark Attendance:**
1. Click the **Checkmark icon** in the sidebar to enable attendance mode
2. Click on any student:
   - **1st Click**: Red → **Absent**
   - **2nd Click**: Yellow → **Tardy**
   - **3rd Click**: Normal → **Present**

**Smart Features:**
- Students marked **Absent** are automatically excluded from:
  - Lucky Draw selections
  - Whole Class rewards
- Attendance status is saved automatically

[Take Attendance](#action:attendance)
`
        }
      ]
    },
    {
      category: '4. Assignments',
      icon: <FileText size={18} />,
      topics: [
        {
          id: 'create-assignment',
          title: 'Create Assignments',
          description: 'Digital worksheets with 9 question types.',
          content: `### Create Digital Assignments
Click the **Clipboard icon** to create engaging digital worksheets.

**Question Types Available:**
1. **Short Answer** - Students write text responses
2. **Multiple Choice** - Select correct option (add 2-6 options)
3. **Fill in the Blank** - Use [blank] for missing words
4. **Matching** - Match items on the left with the right
5. **Reading Comprehension** - Story with sub-questions
6. **True/False** - Mark statements as true or false
7. **Numeric Answer** - Students enter a number
8. **Sentence Ordering** - Rearrange parts into correct order
9. **Sorting** - Students sort items into categories

**Features:**
- Add images to any question
- Assign to all students or specific students
- Validation prevents publishing empty questions

[Create Assignment](#action:assignments)
`
        },
        {
          id: 'grade-assignments',
          title: 'Grade Submissions',
          description: 'Review and grade student work.',
          content: `### Grade Student Submissions
When students submit work, a red badge appears on the **Messages & Grading** icon.

**Grading Steps:**
1. Click the **Messages & Grading** icon
2. Select a submission from the sidebar
3. Review the student's answers
4. Enter a grade and optional feedback
5. Click **Submit Grade**

**Integration:**
- Points can be awarded to students along with grades
- All graded work is saved to the student record
- Parents can view graded work in their portal

[Open Inbox](#action:inbox)
`
        }
      ]
    },
    {
      category: '5. Gamification',
      icon: <Gift size={18} />,
      topics: [
        {
          id: 'lucky-draw',
          title: 'Lucky Draw',
          description: 'Random student selector with rewards.',
          content: `### Lucky Draw - Random Student Selection
Make picking students fun and fair with the Lucky Draw!

**How to Use:**
1. Click the **Dice icon** in the sidebar
2. Choose number of winners (1-4 students)
3. Click **Start Draw**
4. Watch the animated selection!
5. Optionally award points to winners

**Features:**
- No duplicate selections in one draw
- Fun rolling animation
- Sound effects
- Minimum 2 students required
- Absent students are excluded automatically

**Use Cases:**
- Randomly pick helpers
- Select volunteers
- Award prizes
- Choose who presents first

[Try Lucky Draw](#action:luckydraw)
`
        },
        {
          id: 'progress-road',
          title: 'Egg Road Progress',
          description: 'Track class journey through themed worlds.',
          content: `### Egg Road - Class Progress Journey
Gamify your class progress with a visual adventure map!

**How It Works:**
- The entire class contributes points to progress
- Unlock themed worlds as you reach milestones:
  - 🌲 Green Forest (0+ points)
  - ☁️ Cloud Kingdom (500+ points)
  - ⭐ Star Galaxy (1000+ points)
  - 🏆 Golden Victory (2000+ points)
  - 🌟 Star Galaxy (5000+ points)
  - 👑 Golden Victory (10000+ points)

**Features:**
- Top 5 performers appear with larger avatars
- Animated progress fills
- Level markers show milestones
- Encourages teamwork and collective goals

[View Progress](#action:road)
`
        }
      ]
    },
    {
      category: '6. Classroom Tools',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'whiteboard',
          title: 'Whiteboard',
          description: 'Interactive drawing canvas for lessons.',
          content: `### Interactive Whiteboard
A full-featured drawing canvas for interactive lessons.

**Drawing Tools:**
- ✏️ **Pencil** - Freehand drawing with adjustable size
- 🖍️ **Highlighter** - Transparent highlighting
- 📝 **Text Tool** - Type anywhere on the canvas
- 🧽 **Eraser** - Remove content
- 😀 **Emoji Stickers** - 40+ fun educational emojis

**Customization Options:**
- 10 quick colors
- Adjustable brush size
- 5 font styles for text
- Font size control

**Actions:**
- Clear canvas with one click
- Export as PNG image
- Undo/redo support

[Open Whiteboard](#action:whiteboard)
`
        },
        {
          id: 'timer',
          title: 'Kid Timer',
          description: 'Visual countdown timer with audio.',
          content: `### Visual Kid Timer
Perfect for timed activities, tests, and classroom management.

**Features:**
- Preset durations: 1, 2, 3, 4, 5 minutes
- Large circular visual display
- Conic gradient progress ring
- Audio feedback:
  - Tick sounds during countdown
  - Warning beeps (last 10 seconds)
  - Completion sound when time is up
- Play/Pause/Reset controls

**Display:**
- Shows "FOCUS TIME" when running
- Shows "PAUSED" when paused
- Large 80px numbers for classroom visibility

[Start Timer](#action:timer)
`
        },
        {
          id: 'attention-buzzer',
          title: 'Attention Buzzer',
          description: 'Quickly get class attention.',
          content: `### Attention Buzzer
Instantly get your students' attention with a sound and visual cue.

**How to Use:**
1. Click the **Bell icon** in the sidebar
2. A sound plays and visual cue appears
3. Perfect for transitioning between activities
4. Get back students' focus quickly

**Best Practices:**
- Use sparingly to maintain effectiveness
- Combine with verbal instructions
- Great for quieting the room before announcements

[Ring Buzzer](#action:buzzer)
`
        },
        {
          id: 'access-codes',
          title: 'Student & Parent Codes',
          description: 'View and share login codes.',
          content: `### Access Codes for Students & Parents
Each student gets unique 5-digit codes for secure access.

**Student Codes:**
- Students use their code to login to the Student Portal
- View assigned worksheets
- Mark assignments as complete
- Track their own progress

**Parent Codes:**
- Parents use their code to login to the Parent Portal
- View their child's reports and analytics
- See behavior history
- Read teacher feedback

**How to Share:**
1. Click the **Key icon** (Access Codes)
2. Find the student in the list
3. Click the copy button to copy the code
4. Or share the QR code for easy scanning
5. Parents can scan to log in directly!

[View Access Codes](#action:codes)
`
        }
      ]
    },
    {
      category: '7. Reports & Analytics',
      icon: <BarChart3 size={18} />,
      topics: [
        {
          id: 'view-reports',
          title: 'View Reports',
          description: 'Analytics for students and whole class.',
          content: `### Reports and Analytics
Gain insights into class and individual student performance.

**Report Types:**
- **Time Range**: Week, Month, Year
- **Scope**: Individual student OR whole class

**Visualizations:**
- 📊 Bar charts showing points over time
- 🍩 Doughnut chart for behavior distribution
- Positive vs negative behavior breakdown
- Top behaviors identification

**AI Features:**
- Auto-generated teacher feedback summary
- Intelligent insights from student data

**Export:**
- Copy to clipboard for sharing
- Export as parent-friendly PDF
- Chinese/English language toggle

[View Reports](#action:reports)
`
        }
      ]
    },
    {
      category: '8. Settings',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'settings-overview',
          title: 'Settings Overview',
          description: 'Customize your classroom experience.',
          content: `### Classroom Settings
Access all customization options in the Settings page.

**Settings Tabs:**

**1. Behavior Cards**
- Add custom reward cards
- Add custom penalty cards
- Import from other classes
- Reset to defaults

**2. Students**
- Edit student names
- Change avatars
- Delete students
- Import from other classes

**Access Settings:**
Click the **Gear icon** in the sidebar to open settings.

[Open Settings](#action:settings)
`
        }
      ]
    },
    {
      category: '9. Portals',
      icon: <Users size={18} />,
      topics: [
        {
          id: 'student-portal',
          title: 'Student Portal',
          description: 'Student view for assignments.',
          content: `### Student Portal
A simplified interface for students to access their work.

**Student Portal Features:**
- Login with 5-digit student code
- View all assigned worksheets
- Mark assignments as complete
- Track personal progress:
  - Total points earned
  - Assignments completed
  - Pending assignments

**How Students Login:**
1. Go to the ClassABC landing page
2. Select "Student" role
3. Enter their 5-digit code
4. Click "Login"

Language toggle available (English/中文).

[Student Login](#action:login)
`
        },
        {
          id: 'parent-portal',
          title: 'Parent Portal',
          description: 'Parent view for child progress.',
          content: `### Parent Portal
Keep parents informed with read-only access to their child's data.

**Parent Portal Features:**
- Login with 5-digit parent code
- View child's reports and analytics
- See behavior history
- Read AI-generated teacher feedback
- View assignment grades
- Track overall progress

**What Parents CAN Do:**
- View all child data
- Read reports
- See point history

**What Parents CANNOT Do:**
- Modify any data (read-only)
- Award or remove points
- Access other students' information

**How Parents Login:**
1. Go to the ClassABC landing page
2. Select "Parent" role
3. Enter their 5-digit parent code
4. Click "Login"

[Parent Login](#action:login)
`
        }
      ]
    }
  ];

  const zh = [
    {
      category: '0. 快速开始',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'signup',
          title: '创建教师账号',
          description: '注册账号开始管理您的课堂。',
          content: `### 创建您的教师账号
在登录页点击 **免费注册** 创建您的教师账号。

**所需信息：**
- 您的姓名
- 邮箱地址
- 安全密码

**注册完成后：**
- 您的班级数据自动保存到云端
- 可以在任何设备上访问您的课堂
- 需要邮箱验证以确保安全

[创建账号](#action:signup)
`
        },
        {
          id: 'login',
          title: '登录到您的门户',
          description: '如何登录并访问您的班级。',
          content: `### 登录 ClassABC
点击登录页的 **登录** 按钮，然后输入您的邮箱和密码。

**登录方式：**
- **教师**：使用邮箱 + 密码
- **家长**：使用5位家长代码（由教师提供）
- **学生**：使用5位学生代码（由教师提供）

**无法登录？**
- 检查邮箱是否已验证
- 使用"忘记密码"链接重置
- 如有问题请联系技术支持

[打开登录](#action:login)
`
        },
        {
          id: 'create-class',
          title: '创建第一个班级',
          description: '设置新班级并添加学生。',
          content: `### 创建您的第一个班级
登录后，您将看到教师门户。点击 **+ 添加班级** 创建您的第一个课堂。

**班级设置步骤：**
1. 输入班级名称（例如："三年级-上午"、"数学101"）
2. 选择班级头像
3. 点击 **创建班级**

**下一步：**
- 添加学生姓名和头像
- 自定义积分行为卡片
- 开始您的第一个活动！

[前往门户](#action:home)
`
        }
      ]
    },
    {
      category: '1. 班级主面板',
      icon: <GraduationCap size={18} />,
      topics: [
        {
          id: 'dashboard-overview',
          title: '主面板概览',
          description: '了解您的主要工作区。',
          content: `### 您的班级主面板
主面板是您的主要课堂指挥中心，用于管理学生、分配积分和访问所有工具。

**主要功能：**
- **学生卡片**：查看所有学生及其当前积分
- **快捷操作**：点击任何学生卡片即可奖励/扣除积分
- **侧边栏工具**：访问所有课堂功能
- **搜索**：按姓名快速查找学生

**自动保存：**
所有更改都会自动保存，无需查找保存按钮！

[查看主面板](#action:home)
`
        },
        {
          id: 'add-students',
          title: '添加学生',
          description: '向班级添加新学生。',
          content: `### 向班级添加学生
点击 **+ 添加学生** 占位符卡片添加新学生。

**学生信息：**
- 学生姓名（必填）
- 头像选择（可选 - 默认提供）
- 自动分配5位访问代码

**添加后：**
- 学生可以使用代码登录
- 家长获得单独的5位代码用于家长门户
- 积分记录从0开始

[前往主面板](#action:home)
`
        },
        {
          id: 'edit-students',
          title: '编辑学生信息',
          description: '更改姓名、头像或删除学生。',
          content: `### 编辑学生信息
修改学生详细信息：

**更改姓名或头像：**
1. 点击任何学生卡片上的铅笔图标
2. 在弹出窗口中编辑姓名
3. 如需可选择新头像
4. 点击 **保存**

**删除学生：**
1. 点击学生卡片上的垃圾桶图标
2. 在弹出窗口中确认删除
3. ⚠️ 警告：这将永久删除学生及其所有积分记录

或者，使用 **设置 → 学生** 标签进行批量编辑。

[打开设置](#action:settings)
`
        }
      ]
    },
    {
      category: '2. 积分与行为',
      icon: <Award size={18} />,
      topics: [
        {
          id: 'awarding-points',
          title: '奖励积分',
          description: '给学生奖励和后果。',
          content: `### 给学生奖励积分
使用积分系统表扬良好行为或解决问题。

**如何奖励积分：**
1. 点击任何学生卡片
2. 从弹出窗口中选择行为卡片
3. 积分自动应用

**行为卡片：**
- **绿色卡片（奖励）**：+1、+2、+3、+5 分
- **红色卡片（惩罚）**：-1、-2 分

**全班奖励：**
点击"全班"卡片一次性奖励所有学生！适用于全班成就。

[前往主面板](#action:home)
`
        },
        {
          id: 'custom-behaviors',
          title: '自定义行为卡片',
          description: '创建您自己的奖励和惩罚卡片。',
          content: `### 自定义行为卡片
创建符合您课堂文化的个性化行为卡片。

**创建卡片步骤：**
1. 进入 **设置**
2. 点击 **行为卡片** 标签
3. 点击 **+ 添加奖励卡片** 或 **+ 添加惩罚卡片**
4. 输入：
   - 卡片名称（例如："帮助同学"、"上课迟到"）
   - 积分值
   - 选择表情符号贴纸
5. 点击 **保存**

**默认卡片：**
如需重新开始，点击 **重置为默认** 恢复原始行为卡片。

[打开设置](#action:settings)
`
        },
        {
          id: 'import-behaviors',
          title: '导入行为卡片',
          description: '从另一个班级复制卡片。',
          content: `### 导入行为卡片
从现有班级复制行为卡片以节省时间。

**如何导入：**
1. 进入 **设置 → 行为卡片**
2. 点击 **从班级导入**
3. 从列表中选择一个班级
4. 卡片将复制到当前班级

**提示：**
- 适合在多个班级之间保持一致性
- 导入后仍可添加自定义卡片
- 导入不会覆盖现有卡片

[打开设置](#action:settings)
`
        }
      ]
    },
    {
      category: '3. 考勤',
      icon: <Clock size={18} />,
      topics: [
        {
          id: 'taking-attendance',
          title: '记录考勤',
          description: '标记学生为出勤、缺勤或迟到。',
          content: `### 智能考勤系统
只需点击几下即可跟踪学生出勤。

**如何标记考勤：**
1. 点击侧边栏中的 **勾选图标** 启用考勤模式
2. 点击任何学生：
   - **第1次点击**：红色 → **缺勤**
   - **第2次点击**：黄色 → **迟到**
   - **第3次点击**：正常 → **出勤**

**智能功能：**
- 被标记为 **缺勤** 的学生将自动排除：
  - 抽奖选择
  - 全班奖励
- 考勤状态自动保存

[记录考勤](#action:attendance)
`
        }
      ]
    },
    {
      category: '4. 作业',
      icon: <FileText size={18} />,
      topics: [
        {
          id: 'create-assignment',
          title: '创建作业',
          description: '支持9种题型的数字练习纸。',
          content: `### 创建数字作业
点击 **剪贴板图标** 创建有趣的数字练习纸。

**可用题型：**
1. **简答题** - 学生写文本回答
2. **选择题** - 选择正确选项（添加2-6个选项）
3. **填空题** - 使用 [blank] 标记缺失单词
4. **配对题** - 将左侧项目与右侧匹配
5. **阅读理解** - 带子问题的故事
6. **判断题** - 标记陈述为真或假
7. **数字答案** - 学生输入数字
8. **句子排序** - 将部分重新排列为正确顺序
9. **分类题** - 学生将项目分类到类别中

**功能：**
- 为任何题目添加图片
- 分配给所有学生或特定学生
- 验证防止发布空题目

[创建作业](#action:assignments)
`
        },
        {
          id: 'grade-assignments',
          title: '批改作业',
          description: '审查和评分学生作业。',
          content: `### 批改学生作业
学生提交作业后，**消息与评分** 图标上会出现红点。

**批改步骤：**
1. 点击 **消息与评分** 图标
2. 从侧边栏选择提交
3. 审查学生的答案
4. 输入分数和可选反馈
5. 点击 **提交评分**

**集成：**
- 可以在评分时给学生积分
- 所有批改的作业都保存到学生记录
- 家长可以在门户中查看批改的作业

[打开收件箱](#action:inbox)
`
        }
      ]
    },
    {
      category: '5. 游戏化',
      icon: <Gift size={18} />,
      topics: [
        {
          id: 'lucky-draw',
          title: '幸运抽奖',
          description: '带奖励的随机学生选择器。',
          content: `### 幸运抽奖 - 随机学生选择
用幸运抽奖让挑选学生变得有趣公平！

**如何使用：**
1. 点击侧边栏中的 **骰子图标**
2. 选择获奖者数量（1-4名学生）
3. 点击 **开始抽奖**
4. 观看动画选择！
5. 可选择给获奖者奖励积分

**功能：**
- 一次抽奖中不重复选择
- 有趣的滚动动画
- 音效
- 最少需要2名学生
- 缺勤学生自动排除

**使用场景：**
- 随机挑选助手
- 选择志愿者
- 颁发奖品
- 选择谁先展示

[试玩抽奖](#action:luckydraw)
`
        },
        {
          id: 'progress-road',
          title: '彩蛋路进度',
          description: '通过主题世界跟踪班级旅程。',
          content: `### 彩蛋路 - 班级进度旅程
用视觉冒险地图将您的班级进度游戏化！

**工作原理：**
- 整个班级贡献积分以推进进度
- 达到里程碑解锁主题世界：
  - 🌲 绿色森林（0+分）
  - ☁️ 云端王国（500+分）
  - ⭐ 星系（1000+分）
  - 🏆 金色胜利（2000+分）
  - 🌟 星系（5000+分）
  - 👑 金色胜利（10000+分）

**功能：**
- 前5名表现者显示较大头像
- 动画进度填充
- 级别标记显示里程碑
- 鼓励团队合作和集体目标

[查看进度](#action:road)
`
        }
      ]
    },
    {
      category: '6. 课堂工具',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'whiteboard',
          title: '白板',
          description: '互动式绘图画布。',
          content: `### 互动白板
功能齐全的绘图画布，用于互动课程。

**绘图工具：**
- ✏️ **铅笔** - 可调大小的自由绘图
- 🖍️ **高亮笔** - 透明高亮
- 📝 **文本工具** - 在画布上任何位置输入文字
- 🧽 **橡皮擦** - 删除内容
- 😀 **表情符号贴纸** - 40+有趣的教育表情符号

**自定义选项：**
- 10种快速颜色
- 可调节画笔大小
- 5种文本字体样式
- 字体大小控制

**操作：**
- 单击清除画布
- 导出为PNG图像
- 撤销/重做支持

[打开白板](#action:whiteboard)
`
        },
        {
          id: 'timer',
          title: '儿童计时器',
          description: '带音频的视觉倒计时器。',
          content: `### 视觉儿童计时器
非常适合定时活动、测试和课堂管理。

**功能：**
- 预设时长：1、2、3、4、5分钟
- 大型圆形视觉显示
- 锥形渐变进度环
- 音频反馈：
  - 倒计时期间滴答声
  - 警告提示音（最后10秒）
  - 时间结束时的完成音
- 播放/暂停/重置控制

**显示：**
- 运行时显示"专注时间"
- 暂停时显示"已暂停"
- 大号80px数字，课堂可见

[启动计时器](#action:timer)
`
        },
        {
          id: 'attention-buzzer',
          title: '注意提醒器',
          description: '快速引起班级注意。',
          content: `### 注意提醒器
用声音和视觉提示立即引起学生注意。

**如何使用：**
1. 点击侧边栏中的 **铃铛图标**
2. 播放声音并显示视觉提示
3. 非常适合活动之间的转换
4. 快速收回学生注意力

**最佳实践：**
- 适度使用以保持有效性
- 结合口头指示
- 适合在公告前让教室安静下来

[响铃提醒器](#action:buzzer)
`
        },
        {
          id: 'access-codes',
          title: '学生与家长代码',
          description: '查看和分享登录代码。',
          content: `### 学生与家长访问代码
每个学生都有唯一的5位代码用于安全访问。

**学生代码：**
- 学生使用代码登录学生门户
- 查看分配的作业
- 标记作业为已完成
- 跟踪自己的进度

**家长代码：**
- 家长使用代码登录家长门户
- 查看孩子的报告和分析
- 查看行为历史
- 阅读教师反馈

**如何分享：**
1. 点击 **钥匙图标**（访问代码）
2. 在列表中找到学生
3. 点击复制按钮复制代码
4. 或分享二维码以便轻松扫描
5. 家长可以扫描直接登录！

[查看访问代码](#action:codes)
`
        }
      ]
    },
    {
      category: '7. 报告与分析',
      icon: <BarChart3 size={18} />,
      topics: [
        {
          id: 'view-reports',
          title: '查看报告',
          description: '学生和全班的分析。',
          content: `### 报告与分析
深入了解班级和个别学生的表现。

**报告类型：**
- **时间范围**：周、月、年
- **范围**：个别学生或全班

**可视化：**
- 📊 显示积分随时间变化的条形图
- 🍩 行为分布的环形图
- 正面与负面行为细分
- 识别主要行为

**AI功能：**
- 自动生成的教师反馈摘要
- 从学生数据中获得的智能见解

**导出：**
- 复制到剪贴板以供分享
- 导出为家长友好的PDF
- 中文/英文语言切换

[查看报告](#action:reports)
`
        }
      ]
    },
    {
      category: '8. 设置',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'settings-overview',
          title: '设置概览',
          description: '自定义您的课堂体验。',
          content: `### 班级设置
在设置页面访问所有自定义选项。

**设置标签：**

**1. 行为卡片**
- 添加自定义奖励卡片
- 添加自定义惩罚卡片
- 从其他班级导入
- 重置为默认

**2. 学生**
- 编辑学生姓名
- 更改头像
- 删除学生
- 从其他班级导入

**访问设置：**
点击侧边栏中的 **齿轮图标** 打开设置。

[打开设置](#action:settings)
`
        }
      ]
    },
    {
      category: '9. 门户',
      icon: <Users size={18} />,
      topics: [
        {
          id: 'student-portal',
          title: '学生门户',
          description: '用于作业的学生视图。',
          content: `### 学生门户
简化界面供学生访问他们的作业。

**学生门户功能：**
- 使用5位学生代码登录
- 查看所有分配的作业
- 标记作业为已完成
- 跟踪个人进度：
  - 获得的总积分
  - 已完成的作业
  - 待办作业

**学生登录方式：**
1. 转到 ClassABC 登录页
2. 选择"学生"角色
3. 输入他们的5位代码
4. 点击"登录"

提供语言切换（英文/中文）。

[学生登录](#action:login)
`
        },
        {
          id: 'parent-portal',
          title: '家长门户',
          description: '查看孩子进度的家长视图。',
          content: `### 家长门户
通过只读访问让家长了解孩子的数据。

**家长门户功能：**
- 使用5位家长代码登录
- 查看孩子的报告和分析
- 查看行为历史
- 阅读AI生成的教师反馈
- 查看作业成绩
- 跟踪整体进度

**家长可以：**
- 查看所有孩子数据
- 阅读报告
- 查看积分历史

**家长不能：**
- 修改任何数据（只读）
- 奖励或扣除积分
- 访问其他学生信息

**家长登录方式：**
1. 转到 ClassABC 登录页
2. 选择"家长"角色
3. 输入他们的5位家长代码
4. 点击"登录"

[家长登录](#action:login)
`
        }
      ]
    }
  ];

  return lang === 'zh' ? zh : en;
}

export default function SearchableGuide({ onClose, onTriggerAction }) {
  const { t, lang } = useTranslation();
  const GUIDE_CONTENT = useMemo(() => buildGuideContent(lang), [lang]);
  const [search, setSearch] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(() => {
    return (GUIDE_CONTENT && GUIDE_CONTENT[0] && GUIDE_CONTENT[0].topics[0] && GUIDE_CONTENT[0].topics[0].id) || 'signup';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useWindowSize(768);
  const [isDark, setIsDark] = useDarkMode();

  // Fix: Set document title properly - remove guide.title
  useEffect(() => {
    document.title = 'ClassABC - Help Guide';
  }, []);

  const handleLinkClick = (e) => {
    const href = e.target && e.target.getAttribute && e.target.getAttribute('href');
    if (href?.startsWith('#action:')) {
      e.preventDefault();
      const action = href.split(':')[1];
      onTriggerAction && onTriggerAction(action);
    }
  };

  const filteredData = useMemo(() => {
    const term = (search || '').toLowerCase();
    return GUIDE_CONTENT.map(cat => ({
      ...cat,
      topics: cat.topics.filter(tp => {
        const hay = `${tp.title} ${tp.description} ${tp.content}`.toLowerCase();
        return !term || hay.includes(term);
      })
    })).filter(cat => cat.topics.length > 0);
  }, [search, GUIDE_CONTENT]);

  const activeTopic = useMemo(() => {
    for (const cat of GUIDE_CONTENT) {
      const found = cat.topics.find(topic => topic.id === activeTopicId);
      if (found) return found;
    }
    return (GUIDE_CONTENT && GUIDE_CONTENT[0] && GUIDE_CONTENT[0].topics[0]) || { title: '', description: '', content: '' };
  }, [activeTopicId, GUIDE_CONTENT]);

  const getStyles = (dark) => {
    const baseStyles = { ...styles };
    return Object.keys(baseStyles).reduce((acc, key) => {
      const style = baseStyles[key];
      if (typeof style === 'object' && !Array.isArray(style)) {
        acc[key] = { ...style };
        // Apply dark mode color overrides
        if (dark && style.color) {
          acc[key].color = style.color.replace('#1E293B', '#f5f5f5')
            .replace('#64748B', '#e5e5e5')
            .replace('#6B7280', '#9ca3af')
            .replace('#475569', '#cbd5e1')
            .replace('#1F2937', '#f5f5f5');
        }
        if (dark && style.background) {
          acc[key].background = style.background.replace('#fff', '#1a1a1a')
            .replace('#FAFAFA', '#111')
            .replace('#F8FAFC', '#1a1a1a');
        }
        if (dark && style.borderColor) {
          acc[key].borderColor = style.borderColor.replace('#E5E7EB', '#333')
            .replace('#E2E8F0', '#333')
            .replace('#F3F4F6', '#333');
        }
      } else {
        acc[key] = style;
      }
      return acc;
    }, {});
  };

  const appliedStyles = getStyles(isDark);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={appliedStyles.modal} onClick={e => e.stopPropagation()}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ ...appliedStyles.mobileHeader, display: 'flex' }}>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ ...appliedStyles.mobileMenuBtn, display: 'block' }}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={appliedStyles.mobileTitle}>Help Guide</span>
            <button
              onClick={onClose}
              style={{ padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div style={styles.contentWrapper}>
          {/* Sidebar */}
          <aside style={{
            ...appliedStyles.sidebar,
            transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
            position: isMobile ? 'fixed' : 'relative',
            top: isMobile ? '60px' : '0',
            zIndex: isMobileMenuOpen ? 1000 : 1,
          }}>
            <div style={appliedStyles.searchHeader}>
              <Search size={16} style={appliedStyles.searchIcon} />
              <input
                style={appliedStyles.searchInput}
                placeholder={t('search.placeholder') || 'Search topics...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={styles.navScroll}>
              {filteredData.map((cat, idx) => (
                <div key={idx} style={styles.categorySection}>
                  <div style={appliedStyles.catLabel}>{cat.icon} {cat.category}</div>
                  {cat.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveTopicId(topic.id);
                        if (isMobile) setIsMobileMenuOpen(false);
                      }}
                      style={{
                        ...appliedStyles.navItem,
                        backgroundColor: activeTopicId === topic.id ? (isDark ? '#3730a3' : '#EEF2FF') : 'transparent',
                        color: activeTopicId === topic.id ? (isDark ? '#c7d2fe' : '#4F46E5') : (isDark ? '#e5e5e5' : '#64748B'),
                        fontWeight: activeTopicId === topic.id ? '700' : '500',
                      }}
                    >
                      <span style={styles.navItemText}>{topic.title}</span>
                      {activeTopicId === topic.id && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
              ))}
              {filteredData.length === 0 && (
                <div style={appliedStyles.noResults}>
                  <BookOpen size={32} color={isDark ? '#4b5563' : '#CBD5E1'} />
                  <p style={appliedStyles.noResultsText}>No topics found</p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ ...appliedStyles.mainView, zIndex: isMobileMenuOpen ? 1 : 2 }}>
            {!isMobile && (
              <div style={{ display: 'flex', gap: '8px', position: 'absolute', top: '24px', right: '24px', alignItems: 'center' }}>
                <button
                  onClick={() => setIsDark(!isDark)}
                  style={{ padding: '10px', borderRadius: '10px', cursor: 'pointer', border: 'none', background: isDark ? 'rgba(255,255,255,0.15)' : '#F3F4F6', color: isDark ? '#e5e5e5' : '#6B7280', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={onClose} style={{ ...appliedStyles.desktopCloseBtn, ...(isDark ? { background: 'rgba(255,255,255,0.15)', color: '#e5e5e5' } : {}) }}><X size={18} /></button>
              </div>
            )}
            <article style={styles.article}>
              <div style={styles.articleHeader}>
                <span style={appliedStyles.articleBadge}>{lang === 'zh' ? '指南' : 'Guide'}</span>
                <h1 style={appliedStyles.articleTitle}>{activeTopic.title}</h1>
              </div>
              <p style={appliedStyles.articleDesc}>{activeTopic.description}</p>
              <div style={appliedStyles.articleDivider} />
              <div className="markdown-body guide-content">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => {
                      const isAction = props.href?.startsWith('#action:');
                      return (
                        <a
                          {...props}
                          onClick={e => {
                            if (isAction) {
                              e.preventDefault();
                              e.stopPropagation();
                              const action = props.href.split(':')[1];
                              console.log('Triggering action:', action);
                              if (onTriggerAction) {
                                onTriggerAction(action);
                              }
                            }
                          }}
                          style={isAction ? styles.actionLink : undefined}
                          href={undefined}
                        >
                          {isAction && <Zap size={14} style={styles.actionIcon} />}
                          {props.children}
                        </a>
                      );
                    }
                  }}
                >
                  {activeTopic.content}
                </Markdown>
              </div>
            </article>
          </main>
        </div>
      </div>

      <style>{`
        .markdown-body.guide-content h3 { font-size: 18px; color: ${isDark ? '#f5f5f5' : '#1E293B'}; margin: 24px 0 12px; font-weight: 800; }
        .markdown-body.guide-content p { font-size: 15px; color: ${isDark ? '#cbd5e1' : '#475569'}; line-height: 1.8; margin-bottom: 16px; }
        .markdown-body.guide-content ul { padding-left: 20px; margin-bottom: 20px; }
        .markdown-body.guide-content li { color: ${isDark ? '#cbd5e1' : '#475569'}; margin-bottom: 10px; line-height: 1.7; }
        .markdown-body.guide-content a {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white; padding: 12px 24px;
          border-radius: 14px; text-decoration: none; font-weight: 700;
          font-size: 14px; margin-top: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }
        .markdown-body.guide-content a:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        }
        .markdown-body.guide-content strong {
          color: ${isDark ? '#f5f5f5' : '#1E293B'};
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .markdown-body.guide-content h3 { font-size: 16px; margin: 20px 0 10px; }
          .markdown-body.guide-content p { font-size: 14px; line-height: 1.7; }
          .markdown-body.guide-content a { padding: 10px 18px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.25s ease-out'
    },
    modal: {
      width: '100%',
      maxWidth: '1100px',
      height: '85vh',
      maxHeight: '800px',
      background: '#fff',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 50px 120px -20px rgba(0, 0, 0, 0.4)',
      animation: 'slideUp 0.3s ease-out'
    },
    mobileHeader: {
      display: 'none',
      padding: '16px 20px',
      borderBottom: '1px solid #E2E8F0',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      zIndex: 200
    },
    mobileMenuBtn: {
      display: 'none',
      background: '#F1F5F9',
      border: 'none',
      padding: '10px',
      borderRadius: '10px',
      cursor: 'pointer',
      color: '#64748B'
    },
    mobileTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1E293B'
    },
    mobileCloseBtn: {
      display: 'none',
      background: '#FEE2E2',
      border: 'none',
      padding: '10px',
      borderRadius: '10px',
      cursor: 'pointer',
      color: '#DC2626'
    },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '320px',
    background: '#FAFAFA',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    top: 0,
    left: 0,
    bottom: 0
  },
  searchHeader: {
    padding: '24px 20px 16px',
    position: 'relative',
    borderBottom: '1px solid #F3F4F6'
  },
  searchIcon: {
    position: 'absolute',
    left: '32px',
    top: '38px',
    color: '#9CA3AF',
    zIndex: 5
  },
  searchInput: {
    width: 'calc(100% - 40px)',
    padding: '12px 12px 12px 40px',
    borderRadius: '12px',
    border: '1.5px solid #E5E7EB',
    outline: 'none',
    fontSize: '14px',
    fontWeight: '500',
    background: '#fff',
    transition: 'all 0.2s',
    color: '#1F2937'
  },
  navScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 24px'
  },
  categorySection: {
    marginBottom: '24px'
  },
  catLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '12px'
  },
  navItem: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    color: '#64748B'
  },
  navItemText: {
    flex: 1,
    lineHeight: '1.5',
    color: '#64748B'
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#9CA3AF'
  },
  noResultsText: {
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: '500'
  },
  mainView: {
    flex: 1,
    padding: '40px 48px',
    overflowY: 'auto',
    position: 'relative',
    background: '#fff'
  },
  desktopCloseBtn: {
    background: '#F3F4F6',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#6B7280',
    transition: 'all 0.2s'
  },
  desktopCloseBtnDark: {
    background: 'rgba(255,255,255,0.15)',
    color: '#e5e5e5'
  },
  article: {
    maxWidth: '680px',
    margin: '0 auto'
  },
  articleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  articleBadge: {
    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    color: '#4F46E5',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  articleTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: '1.2'
  },
  articleDesc: {
    fontSize: '16px',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  articleDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, #E5E7EB 0%, transparent 100%)',
    margin: '32px 0'
  },
  actionLink: {
    cursor: 'pointer'
  },
  actionIcon: {
    flexShrink: 0
  }
};
