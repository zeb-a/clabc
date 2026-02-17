const HELP_GUIDES = {
  en: {
    'landing': {
      title: 'Welcome to ClassABC',
      body: `### Choose Your Portal

**Teachers**
- Click **Login** to access your Teacher Portal
- Click **Get Started Free** to create your first class

**Students**
- Click **Student** role
- Enter the 5-digit code from your teacher
- View and complete assignments

**Parents**
- Click **Parent** role
- Enter your 5-digit parent code
- View your child's progress report

---

*After logging in, teachers see their classes and can click any class card to enter the Class Dashboard.*`
    },
    'teacher-portal': {
      title: 'Teacher Portal',
      body: `### Manage Your Classes

**Add a Class**
- Click **Add Class** button
- Enter class name
- Optionally add an avatar
- Click save

**Open a Class**
- Click any class card to enter the Class Dashboard

**Edit or Delete**
- Hover over a class card
- Click the pencil icon to edit (name/avatar)
- Click the trash icon to delete (requires confirmation)

---

*All changes save automatically.*`
    },
    'class-dashboard': {
      title: 'Class Dashboard',
      body: `### Your Main Classroom Command Center

This is where you manage everything for a single class.

---

#### **Sidebar Tools**

| | |
|---|---|
| 🏠 | Return to your classes list |
| 📋 | Create worksheets and send to students |
| 💬 | Review student submissions and assign grades |
| 🎲 | Randomly select student winners |
| 🏆 | View class milestone progress |
| ✅ | Mark which students are present/absent |
| 🔳 | View student & parent login codes |
| 📊 | View class & student analytics |
| ⏰ | Start countdown timers for activities |
| 🔔 | Get the class's attention quickly |
| 🎨 | Draw, write, and share with class |
| ⚙️ | Customize point cards and options |

---

#### **Header Action Buttons**

| | |
|---|---|
| 🕐 | View all points awarded to students with timestamps and behavior labels |
| ↕️ | Sort by Name (A-Z) or Highest Points |
| |||| | Change grid size: Compact, Regular, or Spacious |
| ⛶/⤡ | Toggle fullscreen view of the dashboard |
| ☐ | Enable multi-select mode to give points to multiple students at once |

---


#### **Giving Points to Students**

**Individual Students**
- Click any student card
- Select a point card from the popup
- Points are awarded instantly with animation

**Whole Class**
- Click the **Whole Class** card (first card in grid)
- Select a point card
- ALL present students receive the same points

**Multiple Students**
- Click **Select Multiple** (✅ icon)
- Click on student cards to select them
- Click "Give Points" button
- Select a point card to award to all selected students

---

#### **Sort Students**

- Click the up/down arrows icon (⬆️⬇️) in the top right
- A dropdown menu appears with two options:
  - **Name (A-Z)** - Sort students alphabetically
  - **Highest Points** - Sort by total score (highest first)
- Click your preferred sorting option

---

#### **Display Size**

- Click the sliders icon (🎚️) in the top right
- Choose a grid size:
  - **Compact** - Small cards, shows many students
  - **Regular** - Medium cards, balanced view
  - **Spacious** - Large cards, easy to read

---

#### **Points History**

- Click the clock icon (⏱️) in the top right
- View a complete log of all points awarded
- Filter by student or date
- See behavior labels and timestamps
- Use for tracking and record-keeping

---

#### **Fullscreen Mode**

- Click the expand icon (⛶) to show dashboard fullscreen
- Use for classroom display on projector
- Click the **shrink icon** (⬇) or press **Esc** to exit

---

#### **Select Multiple**

- Click the check icon (✅) to enable multi-select mode
- Student cards show checkboxes
- Click cards to select multiple students
- Click "Give Points" to award points to all selected
- Click "Select Multiple" again to disable

---

#### **Student Management**

**Add a Student**
- Click **Add Student** button (bottom of grid)
- Enter student name
- Choose an avatar or upload a photo
- Click save
---
**Edit a Student**
- Hover over a student card
- Click the pencil icon
- Change name or avatar
- Click save
---
**Delete a Student**
- Hover over a student card
- Click the trash icon
- Confirm deletion

---

#### **Attendance Mode**

**Mark Absent Students**
1. Click the ✅ (check) icon in the sidebar
2. Enter **Attendance Mode**
3. Tap on absent students (they turn gray)
4. Click the check icon again to save and exit

**Why Attendance Matters**
- Absent students are excluded from whole-class point rewards
- Absent students cannot receive individual points
- Only present students are affected by class-wide behaviors

---

#### **Display Options**

**Change Grid Size**
- Click the sliders icon (top right)
- Choose: Compact, Regular, or Spacious
---
**Sort Students**
- Click the up/down arrows icon (top right)
- Sort by: Name (A-Z) or Highest Points
---
**Fullscreen Mode**
- Click the expand icon to show dashboard fullscreen
- Click again to exit

---

*All point changes, student edits, and settings save automatically.*`
    },
    'assignments': {
      title: 'Assignments',
      body: `### Create & Publish Worksheets

**Step 1: Enter Assignment Details**
- Type a title for your worksheet
- Add questions using the right panel

---

#### **Question Type Buttons**

| | |
|---|---|
| 📝 | Free-text responses |
| ☑️ | Students pick from options |
| 🔤 | Type \`[blank]\` where answers go |
| ↔️ | Match items on left to right |
| 📖 | Include a passage with questions |
| ✅ | Simple true or false answers |
| 🔢 | Numbers only |
| ↕️ | Drag parts to reorder sentences |
| 📊 | Categorize items into groups |

---

**Step 2: Add Questions**
- Click a question type button in the right panel
- Type your question
- **Add images:** Click the image icon inside a question
- **Delete questions:** Click the trash icon next to a question

---

**Step 3: Assign & Publish**
- Choose who receives the assignment:
  - **All students** - everyone in the class
  - **Select students** - pick specific students
- Click **Publish to Class**

---

*Empty questions cannot be published. Fill in required fields first.*`
    },
    'Messages & Grading': {
      title: 'Inbox — Review Submissions',
      body: `### Grade Student Work

**View Submissions**
- Click the 💬 (messages) icon in the sidebar
- Two sections appear:
  - **Waiting for Review** - submissions needing grades
  - **Recently Graded** - completed reviews

---

**Grade a Submission**
1. Click any submission in the waiting list
2. View the student's answers on the left
3. Enter points/grade in the input field
4. Click the ✅ (check) icon to save

---

**What Happens After Grading**
- Submission moves to "Recently Graded"
- Grade is added to student's total score
- If you regrade, only the difference is added

---

**Exit Inbox**
- Click the close button (X) to return to dashboard

---

*Use the refresh button if students just submitted new work.*`
    },
    'settings': {
      title: 'Settings',
      body: `### Configure Points cards

 Configure Points cards **Add**, **Edit**, **Remove cards**

#### **Point Cards**

These are the rewards and penalties you give students.

**View**
- Each card shows:
  - Emoji icon
  - Card name (e.g., "Great Work")
  - Type (WOW for positive, NO NO for negative)
  - Point value (+1, +2, -1, etc.)

**Add a Card**
- Click **Add Card** (➕) in the header
- Enter card name
- Choose emoji from the sticker picker
- Set point value (positive or negative)
- Click save

**Edit a Card**
- Click the ✏️ (pencil) icon on any card
- Change name, emoji, or points
- Click save icon (✅)

**Delete a Card**
- Click the 🗑️ (trash) icon on any card
- Confirm deletion

---

#### **Reset to Defaults**
- Click **Reset** (🔄) to restore the original set of point cards
- This replaces all your custom cards

---

*Changes save automatically to all your classes.*`
    },
    'access-codes': {
      title: 'Access Codes',
      body: `### Login Codes for Students & Parents

Every student has two 5-digit codes:

| Code Type | Used By | Purpose |
|------------|-----------|---------|
| Student Code | Students | Log in to Student Portal and complete assignments |
| Parent Code | Parents | View their child's reports and progress |

---

#### **QR Codes**

Each code also displays as a QR code.

**Scan a QR Code**
- Point your phone/tablet camera at the QR code
- Automatically logs into the correct portal
- No typing needed!

**Copy a QR Code**
- Click **Copy QR** button next to any student
- QR code is saved to your clipboard as an image
- Paste into emails, documents, or print for sharing

---

#### **Generated Codes**

- Codes are automatically created when this page opens
- Each student gets unique codes
- Codes are permanent and don't change

---

#### **Copy Text Code**

- Click on any 5-digit code to copy it
- Give the code to parent or student
- They enter it on the login screen

---

*Parents can only view their own child's data. Students can only see assignments sent to them.*`
    },
    'settings-cards': {
      title: 'Point Cards',
      body: `### Customize Reward & Penalty Cards

These are the point cards that appear when giving points to students.

---

#### **Card Types**

**WOW Cards (Positive)**
- Give or add points
- Example: "Team Player" +1, "Great Job" +3
- Displayed in green

**NO NO Cards (Negative)**
- Remove or subtract points
- Example: "Too Loud" -1, "Distracted" -2
- Displayed in red

---

#### **Managing Cards**

**Add New Card**
- Click **Add Card** button (top right)
- Enter card name
- Pick an emoji from the sticker picker (100+ options)
- Set point value
- Click save

**Edit Card**
- Click the pencil icon on any card
- Change name, emoji, or points
- Use the sticker picker to change the emoji
- Click save

**Delete Card**
- Click the trash icon on any card
- Confirm deletion

---

#### **Sticker Picker**

When editing a card, click the emoji icon to open the sticker picker:

**Categories:**
- Stars & Rewards (⭐🏆🏅)
- Celebrations (🎉🎊🔥)
- Fun Characters (🤖👽🦄)
- Sports (⚽🏀🎾)
- Nature (☀️🌈🌳)
- Food (🍎🍕🎂)
- Emotions (😊😍😎)
- Actions (👍👏❤️)
- School & Learning (📚💡🎓)
- And many more!

---

*Use "Reset to Defaults" to restore the original card set.*`
    },
    'whiteboard': {
      title: 'Whiteboard',
      body: `### Draw, Write, and Share

The whiteboard is a blank canvas for classroom activities.

---

#### **Drawing Tools** (right side)

| | |
|---|---|
| ✏️ Pencil | Draw freely on the canvas |
| 🖍️ Highlighter | Transparent color overlay |
| 📝 Text | Type text and press Enter to place |
| 🧹 Eraser | Remove drawings |
| 😊 Emoji | Stamp emojis onto the board |

---

#### **Canvas Options**

**Color Picker**
- 10 preset colors available
- Click any color to select

**Line/Stroke Size**
- Adjust how thick your lines are
- Use slider or buttons

**Font Options**
- Family: Modern, Fun, Elegant, Typewriter, Bold
- Size: Make text larger or smaller

**Add Images**
- Click the image icon
- Upload photos from your device
- Resize and position as needed

---

#### **Actions**

**Export PNG**
- Click to download the whiteboard as an image
- Save anywhere on your computer
- Share with students later

**Clear Canvas**
- Click the trash icon
- Wipes the entire board

---

*Use the whiteboard for math problems, diagrams, brainstorming, or any visual lesson.*`
    },
    'parent-portal': {
      title: 'Parent Portal',
      body: `### View Your Child's Progress

Parents use a 5-digit code to see their child's information.

---

#### **Login**

1. Enter your 5-digit parent code (from your child's teacher)
2. Click **Login**

---

#### **What You'll See**

- Your child's current point total
- Daily behavior chart
- Behavior breakdown (positive vs needs work)
- AI-generated teacher feedback
- Attendance records

---

#### **Time Periods**

Change the view to see data for:
- This week
- This month
- This year

---

#### **Language**

Toggle between English and 中文 to change report language.

---

*Your access is read-only. Only teachers can make changes.*`
    },
    'student-portal': {
      title: 'Student Portal',
      body: `### Complete Assignments & Earn Points

Students log in with a 5-digit code to see their work.

---

#### **Login**

1. Enter your 5-digit student code (from your teacher)
2. Click **Login**

---

#### **Assignments**

You'll see all assignments from your teacher:

**Uncompleted** (shown first)
- Newest to oldest
- These are waiting for you
- Click to open and complete

**Completed** (shown below)
- Newest to oldest
- Already finished
- Can hide from view (click hide button)

---

#### **Complete an Assignment**

1. Click any uncompleted assignment
2. Answer all questions
3. Click **Submit**
4. Your work is sent to your teacher
5. You'll get your grade soon!

---

#### **Your Stats**

At the top of the page, you can see:
- **Total Points** - All points you've earned
- **Completed** - Number of assignments done
- **To-Do** - Assignments waiting for you

---

*Refresh the page if your teacher just sent a new assignment.*`
    },
    'inbox': {
      title: 'Messages & Grading',
      body: `### Review & Grade Student Submissions

---

#### **Two Sections**

**Waiting for Review**
- These are new submissions from students
- Click any submission to view answers
- Enter a grade and click save

**Recently Graded**
- These are submissions you've already graded
- Click to review what you gave
- Can regrade if needed

---

#### **Grading Workflow**

1. Click a submission from the waiting list
2. See student answers on the left panel
3. Enter points/grade in the field
4. Click the ✅ icon to save
5. Grade is added to student's total score
6. Submission moves to "Recently Graded"

---

#### **Regading**

If you need to change a grade:
- Click the submission again
- Enter the new grade
- Click save
- Only the difference is added/subtracted

---

#### **Exit**

Click the **X** or close button to return to the dashboard.

---

*The badge on the messages icon shows how many submissions are waiting for review.*`
    },
    'lesson-planner': {
      title: 'Lesson Planner',
      body: `### Plan Your Lessons

Create and organize lessons with calendars and templates.

---

#### **Getting Started**

**Open Lesson Planner**
- From the Teacher Portal, click **Lesson Planner** (or the calendar icon)
- You'll see your monthly view and any saved templates

**Monthly View**
- See all days of the month at a glance
- Click a day to add or edit lessons
- Use arrows to change month

---

#### **Templates**

**Use a Template**
- Pick a template to structure your week or day
- Fill in subjects and activities
- Save to apply the plan to your calendar

**Create Your Own**
- Build custom templates for your schedule
- Reuse them across weeks or months

---

#### **Tips**

- Plan ahead for the whole month
- Duplicate a week to save time
- Export or print your plan if needed

---

*Lesson plans are saved automatically.*`
    },
    'games': {
      title: 'Games',
      body: `### Classroom Games

Play fun games with your class: Tornado, Memory Match, Quiz, and more.

---

#### **Opening Games**

**From the Portal**
- On the Teacher Portal, click **Games** (or the game controller icon)
- Choose a game from the list

**From the Dashboard**
- Some games can be launched from the class dashboard sidebar
- Lucky Draw is in the sidebar; full games open from the portal

---

#### **Game Types**

**Tornado**
- Spin the wheel to pick students or options
- Great for random selection and rewards

**Memory Match**
- Flip cards to find pairs
- Use your own images or default sets

**Quiz**
- Multiple choice or short answer
- Add your own questions

**Others**
- Face Off, Moto Race, Horse Race, Spell the Word, and more
- Each game has its own rules and setup

---

#### **During the Game**

- Fullscreen mode for class display
- Use the back button to return to the game list or portal

---

*Games work best when the whole class can see the screen.*`
    },
    'games-config': {
      title: 'Games Configuration',
      body: `### Set Up Your Games

Configure game options, images, and content before playing.

---

#### **Where to Configure**

**Before Starting a Game**
- Many games show a setup screen where you choose options
- Set number of players, time limits, or topics

**Tornado / Wheel**
- Add or edit segments (names or options)
- Upload images for custom wheels

**Memory Match**
- Choose or upload image pairs
- Set grid size and difficulty

**Quiz**
- Add questions and correct answers
- Choose question type (multiple choice, true/false, etc.)

---

#### **Saving Settings**

- Options are often saved for the current session
- Reopen the same game to reuse your last setup
- Custom images are stored with your account

---

#### **Tips**

- Test a game once before using it in class
- Use clear, simple images for Memory Match
- Keep quiz questions short for on-screen display

---

*Change settings anytime before you start the game.*`
    },
    'reports': {
      title: 'Reports',
      body: `### View Student Progress & Analytics

This page shows detailed reports and analytics for your students.

---

#### **Time Periods**

Change the time range to view data:
- **Week** - Last 7 days
- **Month** - Last 30 days
- **Year** - Last 12 months

---

#### **Student Selection**

- View reports for all students or select one student
- Use the dropdown to filter by specific student
- Each student shows their individual report card

---

#### **Report Card Contents**

Each student report includes:

**Student Info**
- Name and ID
- Avatar or character image
- Total points earned

**AI Teacher Feedback**
- Automatically generated summary
- Highlights strengths and areas for improvement
- Based on behavior patterns
- Editable by teachers (click Edit button)

**Behavior Distribution Chart**
- Daily points over the selected time period
- Bar chart showing point trends
- Positive behaviors in green
- Negative behaviors in red

**Behavior Ratio**
- Doughnut chart showing positive vs negative
- Visual breakdown of behavior types
- Exact counts for each category

---

#### **Edit Feedback**

Teachers can customize the AI-generated feedback:
- Click **Edit** next to the feedback
- Modify the text as needed
- Click **Save** to keep your changes
- Parents see your edited version

---

#### **Export Options**

**Download PDF**
- Click the PDF button (top right)
- Downloads the report as a PDF file
- Includes all charts and data
- Perfect for printing or sharing

**Print**
- Click the Print button
- Opens print dialog
- Print directly to paper or PDF
- Optimized for A4 paper

---

#### **Language**

Toggle between English and 中文 to change report language for bilingual families.

---

*Reports help teachers track student progress and communicate with parents.*`
    }
  },


  zh: {
    'landing': {
      title: '欢迎使用 ClassABC',
      body: `### 选择您的门户

**教师**
- 点击 **登录** 进入教师门户
- 点击 **免费注册** 创建第一个班级

**学生**
- 点击 **学生** 角色
- 输入老师提供的 5 位代码
- 查看并完成作业

**家长**
- 点击 **家长** 角色
- 输入 5 位家长代码
- 查看孩子的进度报告

---

*登录后，教师会看到班级卡片，点击任何卡片即可进入课堂仪表盘。*`
    },
    'teacher-portal': {
      title: '教师门户',
      body: `### 管理您的班级

**添加班级**
- 点击 **添加班级** 按钮
- 输入班级名称
- 可选添加头像
- 点击保存

**打开班级**
- 点击任何班级卡片进入课堂仪表盘

**编辑或删除**
- 悬停在班级卡片上
- 点击铅笔图标编辑（名称/头像）
- 点击垃圾桶图标删除（需确认）

---

*所有更改会自动保存。*`
    },
    'class-dashboard': {
      title: '课堂仪表盘',
      body: `### 您的主要课堂指挥中心

这是您管理单个班级所有事项的地方。

---

#### **侧边栏工具**

| | |
|---|---|
| 🏠 | 返回班级列表 |
| 📋 | 创建并发送给学生 |
| 💬 | 审阅学生提交并打分 |
| 🎲 | 随机选择学生获奖者 |
| 🏆 | 查看班级里程碑进度 |
| ✅ | 标记学生出勤/缺勤 |
| 🔳 | 查看学生和家长登录代码 |
| 📊 | 查看班级与学生分析 |
| ⏰ | 为活动启动倒计时 |
| 🔔 | 快速吸引班级注意力 |
| 🎨 | 绘制、书写并分享给班级 |
| ⚙️ | 自定义积分卡和选项 |

---

#### **给学生积分**

**单个学生**
- 点击任何学生卡片
- 从弹窗中选择积分卡
- 积分立即发放并显示动画

**全班**
- 点击 **全班** 卡片（网格中的第一张）
- 选择积分卡
- 所有在座学生获得相同积分

---

#### **学生管理**

**添加学生**
- 点击 **添加学生** 按钮（网格底部）
- 输入学生姓名
- 选择头像或上传照片
- 点击保存

**编辑学生**
- 悬停在任何学生卡片上
- 点击铅笔图标
- 更改姓名或头像
- 点击保存

**删除学生**
- 悬停在任何学生卡片上
- 点击垃圾桶图标
- 确认删除

---

#### **考勤模式**

**标记缺勤学生**
1. 点击侧边栏中的 ✅（勾选）图标
2. 进入 **考勤模式**
3. 点击缺勤学生（变为灰色）
4. 再次点击勾选图标保存并退出

**为什么考勤很重要**
- 缺勤学生不参与全班奖励
- 缺勤学生无法获得个人积分
- 只有在座学生受全班行为影响

---

#### **显示选项**

**更改网格大小**
- 点击滑块图标（右上角）
- 选择：紧凑、常规或宽敞

**排序学生**
- 点击上/下箭头图标（右上角）
- 排序方式：姓名（A-Z）或最高积分

**全屏模式**
- 点击展开图标全屏显示仪表盘
- 再次点击退出

---

*所有积分更改、学生编辑和设置都会自动保存。*`
    },
    'assignments': {
      title: '作业',
      body: `### 创建并发布练习

**步骤 1：输入作业详情**
- 输入练习题的标题
- 使用右侧面板添加题目

---

#### **题目类型**

| | |
|---|---|
| 简答题 | 自由文本回答 |
| 选择题 | 从选项中选择 |
| 填空题 | 在答案处输入 \`[blank]\` |
| 连线题 | 将左侧项目与右侧匹配 |
| 阅读理解 | 包含段落和问题 |
| 判断题 | 简单的是/否答案 |
| 数字题 | 仅数字 |
| 句子排序 | 拖动部分重新排序句子 |
| 分类题 | 将项目归类到组别 |

---

**步骤 2：添加题目**
- 点击右侧面板中的题目类型按钮
- 输入您的问题
- **添加图片：** 点击题目中的图片图标
- **删除题目：** 点击题目旁边的垃圾桶图标

---

**步骤 3：分配并发布**
- 选择谁接收作业：
  - **所有学生** - 班级中的每个人
  - **选择学生** - 选择特定学生
- 点击 **发布到班级**

---

*空题目无法发布。先填写必填字段。*`
    },
    'Messages & Grading': {
      title: '消息与评分',
      body: `### 审阅学生提交

**查看提交**
- 点击侧边栏中的 💬（消息）图标
- 出现两个部分：
  - **待审阅** - 需要评分的提交
  - **最近已评分** - 已完成的审阅

---

**评分提交**
1. 点击待审阅列表中的任何提交
2. 在左侧查看学生的答案
3. 在输入字段中输入积分/成绩
4. 点击 ✅（勾选）图标保存

---

**评分后发生什么**
- 提交移动到"最近已评分"
- 积分添加到学生的总分中
- 如果您重新评分，只添加差额

---

**退出收件箱**
- 点击关闭按钮（X）返回仪表盘

---

*如果学生刚刚提交了新作业，请使用刷新按钮。*`
    },
    'settings': {
      title: '设置',
      body: `### 配置您的班级

此页面用于管理班级设置。

---

#### **积分卡**

这些是您给学生提供的奖励和惩罚。

**查看**
- 每张卡片显示：
  - 表情图标
  - 卡片名称（如"做得好"）
  - 类型（WOW 为正分，NO NO 为负分）
  - 积分值（+1、+2、-1 等）

**添加卡片**
- 点击标题中的 **添加卡片**
- 输入卡片名称
- 从贴纸选择器中选择表情符号
- 设置积分值（正或负）
- 点击保存

**编辑卡片**
- 点击任何卡片上的铅笔图标
- 更改名称、表情符号或积分
- 点击保存图标（✅）

**删除卡片**
- 点击任何卡片上的垃圾桶图标
- 确认删除

---

#### **恢复默认值**
- 点击 **重置** 恢复原始积分卡集
- 这将替换所有自定义卡片

---

*更改会自动保存到您的所有班级。*`
    },
    'access-codes': {
      title: '访问码',
      body: `### 学生和家长登录代码

每个学生有两个 5 位代码：

| 代码类型 | 使用者 | 用途 |
|------------|-----------|---------|
| 学生代码 | 学生 | 登录学生门户并完成作业 |
| 家长代码 | 家长 | 查看孩子的报告和进度 |

---

#### **二维码**

每个代码也显示为二维码。

**扫描二维码**
- 用手机/平板相机对准二维码
- 自动登录到正确的门户
- 无需输入！

**复制二维码**
- 点击任何学生旁边的 **复制二维码** 按钮
- 二维码作为图像保存到剪贴板
- 粘贴到电子邮件、文档或打印以分享

---

#### **生成的代码**

- 打开此页面时自动创建代码
- 每个学生获得唯一代码
- 代码是永久的，不会改变

---

#### **复制文本代码**

- 点击任何 5 位代码进行复制
- 将代码提供给家长或学生
- 他们在登录屏幕上输入

---

*家长只能查看自己孩子的数据。学生只能看到发给他们的作业。*`
    },
    'settings-cards': {
      title: '积分卡',
      body: `### 自定义奖励和惩罚卡片

这些是给学生积分时出现的积分卡。

---

#### **卡片类型**

**WOW 卡（正分）**
- 给予或添加积分
- 例如："团队合作者" +1、"做得好" +3
- 以绿色显示

**NO NO 卡（负分）**
- 扣除积分
- 例如："太吵了" -1、"分心了" -2
- 以红色显示

---

#### **管理卡片**

**添加新卡片**
- 点击 **添加卡片** 按钮（右上角）
- 输入卡片名称
- 从贴纸选择器中选择表情符号（100+ 选项）
- 设置积分值
- 点击保存

**编辑卡片**
- 点击任何卡片上的铅笔图标
- 更改名称、表情符号或积分
- 使用贴纸选择器更改表情符号
- 点击保存

**删除卡片**
- 点击任何卡片上的垃圾桶图标
- 确认删除

---

#### **贴纸选择器**

编辑卡片时，点击表情符号图标打开贴纸选择器：

**类别：**
- 星星与奖励（⭐🏆🏅）
- 庆祝（🎉🎊🔥）
- 有趣角色（🤖👽🦄）
- 运动（⚽🏀🎾）
- 自然（☀️🌈🌳）
- 食物（🍎🍕🎂）
- 表情（😊😍😎）
- 动作（👍👏❤️）
- 学校与学习（📚💡🎓）
- 以及更多！

---

*使用"恢复默认值"恢复原始卡片集。*`
    },
    'whiteboard': {
      title: '白板',
      body: `### 绘制、书写和分享

白板是用于课堂活动的空白画布。

---

#### **绘图工具**（右侧）

| | |
|---|---|
| ✏️ 铅笔 | 在画布上自由绘制 |
| 🖍️ 荧光笔 | 半透明颜色覆盖 |
| 📝 文本 | 输入文本并按回车键放置 |
| 🧹 橡皮擦 | 删除绘图 |
| 😊 表情 | 将表情符号印到板上 |

---

#### **画布选项**

**颜色选择器**
- 10 种预设颜色可用
- 点击任何颜色进行选择

**线条/笔触大小**
- 调整线条的粗细
- 使用滑块或按钮

**字体选项**
- 字体系列：现代、趣味、优雅、打字机、粗体
- 大小：使文本更大或更小

**添加图片**
- 点击图片图标
- 从设备上传照片
- 根据需要调整大小和位置

---

#### **操作**

**导出 PNG**
- 点击以将白板下载为图像
- 保存到计算机上的任何位置
- 稍后与学生分享

**清除画布**
- 点击垃圾桶图标
- 擦除整个画布

---

*将白板用于数学题、图表、头脑风暴或任何视觉课程。*`
    },
    'parent-portal': {
      title: '家长门户',
      body: `### 查看孩子的进度

家长使用 5 位代码查看孩子的信息。

---

#### **登录**

1. 输入您的 5 位家长代码（来自孩子的老师）
2. 点击 **登录**

---

#### **您将看到**

- 孩子的当前积分总数
- 每日行为图表
- 行为细分（正分与需改进）
- AI 生成的教师反馈
- 出勤记录

---

#### **时间周期**

更改视图以查看以下数据：
- 本周
- 本月
- 本年

---

#### **语言**

在英语和中文之间切换以更改报告语言。

---

*您的访问是只读的。只有教师可以进行更改。*`
    },
    'student-portal': {
      title: '学生门户',
      body: `### 完成作业并获得积分

学生使用 5 位代码登录查看他们的作业。

---

#### **登录**

1. 输入您的 5 位学生代码（来自老师）
2. 点击 **登录**

---

#### **作业**

您将看到来自老师的所有作业：

**未完成**（首先显示）
- 从新到旧
- 这些在等待您
- 点击打开并完成

**已完成**（下方显示）
- 从新到旧
- 已完成
- 可以隐藏（点击隐藏按钮）

---

#### **完成作业**

1. 点击任何未完成的作业
2. 回答所有问题
3. 点击 **提交**
4. 您的工作发送给老师
5. 您很快就会收到成绩！

---

#### **您的统计**

页面顶部，您可以看到：
- **总积分** - 您获得的所有积分
- **已完成** - 已完成的作业数量
- **待办** - 等待您的作业

---

*如果老师刚刚发送了新作业，请刷新页面。*`
    },
    'inbox': {
      title: '消息与评分',
      body: `### 审阅和评分学生提交

---

#### **两个部分**

**待审阅**
- 这些是来自学生的新提交
- 点击任何提交查看答案
- 输入成绩并点击保存

**最近已评分**
- 这些是您已经评分的提交
- 点击查看您给出的内容
- 如需可以重新评分

---

#### **评分流程**

1. 点击待审阅列表中的提交
2. 在左侧面板查看学生答案
3. 在字段中输入积分/成绩
4. 点击 ✅ 图标保存
5. 积分添加到学生的总分
6. 提交移动到"最近已评分"

---

#### **重新评分**

如果您需要更改成绩：
- 再次点击提交
- 输入新成绩
- 点击保存
- 只添加/减去差额

---

#### **退出**

点击 **X** 或关闭按钮返回仪表盘。

---

*消息图标上的徽章显示有多少提交等待审阅。*`
    },
    'lesson-planner': {
      title: '课程计划',
      body: `### 规划您的课程

使用日历和模板创建和整理课程。

---

#### **入门**

**打开课程计划**
- 在教师门户中点击 **课程计划**（或日历图标）
- 您会看到月视图和已保存的模板

**月视图**
- 一览当月所有日期
- 点击某天添加或编辑课程
- 使用箭头切换月份

---

#### **模板**

**使用模板**
- 选择模板来安排您的一周或一天
- 填写科目和活动
- 保存以将计划应用到日历

**自定义**
- 为您的日程创建自定义模板
- 在周或月中重复使用

---

*课程计划会自动保存。*`
    },
    'games': {
      title: '课堂游戏',
      body: `### 课堂游戏

与班级一起玩趣味游戏： Tornado、记忆配对、测验等。

---

#### **打开游戏**

**从门户**
- 在教师门户点击 **游戏**（或游戏手柄图标）
- 从列表中选择游戏

**游戏类型**
- Tornado：转盘随机选择
- 记忆配对：翻牌配对
- 测验：选择题或简答题
- 其他：Face Off、赛车、拼写等

---

*游戏适合全班一起观看大屏幕。*`
    },
    'games-config': {
      title: '游戏配置',
      body: `### 设置游戏

在开始前配置游戏选项、图片和内容。

---

#### **配置位置**

**开始前**
- 许多游戏在开始前有设置界面
- 设置人数、时间、主题等

**Tornado / 转盘**
- 添加或编辑选项
- 上传自定义图片

**记忆配对**
- 选择或上传图片对
- 设置网格大小

**测验**
- 添加题目和正确答案
- 选择题型

---

*随时在开始游戏前更改设置。*`
    },
    'reports': {
      title: '报告',
      body: `### 查看学生进度与分析

此页面显示学生的详细报告和分析。

---

#### **时间段**

更改时间范围以查看数据：
- **周** - 最近 7 天
- **月** - 最近 30 天
- **年** - 最近 12 个月

---

#### **学生选择**

- 查看所有学生的报告或选择一名学生
- 使用下拉列表筛选特定学生
- 每个学生显示各自的报告卡片

---

#### **报告卡片内容**

每个学生报告包括：

**学生信息**
- 姓名和 ID
- 头像或角色图片
- 获得的总积分

**AI 教师反馈**
- 自动生成的摘要
- 突出优势和需要改进的领域
- 基于行为模式
- 教师可编辑（点击编辑按钮）

**行为分布图表**
- 所选时间段内的每日积分
- 显示积分趋势的柱状图
- 积极行为显示为绿色
- 需要改进的行为显示为红色

**行为比例**
- 显示积极与消极的环形图
- 行为类型的视觉分解
- 每个类别的确切计数

---

#### **编辑反馈**

教师可以自定义 AI 生成的反馈：
- 点击反馈旁边的 **编辑**
- 根据需要修改文本
- 点击 **保存** 保留您的更改
- 家长看到您编辑的版本

---

#### **导出选项**

**下载 PDF**
- 点击 PDF 按钮（右上角）
- 将报告下载为 PDF 文件
- 包含所有图表和数据
- 适合打印或分享

**打印**
- 点击打印按钮
- 打开打印对话框
- 直接打印到纸张或 PDF
- 针对 A4 纸优化

---

#### **语言**

在英语和中文之间切换，为双语家庭更改报告语言。

---

*报告帮助教师跟踪学生进度并与家长沟通。*`
    }
  }
};

