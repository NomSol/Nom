export enum AccessLevel {
    Basic = 'BASIC',
    Enhanced = 'ENHANCED',
    Full = 'FULL'
}

export enum AgentCapability {
    VoiceControl = 'VOICE_CONTROL',
    GestureControl = 'GESTURE_CONTROL',
    ScreenReader = 'SCREEN_READER',
    ColorAdjustment = 'COLOR_ADJUSTMENT',
    SimplifiedUI = 'SIMPLIFIED_UI'
}

export interface UserContext {
    accessibilityNeeds: {
        vision?: 'low' | 'none' | 'color-blind'
        mobility?: 'limited' | 'none'
        cognitive?: string[]
    }
    preferredInteractions: string[]
    language: string
    deviceCapabilities: string[]
}

export interface FunctionMeta {
    name: string
    description: string
    parameters: ParameterInfo[]
    returnType: string
    accessibility: AccessibilityRequirement
    category: string
}

export interface ParameterInfo {
    name: string
    type: string
    description: string
    isOptional: boolean
}

export interface AccessibilityRequirement {
    minimumLevel: AccessLevel
    requiredCapabilities: AgentCapability[]
    alternatives?: string[]
}

export interface AccessibilityResponse {
    text: string
    actions: Action[]
    alternatives: Alternative[]
    context?: any
}

export interface Action {
    type: string
    description: string
    function?: string
    args?: any[]
    fallback?: string
}

export interface Alternative {
    type: string
    description: string
    priority: number
}

