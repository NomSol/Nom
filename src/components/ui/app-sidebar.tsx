// //这个sidebar不错，但是dropdwonmenu是直接集成到里面的，我试试怎么拆出来再写一下
// "use client";
// import { ChevronDown, Building } from "lucide-react";
// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// // Menu items
// const items = [
//   { title: "Home", url: "#", icon: null },
//   { title: "Inbox", url: "#", icon: null },
// ];

// export function AppSidebar() {
//   return (
//     <Sidebar>
//       {/* Header with Dropdown */}
//       <SidebarHeader>
//         <div className="flex items-center gap-2 p-4">
//           <Building className="w-6 h-6" />
//           <div className="flex-1">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton className="flex justify-between items-center w-full">
//                   <div className="flex flex-col text-left">
//                     <span className="text-sm font-medium">Acme Inc</span>
//                     <span className="text-xs text-muted-foreground">
//                       Enterprise
//                     </span>
//                   </div>
//                   <ChevronDown className="ml-2" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56">
//                 <DropdownMenuItem>
//                   <span>Acme Inc</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <span>Acme Corp.</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <span>Evil Corp.</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <span>Add Team</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </SidebarHeader>

//       {/* Sidebar content */}
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Menu</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Menu items
const items = [
  { title: "Home", url: "#", icon: null },
  { title: "Inbox", url: "#", icon: null },
];

export function AppSidebar() {
  return (
    <Sidebar>
      {/* Header with Dropdown */}
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

      {/* Sidebar content */}
      <SidebarContent>
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
      </SidebarContent>

      {/* Footer with Dropdown */}
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
  );
}
