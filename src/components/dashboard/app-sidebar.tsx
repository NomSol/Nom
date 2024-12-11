// "use client";

// import { ChevronDown, Building, User } from "lucide-react";
// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarTrigger,
// } from "@/components/dashboard/sidebar";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from "@/components/dashboard/dropdown-menu";
// import { SearchCity } from "./searchcity";

// // 菜单项
// const items = [
//   { title: "Home", url: "#", icon: null },
//   { title: "Inbox", url: "#", icon: null },
// ];

// export function AppSidebar() {
//   return (
//     <>
//       <Sidebar>
//         {/* 头部下拉菜单 */}
//         <SidebarHeader>
//           <div className="flex items-center gap-2 p-4">
//             <Building className="w-6 h-6" />
//             <div className="flex-1">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <SidebarMenuButton className="flex justify-between items-center w-full">
//                     <div className="flex flex-col text-left">
//                       <span className="text-sm font-medium">Acme Inc</span>
//                       <span className="text-xs text-muted-foreground">
//                         Enterprise
//                       </span>
//                     </div>
//                     <ChevronDown className="ml-2" />
//                   </SidebarMenuButton>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56">
//                   <DropdownMenuItem>
//                     <span>Acme Inc</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <span>Acme Corp.</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <span>Evil Corp.</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <span>Add Team</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </SidebarHeader>

//         {/* 侧边栏内容 */}
//         <SidebarContent>
//           {/* 搜索城市组件 */}
//           <SearchCity />

//           {/* 现有菜单项 */}
//           <SidebarGroup>
//             <SidebarGroupLabel>Menu</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {items.map((item) => (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild>
//                       <a href={item.url}>
//                         <span>{item.title}</span>
//                       </a>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>

//         {/* 底部下拉菜单 */}
//         <SidebarFooter>
//           <div className="flex items-center gap-2 p-4">
//             <User className="w-6 h-6" />
//             <div className="flex-1">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <SidebarMenuButton className="flex justify-between items-center w-full">
//                     <div className="flex flex-col text-left">
//                       <span className="text-sm font-medium">shadcn</span>
//                       <span className="text-xs text-muted-foreground">
//                         m@example.com
//                       </span>
//                     </div>
//                     <ChevronDown className="ml-2" />
//                   </SidebarMenuButton>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56">
//                   <DropdownMenuItem>
//                     <span>Upgrade to Pro</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <span>Account</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <span>Billing</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <span>Notifications</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <span>Log out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </SidebarFooter>
//       </Sidebar>

//       {/* 侧边栏触发器 */}
//       <SidebarTrigger />
//     </>
//   );
// }

"use client";

import { ChevronDown, Building, User } from "lucide-react";
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
  SidebarTrigger,
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
  { title: "Home", url: "#", icon: null },
  { title: "Inbox", url: "#", icon: null },
];

export function AppSidebar() {
  return (
    <>
      <Sidebar>
        {/* 头部下拉菜单 */}
        <SidebarHeader>
          <div className="flex items-center gap-2 p-4">
            <Building className="w-6 h-6" />
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">Acme Inc</span>
                      <span className="text-xs text-muted-foreground">
                        Enterprise
                      </span>
                    </div>
                    <ChevronDown className="ml-2" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>
                    <span>Acme Inc</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Acme Corp.</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Evil Corp.</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Add Team</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarHeader>

        {/* 侧边栏内容 */}
        <SidebarContent>
          {/* 搜索城市组件 */}
          <SearchCity />

          {/* 菜单组 */}
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
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
              {/* Treasure List */}
              <TreasureListDropdown />

              {/* Found Treasures */}
              <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md mt-2">
                <span className="text-sm font-medium">Found</span>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* 宝藏信息组 */}
        </SidebarContent>

        {/* 底部下拉菜单 */}
        <SidebarFooter>
          <div className="flex items-center gap-2 p-4">
            <User className="w-6 h-6" />
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">shadcn</span>
                      <span className="text-xs text-muted-foreground">
                        m@example.com
                      </span>
                    </div>
                    <ChevronDown className="ml-2" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* 侧边栏触发器 */}
      <SidebarTrigger />
    </>
  );
}
