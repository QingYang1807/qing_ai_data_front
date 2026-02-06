// 默认菜单配置
const defaultMenu = [
  {
    permissionCode: 'dashboard',
    permissionName: '仪表盘',
    path: '/dashboard',
    component: 'Dashboard',
    icon: 'DashboardOutlined',
    children: []
  },
  {
    permissionCode: 'datasource',
    permissionName: '数据源管理',
    path: '/dashboard/datasource',
    component: 'DataSource',
    icon: 'DatabaseOutlined',
    children: []
  },
  {
    permissionCode: 'collect',
    permissionName: '数据采集',
    path: '/dashboard/collect',
    component: 'Collect',
    icon: 'CloudDownloadOutlined',
    children: []
  },
  {
    permissionCode: 'cleaning',
    permissionName: '数据清洗',
    path: '/dashboard/cleaning',
    component: 'Cleaning',
    icon: 'FilterOutlined',
    children: []
  },
  {
    permissionCode: 'dataset',
    permissionName: '数据集管理',
    path: '/dashboard/dataset',
    component: 'Dataset',
    icon: 'FolderOutlined',
    children: []
  },
  {
    permissionCode: 'processing',
    permissionName: '数据处理',
    path: '/dashboard/processing',
    component: 'Processing',
    icon: 'ToolOutlined',
    children: []
  },
  {
    permissionCode: 'annotation',
    permissionName: '数据标注',
    path: '/dashboard/annotation',
    component: 'Annotation',
    icon: 'TagOutlined',
    children: []
  },
  {
    permissionCode: 'augment',
    permissionName: '数据增强',
    path: '/dashboard/augment',
    component: 'Augment',
    icon: 'PlusOutlined',
    children: []
  },
  {
    permissionCode: 'synthesis',
    permissionName: '数据合成',
    path: '/dashboard/synthesis',
    component: 'Synthesis',
    icon: 'MergeCellsOutlined',
    children: []
  },
  {
    permissionCode: 'evaluation',
    permissionName: '数据评估',
    path: '/dashboard/evaluation',
    component: 'Evaluation',
    icon: 'BarChartOutlined',
    children: []
  },
  {
    permissionCode: 'conversion',
    permissionName: '格式转换',
    path: '/dashboard/conversion',
    component: 'Conversion',
    icon: 'SyncOutlined',
    children: []
  },
  {
    permissionCode: 'feeding',
    permissionName: '数据投喂',
    path: '/dashboard/feeding',
    component: 'Feeding',
    icon: 'CloudServerOutlined',
    children: []
  },
  {
    permissionCode: 'training',
    permissionName: '训练迭代',
    path: '/dashboard/training',
    component: 'Training',
    icon: 'RocketOutlined',
    children: []
  },
  {
    permissionCode: 'reflow',
    permissionName: '数据回流',
    path: '/dashboard/reflow',
    component: 'Reflow',
    icon: 'ReloadOutlined',
    children: []
  },
  {
    permissionCode: 'compliance',
    permissionName: '合规检查',
    path: '/dashboard/compliance',
    component: 'Compliance',
    icon: 'SafetyOutlined',
    children: []
  },
  {
    permissionCode: 'transaction',
    permissionName: '事务管理',
    path: '/dashboard/transaction',
    component: 'Transaction',
    icon: 'TransactionOutlined',
    children: []
  },
  {
    permissionCode: 'rating',
    permissionName: '数据评级',
    path: '/dashboard/rating',
    component: 'Rating',
    icon: 'StarOutlined',
    children: []
  },
  {
    permissionCode: 'privacy',
    permissionName: '隐私保护',
    path: '/dashboard/privacy',
    component: 'Privacy',
    icon: 'LockOutlined',
    children: []
  },
  {
    permissionCode: 'desensitization',
    permissionName: '数据脱敏',
    path: '/dashboard/desensitization',
    component: 'Desensitization',
    icon: 'EyeInvisibleOutlined',
    children: []
  },
  {
    permissionCode: 'audit',
    permissionName: '审计日志',
    path: '/dashboard/audit',
    component: 'Audit',
    icon: 'FileTextOutlined',
    children: []
  },
  {
    permissionCode: 'overview',
    permissionName: '概览统计',
    path: '/dashboard/overview',
    component: 'Overview',
    icon: 'PieChartOutlined',
    children: []
  },
  {
    permissionCode: 'bias',
    permissionName: '偏见检测',
    path: '/dashboard/bias',
    component: 'Bias',
    icon: 'WarningOutlined',
    children: []
  },
  {
    permissionCode: 'infrastructure',
    permissionName: '基础设施监控',
    path: '/dashboard/infrastructure',
    component: 'Infrastructure',
    icon: 'DesktopOutlined',
    children: []
  },
  {
    permissionCode: 'report',
    permissionName: '报告生成',
    path: '/dashboard/report',
    component: 'Report',
    icon: 'FileOutlined',
    children: []
  }
];

export { defaultMenu as defaultMenus };
export default defaultMenu;
