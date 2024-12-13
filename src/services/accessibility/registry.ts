import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { OllamaService } from './ollama'
import { AccessibilityRequirement, AccessLevel, FunctionMeta, ParameterInfo } from './types'

export class FunctionRegistry {
    private functions = new Map<string, Function>()
    private metadata = new Map<string, FunctionMeta>()
    private embeddingCache = new Map<string, number[]>()
    private ollama: OllamaService

    constructor() {
        this.ollama = new OllamaService()
    }

    async scanAndRegister(basePath: string): Promise<void> {
        const resolvedPath = resolve(basePath)
        const files = await this.scanFiles(resolvedPath)
        await Promise.all(files.map(file => this.processFile(file)))
        await this.generateEmbeddings()
    }

    private async scanFiles(dir: string): Promise<string[]> {
        const entries = await readdir(dir, { withFileTypes: true })
        const files: string[] = []

        for (const entry of entries) {
            const fullPath = join(dir, entry.name)
            if (entry.isDirectory()) {
                files.push(...await this.scanFiles(fullPath))
            } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                files.push(fullPath)
            }
        }

        return files
    }

    // 补充FunctionRegistry类中的方法

    private parseAccessibilityTag(line: string): AccessibilityRequirement {
        try {
            // 移除@accessibility和可能的前导空格
            const jsonStr = line.replace(/@accessibility\s*/, '').trim()
            // 解析JSON对象
            const accessibilityData = JSON.parse(jsonStr)

            return {
                minimumLevel: accessibilityData.level || 'Basic',
                requiredCapabilities: accessibilityData.capabilities || [],
                alternatives: accessibilityData.alternatives || []
            }
        } catch (error) {
            console.warn('Failed to parse accessibility tag:', error)
            return {
                minimumLevel: AccessLevel.Basic,
                requiredCapabilities: []
            }
        }
    }

    private parseParamTag(line: string): ParameterInfo {
        // 匹配格式: @param {type} name - description
        const paramRegex = /@param\s+{([^}]+)}\s+(\w+)\s*-?\s*(.*)/
        const match = line.match(paramRegex)

        if (!match) {
            return {
                name: 'unknown',
                type: 'any',
                description: '',
                isOptional: false
            }
        }

        const [, type, name, description] = match
        const isOptional = type.includes('?') || type.includes('optional')

        return {
            name,
            type: type.replace(/\?|optional/, '').trim(),
            description: description.trim(),
            isOptional
        }
    }

    private parseReturnsTag(line: string): string {
        // 匹配格式: @returns {type} description
        const returnRegex = /@returns?\s+{([^}]+)}\s*(.*)/
        const match = line.match(returnRegex)

        if (!match) {
            return 'void'
        }

        return match[1].trim()
    }

    private extractFunctionImplementation(code: string): Function | undefined {
        try {
            // 提取函数名和参数
            const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([\s\S]*?)\)/
            const match = code.match(funcRegex)

            if (!match) {
                return undefined
            }

            const [, funcName, params] = match

            // 提取函数体
            const bodyRegex = new RegExp(`${funcName}\\s*\\([^)]*\\)\\s*{([\\s\\S]*?)}`)
            const bodyMatch = code.match(bodyRegex)

            if (!bodyMatch) {
                return undefined
            }

            const functionBody = bodyMatch[1]

            // 构建可执行的函数
            // 注意：这里使用 new Function 可能有安全风险，
            // 在生产环境中应该使用更安全的方式或添加适当的安全检查
            const paramNames = params.split(',').map(p => p.trim())
            return new Function(...paramNames, functionBody)

        } catch (error) {
            console.warn('Failed to extract function implementation:', error)
            return undefined
        }
    }

    private async processFile(filePath: string): Promise<void> {
        const content = await readFile(filePath, 'utf-8')
        const functionMatches = this.extractFunctions(content)

        for (const match of functionMatches) {
            try {
                const metadata = this.parseJSDocComment(match.comment)

                if (metadata.accessibility) {
                    // 提取函数名
                    const funcNameMatch = match.code.match(/function\s+(\w+)/)
                    if (!funcNameMatch) continue

                    const funcName = funcNameMatch[1]
                    metadata.name = funcName // 设置函数名

                    this.metadata.set(funcName, metadata)

                    // 尝试提取并存储函数实现
                    const func = this.extractFunctionImplementation(match.code)
                    if (func) {
                        this.functions.set(funcName, func)
                    }

                    // 记录成功注册
                    console.log(`Registered function: ${funcName}`)
                }
            } catch (error) {
                console.error(`Error processing function in ${filePath}:`, error)
            }
        }
    }

    private extractFunctions(content: string): Array<{ comment: string, code: string }> {
        const functionRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+(?:async\s+)?function\s+(\w+)/g
        const matches = []
        let match

        while ((match = functionRegex.exec(content)) !== null) {
            matches.push({
                comment: match[1],
                code: match[0]
            })
        }

        return matches
    }

    private parseJSDocComment(comment: string): FunctionMeta {
        // Parse JSDoc comment to extract metadata
        const lines = comment.split('\n')
        const metadata: Partial<FunctionMeta> = {
            parameters: [],
            accessibility: {
                minimumLevel: 'Basic' as any,
                requiredCapabilities: []
            }
        }

        for (const line of lines) {
            if (line.includes('@accessibility')) {
                metadata.accessibility = this.parseAccessibilityTag(line)
            } else if (line.includes('@param')) {
                metadata.parameters?.push(this.parseParamTag(line))
            } else if (line.includes('@returns')) {
                metadata.returnType = this.parseReturnsTag(line)
            }
        }

        return metadata as FunctionMeta
    }

    async findRelevantFunctions(query: string): Promise<string[]> {
        const queryEmbedding = await this.ollama.generateEmbedding(query)
        const similarities = new Map<string, number>()

        for (const [name, embedding] of this.embeddingCache.entries()) {
            const similarity = this.cosineSimilarity(queryEmbedding, embedding)
            similarities.set(name, similarity)
        }

        return Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name)
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
        const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
        const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
        return dotProduct / (normA * normB)
    }

    private async generateEmbeddings(): Promise<void> {
        for (const [name, meta] of this.metadata.entries()) {
            const description = `${meta.description}\nParameters: ${meta.parameters.map(p => `${p.name}: ${p.description}`).join(', ')
                }`
            const embedding = await this.ollama.generateEmbedding(description)
            this.embeddingCache.set(name, embedding)
        }
    }

    getFunctionMeta(name: string): FunctionMeta | undefined {
        return this.metadata.get(name)
    }

    getFunction(name: string): Function | undefined {
        return this.functions.get(name)
    }
}