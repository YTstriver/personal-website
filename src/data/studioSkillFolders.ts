export interface StudioSkillFolderItem {
  id: string;
  label: string;
  src: string;
  thumbnailSrc?: string;
  alt: string;
  aspectRatio?: number;
  description?: string;
}

export interface StudioSkillFolder {
  id: string;
  title: string;
  tone: string;
  kind: 'documents' | 'icons';
  items: StudioSkillFolderItem[];
}

// Folder names and supplied assets follow the owner's material library.
// AI additions are editable tool examples, with no inferred proficiency ratings.
// Only document folders support enlarging their complete images.
export const studioSkillFolders: StudioSkillFolder[] = [
  {
    "id": "projects",
    "title": "项目业绩及奖项",
    "tone": "#a96c43",
    "kind": "documents",
    "items": [
      {
        "id": "projects-nanjing-bonded-rd-building",
        "label": "南京综合保税区研发楼项目",
        "src": "/images/skills/folders/projects/nanjing-bonded-rd-building.webp",
        "thumbnailSrc": "/images/skills/folders/projects/nanjing-bonded-rd-building-thumb.webp",
        "alt": "南京综合保税区研发楼项目图片",
        "aspectRatio": 1.50058617
      },
      {
        "id": "projects-award-01",
        "label": "QC成果 · 南京市 I 类成果",
        "src": "/images/skills/folders/projects/award-01.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-01-thumb.webp",
        "alt": "QC成果 · 南京市 I 类成果图片",
        "aspectRatio": 1.4427673
      },
      {
        "id": "projects-award-02",
        "label": "QC成果 · 江苏省 II 类成果",
        "src": "/images/skills/folders/projects/award-02.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-02-thumb.webp",
        "alt": "QC成果 · 江苏省 II 类成果图片",
        "aspectRatio": 0.70520833
      },
      {
        "id": "projects-award-08",
        "label": "优秀施工方案 · 二等奖",
        "src": "/images/skills/folders/projects/award-08.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-08-thumb.webp",
        "alt": "优秀施工方案 · 二等奖图片",
        "aspectRatio": 1.4159292
      },
      {
        "id": "projects-award-09",
        "label": "省级安装行业工法",
        "src": "/images/skills/folders/projects/award-09.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-09-thumb.webp",
        "alt": "省级安装行业工法图片",
        "aspectRatio": 1.4159292
      },
      {
        "id": "projects-award-10",
        "label": "南京市优质结构工程",
        "src": "/images/skills/folders/projects/award-10.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-10-thumb.webp",
        "alt": "南京市优质结构工程图片",
        "aspectRatio": 1.41488578
      },
      {
        "id": "projects-award-11",
        "label": "省标化工地二星",
        "src": "/images/skills/folders/projects/award-11.webp",
        "thumbnailSrc": "/images/skills/folders/projects/award-11-thumb.webp",
        "alt": "省标化工地二星图片",
        "aspectRatio": 1.41488578
      },
      {
        "id": "projects-paper-second-prize",
        "label": "优秀论文 · 二等奖",
        "src": "/images/skills/folders/projects/paper-second-prize.webp",
        "thumbnailSrc": "/images/skills/folders/projects/paper-second-prize-thumb.webp",
        "alt": "预制结构柱现场施工质量控制技术论文二等奖证书",
        "aspectRatio": 1.41528508
      }
    ]
  },
  {
    "id": "bim",
    "title": "BIM证书及奖项",
    "tone": "#907753",
    "kind": "documents",
    "items": [
      {
        "id": "bim-award-01",
        "label": "中国建设工程BIM大赛 · 一类成果",
        "src": "/images/skills/folders/bim/award-01.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-01-thumb.webp",
        "alt": "中国建设工程BIM大赛 · 一类成果图片",
        "aspectRatio": 0.70677083
      },
      {
        "id": "bim-award-04",
        "label": "江苏省BIM应用大赛 · 一类成果",
        "src": "/images/skills/folders/bim/award-04.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-04-thumb.webp",
        "alt": "江苏省BIM应用大赛 · 一类成果图片",
        "aspectRatio": 0.71875
      },
      {
        "id": "bim-award-05",
        "label": "第六届全国BIM大赛 · 一类成果",
        "src": "/images/skills/folders/bim/award-05.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-05-thumb.webp",
        "alt": "第六届全国BIM大赛 · 一类成果图片",
        "aspectRatio": 0.72083333
      },
      {
        "id": "bim-award-07",
        "label": "江苏省BIM应用大赛 · 二类成果",
        "src": "/images/skills/folders/bim/award-07.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-07-thumb.webp",
        "alt": "江苏省BIM应用大赛 · 二类成果图片",
        "aspectRatio": 0.70677083
      },
      {
        "id": "bim-award-08",
        "label": "BIM高级建模师 · 建筑设计",
        "src": "/images/skills/folders/bim/award-08.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-08-thumb.webp",
        "alt": "BIM高级建模师 · 建筑设计图片",
        "aspectRatio": 0.70677083
      },
      {
        "id": "bim-award-09",
        "label": "BIM高级建模师 · 设备设计",
        "src": "/images/skills/folders/bim/award-09.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-09-thumb.webp",
        "alt": "BIM高级建模师 · 设备设计图片",
        "aspectRatio": 0.70677083
      },
      {
        "id": "bim-award-10",
        "label": "BIM高级建模师 · 结构设计",
        "src": "/images/skills/folders/bim/award-10.webp",
        "thumbnailSrc": "/images/skills/folders/bim/award-10-thumb.webp",
        "alt": "BIM高级建模师 · 结构设计图片",
        "aspectRatio": 0.70572917
      },
      {
        "id": "bim-jianghai-second-first-prize",
        "label": "第二届江海杯 · 一等奖",
        "src": "/images/skills/folders/bim/jianghai-second-first-prize.webp",
        "thumbnailSrc": "/images/skills/folders/bim/jianghai-second-first-prize-thumb.webp",
        "alt": "南通市第二届江海杯BIM技术应用大赛综合组一等奖证书",
        "aspectRatio": 1.41504854
      },
      {
        "id": "bim-jianghai-third-first-prize",
        "label": "第三届江海杯 · 一等奖",
        "src": "/images/skills/folders/bim/jianghai-third-first-prize.webp",
        "thumbnailSrc": "/images/skills/folders/bim/jianghai-third-first-prize-thumb.webp",
        "alt": "南通市第三届江海杯BIM技术应用大赛综合组一等奖证书",
        "aspectRatio": 1.41616039
      }
    ]
  },
  {
    "id": "software",
    "title": "软件技能",
    "tone": "#b08853",
    "kind": "icons",
    "items": [
      {
        "id": "blender",
        "label": "Blender",
        "src": "/images/skills/folders/software/blender.png",
        "thumbnailSrc": "/images/skills/folders/software/blender.png",
        "alt": "Blender图标",
        "aspectRatio": 1
      },
      {
        "id": "cad",
        "label": "AutoCAD",
        "src": "/images/skills/folders/software/cad.png",
        "thumbnailSrc": "/images/skills/folders/software/cad.png",
        "alt": "AutoCAD图标",
        "aspectRatio": 1
      },
      {
        "id": "cityengine",
        "label": "CityEngine",
        "src": "/images/skills/folders/software/cityengine.png",
        "thumbnailSrc": "/images/skills/folders/software/cityengine.png",
        "alt": "CityEngine图标",
        "aspectRatio": 1
      },
      {
        "id": "d5-render",
        "label": "D5 Render",
        "src": "/images/skills/folders/software/d5-render.png",
        "thumbnailSrc": "/images/skills/folders/software/d5-render.png",
        "alt": "D5 Render图标",
        "aspectRatio": 1
      },
      {
        "id": "davinci",
        "label": "DaVinci Resolve",
        "src": "/images/skills/folders/software/davinci.png",
        "thumbnailSrc": "/images/skills/folders/software/davinci.png",
        "alt": "DaVinci Resolve图标",
        "aspectRatio": 1
      },
      {
        "id": "photoshop",
        "label": "Photoshop",
        "src": "/images/skills/folders/software/photoshop.png",
        "thumbnailSrc": "/images/skills/folders/software/photoshop.png",
        "alt": "Photoshop图标",
        "aspectRatio": 1
      },
      {
        "id": "premiere",
        "label": "Premiere Pro",
        "src": "/images/skills/folders/software/premiere.png",
        "thumbnailSrc": "/images/skills/folders/software/premiere.png",
        "alt": "Premiere Pro图标",
        "aspectRatio": 1
      },
      {
        "id": "qgis",
        "label": "QGIS",
        "src": "/images/skills/folders/software/qgis.png",
        "thumbnailSrc": "/images/skills/folders/software/qgis.png",
        "alt": "QGIS图标",
        "aspectRatio": 1
      },
      {
        "id": "revit",
        "label": "Revit",
        "src": "/images/skills/folders/software/revit.png",
        "thumbnailSrc": "/images/skills/folders/software/revit.png",
        "alt": "Revit图标",
        "aspectRatio": 1
      },
      {
        "id": "rhino",
        "label": "Rhino",
        "src": "/images/skills/folders/software/rhino.png",
        "thumbnailSrc": "/images/skills/folders/software/rhino.png",
        "alt": "Rhino图标",
        "aspectRatio": 1
      },
      {
        "id": "sketchup",
        "label": "SketchUp",
        "src": "/images/skills/folders/software/sketchup.png",
        "thumbnailSrc": "/images/skills/folders/software/sketchup.png",
        "alt": "SketchUp图标",
        "aspectRatio": 1
      },
      {
        "id": "unreal-engine",
        "label": "Unreal Engine",
        "src": "/images/skills/folders/software/unreal-engine.png",
        "thumbnailSrc": "/images/skills/folders/software/unreal-engine.png",
        "alt": "Unreal Engine图标",
        "aspectRatio": 1
      }
    ]
  },
  {
    "id": "ai",
    "title": "Ai协同技能",
    "tone": "#948158",
    "kind": "icons",
    "items": [
      {
        "id": "chatgpt",
        "label": "ChatGPT",
        "src": "/images/skills/folders/ai/chatgpt.png",
        "thumbnailSrc": "/images/skills/folders/ai/chatgpt.png",
        "alt": "ChatGPT图标",
        "aspectRatio": 1,
        "description": "构思整理、提示词沟通与内容协作。"
      },
      {
        "id": "claude",
        "label": "Claude",
        "src": "/images/skills/folders/ai/claude.svg",
        "thumbnailSrc": "/images/skills/folders/ai/claude.svg",
        "alt": "Claude图标",
        "aspectRatio": 1,
        "description": "长文阅读、资料梳理与表达推敲。"
      },
      {
        "id": "comfyui",
        "label": "ComfyUI",
        "src": "/images/skills/folders/ai/comfyui.png",
        "thumbnailSrc": "/images/skills/folders/ai/comfyui.png",
        "alt": "ComfyUI图标",
        "aspectRatio": 1,
        "description": "以节点流程组织图像与视觉实验。"
      },
      {
        "id": "gemini",
        "label": "Gemini",
        "src": "/images/skills/folders/ai/gemini.png",
        "thumbnailSrc": "/images/skills/folders/ai/gemini.png",
        "alt": "Gemini图标",
        "aspectRatio": 1,
        "description": "多模态参考、信息整理与创意探索。"
      },
      {
        "id": "cursor",
        "label": "Cursor",
        "src": "/images/skills/folders/ai/cursor.png",
        "thumbnailSrc": "/images/skills/folders/ai/cursor.png",
        "alt": "Cursor图标",
        "aspectRatio": 1,
        "description": "面向代码编辑与交互原型的协作工具。"
      },
      {
        "id": "github",
        "label": "GitHub",
        "src": "/images/skills/folders/ai/github.svg",
        "thumbnailSrc": "/images/skills/folders/ai/github.svg",
        "alt": "GitHub图标",
        "aspectRatio": 1,
        "description": "版本管理、项目协作与开源资源探索。"
      },
      {
        "id": "tapnow",
        "label": "TapNow",
        "src": "/images/skills/folders/ai/tapnow.webp",
        "thumbnailSrc": "/images/skills/folders/ai/tapnow.webp",
        "alt": "TapNow图标",
        "aspectRatio": 1,
        "description": "在创作画布中组织图像、视频与分镜工作流。"
      },
      {
        "id": "lm-studio",
        "label": "LM Studio",
        "src": "/images/skills/folders/ai/lm-studio.svg",
        "thumbnailSrc": "/images/skills/folders/ai/lm-studio.svg",
        "alt": "LM Studio图标",
        "aspectRatio": 1,
        "description": "本地模型运行、对话测试与离线资料协作。"
      },
      {
        "id": "obsidian",
        "label": "Obsidian",
        "src": "/images/skills/folders/ai/obsidian.svg",
        "thumbnailSrc": "/images/skills/folders/ai/obsidian.svg",
        "alt": "Obsidian图标",
        "aspectRatio": 1,
        "description": "以双向链接组织笔记、知识资料与学习记录。"
      }
    ]
  },
  {
    "id": "sport",
    "title": "运动技能",
    "tone": "#80866a",
    "kind": "icons",
    "items": [
      {
        "id": "running",
        "label": "跑步",
        "src": "/images/skills/folders/sport/running-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/running-pictogram.png",
        "alt": "跑步运动图标",
        "aspectRatio": 1
      },
      {
        "id": "swimming",
        "label": "游泳",
        "src": "/images/skills/folders/sport/swimming-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/swimming-pictogram.png",
        "alt": "游泳运动图标",
        "aspectRatio": 1
      },
      {
        "id": "cycling",
        "label": "骑行",
        "src": "/images/skills/folders/sport/cycling-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/cycling-pictogram.png",
        "alt": "骑行运动图标",
        "aspectRatio": 1
      },
      {
        "id": "mountaineering",
        "label": "登山",
        "src": "/images/skills/folders/sport/mountaineering-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/mountaineering-pictogram.png",
        "alt": "登山运动图标",
        "aspectRatio": 1
      },
      {
        "id": "hiking",
        "label": "徒步",
        "src": "/images/skills/folders/sport/hiking-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/hiking-pictogram.png",
        "alt": "徒步运动图标",
        "aspectRatio": 1
      },
      {
        "id": "badminton",
        "label": "羽毛球",
        "src": "/images/skills/folders/sport/badminton-pictogram.png",
        "thumbnailSrc": "/images/skills/folders/sport/badminton-pictogram.png",
        "alt": "羽毛球运动图标",
        "aspectRatio": 1
      }
    ]
  }
];
