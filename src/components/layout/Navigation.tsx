"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SkipLink } from "@/components/ui/skip-link";

// 路由配置：用於生成麵包屑
const routeConfig: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Home" },
  "/dashboard": { label: "Analytics Dashboard", parent: "/" },
  "/bank": { label: "Bank Reconciliation", parent: "/" },
  "/reports": { label: "Reports", parent: "/" },
  "/customers": { label: "Customers", parent: "/" },
  "/customers/new": { label: "New Customer", parent: "/customers" },
  "/quotations": { label: "Quotations", parent: "/" },
  "/quotations/new": { label: "New Quotation", parent: "/quotations" },
  "/invoices": { label: "Invoices", parent: "/" },
  "/invoices/new": { label: "New Invoice", parent: "/invoices" },
};

interface BreadcrumbItem {
  href: string;
  label: string;
  isActive: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // 添加首頁
    breadcrumbs.push({
      href: "/",
      label: "Home",
      isActive: pathname === "/",
    });

    // 構建路徑
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const config = routeConfig[currentPath];
      const label =
        config?.label || segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        href: currentPath,
        label,
        isActive: isLast,
      });
    });

    // 直接設置 items（這是 React 推薦的方式）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(breadcrumbs);
  }, [pathname]);

  if (items.length <= 1) return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm mb-6"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          )}
          {item.isActive ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// 導航項目類型
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }> | string;
  shortcut?: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/bank", label: "Bank Reconciliation", icon: "Receipt" },
  { href: "/reports", label: "Reports", icon: "BarChart" },
  { href: "/customers", label: "Customers", icon: "Users" },
  { href: "/quotations", label: "Quotations", icon: "FileText" },
  { href: "/invoices", label: "Invoices", icon: "FileText2" },
];

// 圖標映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Receipt: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-bar-chart"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  Tag: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-tag"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l5 5a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),
  Users,
  FileText,
  FileText2: FileText,
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 鍵盤導航
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, href: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = href;
      }
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    },
    [],
  );

  // 關閉 mobile menu 當點擊 outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-sidebar]")) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [isMobileMenuOpen]);

  // 鍵盤快捷鍵：Ctrl/Cmd + B 切換 sidebar
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        onToggle();
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcut);
    return () =>
      document.removeEventListener("keydown", handleKeyboardShortcut);
  }, [onToggle]);

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  // 側邊欄內容
  const sidebarContent = (
    <>
      {/* Logo / 品牌區域 */}
      <div className="p-4 border-b">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                omb-accounting
              </h1>
              <p className="text-xs text-gray-500">Accounting System</p>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 導航項目 */}
      <nav
        className="flex-1 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as string] || Home;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-1 transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed && "justify-center px-2",
              )}
              aria-current={isActive ? "page" : undefined}
              title={isCollapsed ? item.label : undefined}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, item.href)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.shortcut && (
                <kbd
                  className="ml-auto text-xs text-gray-400 border border-gray-200 rounded px-1.5"
                  aria-label={`Keyboard shortcut: ${item.shortcut}`}
                >
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 底部區域 */}
      <div className="p-4 border-t">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors",
            isCollapsed && "justify-center px-2",
          )}
          title={isCollapsed ? "Logout" : undefined}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, "#")}
          aria-label="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-sidebar"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside
        data-sidebar
        data-testid="desktop-sidebar"
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-sm transition-all duration-300 z-40 hidden lg:flex flex-col",
          sidebarWidth,
        )}
        aria-label="Desktop navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        id="mobile-sidebar"
        data-sidebar
        data-testid="mobile-sidebar"
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full bg-white border-r shadow-sm z-40 transition-transform duration-300 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
        )}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

interface NavigationLayoutProps {
  children: React.ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 檢測是否為移動設備 - 只在客戶端執行
  useEffect(() => {
    let rafId: number;

    const initializeMobile = () => {
      const isMobileDevice = window.innerWidth < 1024;
      setIsMobile(isMobileDevice);
      // 使用 requestAnimationFrame 來避免同步 setState
      rafId = requestAnimationFrame(() => {
        setMounted(true);
      });
    };

    initializeMobile();
    window.addEventListener("resize", initializeMobile);

    return () => {
      window.removeEventListener("resize", initializeMobile);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 在移動設備上自動展開 sidebar
  useEffect(() => {
    let rafId: number;

    if (mounted && isMobile) {
      // 使用 requestAnimationFrame 來避免同步 setState
      rafId = requestAnimationFrame(() => {
        setIsSidebarCollapsed(true);
      });
    }

    return () => cancelAnimationFrame(rafId);
  }, [isMobile, mounted]);

  // 避免 SSR 水合不匹配 - 首次渲染時不顯示 sidebar
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkipLink targetId="main-content" />
        <main id="main-content" className="p-4 lg:p-8" tabIndex={-1}>
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink targetId="main-content" />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        id="main-content"
        className={cn(
          "transition-all duration-300 p-4 lg:p-8",
          isMobile || isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
        )}
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
