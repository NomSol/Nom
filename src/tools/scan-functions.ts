// npx ts-node -P tsconfig.tools.json src/tools/scan-functions.ts
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import * as ts from 'typescript'

interface FunctionInfo {
    name: string
    filePath: string
    description?: string
    parameters: {
        name: string
        type: string
        description?: string
        isOptional: boolean
    }[]
    returnType?: string
    accessibility?: {
        level: string
        capabilities: string[]
    }
}

class FunctionScanner {
    private functions: FunctionInfo[] = []

    async scanProject(basePath: string): Promise<FunctionInfo[]> {
        await this.scanDir(resolve(basePath))
        return this.functions
    }

    private async scanDir(dir: string) {
        try {
            const entries = await readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = join(dir, entry.name)

                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await this.scanDir(fullPath)
                } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                    await this.scanFile(fullPath)
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error)
        }
    }

    private async scanFile(filePath: string) {
        try {
            const content = await readFile(filePath, 'utf-8')
            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.Latest,
                true
            )

            this.visitNode(sourceFile, filePath)
        } catch (error) {
            console.error(`Error scanning file ${filePath}:`, error)
        }
    }

    private visitNode(node: ts.Node, filePath: string) {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
            const jsDoc = ts.getJSDocTags(node)
            const accessibilityTag = jsDoc.find(tag => tag.tagName.text === 'accessibility')

            // if (accessibilityTag) {
            if (true) {
                const functionInfo = this.extractFunctionInfo(node, filePath)
                if (functionInfo) {
                    this.functions.push(functionInfo)
                }
            }
        }

        ts.forEachChild(node, child => this.visitNode(child, filePath))
    }

    private extractFunctionInfo(node: ts.FunctionDeclaration | ts.MethodDeclaration, filePath: string): FunctionInfo | null {
        if (!node.name) return null
        const functionInfo: FunctionInfo = {
            name: node.name.getText(),
            filePath: filePath.replace(process.cwd(), ''),
            parameters: []
        }

        // Extract parameters
        node.parameters.forEach(param => {
            functionInfo.parameters.push({
                name: param.name.getText(),
                type: param.type?.getText() || 'any',
                isOptional: !!param.questionToken,
                description: ''
            })
        })

        // Extract JSDoc info
        const comments = ts.getJSDocCommentsAndTags(node)
        if (comments && comments.length > 0) {
            const mainJSDoc = comments[0]
            functionInfo.description = ts.getTextOfJSDocComment(mainJSDoc.comment)?.toString() || ''

            // Parse accessibility tag
            const accessibilityTag = comments.find(c =>
                ts.isJSDoc(c) && c.tags?.some(tag => tag.tagName.text === 'accessibility')
            )
            if (accessibilityTag) {
                try {
                    const comment = ts.getTextOfJSDocComment(accessibilityTag.comment)
                    functionInfo.accessibility = JSON.parse(comment || '{}')
                } catch (e) {
                    console.warn(`Invalid accessibility tag in ${filePath}:`, e)
                }
            }
        }

        return functionInfo
    }

    async generateRegistryFile(outputPath: string) {
        const registryData = {
            timestamp: new Date().toISOString(),
            functions: this.functions
        }

        try {
            await writeFile(
                outputPath,
                JSON.stringify(registryData, null, 2)
            )
            console.log(`Generated registry with ${this.functions.length} functions at ${outputPath}`)
        } catch (error) {
            console.error('Error writing registry file:', error)
        }
    }
}

// Main execution
async function main() {
    const scanner = new FunctionScanner()
    await scanner.scanProject('./src')
    await scanner.generateRegistryFile('./src/services/accessibility/registry-data.json')
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error)
}