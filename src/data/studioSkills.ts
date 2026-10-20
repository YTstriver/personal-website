export type SkillIconName = 'building' | 'business' | 'award' | 'box' | 'film' | 'camera' | 'sparkles' | 'message' | 'image' | 'code' | 'workflow' | 'run' | 'swim' | 'mountain' | 'hike' | 'bike' | 'horse' | 'racket';
export interface StudioSkill { id: string; label: string; description: string; icon: SkillIconName; image: string; imagePosition?: string; gallery?: Array<{ src: string; alt: string; aspectRatio: number }>; }
export interface StudioSkillBranch { id: string; title: string; subtitle: string; tone: string; skills: StudioSkill[]; }

// Owner-provided professional and sports skills; AI entries are editable draft descriptions.
// No experience duration, award names or proficiency ratings are inferred.
export const studioSkillBranches: StudioSkillBranch[] = [
  {
    id: 'professional', title: '专业技能', subtitle: '从现场到数字空间', tone: '#9b5935',
    skills: [
      {
        id: 'management', label: '项目业绩及奖项', description: '从项目现场到团队协同，推进工程任务的落地。', icon: 'business', image: '/images/skills/projects/nanjing-bonded-rd-building.webp',
        gallery: [
          { src: '/images/skills/projects/nanjing-bonded-rd-building.webp', alt: '南京综合保税区研发楼项目航拍图', aspectRatio: 1280 / 853 },
          { src: '/images/skills/projects/award-01.jpg', alt: '南京市工程建设质量管理小组活动 I 类成果荣誉证书', aspectRatio: 1147 / 795 },
          { src: '/images/skills/projects/award-02.webp', alt: '江苏省工程建设质量管理小组活动 II 类成果评价证书', aspectRatio: 1354 / 1920 },
          { src: '/images/skills/projects/award-08.webp', alt: '江苏省建筑业优秀施工方案二等奖荣誉证书', aspectRatio: 1920 / 1356 },
          { src: '/images/skills/projects/award-09.webp', alt: '安装行业工法证书（省级）', aspectRatio: 1920 / 1356 },
          { src: '/images/skills/projects/award-10.webp', alt: '南京市优质结构工程证书', aspectRatio: 1920 / 1357 },
          { src: '/images/skills/projects/award-11.webp', alt: '建筑施工安全生产标准化优秀等次评定通知书', aspectRatio: 1920 / 1357 },
        ],
      },
      { id: 'bim', label: 'BIM证书及奖项', description: '工程数字化实践、模型协同与 BIM 项目成果。', icon: 'award', image: '/images/skills/engineering.svg' },
    ],
  },
  {
    id: 'software', title: '软件技能', subtitle: '把构思变成作品', tone: '#89704f',
    skills: [
      { id: 'sketchup', label: 'SketchUp', description: 'SketchUp（SU）：空间构思、方案建模与三维表达。', icon: 'box', image: '/images/skills/modeling.svg' },
      { id: 'revit', label: 'Revit', description: '工程模型、专业协同与建筑信息表达。', icon: 'building', image: '/images/skills/modeling.svg' },
      { id: 'blender', label: 'Blender', description: '三维创作、材质光影与动态实验。', icon: 'film', image: '/images/posters/cubic-domain.jpg' },
      { id: 'rhino', label: 'Rhino', description: '曲面建模、形态探索与空间设计。', icon: 'box', image: '/images/skills/modeling.svg' },
    ],
  },
  {
    id: 'ai', title: 'Ai协同技能', subtitle: '让灵感继续生长', tone: '#8b7546',
    skills: [
      { id: 'prompting', label: '提示词设计', description: '把创作意图变成清晰的表达。', icon: 'message', image: '/images/skills/ai-workflow.svg' },
      { id: 'visual', label: '视觉共创', description: '借助 AI 探索图像、分镜与视频创意。', icon: 'image', image: '/images/skills/ai-workflow.svg' },
      { id: 'coding', label: '代码协作', description: '与 AI 一起实现网页交互，并持续检查与优化。', icon: 'code', image: '/images/skills/ai-workflow.svg' },
      { id: 'workflow', label: '流程整合', description: '连接设计与制作工具，整理可复用的创作流程。', icon: 'workflow', image: '/images/skills/ai-workflow.svg' },
    ],
  },
  {
    id: 'sport', title: '运动技能', subtitle: '保持探索与活力', tone: '#68704f',
    skills: [
      { id: 'running', label: '跑步', description: '用步伐与呼吸，找到自己的节奏。', icon: 'run', image: '/photos/optimized/thumb/wuhan-06.jpg' },
      { id: 'swimming', label: '游泳', description: '在水中感受身体、呼吸与节奏的配合。', icon: 'swim', image: '/photos/optimized/thumb/wuhan-13.jpg' },
      { id: 'cycling', label: '骑行', description: '用车轮探索道路与城市边界。', icon: 'bike', image: '/photos/optimized/thumb/wuhan-12.jpg' },
      { id: 'climbing', label: '登山', description: '走向山脊，在攀升中探索更远的风景。', icon: 'mountain', image: '/photos/optimized/thumb/wuhan-11.jpg' },
      { id: 'hiking', label: '徒步', description: '沿着山径，感受步伐与自然。', icon: 'hike', image: '/photos/optimized/thumb/wuhan-05.jpg' },
      { id: 'badminton', label: '羽毛球', description: '在球场上保持专注与身体活力。', icon: 'racket', image: '/images/skills/badminton.svg' },
    ],
  },
];
