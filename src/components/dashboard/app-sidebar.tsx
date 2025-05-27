"use client";
import { useWallet } from '@/context/WalletContext';
import { usePathname } from "next/navigation";
import { useUserGameProps } from "@/hooks/use-usergameprops";
import { useSidebar } from "./sidebar";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/dashboard/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/dashboard/dropdown-menu";
import { SearchCity } from "./searchcity";
import { TreasureListDropdown } from "./TreasureListDropdown";
import {
  User,
  ChevronDown,
  Battery,
  Home,
  Map,
  Users,
  Award,
  ShoppingCart,
  Backpack,
  Wallet,
  Cat,
} from "lucide-react";

// Define interfaces for menu items
interface MenuItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

export function AppSidebar() {
  const { walletAddress, connected, disconnectWallet } = useWallet();
  const pathname = usePathname();
  const { gameProps, isLoading } = useUserGameProps();
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  // Format numbers to be more readable (e.g., 8200 -> 8.2k)
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  // First group: Navigation items
  const navigationItems: MenuItem[] = [
    { title: "Home", url: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { title: "Map", url: "/main/dashboard", icon: <Map className="w-5 h-5" /> },
    {
      title: "Find Friends",
      url: "/friends/find",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Second group: Game features
  const gameFeatureItems: MenuItem[] = [
    {
      title: "Ranking Board",
      url: "/ranking",
      icon: <Award className="w-5 h-5" />,
    },
  ];

  // Third group: Account items
  const accountItems: MenuItem[] = [
    {
      title: "My Carts",
      url: "/carts",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      title: "My Backpacks",
      url: "/backpacks",
      icon: <Backpack className="w-5 h-5" />,
    },
    {
      title: "My Wallet",
      url: "/wallet",
      icon: <Wallet className="w-5 h-5" />,
    },
  ];

  // Renders a single menu item
  const renderMenuItem = (
    item: MenuItem,
    index: number,
    totalItems: number
  ) => {
    const isFirst = index === 0;
    const isLast = index === totalItems - 1;
    const active = pathname === item.url;

    return (
      <a
        key={item.title}
        href={item.url}
        className={`flex items-center gap-3 px-4 py-3 bg-white
        ${!isFirst ? "border-t border-gray-100" : "rounded-t-lg"}
        ${isLast ? "rounded-b-lg" : ""}
        ${active ? "text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
      >
        <span className="text-gray-600">{item.icon}</span>
        <span className="font-medium">{item.title}</span>
      </a>
    );
  };

  // Group component to render a group of menu items
  const MenuGroup = ({
    title,
    items,
  }: {
    title: string;
    items: MenuItem[];
  }) => (
    <div className="mb-6">
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
          {title}
        </h3>
      </div>
      <div className="mx-4 overflow-hidden shadow-sm">
        {items.map((item, index) => renderMenuItem(item, index, items.length))}
      </div>
    </div>
  );

  return (
    <Sidebar
      className={`bg-gray-100 transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0 md:w-16"
        }`}
    >
      {/* Status Header */}
      <SidebarHeader className="flex-shrink-0">
        <div
          className={`p-3 border-b border-gray-200 bg-white ${!isSidebarOpen && "hidden md:block"
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Profile Icon - 保持与 topbar 中猫图标一致的样式 */}
            <div className="rounded-full shadow-md bg-gray-200 flex items-center justify-center w-10 h-10">
              {/* 使用与 topbar 完全相同的样式 */}
              {!isSidebarOpen ? (
                <Cat className="h-6 w-6 text-gray-600" strokeWidth={2} />
              ) : (
                <Cat className="h-6 w-6 text-gray-600" strokeWidth={2} />
              )}
            </div>

            {/* Game Stats - Only show when sidebar is open */}
            {isSidebarOpen && !isLoading && (
              <div className="flex items-center space-x-2">
                {/* Energy */}
                <div className="flex items-center gap-1 px-2">
                  <Battery className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">
                    {gameProps?.energy || "100"}
                  </span>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 px-2">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {formatNumber(gameProps?.xp)}
                  </span>
                </div>

                {/* Coins */}
                <div className="flex items-center gap-1 px-2">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {formatNumber(gameProps?.coins)}
                  </span>
                </div>

                {/* Balance */}
                <div className="flex items-center gap-1 px-2">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  <span className="text-sm font-medium">
                    {formatNumber(gameProps?.balance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent
        className={`py-4 bg-gray-100 ${!isSidebarOpen && "hidden md:block"
          } overflow-y-auto flex-grow`}
      >
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Only show full menu when sidebar is open */}
            {isSidebarOpen ? (
              <div className="flex flex-col min-h-0">
                {/* Group 1: Navigation Items */}
                <MenuGroup title="Navigation" items={navigationItems} />

                {/* Group 2: Game Features */}
                <div className="mb-6">
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                      Features
                    </h3>
                  </div>

                  {/* Regular menu items for features */}
                  <div className="mx-4 overflow-hidden shadow-sm">
                    {gameFeatureItems.map((item, index) =>
                      renderMenuItem(item, index, gameFeatureItems.length)
                    )}
                  </div>

                  {/* Special dropdown components - Fixed width to prevent layout shifts */}
                  <div className="mt-2 mx-4">
                    <div className="w-full">
                      <TreasureListDropdown />
                    </div>
                  </div>
                </div>

                {/* Group 3: Account Items */}
                <MenuGroup title="Account" items={accountItems} />
              </div>
            ) : (
              /* Collapsed view - show only icons */
              <div className="flex flex-col items-center space-y-4 mt-4">
                {/* Nav icons */}
                {navigationItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    className={`p-2 rounded-full ${pathname === item.url ? "bg-white" : "hover:bg-gray-200"
                      }`}
                    title={item.title}
                  >
                    {item.icon}
                  </a>
                ))}

                <div className="w-8 border-t border-gray-300 my-2"></div>

                {/* Feature icons */}
                {gameFeatureItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    className={`p-2 rounded-full ${pathname === item.url ? "bg-white" : "hover:bg-gray-200"
                      }`}
                    title={item.title}
                  >
                    {item.icon}
                  </a>
                ))}

                <a
                  href="/placements"
                  className="p-2 rounded-full hover:bg-gray-200"
                  title="My Disposal History"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </a>

                <a
                  href="/findings"
                  className="p-2 rounded-full hover:bg-gray-200"
                  title="My Findings"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </a>

                <div className="w-8 border-t border-gray-300 my-2"></div>

                {/* Account icons */}
                {accountItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    className={`p-2 rounded-full ${pathname === item.url ? "bg-white" : "hover:bg-gray-200"
                      }`}
                    title={item.title}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Search Bar - Only show when sidebar is open */}
      {isSidebarOpen && (
        <div className="px-4 py-2 mb-2 bg-gray-100 flex-shrink-0">
          <div className="bg-white rounded-lg">
            <SearchCity />
          </div>
        </div>
      )}

      <SidebarFooter className="flex-shrink-0">
        <div
          className={`border-t border-gray-200 p-4 bg-white mt-auto ${!isSidebarOpen && "hidden md:block"
            }`}
        >
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              {walletAddress ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <Wallet className="h-5 w-5 text-gray-600" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center justify-between">
                      <div className="flex flex-col text-left truncate">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {walletAddress || "User"}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {connected ? "Connected" : "Not Connected"}
                        </span>
                      </div>
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-500 flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => {
                      try {
                        disconnectWallet();
                      } catch (error) {
                        console.error("Error during logout:", error);
                        // Continue with navigation even if disconnect fails
                        window.location.href = '/';
                      }
                    }}>
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
