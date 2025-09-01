# 配置文件说明

## default_menu.js

这个文件包含了系统的默认菜单配置，基于数据库表 `sys_permission` 的结构设计。

### 文件结构

- **位置**: `src/config/default_menu.js`
- **导出**: `defaultMenus` 数组
- **类型**: 符合 `MenuItem` 接口的菜单数据

### 菜单结构

菜单数据包含以下主要模块：

1. **数据中心** (`data-center`)
   - 数据源管理
   - 数据采集
   - 数据处理
   - 数据标注
   - 数据增强
   - 数据合成
   - 数据评估
   - 数据回流

2. **数据市场** (`data-market`)
   - 数据集列表
   - 合规检测
   - 交易记录
   - 用户评分/举报

3. **数据合规** (`data-compliance`)
   - 隐私合规检测
   - 脱敏工具
   - 审计日志

4. **数据洞察** (`data-insight`)
   - 数据概览
   - 偏差趋势
   - 报表导出

5. **模型中心** (`model-center`)
   - 模型管理
   - 模型训练
   - 模型评估
   - 模型部署
   - 模型推理

6. **模型市场** (`model-market`)
   - 模型上架
   - 合规检测
   - 调用统计
   - 用户评分

7. **工作流编排** (`workflow`)
   - 可视化任务流
   - 调度管理

8. **账单中心** (`billing-center`)
   - 数据账单
   - 模型账单

9. **系统管理** (`system-management`)
   - 用户管理
   - 租户管理
   - 权限角色
   - 项目管理
   - 环境配置

10. **实验工具** (`experiment-tools`)
    - VSCode
    - JupyterLab

### 数据结构

每个菜单项包含以下字段：

```javascript
{
  id: number,                    // 菜单ID
  permissionCode: string,        // 权限编码
  permissionName: string,        // 权限名称
  permissionType: string,        // 权限类型 (menu/button/api)
  parentId: number,              // 父权限ID (0表示顶级菜单)
  path: string,                  // 路由路径
  component: string,             // 组件名称
  icon: string,                  // 图标名称
  sortOrder: number,             // 排序
  status: number,                // 状态 (1-启用, 0-禁用)
  children?: MenuItem[]          // 子菜单
}
```

### 使用方法

1. **导入菜单数据**:
   ```javascript
   import { defaultMenus } from '@/config/default_menu';
   ```

2. **修改菜单配置**:
   - 直接编辑 `default_menu.js` 文件
   - 修改后重启应用即可生效

3. **添加新菜单**:
   - 在数组中添加新的菜单项
   - 确保 `id` 唯一
   - 设置正确的 `parentId` 建立层级关系

### 注意事项

1. **ID唯一性**: 确保每个菜单项的 `id` 在整个系统中唯一
2. **层级关系**: 通过 `parentId` 建立父子关系，顶级菜单的 `parentId` 为 0
3. **图标映射**: 图标名称需要在 `DynamicSidebar.tsx` 中的 `iconMap` 中定义
4. **路由路径**: 确保路径与实际的页面路由匹配
5. **组件名称**: 组件名称应该与实际的React组件对应

### 与数据库同步

当数据库中的菜单数据更新时：

1. 如果数据库连接正常，系统会使用数据库中的菜单数据
2. 如果数据库连接失败，系统会回退到使用这个默认菜单配置
3. 可以通过修改这个文件来更新默认菜单，无需依赖数据库

### 扩展建议

1. **国际化支持**: 可以为 `permissionName` 添加多语言支持
2. **权限控制**: 可以基于 `permissionCode` 实现细粒度的权限控制
3. **动态配置**: 可以考虑将菜单配置改为从配置文件或环境变量读取
