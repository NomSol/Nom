import { OllamaService } from './ollama'
import { FunctionRegistry } from './registry'
import registryData from './registry-data.json'
import {
    AccessibilityResponse,
    AccessLevel,
    AgentCapability,
    UserContext
} from './types'


export class AccessibilityAgent {
    private llm: OllamaService

    constructor(
        private registry: FunctionRegistry,
        private userContext: UserContext
    ) {
        this.llm = new OllamaService()
    }

    async processRequest(input: string): Promise<AccessibilityResponse> {
        try {
            // Prepare the prompt
            const systemContent = JSON.stringify(registryData, null, 2) + "\n\n" +
                "1. Consider which function from the registry would best help with the user's request\n" +
                "2. Clearly indicate which function you recommend using\n" +
                "3. Explain why this function is appropriate\n" +
                "4. Consider the user's accessibility needs in your response"

            // Generate response using the LLM
            const response = await this.llm.chat([
                { role: 'system', content: systemContent },
                { role: 'user', content: input }
            ])

            // Log the composed message to the browser console
            console.log('Composed message:', response.message.content);

            // Find recommended function from response
            const recommendedFunction = this.findRecommendedFunction(
                response.message.content,
                registryData.functions
            )

            return this.formatResponse(response, recommendedFunction)
        } catch (error) {
            console.error('Error processing accessibility request:', error)
            return this.getFallbackResponse(error)
        }
    }

    // ... rest of the methods remain the same ...



    //     async processRequest(input: string): Promise<AccessibilityResponse> {
    //         try {
    //             const accessLevel = this.determineAccessLevel(this.userContext)
    //             const capabilities = this.determineCapabilities(this.userContext)

    //             // Create a system prompt that includes the full registry data
    //             const functions = registryData.functions
    //             const systemPrompt = this.generateSystemPrompt(functions)

    //             // Generate response using the LLM
    //             const response = await this.llm.chat([
    //                 {
    //                     role: 'system',
    //                     content: `${systemPrompt}\n\nWhen responding, please:
    // 1. Consider which function from the registry would best help with the user's request
    // 2. Clearly indicate which function you recommend using
    // 3. Explain why this function is appropriate
    // 4. Consider the user's accessibility needs in your response`
    //                 },
    //                 {
    //                     role: 'user',
    //                     content: input
    //                 }
    //             ])

    //             // Find the most relevant function based on the LLM's response
    //             const recommendedFunction = this.findRecommendedFunction(
    //                 response.message.content,
    //                 functions
    //             )

    //             return this.formatResponse(response, recommendedFunction)
    //         } catch (error) {
    //             console.error('Error processing accessibility request:', error)
    //             return this.getFallbackResponse(error)
    //         }
    //     }

    private findRecommendedFunction(responseText: string, functions: any[]): any {
        // Simple matching based on function names mentioned in the response
        for (const func of functions) {
            if (responseText.toLowerCase().includes(func.name.toLowerCase())) {
                return func
            }
        }
        return null
    }

    private determineAccessLevel(context: UserContext): AccessLevel {
        if (context.accessibilityNeeds.vision === 'none' ||
            context.accessibilityNeeds.mobility === 'none') {
            return AccessLevel.Full
        }

        if (context.accessibilityNeeds.vision === 'low' ||
            context.accessibilityNeeds.mobility === 'limited' ||
            context.accessibilityNeeds.cognitive?.length) {
            return AccessLevel.Enhanced
        }

        return AccessLevel.Basic
    }

    private determineCapabilities(context: UserContext): AgentCapability[] {
        const capabilities: AgentCapability[] = []

        // Map preferences to capabilities
        if (context.preferredInteractions.includes('voice')) {
            capabilities.push(AgentCapability.VoiceControl)
        }
        if (context.preferredInteractions.includes('gesture')) {
            capabilities.push(AgentCapability.GestureControl)
        }
        if (context.preferredInteractions.includes('text')) {
            capabilities.push(AgentCapability.ScreenReader)
        }

        // Add capabilities based on needs
        if (context.accessibilityNeeds.vision === 'low' ||
            context.accessibilityNeeds.vision === 'none') {
            capabilities.push(AgentCapability.ScreenReader)
        }

        return Array.from(new Set(capabilities))
    }

    private generateSystemPrompt(functions: any[]): string {
        const functionsList = functions.map(f => {
            return `
Function: ${f.name}
Description: ${f.description || 'No description provided'}
Parameters: ${f.parameters?.map((p: { name: string; type: string; description?: string }) =>
                `${p.name} (${p.type})${p.description ? ` - ${p.description}` : ''}`
            ).join(', ') || 'None'}
Path: ${f.filePath}
`
        }).join('\n')

        return `You are an AI assistant helping a user with these accessibility needs:
${JSON.stringify(this.userContext, null, 2)}

Available functions:
${functionsList}

The user will ask questions or make requests. Your task is to:
1. Understand their request
2. Consider their accessibility needs
3. Recommend the most appropriate function from the list above
4. Explain why you recommend that function`
    }

    private async formatResponse(
        llmResponse: any,
        recommendedFunction: any
    ): Promise<AccessibilityResponse> {
        const response: AccessibilityResponse = {
            text: llmResponse.message.content,
            actions: [],
            alternatives: []
        }

        if (recommendedFunction) {
            response.actions.push({
                type: 'function_call',
                description: `Use ${recommendedFunction.name}`,
                function: recommendedFunction.name,
                args: []
            })
        }

        // Add alternatives based on user context
        if (this.userContext.accessibilityNeeds.vision === 'none') {
            response.alternatives.push({
                type: 'voice_interaction',
                description: 'Voice command alternative available',
                priority: 1
            })
        }

        // Format for screen readers if needed
        if (this.userContext.deviceCapabilities.includes('screen-reader')) {
            response.text = `[Screen Reader Output] ${response.text}`
        }

        return response
    }

    private getFallbackResponse(error: any): AccessibilityResponse {
        const response: AccessibilityResponse = {
            text: "I apologize, but I'm having trouble processing your request right now.",
            actions: [],
            alternatives: [{
                type: 'fallback',
                description: 'Please try again or contact support for help.',
                priority: 1
            }]
        }

        if (this.userContext.accessibilityNeeds.vision === 'none') {
            response.alternatives.push({
                type: 'voice_support',
                description: 'Would you like me to connect you with voice support?',
                priority: 1
            })
        }

        return response
    }
}