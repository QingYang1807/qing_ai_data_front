import { create } from 'zustand';
import { permissionAPI } from '@/api/system';

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
  
  // Actions
  loadAllMenus: () => Promise<void>;
  loadUserMenus: (userId: number) => Promise<void>;
  loadMenuTree: () => Promise<void>;
  setMenus: (menus: MenuItem[]) => void;
  setUserMenus: (menus: MenuItem[]) => void;
  clearMenus: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: [],
  userMenus: [],
  isLoading: false,

  loadAllMenus: async () => {
    set({ isLoading: true });
    try {
      const response = await permissionAPI.getAllMenus();
      if (response.data.success) {
        const menus = buildMenuTree(response.data.data);
        set({ menus, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load all menus error:', error);
      set({ isLoading: false });
    }
  },

  loadUserMenus: async (userId: number) => {
    set({ isLoading: true });
    try {
      const response = await permissionAPI.getUserMenus(userId);
      if (response.data.success) {
        const userMenus = buildMenuTree(response.data.data);
        set({ userMenus, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load user menus error:', error);
      set({ isLoading: false });
    }
  },

  loadMenuTree: async () => {
    set({ isLoading: true });
    try {
      const response = await permissionAPI.getMenuTree();
      if (response.data.success) {
        set({ menus: response.data.data, isLoading: false });
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