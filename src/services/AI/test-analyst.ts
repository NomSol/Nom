import { TokenAnalyst } from './Analyst';
import { AccessibilityAgent } from './agent';
import { FunctionRegistry } from './registry';

// Mock user context
const userContext = {
    accessibilityNeeds: {
        vision: 'low' as 'low' | 'none' | 'color-blind',
        mobility: 'limited' as 'limited' | 'none',
        cognitive: []
    },
    preferredInteractions: ['text'],
    deviceCapabilities: ['standard-input', 'standard-output'],
    language: 'en-US'
};

// Create mock registry
const registry = new FunctionRegistry();

async function testTokenAnalyst() {
    console.log('=== Testing TokenAnalyst ===');
    const analyst = new TokenAnalyst();

    // Test getting pump tokens
    console.log('Getting pump tokens...');
    const pumpTokens = await analyst.getSolanaPumpTokens();
    console.log(`Found ${pumpTokens.length} tokens`);
    console.log('Sample tokens:', pumpTokens.slice(0, 3));

    // Test analyzing a specific token
    if (pumpTokens.length > 0) {
        const testToken = pumpTokens[0];
        console.log(`\nAnalyzing token: ${testToken.name} (${testToken.address})`);
        const tokenData = await analyst.analyzeToken(testToken.address);
        console.log('Analysis result:', tokenData ? 'Success' : 'Failed');
        if (tokenData) {
            console.log('Death score:', tokenData.deathScore.toFixed(2));
            console.log('Recovery potential:', tokenData.recoveryValue.toFixed(2));
        }
    }

    // Test getting dead tokens list
    console.log('\nGetting dead tokens list...');
    const deadTokens = await analyst.getDeadTokensList(3);
    console.log(`Found ${deadTokens.length} dead tokens`);
    console.log('Dead tokens summary:');
    console.log(analyst.formatTokensSummary(deadTokens));
}

async function testAgentIntegration() {
    console.log('\n=== Testing Agent Integration ===');
    const agent = new AccessibilityAgent(registry, userContext);

    // Test token analysis request
    console.log('Testing token analysis request...');
    const response = await agent.processRequest('Show me some dead tokens on Solana');
    console.log('Response:', response.text.substring(0, 150) + '...');

    // Test specific token request (if we have tokens)
    const pumpTokens = await new TokenAnalyst().getSolanaPumpTokens();
    if (pumpTokens.length > 0) {
        const testToken = pumpTokens[0];
        console.log(`\nTesting specific token request for ${testToken.address}...`);
        const tokenResponse = await agent.processRequest(`Analyze this token: ${testToken.address}`);
        console.log('Response:', tokenResponse.text.substring(0, 150) + '...');
    }
}

// Run tests
async function runTests() {
    try {
        await testTokenAnalyst();
        await testAgentIntegration();
        console.log('\nAll tests completed!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTests(); 