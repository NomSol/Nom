import { MessageCircle } from "lucide-react";
import { useCallback, useState } from "react";

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
import {
    AccessibilityResponse,
    UserContext
} from "@/services/accessibility/types";

// Component to display AI response with accessibility support
const ResponseDisplay = ({ response }: { response: AccessibilityResponse | null }) => {
    if (!response) return null;

    return (
        <div className="space-y-4">
            {/* Main response text */}
            <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm whitespace-pre-wrap">{response.text}</p>
            </div>

            {/* Actions if available */}
            {response.actions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Suggested Actions:</p>
                    {response.actions.map((action, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                            • {action.description}
                        </div>
                    ))}
                </div>
            )}

            {/* Alternatives if available */}
            {response.alternatives.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Alternative Options:</p>
                    {response.alternatives.map((alt, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                            • {alt.description}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function AISidebarDialog() {
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [response, setResponse] = useState<AccessibilityResponse | null>(null);
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);

    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            // Initialize registry and user context
            const registry = new FunctionRegistry();

            const userContext: UserContext = {
                accessibilityNeeds: {
                    vision: 'none',
                    mobility: 'none'
                },
                preferredInteractions: ['text'],
                language: 'en',
                deviceCapabilities: ['keyboard']
            };

            // Create agent and process request
            const agent = new AccessibilityAgent(registry, userContext);
            const result = await agent.processRequest(input);

            // Update messages history
            setMessages(prev => [
                ...prev,
                { role: 'user', content: input },
                { role: 'assistant', content: result.text }
            ]);

            setResponse(result);
            setInput(""); // Clear input after successful response
        } catch (error) {
            console.error('AI processing error:', error);
            setResponse({
                text: 'Sorry, I encountered an error processing your request. Please try again.',
                actions: [],
                alternatives: [{
                    type: 'error',
                    description: 'If the problem persists, please contact support.',
                    priority: 1
                }]
            });
        } finally {
            setIsProcessing(false);
        }
    }, [input, isProcessing]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Sheet>
                            <SheetTrigger asChild>
                                <SidebarMenuButton
                                    className="w-full flex items-center gap-2"
                                    aria-label="Open AI Assistant"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Ask AI Assistant</span>
                                </SidebarMenuButton>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[400px] sm:w-[540px]"
                            >
                                <SheetHeader>
                                    <SheetTitle>AI Assistant</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-4">
                                    {/* Message history */}
                                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px]">
                                        {messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg ${msg.role === 'user'
                                                        ? 'bg-primary/10 ml-8'
                                                        : 'bg-muted mr-8'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Input
                                            placeholder="Type your question..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            aria-label="Your question"
                                            disabled={isProcessing}
                                        />
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isProcessing || !input.trim()}
                                            aria-label={isProcessing ? "Processing request" : "Send question"}
                                        >
                                            {isProcessing ? 'Processing...' : 'Send'}
                                        </Button>
                                    </div>

                                    {/* Response display component */}
                                    {response && <ResponseDisplay response={response} />}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}