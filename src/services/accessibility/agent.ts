import { OllamaService } from './ollama'
import { FunctionRegistry } from './registry'
import { AccessibilityResponse, UserContext } from './types'

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
            const relevantFunctions = await this.registry.findRelevantFunctions(input)
            const response = await this.generateResponse(input, relevantFunctions)
            return await this.formatResponse(response, relevantFunctions)
        } catch (error) {
            console.error('Error processing accessibility request:', error)
            return this.getFallbackResponse(error)
        }
    }

    private async generateResponse(input: string, functions: string[]) {
        const systemPrompt = await this.generateSystemPrompt(functions)
        return await this.llm.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
        ])
    }

    private async generateSystemPrompt(functions: string[]): Promise<string> {
        const functionDescriptions = functions.map(name => {
            const meta = this.registry.getFunctionMeta(name)
            return meta ? `${name}: ${meta.description}` : name
        })

        return `You are an AI assistant helping a user with these accessibility needs:
    ${JSON.stringify(this.userContext, null, 2)}

    Available functions:
    ${functionDescriptions.join('\n')}

    Provide clear, concise responses and suggest appropriate actions.`
    }

    private async formatResponse(
        llmResponse: any,
        functions: string[]
    ): Promise<AccessibilityResponse> {
        const response: AccessibilityResponse = {
            text: llmResponse.message.content,
            actions: [],
            alternatives: []
        }

        // Parse LLM response and extract actions/alternatives
        // Add appropriate response formatting based on user's accessibility needs

        return response
    }

    private getFallbackResponse(error: any): AccessibilityResponse {
        return {
            text: "I apologize, but I'm having trouble processing your request right now.",
            actions: [],
            alternatives: [{
                type: 'fallback',
                description: 'Please try again or contact support for help.',
                priority: 1
            }]
        }
    }
}