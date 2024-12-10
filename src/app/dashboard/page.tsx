import { SidebarProvider } from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchBar } from '@/components/myboard/search-bar';
import { MainContent } from '@/components/myboard/main-content';
import { Repository } from '@/components/myboard/repository';
import { Sidebar } from "lucide-react";
import { TabComponent } from "@/components/myboard/tab";

export default function MyPage() {
    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-screen max-w-2xl p-6 text-center">
                <div className="mb-6">
                    <SearchBar />
                </div>
                <MainContent />
                <TabComponent />
            </div>
        </div>
    )
}