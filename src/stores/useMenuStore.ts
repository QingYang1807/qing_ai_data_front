import { create } from 'zustand';
import { permissionAPI } from '@/api/system';
import { defaultMenus } from '@/config/default_menu';

export interface MenuItem {
  id: number;
  permissionCode: string;
  permissionName: string;
  permissionType: string;
  parentId: number;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  status: number;
  children?: MenuItem[];
}

interface MenuState {
  menus: MenuItem[];
  userMenus: MenuItem[];
  isLoading: boolean;
  isUsingDefaultMenu: boolean; // 是否使用默认菜单
  lastLoadTime: number; // 最后加载时间，用于缓存控制
  cacheExpiry: number; // 缓存过期时间（毫秒）
  
  // Actions
  loadAllMenus: () => Promise<void>;
  loadUserMenus: (userId: number, forceRefresh?: boolean) => Promise<void>;
  loadMenuTree: () => Promise<void>;
  setMenus: (menus: MenuItem[]) => void;
  setUserMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
  resetToDefaultMenus: () => void;
  clearCache: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: defaultMenus,
  userMenus: defaultMenus, // 初始化时使用默认菜单
  isLoading: false,
  isUsingDefaultMenu: true, // 初始状态使用默认菜单
  lastLoadTime: 0,
  cacheExpiry: 5 * 60 * 1000, // 5分钟缓存

  loadAllMenus: async () => {
    set({ isLoading: true });
    try {
      const response = await permissionAPI.getAllMenus();
      if (response.code === 200) {
        const menus = buildMenuTree(response.data);
        set({ menus, isLoading: false, lastLoadTime: Date.now() });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load all menus error:', error);
      set({ isLoading: false });
    }
  },

  loadUserMenus: async (userId: number, forceRefresh = false) => {
    const { lastLoadTime, cacheExpiry, isUsingDefaultMenu } = get();
    const now = Date.now();
    
    // 检查缓存是否有效
    if (!forceRefresh && !isUsingDefaultMenu && (now - lastLoadTime) < cacheExpiry) {
      console.log('使用缓存的菜单数据');
      return;
    }

    set({ isLoading: true });
    try {
      const response = await permissionAPI.getUserMenus(userId);
      if (response.code === 200 && response.data && response.data.length > 0) {
        // 数据库调用成功且有数据，使用数据库数据
        const userMenus = buildMenuTree(response.data);
        set({ 
          userMenus, 
          isLoading: false, 
          isUsingDefaultMenu: false,
          lastLoadTime: now
        });
        console.log('使用数据库菜单数据');
      } else {
        // 数据库调用成功但无数据，保持默认菜单
        console.log('数据库无菜单数据，使用默认菜单');
        set({ 
          isLoading: false, 
          isUsingDefaultMenu: true,
          lastLoadTime: now
        });
      }
    } catch (error) {
      // 数据库调用失败，保持默认菜单
      console.error('Load user menus error:', error);
      console.log('数据库调用失败，使用默认菜单');
      set({ 
        isLoading: false, 
        isUsingDefaultMenu: true,
        lastLoadTime: now
      });
    }
  },

  loadMenuTree: async () => {
    set({ isLoading: true });
    try {
      const response = await permissionAPI.getMenuTree();
      if (response.code === 200) {
        set({ menus: response.data, isLoading: false, lastLoadTime: Date.now() });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load menu tree error:', error);
      set({ isLoading: false });
    }
  },

  setMenus: (menus: MenuItem[]) => {
    set({ menus });
  },

  setUserMenus: (userMenus: MenuItem[]) => {
    set({ userMenus });
  },

  clearMenus: () => {
    set({ menus: [], userMenus: [] });
  },

  resetToDefaultMenus: () => {
    set({ userMenus: defaultMenus, isUsingDefaultMenu: true });
  },

  clearCache: () => {
    set({ lastLoadTime: 0 });
  },
}));

// 构建菜单树结构
function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const menuMap = new Map<number, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // 创建菜单映射
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // 构建树结构
  menus.forEach(menu => {
    const menuWithChildren = menuMap.get(menu.id)!;
    if (menu.parentId === 0) {
      rootMenus.push(menuWithChildren);
    } else {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuWithChildren);
      }
    }
  });

  return rootMenus;
} 