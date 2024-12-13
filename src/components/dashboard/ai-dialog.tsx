import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/dashboard/sheet";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessibilityAgent } from "@/services/accessibility/agent";
import { FunctionRegistry } from "@/services/accessibility/registry";
import { UserContext } from "@/services/accessibility/types";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function AISidebarDialog() {
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [response, setResponse] = useState("");

    const handleSubmit = async () => {
        if (!input.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            const registry = new FunctionRegistry();
            await registry.scanAndRegister('./src');

            const userContext: UserContext = {
                accessibilityNeeds: {
                    vision: undefined,
                    mobility: undefined
                },
                preferredInteractions: ['text'],
                language: 'en',
                deviceCapabilities: ['keyboard']
            };

            const agent = new AccessibilityAgent(registry, userContext);
            const result = await agent.processRequest(input);

            setResponse(result.text);
        } catch (error) {
            console.error('AI processing error:', error);
            setResponse('Sorry, I encountered an error processing your request.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Sheet>
                            <SheetTrigger asChild>
                                <SidebarMenuButton className="w-full flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Ask AI Assistant</span>
                                </SidebarMenuButton>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>AI Assistant</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-4">
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            placeholder="Type your question..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSubmit();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isProcessing || !input.trim()}
                                        >
                                            {isProcessing ? 'Processing...' : 'Send'}
                                        </Button>
                                    </div>
                                    {response && (
                                        <div className="p-4 rounded-lg bg-muted">
                                            <p className="text-sm">{response}</p>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
