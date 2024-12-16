import {
    AccessibilityRequirement,
    AccessLevel,
    AgentCapability,
    FunctionMeta,
    ParameterInfo
} from './types'

export interface SearchResult {
    functionName: string
    metadata: FunctionMeta
}

export class FunctionRegistry {
    private functions = new Map<string, FunctionMeta>()
    private initialized: boolean = false

    constructor() {
        this.loadRegistry()
    }

    private loadRegistry() {
        try {
            const registryData = require('./registry-data.json')

            for (const func of registryData.functions) {
                // Convert string levels to enum
                const accessLevel = func.accessibility?.level as keyof typeof AccessLevel || AccessLevel.Basic

                // Convert capability strings to enum values
                const capabilities = (func.accessibility?.capabilities || [])
                    .map((cap: keyof typeof AgentCapability) => AgentCapability[cap])
                    .filter(Boolean)

                this.functions.set(func.name, {
                    ...func,
                    accessibility: {
                        minimumLevel: AccessLevel[accessLevel],
                        requiredCapabilities: capabilities,
                        alternatives: func.accessibility?.alternatives || []
                    },
                    category: func.category || 'general',
                    description: func.description || '',
                    parameters: this.validateParameters(func.parameters || [])
                })
            }
            console.log(`Loaded ${this.functions.size} functions into registry`)
        } catch (error) {
            console.error('Failed to load registry data:', error)
        }
    }

    private validateParameters(params: any[]): ParameterInfo[] {
        return params.map(p => ({
            name: p.name || '',
            type: p.type || 'any',
            description: p.description || '',
            isOptional: !!p.isOptional
        }))
    }

    private generateFunctionDescription(meta: FunctionMeta): string {
        const parts = [
            meta.description,
            `Parameters: ${meta.parameters.map(p =>
                `${p.name}${p.isOptional ? '?' : ''}: ${p.type}${p.description ? ` - ${p.description}` : ''}`
            ).join(', ')}`,
            `Category: ${meta.category}`,
            `Accessibility: Level ${meta.accessibility.minimumLevel}`,
            `Required Capabilities: [${meta.accessibility.requiredCapabilities.join(', ')}]`
        ]

        if (meta.accessibility.alternatives?.length) {
            parts.push(`Alternatives: ${meta.accessibility.alternatives.join(', ')}`)
        }

        return parts.join('\n')
    }

    async findRelevantFunctions(
        query: string,
        userAccessLevel: AccessLevel = AccessLevel.Basic,
        userCapabilities: AgentCapability[] = [],
        limit: number = 5
    ): Promise<SearchResult[]> {
        const results: SearchResult[] = [];

        // Simple keyword matching from the query
        const queryWords = query.toLowerCase().split(/\s+/);

        for (const [name, metadata] of this.functions.entries()) {
            // Check accessibility requirements first
            if (!this.isAccessible(metadata.accessibility, userAccessLevel, userCapabilities)) {
                continue;
            }

            // Check if function matches query keywords
            const functionText = [
                name.toLowerCase(),
                metadata.description.toLowerCase(),
                metadata.category.toLowerCase(),
                ...metadata.parameters.map(p => p.name.toLowerCase()),
                ...metadata.parameters.map(p => p.description.toLowerCase())
            ].join(' ');

            if (queryWords.some(word => functionText.includes(word))) {
                results.push({ functionName: name, metadata });
            }
        }

        // Sort results by relevance (number of matching keywords)
        return results
            .sort((a, b) => {
                const aMatchCount = queryWords.filter(word =>
                    a.metadata.description.toLowerCase().includes(word)).length;
                const bMatchCount = queryWords.filter(word =>
                    b.metadata.description.toLowerCase().includes(word)).length;
                return bMatchCount - aMatchCount;
            })
            .slice(0, limit);
    }

    private isAccessible(
        requirement: AccessibilityRequirement,
        userLevel: AccessLevel,
        userCapabilities: AgentCapability[]
    ): boolean {
        // Check minimum access level
        if (userLevel < requirement.minimumLevel) {
            return false
        }

        // Check if user has all required capabilities
        return requirement.requiredCapabilities.every(cap =>
            userCapabilities.includes(cap)
        )
    }

    getFunctionMeta(name: string): FunctionMeta | undefined {
        return this.functions.get(name)
    }

    getFunctionsByCapability(capability: AgentCapability): FunctionMeta[] {
        return Array.from(this.functions.values())
            .filter(meta => meta.accessibility.requiredCapabilities.includes(capability))
    }

    getFunctionsByAccessibilityLevel(level: AccessLevel): FunctionMeta[] {
        return Array.from(this.functions.values())
            .filter(meta => meta.accessibility.minimumLevel === level)
    }

    getCompatibleFunctions(
        userLevel: AccessLevel,
        userCapabilities: AgentCapability[]
    ): FunctionMeta[] {
        return Array.from(this.functions.values())
            .filter(meta => this.isAccessible(meta.accessibility, userLevel, userCapabilities))
    }

    getAllFunctions(): FunctionMeta[] {
        return Array.from(this.functions.values());
    }

    getRegistryStats() {
        const accessLevelCounts = new Map<AccessLevel, number>()
        const capabilityCounts = new Map<AgentCapability, number>()

        for (const meta of this.functions.values()) {
            // Count access levels
            const level = meta.accessibility.minimumLevel
            accessLevelCounts.set(level, (accessLevelCounts.get(level) || 0) + 1)

            // Count capabilities
            meta.accessibility.requiredCapabilities.forEach(cap => {
                capabilityCounts.set(cap, (capabilityCounts.get(cap) || 0) + 1)
            })
        }

        return {
            totalFunctions: this.functions.size,
            accessLevelDistribution: Object.fromEntries(accessLevelCounts),
            capabilityDistribution: Object.fromEntries(capabilityCounts),
            categoriesCount: new Set(
                Array.from(this.functions.values())
                    .map(f => f.category)
            ).size
        }
    }
}