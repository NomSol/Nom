

"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { ChevronDown, User, Cat, Star, Coins, CircleDot } from "lucide-react";
import { AiFillHome } from "react-icons/ai";
import { FaMapMarkedAlt } from "react-icons/fa";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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

const items = [
  { title: "Home", url: "/dashboard", icon: <AiFillHome /> },
  { title: "Map", url: "/main/dashboard", icon: <FaMapMarkedAlt /> },
];

const GameStatusHeader = () => {
  return (
    <div className="px-4 py-3 flex items-center bg-white border-b">
      <div className="flex items-center">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Cat className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-1.5">
          <Star
            className="w-4 h-4 text-amber-400"
            fill="currentColor"
            strokeWidth={0.5}
          />
          <span className="text-sm font-medium text-gray-700">323</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-500" strokeWidth={2} />
          <span className="text-sm font-medium text-gray-700">8.2k</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
          <span className="text-sm font-medium text-gray-700">12.5</span>
        </div>
      </div>
    </div>
  );
};

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <GameStatusHeader />
      </SidebarHeader>

      <SidebarContent>
        <SearchCity />

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center gap-2 ${
                        pathname === item.url
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Treasures</SidebarGroupLabel>
          <SidebarGroupContent>
            <TreasureListDropdown />
            <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md mt-2">
              <span className="text-sm font-medium">Found</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 p-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="User"
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex justify-between items-center w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">
                      {session?.user?.name || "user"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session?.user?.email || ""}
                    </span>
                  </div>
                  <ChevronDown className="ml-2" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut()}>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
