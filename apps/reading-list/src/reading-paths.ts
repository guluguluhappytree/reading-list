export interface PathBook {
  title: string;
  author: string;
  reason: string;
}

export interface ReadingPath {
  id: string;
  name: string;
  keywords: string[];
  /** 高权重短语，优先匹配复合目标 */
  priorityKeywords?: string[];
  books: PathBook[];
}

/** 权威书单路径：按知识构建顺序排列，经典/核心著作靠前 */
export const READING_PATHS: ReadingPath[] = [
  {
    id: "chinese-history",
    name: "中国历史通读",
    keywords: ["中国历史", "中国史", "历史", "通史", "古代史", "近代史", "读史"],
    books: [
      { title: "史记", author: "司马迁", reason: "纪传体通史源头，建立中国历史叙述的基本框架" },
      { title: "资治通鉴", author: "司马光", reason: "编年体巨著，理解中国政治兴衰与制度演变" },
      { title: "中国通史", author: "吕思勉", reason: "现代学术视角下的通史入门，脉络清晰" },
      { title: "万历十五年", author: "黄仁宇", reason: "大历史观切入，理解明代政治运作逻辑" },
      { title: "中国近代史", author: "徐中约", reason: "系统梳理近代变革，国际视野下的中国转型" },
      { title: "剑桥中国史", author: "费正清 等", reason: "海外汉学经典，多卷本深入各时期" },
    ],
  },
  {
    id: "mao-thought",
    name: "毛泽东思想与著作",
    keywords: ["毛选", "毛泽东", "毛主席", "革命", "马克思主义中国化"],
    books: [
      { title: "毛泽东选集（一至四卷）", author: "毛泽东", reason: "核心原著，理解思想形成与实践脉络" },
      { title: "实践论", author: "毛泽东", reason: "认识论经典，知行合一的方法论基础" },
      { title: "矛盾论", author: "毛泽东", reason: "辩证法运用，分析复杂问题的思维工具" },
      { title: "论持久战", author: "毛泽东", reason: "战略思维范本，阶段分析与力量转化" },
      { title: "红星照耀中国", author: "埃德加·斯诺", reason: "外部视角记录延安时期，理解历史语境" },
      { title: "毛泽东传", author: "罗斯·特里尔", reason: "传记视角补充，理解人物与时代互动" },
    ],
  },
  {
    id: "western-philosophy",
    name: "西方哲学入门",
    keywords: ["哲学", "西方哲学", "思辨", "存在", "伦理", "认识论"],
    books: [
      { title: "苏菲的世界", author: "乔斯坦·贾德", reason: "小说化哲学史入门，建立整体地图" },
      { title: "理想国", author: "柏拉图", reason: "西方哲学源头，正义与城邦思想基石" },
      { title: "尼各马可伦理学", author: "亚里士多德", reason: "德性伦理经典，幸福与中庸之道" },
      { title: "第一哲学沉思集", author: "笛卡尔", reason: "近代哲学转向，理性怀疑与方法" },
      { title: "纯粹理性批判", author: "康德", reason: "哲学史分水岭，认识界限的系统论证" },
      { title: "西方哲学史", author: "罗素", reason: "清晰叙述哲学发展，适合建立全局观" },
    ],
  },
  {
    id: "psychology",
    name: "心理学体系",
    keywords: ["心理学", "心理", "认知", "行为", "精神", "人格"],
    books: [
      { title: "心理学与生活", author: "理查德·格里格", reason: "权威入门教材，覆盖心理学主要分支" },
      { title: "思考，快与慢", author: "丹尼尔·卡尼曼", reason: "诺贝尔成果通俗化，理解认知偏差" },
      { title: "社会心理学", author: "戴维·迈尔斯", reason: "经典教材，理解群体与个体互动" },
      { title: "梦的解析", author: "弗洛伊德", reason: "精神分析奠基作，理解无意识理论" },
      { title: "人性和人类生存", author: "亚伯拉罕·马斯洛", reason: "需求层次与自我实现理论来源" },
      { title: "影响力", author: "罗伯特·西奥迪尼", reason: "说服与决策心理，应用层面经典" },
    ],
  },
  {
    id: "munger-models",
    name: "芒格多元思维模型",
    keywords: [
      "芒格", "Charlie Munger", "格栅", "latticework", "跨学科", "能力圈",
      "安全边际", "逆向思维", "复利", "误判", "心理倾向",
    ],
    priorityKeywords: [
      "查理芒格", "芒格思维", "芒格的思维模型", "多元思维模型", "思维模型",
      "跨学科思维", "误判心理学", "能力圈", "格栅理论", "穷查理",
    ],
    books: [
      { title: "穷查理宝典", author: "查理·芒格", reason: "【核心】芒格演讲与思想全集：多元思维、能力圈、逆向思考与格栅理论" },
      { title: "探求智慧：从达尔文到芒格", author: "彼得·贝弗林", reason: "【核心】系统整理芒格式思维：误判、进化、概率与决策原则" },
      { title: "富兰克林自传", author: "本杰明·富兰克林", reason: "【榜样】芒格最推崇的人物之一：理性、美德与实用主义实践" },
      { title: "思考，快与慢", author: "丹尼尔·卡尼曼", reason: "【心理学】系统1/系统2，芒格误判心理学清单的现代科学基础" },
      { title: "影响力", author: "罗伯特·西奥迪尼", reason: "【心理学】互惠、承诺、社会认同——芒格「人类误判心理」演讲核心参考" },
      { title: "清醒思考的艺术", author: "罗尔夫·多贝里", reason: "【心理学】52 种思维谬误，快速建立偏差检查清单" },
      { title: "自私的基因", author: "理查德·道金斯", reason: "【生物学】进化与自私/利他，芒格推荐：理解竞争与适应" },
      { title: "物种起源", author: "查尔斯·达尔文", reason: "【生物学】自然选择，芒格：商业竞争与生态位思维的源头" },
      { title: "深奥的简洁", author: "约翰·格里宾", reason: "【物理学/系统】混沌、临界与涌现，芒格亲自推荐" },
      { title: "枪炮、病菌与钢铁", author: "贾雷德·戴蒙德", reason: "【历史/地理】长时段因果链，芒格推荐的大历史视角" },
      { title: "国富论", author: "亚当·斯密", reason: "【经济学】分工、自利与市场，芒格式经济学思维基石" },
      { title: "资本主义、社会主义与民主", author: "约瑟夫·熊彼特", reason: "【经济学】创造性破坏，理解创新与行业更替" },
      { title: "论战略", author: "B. H. 李德·哈特", reason: "【军事/策略】间接路线与战略思维，芒格推崇的「逆向思考」来源" },
      { title: "洛克菲勒传", author: "罗恩·切尔诺", reason: "【传记】芒格推荐：规模、复利与商业帝国构建" },
      { title: "模型思维", author: "斯科特·佩奇", reason: "【数学/模型】多模型并行思考，现代版「思维格栅」操作手册" },
      { title: "随机漫步的傻瓜", author: "纳西姆·塔勒布", reason: "【概率】随机性、幸存者偏差与黑天鹅，与芒格风险观相通" },
      { title: "怎样选择成长股", author: "菲利普·费雪", reason: "【投资】质与量分析，芒格与巴菲特「买好公司」方法论来源" },
      { title: "聪明的投资者", author: "本杰明·格雷厄姆", reason: "【投资】安全边际与内在价值，芒格投资体系的底层框架" },
      { title: "巴菲特致股东的信", author: "沃伦·巴菲特", reason: "【投资】芒格搭档的资本配置与长期主义实践" },
      { title: "崩溃", author: "贾雷德·戴蒙德", reason: "【历史/系统】文明崩溃的多因素模型，系统思维与二阶效应" },
      { title: "第三种黑猩猩", author: "贾雷德·戴蒙德", reason: "【人类学】人类行为与环境的深层逻辑，芒格书单常客" },
      { title: "谈判力", author: "罗杰·费舍尔 / 威廉·尤里", reason: "【实践】Getting to Yes，芒格推荐：利益导向与理性协商" },
    ],
  },
  {
    id: "investment-master",
    name: "投资大师养成记",
    keywords: ["投资", "股票", "证券", "私募", "公募", "基金", "巴菲特", "索罗斯", "达利欧", "林奇"],
    priorityKeywords: [
      "投资专家", "顶级投资", "一级市场", "二级市场", "投资大佬", "投资策略",
      "全球局势", "经济趋势", "把握机会", "价值投资", "宏观对冲", "财务分析",
    ],
    books: [
      { title: "经济学原理", author: "N. 格里高利·曼昆", reason: "【基础】现代经济学标准教材，建立供需、宏观与政策分析框架" },
      { title: "货币金融学", author: "弗雷德里克·米什金", reason: "【基础】理解利率、央行、货币供应与金融体系的权威教材" },
      { title: "国富论", author: "亚当·斯密", reason: "【基础】分工、市场与国民财富的经典原点" },
      { title: "就业、利息和货币通论", author: "约翰·梅纳德·凯恩斯", reason: "【宏观】总需求、流动性偏好与宏观政策思维源头" },
      { title: "原则", author: "瑞·达利欧", reason: "【宏观】经济机器如何运行，债务周期与全天候策略" },
      { title: "债务危机", author: "瑞·达利欧", reason: "【宏观】百年债务危机案例，理解杠杆、泡沫与清算" },
      { title: "时运变迁", author: "乔治·索罗斯", reason: "【宏观】反身性理论与全球宏观对冲实践" },
      { title: "证券分析", author: "本杰明·格雷厄姆 / 戴维·多德", reason: "【价值】价值投资奠基之作，安全边际与内在价值" },
      { title: "聪明的投资者", author: "本杰明·格雷厄姆", reason: "【价值】面向实操的价值投资圣经，巴菲特启蒙之书" },
      { title: "巴菲特致股东的信", author: "沃伦·巴菲特", reason: "【大师】伯克希尔数十年投资哲学与资本配置原则" },
      { title: "穷查理宝典", author: "查理·芒格", reason: "【大师】多元思维模型，跨学科决策与误判心理学" },
      { title: "彼得·林奇的成功投资", author: "彼得·林奇", reason: "【二级】散户如何调研公司、发现十倍股" },
      { title: "怎样选择成长股", author: "菲利普·费雪", reason: "【二级】成长股投资十五原则，质与量并重" },
      { title: "财务报表分析与股票估值", author: "斯蒂芬·佩因曼", reason: "【分析】从财报到估值，二级市场核心硬技能" },
      { title: "手把手教你读财报", author: "唐朝", reason: "【分析】A 股语境下的财报解读与排雷" },
      { title: "思考，快与慢", author: "丹尼尔·卡尼曼", reason: "【心理】认知偏差与决策陷阱，投资心理建设" },
      { title: "动物精神", author: "乔治·阿克洛夫 / 罗伯特·希勒", reason: "【心理】信心、故事与泡沫，理解市场非理性" },
      { title: "反脆弱", author: "纳西姆·塔勒布", reason: "【风控】不确定性中的获益结构，尾部风险思维" },
      { title: "金融炼金术", author: "乔治·索罗斯", reason: "【大师】量子基金操盘实录，宏观交易细节" },
      { title: "venture deals", author: "Brad Feld / Jason Mendelson", reason: "【一级】VC  term sheet、估值与条款，一级市场必读" },
      { title: "从0到1", author: "彼得·蒂尔", reason: "【一级】创业与垄断逻辑，理解初创与风险投资" },
      { title: "剧变", author: "亨利·基辛格", reason: "【全球】地缘政治格局，洞察大国博弈与宏观变量" },
    ],
  },
  {
    id: "economics",
    name: "经济学构建",
    keywords: ["经济学", "宏观经济学", "微观经济学", "经济理论", "经济史", "政治经济学"],
    priorityKeywords: ["学经济", "经济学入门", "宏观微观"],
    books: [
      { title: "经济学原理", author: "N. 格里高利·曼昆", reason: "全球使用最广的入门教材，框架完整" },
      { title: "国富论", author: "亚当·斯密", reason: "现代经济学奠基，分工与市场理论源头" },
      { title: "就业、利息和货币通论", author: "约翰·梅纳德·凯恩斯", reason: "宏观经济学革命性著作" },
      { title: "资本主义、社会主义与民主", author: "约瑟夫·熊彼特", reason: "创造性破坏与创新驱动理论" },
      { title: "资本论（第一卷）", author: "卡尔·马克思", reason: "政治经济学批判，理解资本逻辑" },
      { title: "薛兆丰经济学讲义", author: "薛兆丰", reason: "中文语境下的经济学思维训练" },
      { title: "魔鬼经济学", author: "史蒂芬·列维特", reason: "用数据看经济现象，培养实证思维" },
    ],
  },
  {
    id: "investment",
    name: "投资理财入门",
    keywords: ["理财", "财富自由", "被动收入", "基金定投", "小白理财"],
    priorityKeywords: ["理财入门", "个人理财", "存钱"],
    books: [
      { title: "小狗钱钱", author: "博多·舍费尔", reason: "理财观念启蒙，建立金钱观基础" },
      { title: "漫步华尔街", author: "伯顿·马尔基尔", reason: "市场规律与长期策略，经典入门" },
      { title: "聪明的投资者", author: "本杰明·格雷厄姆", reason: "价值投资圣经，巴菲特启蒙之作" },
      { title: "穷查理宝典", author: "查理·芒格", reason: "多元思维模型，投资与决策智慧" },
      { title: "原则", author: "瑞·达利欧", reason: "系统化决策原则，Bridgewater 创始人" },
      { title: "财务报表分析与股票估值", author: "斯蒂芬·佩因曼", reason: "从财务数据到估值，进阶必读" },
    ],
  },
  {
    id: "management",
    name: "管理与商业",
    keywords: ["管理", "商业", "企业", "领导力", "创业", "组织", "战略"],
    books: [
      { title: "管理的实践", author: "彼得·德鲁克", reason: "现代管理学之父，管理学科奠基" },
      { title: "从0到1", author: "彼得·蒂尔", reason: "创业与创新思维，垄断与竞争策略" },
      { title: "创新者的窘境", author: "克莱顿·克里斯坦森", reason: "颠覆式创新理论，理解企业兴衰" },
      { title: "定位", author: "艾·里斯 / 杰克·特劳特", reason: "营销战略经典，品牌竞争法则" },
      { title: "第五项修炼", author: "彼得·圣吉", reason: "学习型组织，系统思考方法" },
      { title: "基业长青", author: "吉姆·柯林斯", reason: "卓越企业特质研究，长期主义视角" },
    ],
  },
  {
    id: "product",
    name: "产品经理",
    keywords: ["产品", "产品经理", "PM", "用户", "需求", "交互", "UX"],
    books: [
      { title: "启示录", author: "Marty Cagan", reason: "产品管理圣经，打造用户喜爱产品的流程" },
      { title: "用户体验要素", author: "Jesse James Garrett", reason: "UX 五层模型，从战略到表现" },
      { title: "简约至上", author: "Giles Colborne", reason: "交互设计四大策略，简化复杂产品" },
      { title: "上瘾", author: "尼尔·埃亚尔", reason: "习惯养成模型，理解用户留存机制" },
      { title: "俞军产品方法论", author: "俞军", reason: "中国互联网产品实践总结" },
      { title: "决胜B端", author: "杨堃", reason: "B 端产品系统方法论" },
    ],
  },
  {
    id: "franklin-america",
    name: "富兰克林与美国建国",
    keywords: ["富兰克林", "本杰明", "美国", "建国", "启蒙", "自治"],
    books: [
      { title: "富兰克林自传", author: "本杰明·富兰克林", reason: "第一手原著，个人修养与公共精神" },
      { title: "穷理查年鉴", author: "本杰明·富兰克林", reason: "箴言集，实用主义与美德训练" },
      { title: "美国宪法的民主批判", author: "罗伯特·达尔", reason: "理解美国政治制度设计" },
      { title: "常识", author: "托马斯·潘恩", reason: "独立运动思想动员经典" },
      { title: "联邦党人文集", author: "汉密尔顿 等", reason: "宪法解释与建国理念阐述" },
      { title: "美国史", author: "艾伦·布林克利", reason: "通史视角理解建国与发展" },
    ],
  },
  {
    id: "chinese-classics",
    name: "中国古典典籍",
    keywords: ["古典", "国学", "儒家", "道家", "诸子", "古籍", "经典"],
    books: [
      { title: "论语", author: "孔子及其弟子", reason: "儒家核心，仁义礼智信的源头" },
      { title: "道德经", author: "老子", reason: "道家根本经典，无为与辩证智慧" },
      { title: "孟子", author: "孟子", reason: "性善论与仁政思想展开" },
      { title: "庄子", author: "庄子", reason: "逍遥与齐物，拓展精神境界" },
      { title: "孙子兵法", author: "孙武", reason: "战略思维源头，竞争与博弈" },
      { title: "菜根谭", author: "洪应明", reason: "修身处世箴言，日常修养指南" },
    ],
  },
  {
    id: "literature",
    name: "文学经典",
    keywords: ["文学", "小说", "名著", "经典文学", "诗歌", "散文"],
    books: [
      { title: "如何阅读一本书", author: "莫提默·艾德勒", reason: "阅读方法论，任何主题的元技能" },
      { title: "红楼梦", author: "曹雪芹", reason: "中国古典小说巅峰，社会与人性百科全书" },
      { title: "百年孤独", author: "加西亚·马尔克斯", reason: "魔幻现实主义代表，叙事艺术高峰" },
      { title: "战争与和平", author: "列夫·托尔斯泰", reason: "史诗级巨著，历史与个体命运交织" },
      { title: "卡拉马佐夫兄弟", author: "陀思妥耶夫斯基", reason: "思想深度与心理刻画极致" },
      { title: "西方正典", author: "哈罗德·布鲁姆", reason: "文学经典地图，指导深度阅读" },
    ],
  },
  {
    id: "writing",
    name: "写作与表达",
    keywords: ["写作", "文案", "表达", "修辞", "叙事", "非虚构"],
    books: [
      { title: "风格的要素", author: "威廉·斯特伦克", reason: "英文写作规范经典，简洁原则" },
      { title: "写作这回事", author: "斯蒂芬·金", reason: "小说写作实践与心路历程" },
      { title: "故事", author: "罗伯特·麦基", reason: "编剧圣经，叙事结构与人物弧光" },
      { title: "非虚构写作指南", author: "珍·哈里斯", reason: "纪实写作方法与伦理" },
      { title: "金字塔原理", author: "芭芭拉·明托", reason: "结构化表达，商务写作基础" },
      { title: "让创意更有黏性", author: "奇普·希思", reason: "好创意六原则，传播与记忆" },
    ],
  },
  {
    id: "science",
    name: "科学与通识",
    keywords: ["科学", "物理", "生物", "宇宙", "通识", "科普", "自然"],
    books: [
      { title: "时间简史", author: "史蒂芬·霍金", reason: "宇宙学科普经典，时空观念入门" },
      { title: "物种起源", author: "查尔斯·达尔文", reason: "进化论奠基，改变人类自我认知" },
      { title: "上帝掷骰子吗", author: "曹天元", reason: "量子力学史话，中文科普佳作" },
      { title: "从一到无穷大", author: "乔治·伽莫夫", reason: "数学与物理趣味入门" },
      { title: "人类简史", author: "尤瓦尔·赫拉利", reason: "宏观视角理解人类发展" },
      { title: "科学革命的结构", author: "托马斯·库恩", reason: "范式转换理论，理解科学进步" },
    ],
  },
  {
    id: "programming",
    name: "计算机与编程",
    keywords: ["编程", "计算机", "代码", "软件", "算法", "开发", "程序员"],
    books: [
      { title: "计算机科学导论", author: "J. Glenn Brookshear", reason: "全局地图，理解计算机科学全貌" },
      { title: "代码大全", author: "史蒂夫·麦康奈尔", reason: "软件构建实践圣经" },
      { title: "算法导论", author: "Cormen 等", reason: "算法领域权威教材" },
      { title: "设计模式", author: "GoF", reason: "面向对象设计经典模式" },
      { title: "人月神话", author: "弗雷德里克·布鲁克斯", reason: "软件工程管理经典洞见" },
      { title: "深入理解计算机系统", author: "Bryant & O'Hallaron", reason: "从程序到系统，底层贯通" },
    ],
  },
  {
    id: "self-growth",
    name: "自我成长",
    keywords: ["成长", "习惯", "自律", "效率", "认知", "精进", "人生"],
    books: [
      { title: "高效能人士的七个习惯", author: "史蒂芬·柯维", reason: "个人效能经典框架，由内而外的习惯" },
      { title: "刻意练习", author: "安德斯·艾利克森", reason: "技能习得科学，打破天赋迷思" },
      { title: "心流", author: "米哈里·契克森米哈赖", reason: "最优体验心理学，专注与幸福" },
      { title: "终身成长", author: "卡罗尔·德韦克", reason: "固定型与成长型思维，心态决定高度" },
      { title: "曾国藩家书", author: "曾国藩", reason: "中国传统语境下的修身实践" },
      { title: "沉思录", author: "马可·奥勒留", reason: "斯多葛哲学实践，内心秩序与责任" },
    ],
  },
];

export const FALLBACK_BOOKS: PathBook[] = [
  { title: "如何阅读一本书", author: "莫提默·艾德勒", reason: "建立系统化阅读方法，适合任何主题" },
  { title: "人类简史", author: "尤瓦尔·赫拉利", reason: "拓宽视野，理解知识在大历史中的位置" },
  { title: "苏菲的世界", author: "乔斯坦·贾德", reason: "哲学史入门，训练思辨与追问" },
  { title: "思考，快与慢", author: "丹尼尔·卡尼曼", reason: "认知科学经典，提升决策质量" },
  { title: "穷查理宝典", author: "查理·芒格", reason: "多元思维模型，跨学科知识构建" },
];
