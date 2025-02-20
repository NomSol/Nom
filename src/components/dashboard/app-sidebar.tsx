"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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
import { User, ChevronDown, Cat, Star, Coins, CircleDot } from "lucide-react";

const items = [
  { title: "Home", url: "/dashboard", icon: <AiFillHome /> },
  { title: "Map", url: "/main/dashboard", icon: <FaMapMarkedAlt /> },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar>
      {/* Redesigned Header */}
      <SidebarHeader>
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center space-x-2 px-2">
            {/* cat icon */}
            <div className="rounded-lg bg-gray-100 p-1.5">
              <Cat className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
            </div>

            {/* status indicator container */}
            <div className="flex items-center divide-x divide-gray-200">
              <div className="flex items-center gap-1 px-2">
                <Star
                  className="h-4 w-4 text-amber-400"
                  fill="currentColor"
                  strokeWidth={0.5}
                />
                <span className="text-sm font-medium text-gray-700">323</span>
              </div>
              <div className="flex items-center gap-1 px-2">
                <Coins className="h-4 w-4 text-amber-500" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-700">8.2k</span>
              </div>
              <div className="flex items-center gap-1 px-2">
                <CircleDot
                  className="h-4 w-4 text-blue-400"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-medium text-gray-700">12.5</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* searchbar */}
        <div className="p-2">
          <SearchCity />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-gray-700">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center gap-2 px-4 py-2 ${
                        pathname === item.url
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
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
          <SidebarGroupLabel className="px-4 text-gray-700">
            Treasures
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <TreasureListDropdown />
            <div className="mt-2 flex cursor-pointer items-center justify-between rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50">
              <span className="text-sm font-medium">Found</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <User className="h-5 w-5 text-gray-700" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex w-full items-center justify-between">
                    <div className="flex flex-col text-left truncate">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || "user"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {session?.user?.email || ""}
                      </span>
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500 flex-shrink-0" />
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