/** Get help entry for a page (with fallback to en and inbox alias). */
export function getHelpEntry(guides, lang, pageId) {
  let entry = (guides[lang] && guides[lang][pageId]) || (guides.en && guides.en[pageId]);
  if (!entry && pageId === 'inbox') {
    entry = (guides[lang] && guides[lang]['Messages & Grading']) || (guides.en && guides.en['Messages & Grading']);
  }
  return entry || { title: 'Help', body: 'No help available for this page.' };
}

/** Strip ** from heading text for display and suggestions. */
function stripBold(s) {
  return (s || '').replace(/\*\*/g, '').trim();
}

/** Normalize help body so ** in headings don't show as literal asterisks. */
export function normalizeHelpBody(body) {
  if (!body) return '';
  let out = body
    .replace(/^(#{3,4}\s*)\*\*([^*]*)\*\*/gm, '$1$2');
  return out;
}

/** Parse entry body into sections (by ### or #### headings). Each section has { title, body } with title stripped of **. */
export function parseSections(entry) {
  if (!entry || !entry.body) return [];
  const sections = [];
  const re = /^(#{3,4})\s+(.+)$/gm;
  let lastHeadingEnd = 0;
  let m;
  let lastTitle = null;
  while ((m = re.exec(entry.body)) !== null) {
    const rawTitle = m[2];
    const title = stripBold(rawTitle);
    const thisHeadingEnd = m.index + m[0].length;
    if (lastTitle !== null) {
      const body = entry.body.slice(lastHeadingEnd, m.index).replace(/^\s+|\s+$/g, '');
      sections.push({ title: lastTitle, body: body || '(No content)' });
    }
    lastTitle = title;
    lastHeadingEnd = thisHeadingEnd;
  }
  if (lastTitle !== null) {
    const body = entry.body.slice(lastHeadingEnd).replace(/^\s+|\s+$/g, '');
    sections.push({ title: lastTitle, body: body || '(No content)' });
  }
  return sections;
}

/** Extract suggested questions (section titles, no **). */
export function getSuggestedQuestions(entry) {
  const sections = parseSections(entry);
  return sections.map(s => s.title).slice(0, 12);
}

/** Find the best matching section for a question (keyword overlap). Returns { title, body } or null. */
export function getMatchingSection(entry, question) {
  const sections = parseSections(entry);
  if (!sections.length) return null;
  const q = (question || '').toLowerCase().replace(/[?.,!]/g, '');
  const words = q.split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return null;
  let best = null;
  let bestScore = 0;
  for (const section of sections) {
    const text = (section.title + ' ' + section.body).toLowerCase();
    let score = 0;
    for (const w of words) {
      if (text.includes(w)) score += 1;
      if (section.title.toLowerCase().includes(w)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = section;
    }
  }
  return bestScore > 0 ? best : null;
}

export default HELP_GUIDES;
