export class OllamaService {
    constructor(
        private model = 'llama3.2',
        private baseUrl = 'http://localhost:11434'
    ) { }

    async chat(messages: Array<{ role: string, content: string }>) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: false
            })
        })

        if (!response.ok) {
            throw new Error(`Ollama chat failed: ${response.statusText}`)
        }

        return await response.json()
    }

    async generateEmbedding(text: string): Promise<number[]> {
        const response = await fetch(`${this.baseUrl}/api/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'all-minilm',
                input: text
            })
        })

        if (!response.ok) {
            throw new Error(`Embedding generation failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.embeddings[0]
    }

    async generateSystemPrompt(context: any): Promise<string> {
        const response = await this.chat([{
            role: 'system',
            content: `Generate a system prompt for an AI assistant helping a user with these accessibility needs: ${JSON.stringify(context)}`
        }])
        return response.message.content
    }
}