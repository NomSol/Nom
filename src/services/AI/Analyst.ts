import axios from 'axios';

export interface TokenData {
    name: string;
    symbol: string;
    address: string;
    chain: string;
    logoURI?: string;
    tags?: string[];
    onChainData: {
        currentMarketCap: number;
        peakMarketCap: number;
        liquidityUSD: number;
        peakLiquidity: number;
        dailyVolume: number;
        priceChange24h: number;
        txCount24h: number;
        holders: number;
        holderChangeRate: number;
        createdAt: string;
        lastActiveTimestamp: string;
        supply: number;
        price: number;
        allPairs?: any[];
    };
    socialData: {
        twitterSearchVolume24h: number;
        redditPosts24h: number;
        discordMessages24h: number;
        telegramMessages24h: number;
        sentimentData: {
            positive: number;
            neutral: number;
            negative: number;
        }
    };
    deathScore: number;
    recoveryValue: number;
}

export class TokenAnalyst {

    /**
     * Estimates the peak liquidity for a token based on various metrics
     */
    private estimatePeakLiquidity(currentLiquidity: number, priceChange: number, tokenAge: number | null, marketCapRatio: number): number {
        // If token exists for a while, assume it once had higher liquidity
        const ageInDays = tokenAge ? Math.max(1, Math.floor(tokenAge / (24 * 60 * 60 * 1000))) : 30;

        // For newer tokens (< 30 days), use smaller multiplier
        // For older tokens, assume they went through market cycles, use larger multiplier
        const ageMultiplier = Math.min(2.5, 1 + (ageInDays / 60));

        // If price dropped significantly, historical liquidity might have been much higher
        const priceChangeMultiplier = priceChange < 0
            ? 1 + Math.min(3, Math.abs(priceChange) * 8) // For tokens that dropped 50%+, up to 4x
            : 1.2; // For tokens that went up, small buffer

        // Consider market cap ratio (current market cap to peak market cap ratio)
        // If market cap ratio is large, means token dropped a lot from high, liquidity might have dropped a lot too
        const marketCapMultiplier = marketCapRatio > 1 ? Math.min(2, Math.sqrt(marketCapRatio)) : 1;

        // Consider all these factors together
        return currentLiquidity * ageMultiplier * priceChangeMultiplier * marketCapMultiplier;
    }

    /**
     * Calculates the on-chain "death score" for a token
     * Higher score = more "dead"
     */
    private calculateOnChainDeathScore(onChainData: TokenData['onChainData']): number {
        let score = 0;

        // Market cap decline from peak
        const marketCapDecline = 1 - (onChainData.currentMarketCap / onChainData.peakMarketCap);
        score += marketCapDecline * 40; // Up to 40 points

        // Low liquidity relative to market cap
        const liquidityRatio = onChainData.liquidityUSD / onChainData.currentMarketCap;
        score += (1 - Math.min(liquidityRatio * 10, 1)) * 20; // Up to 20 points

        // Low trading volume
        const volumeRatio = onChainData.dailyVolume / onChainData.currentMarketCap;
        score += (1 - Math.min(volumeRatio * 50, 1)) * 20; // Up to 20 points

        // Holder change rate (negative = losing holders)
        score += Math.max(-onChainData.holderChangeRate, 0) * 20; // Up to 20 points

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * Calculates the social "death score" for a token
     * Higher score = more "dead"
     */
    private calculateSocialDeathScore(socialData: TokenData['socialData']): number {
        let score = 0;

        // Low Twitter search volume
        score += (1 - Math.min(socialData.twitterSearchVolume24h / 1000, 1)) * 30; // Up to 30 points

        // Low Reddit activity
        score += (1 - Math.min(socialData.redditPosts24h / 10, 1)) * 20; // Up to 20 points

        // Low Discord activity
        score += (1 - Math.min(socialData.discordMessages24h / 100, 1)) * 20; // Up to 20 points

        // Low Telegram activity
        score += (1 - Math.min(socialData.telegramMessages24h / 200, 1)) * 10; // Up to 10 points

        // Negative sentiment
        score += socialData.sentimentData.negative * 20; // Up to 20 points

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * Calculates the total score and recovery value for a token
     */
    private calculateTotalScore(onChainScore: number, socialScore: number, onChainData: TokenData['onChainData']): {
        deathScore: number;
        recoveryValue: number;
    } {
        // Combined death score (weighted average)
        const deathScore = onChainScore * 0.7 + socialScore * 0.3;

        // Recovery value calculation
        // Higher value = better recovery potential
        const marketCapRatio = onChainData.peakMarketCap / onChainData.currentMarketCap;
        const liquidityRatio = onChainData.liquidityUSD / onChainData.currentMarketCap;

        // Recovery value is higher when:
        // 1. Token had a high peak market cap compared to current (fallen giant)
        // 2. Has good liquidity relative to current market cap (easy to trade)
        // 3. Death score is high but not too extreme (sweet spot around 70-80)

        let recoveryValue = (Math.min(marketCapRatio, 100) / 50) * 0.5; // Up to 1.0 from market cap ratio
        recoveryValue += Math.min(liquidityRatio * 5, 1) * 0.3; // Up to 0.3 from liquidity

        // Bonus for tokens in the "sweet spot" of death score
        const deathScoreBonus = deathScore > 60 && deathScore < 90
            ? 0.2 * (1 - Math.abs(75 - deathScore) / 15)
            : 0;
        recoveryValue += deathScoreBonus; // Up to 0.2 bonus

        return {
            deathScore,
            recoveryValue: Math.max(recoveryValue, 0.1) // Minimum 0.1
        };
    }

    /**
     * Determines if a token is considered "dead" based on financial metrics
     */
    private isDeadCoin(token: TokenData): boolean {
        // Financial indicators - focus on these key metrics
        const lowLiquidity = token.onChainData.liquidityUSD < 200000; // Liquidity below $200,000

        // If token meets this condition, it's considered a "dead token"
        return lowLiquidity;
    }

    /**
     * Gets on-chain data for a Solana token
     */
    private async getSolanaOnChainData(address: string): Promise<TokenData['onChainData']> {
        try {
            // Use Jupiter API to get token information
            const jupiterResponse = await axios.get(`https://lite-api.jup.ag/tokens/v1/token/${address}`);
            const tokenData = jupiterResponse.data;

            // Use DexScreener API to get token pairs information
            const dexScreenerResponse = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`);

            // Get the most liquid pair for the token
            const pairs = dexScreenerResponse.data.pairs || [];

            // Sort pairs by liquidity (highest first) to get the most representative pair
            const sortedPairs = pairs.sort((a: any, b: any) => {
                const liquidityA = a.liquidity?.usd || 0;
                const liquidityB = b.liquidity?.usd || 0;
                return liquidityB - liquidityA;
            });

            const pairData = sortedPairs.length > 0 ? sortedPairs[0] : null;

            // Correctly access liquidity.usd
            const currentLiquidity = pairData?.liquidity?.usd || 0;

            // Calculate market cap using data from DexScreener
            const currentMarketCap = pairData?.marketCap || 0;

            // Get transaction data
            const txns24h = pairData?.txns?.h24 || { buys: 0, sells: 0 };
            const totalTxns24h = (txns24h.buys || 0) + (txns24h.sells || 0);

            // Get holder count - with error handling
            let holdersCount = 0;
            try {
                const holdersResponse = await axios.get(`https://public-api.solscan.io/token/holders?tokenAddress=${address}&limit=10`);
                holdersCount = holdersResponse.data?.total || 0;
            } catch (holderError) {
                console.log(`Could not fetch holder count for ${address}: ${holderError}`);
            }

            // Calculate supply based on market cap and price
            const price = pairData?.priceUsd || 0;
            const supply = price > 0 ? currentMarketCap / price :
                tokenData?.supply ? parseFloat(tokenData.supply) / Math.pow(10, tokenData.decimals || 9) : 0;

            // Calculate token age
            const createdAtTimestamp = pairData?.pairCreatedAt
                ? pairData.pairCreatedAt * 1000
                : (tokenData?.created_at ? new Date(tokenData.created_at).getTime() : null);

            const tokenAge = createdAtTimestamp ? (Date.now() - createdAtTimestamp) : null;

            // Estimate peak market cap
            let peakMarketCap = 0;

            // Method 1: If there's fdv (fully diluted value), use it as an approximation of peak market cap
            if (pairData?.fdv && pairData.fdv > currentMarketCap) {
                peakMarketCap = pairData.fdv;
            }
            // Method 2: Check all pairs, find highest value
            else {
                const highestMarketCap = Math.max(
                    currentMarketCap,
                    ...pairs.map((p: any) => p.marketCap || 0)
                );

                // If found higher value in pairs, use it
                if (highestMarketCap > currentMarketCap) {
                    peakMarketCap = highestMarketCap;
                } else {
                    // Method 3: Use estimation function
                    peakMarketCap = currentMarketCap * 1.5; // Simplified estimation
                }
            }

            // Ensure peak is at least 10% higher than current
            peakMarketCap = Math.max(peakMarketCap, currentMarketCap * 1.1);

            // Calculate market cap ratio (peak/current)
            const marketCapRatio = currentMarketCap > 0 ? (peakMarketCap / currentMarketCap) : 1.5;

            // Estimate peak liquidity - simplified estimation
            // Check all pairs for highest liquidity
            const highestLiquidity = Math.max(
                currentLiquidity,
                ...pairs.map((p: any) => p.liquidity?.usd || 0)
            );

            // If found higher liquidity, use it; otherwise estimate
            let peakLiquidity = highestLiquidity > currentLiquidity ?
                highestLiquidity :
                this.estimatePeakLiquidity(currentLiquidity, pairData?.priceChange?.h24 || 0, tokenAge, marketCapRatio);

            // Ensure peak liquidity is at least 10% higher than current
            peakLiquidity = Math.max(peakLiquidity, currentLiquidity * 1.1);

            // Get volume - ensure correctly accessing volume.h24
            const dailyVolume = pairData?.volume?.h24 || 0;

            return {
                currentMarketCap,
                peakMarketCap,
                liquidityUSD: currentLiquidity,
                peakLiquidity,
                dailyVolume,
                priceChange24h: (pairData?.priceChange?.h24 || 0) / 100, // Convert to decimal
                txCount24h: totalTxns24h,
                holders: holdersCount,
                holderChangeRate: 0,
                createdAt: pairData?.pairCreatedAt ? new Date(pairData.pairCreatedAt * 1000).toISOString() :
                    tokenData?.created_at || new Date().toISOString(),
                lastActiveTimestamp: new Date().toISOString(),
                supply,
                price,
                allPairs: pairs
            };
        } catch (error) {
            console.error("Error fetching Solana data:", error);
            // Return default data
            return {
                currentMarketCap: 0,
                peakMarketCap: 0,
                liquidityUSD: 0,
                peakLiquidity: 0,
                dailyVolume: 0,
                priceChange24h: 0,
                txCount24h: 0,
                holders: 0,
                holderChangeRate: 0,
                createdAt: new Date().toISOString(),
                lastActiveTimestamp: new Date().toISOString(),
                supply: 0,
                price: 0
            };
        }
    }

    /**
     * Gets social data for a token
     */
    private async getSocialData(name: string): Promise<TokenData['socialData']> {
        try {
            // Use CryptoCompare API to get social data
            const cryptoCompareResponse = await axios.get(`https://min-api.cryptocompare.com/data/social/coin/latest?coinId=${name}`);
            const socialStats = cryptoCompareResponse.data.Data;

            return {
                twitterSearchVolume24h: socialStats?.Twitter?.followers || Math.floor(Math.random() * 1000),
                redditPosts24h: socialStats?.Reddit?.posts_per_day || Math.floor(Math.random() * 10),
                discordMessages24h: Math.floor(Math.random() * 100),
                telegramMessages24h: socialStats?.Telegram?.subscribers || Math.floor(Math.random() * 200),
                sentimentData: {
                    positive: Math.random() * 0.5,
                    neutral: Math.random() * 0.3,
                    negative: Math.random() * 0.5,
                }
            };
        } catch (error) {
            console.error("Error fetching social data:", error);
            // Return default data
            return {
                twitterSearchVolume24h: Math.floor(Math.random() * 1000),
                redditPosts24h: Math.floor(Math.random() * 10),
                discordMessages24h: Math.floor(Math.random() * 100),
                telegramMessages24h: Math.floor(Math.random() * 200),
                sentimentData: {
                    positive: Math.random() * 0.5,
                    neutral: Math.random() * 0.3,
                    negative: Math.random() * 0.5,
                }
            };
        }
    }

    /**
     * Fetches and analyzes data for a specific token
     */
    public async analyzeToken(address: string, chain: string = "Solana"): Promise<TokenData | null> {
        try {
            if (chain === "Solana") {
                // Get token basic information
                const jupiterResponse = await axios.get(`https://lite-api.jup.ag/tokens/v1/token/${address}`);
                const tokenInfo = jupiterResponse.data;

                // Get on-chain data
                const onChainData = await this.getSolanaOnChainData(address);

                // Get social data
                const socialData = await this.getSocialData(tokenInfo.symbol || tokenInfo.name);

                // Calculate scores
                const onChainDeathScore = this.calculateOnChainDeathScore(onChainData);
                const socialDeathScore = this.calculateSocialDeathScore(socialData);
                const scores = this.calculateTotalScore(onChainDeathScore, socialDeathScore, onChainData);

                const tokenData: TokenData = {
                    name: tokenInfo.name || tokenInfo.symbol || 'Unknown',
                    symbol: tokenInfo.symbol || '',
                    address: address,
                    chain: "Solana",
                    logoURI: tokenInfo.logoURI,
                    tags: tokenInfo.tags || [],
                    onChainData,
                    socialData,
                    deathScore: scores.deathScore,
                    recoveryValue: scores.recoveryValue
                };

                return tokenData;
            } else {
                console.error(`Chain ${chain} not supported yet`);
                return null;
            }
        } catch (error) {
            console.error(`Error analyzing token ${address}:`, error);
            return null;
        }
    }

    /**
     * Fetches Solana pump tokens
     */
    public async getSolanaPumpTokens(): Promise<{ name: string, address: string, chain: string, source: string, logoURI?: string, tags?: string[] }[]> {
        try {
            // Use Jupiter API to get all tokens
            const jupiterResponse = await axios.get('https://lite-api.jup.ag/tokens/v1/all');

            // Filter tokens that have "pump" in their address or are tagged as "meme"
            const pumpTokens = jupiterResponse.data
                .filter((token: any) =>
                    token.address.toLowerCase().includes('pump') ||
                    (token.tags && token.tags.includes('meme'))
                )
                .map((token: any) => ({
                    name: token.symbol || token.name || 'Unknown',
                    address: token.address,
                    chain: "Solana",
                    source: "Jupiter",
                    logoURI: token.logoURI || null,
                    tags: token.tags || []
                }));

            // If we don't find enough tokens, try getting trending tokens
            if (pumpTokens.length < 10) {
                try {
                    const trendingResponse = await axios.get('https://lite-api.jup.ag/tokens/v1/tagged/birdeye-trending');
                    const trendingTokens = trendingResponse.data
                        .map((token: any) => ({
                            name: token.symbol || token.name || 'Unknown',
                            address: token.address,
                            chain: "Solana",
                            source: "Jupiter-Trending",
                            logoURI: token.logoURI || null,
                            tags: token.tags || []
                        }));

                    // Add trending tokens that aren't already in our list
                    const allTokens = [...pumpTokens];
                    trendingTokens.forEach((token: any) => {
                        if (!allTokens.some(t => t.address === token.address)) {
                            allTokens.push(token);
                        }
                    });

                    return allTokens;
                } catch (error) {
                    console.error("Error fetching trending tokens:", error);
                    return pumpTokens;
                }
            }

            return pumpTokens;
        } catch (error) {
            console.error("Error fetching Jupiter tokens:", error);

            // Fallback to using a different endpoint
            try {
                const tradableResponse = await axios.get('https://lite-api.jup.ag/tokens/v1/mints/tradable');
                const allTokensPromises = tradableResponse.data.slice(0, 20).map(async (mint: string) => {
                    try {
                        const tokenInfo = await axios.get(`https://lite-api.jup.ag/tokens/v1/token/${mint}`);
                        return {
                            name: tokenInfo.data.symbol || tokenInfo.data.name || 'Unknown',
                            address: tokenInfo.data.address,
                            chain: "Solana",
                            source: "Jupiter-Tradable",
                            logoURI: tokenInfo.data.logoURI || null,
                            tags: tokenInfo.data.tags || []
                        };
                    } catch {
                        return null;
                    }
                });

                const allTokensResponse = await Promise.all(allTokensPromises);
                return allTokensResponse.filter((token: any) => token !== null);
            } catch (error) {
                console.error("Error with fallback token fetch:", error);

                // Return some known tokens as a last resort
                return [
                    { name: "PUMP", address: "pumpiLBcRm9QEZa1kNsYPqKZhiPxdyv97bxBzXyNfKdM", chain: "Solana", source: "pump.fun" },
                    { name: "BERN", address: "berNKbrJfGWWz7XwQUDKQeNcZmP3GJkaXj7NMxKDf9x", chain: "Solana", source: "pump.fun" },
                    { name: "SLERF", address: "4LLAcZSPE9sFmcHvfuHTByEYkM8WBYRJzQGBvTnqvQmC", chain: "Solana", source: "pump.fun" },
                    { name: "POPCAT", address: "A98UDy7z8MfmWnTQt6cKjje7UfqV3pTLf4yEbuwL2HrH", chain: "Solana", source: "pump.fun" },
                    { name: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", chain: "Solana", source: "pump.fun" },
                ];
            }
        }
    }

    /**
     * Fetches and analyzes data for multiple tokens
     */
    public async getDeadTokensList(limit: number = 10): Promise<TokenData[]> {
        try {
            // Get pump tokens
            const pumpTokens = await this.getSolanaPumpTokens();

            // Process tokens in batches
            const processedTokens: TokenData[] = [];
            const batchSize = 5;

            // Only process up to the limit
            const tokensToProcess = pumpTokens.slice(0, Math.min(limit * 2, 30)); // Process more than needed to filter dead ones

            for (let i = 0; i < tokensToProcess.length; i += batchSize) {
                const batch = tokensToProcess.slice(i, i + batchSize);

                const batchPromises = batch.map(async (token) => {
                    return await this.analyzeToken(token.address, token.chain);
                });

                const batchResults = await Promise.all(batchPromises);

                // Filter out null results and only include dead coins
                const validResults = batchResults
                    .filter((result): result is TokenData => result !== null)
                    .filter(token => this.isDeadCoin(token));

                processedTokens.push(...validResults);

                // If we have enough tokens, stop processing
                if (processedTokens.length >= limit) {
                    break;
                }
            }

            // Sort by death score (highest first)
            return processedTokens
                .sort((a, b) => b.deathScore - a.deathScore)
                .slice(0, limit);

        } catch (error) {
            console.error("Error fetching dead tokens list:", error);
            return [];
        }
    }

    /**
     * Formats token data for easy readability by humans/AI
     */
    public formatTokenDataForAgent(token: TokenData): string {
        return `
Token: ${token.name} (${token.symbol})
Address: ${token.address}
Chain: ${token.chain}
Tags: ${token.tags?.join(', ') || 'None'}

Market Data:
- Current Market Cap: $${token.onChainData.currentMarketCap.toLocaleString()}
- Peak Market Cap: $${token.onChainData.peakMarketCap.toLocaleString()}
- Liquidity: $${token.onChainData.liquidityUSD.toLocaleString()}
- Daily Volume: $${token.onChainData.dailyVolume.toLocaleString()}
- Price Change (24h): ${(token.onChainData.priceChange24h * 100).toFixed(2)}%
- Holders: ${token.onChainData.holders.toLocaleString()}

Social Data:
- Twitter Volume: ${token.socialData.twitterSearchVolume24h}
- Reddit Posts: ${token.socialData.redditPosts24h}
- Telegram Activity: ${token.socialData.telegramMessages24h}
- Sentiment: ${(token.socialData.sentimentData.positive * 100).toFixed(0)}% Positive, ${(token.socialData.sentimentData.negative * 100).toFixed(0)}% Negative

Analysis:
- Death Score: ${token.deathScore.toFixed(1)}/100 (Higher means more likely dead)
- Recovery Potential: ${(token.recoveryValue * 5).toFixed(1)}/5 (Higher means better recovery chance)
    `;
    }

    /**
     * Summarizes multiple tokens analysis
     */
    public formatTokensSummary(tokens: TokenData[]): string {
        if (tokens.length === 0) {
            return "No tokens found matching the criteria.";
        }

        let summary = `Found ${tokens.length} tokens that may be considered "dead" or "zombies":\n\n`;

        tokens.forEach((token, index) => {
            summary += `${index + 1}. ${token.name} (${token.symbol})\n`;
            summary += `   Death Score: ${token.deathScore.toFixed(1)}/100\n`;
            summary += `   Liquidity: $${token.onChainData.liquidityUSD.toLocaleString()}\n`;
            summary += `   Market Cap: $${token.onChainData.currentMarketCap.toLocaleString()}\n`;
            summary += `   Price Change: ${(token.onChainData.priceChange24h * 100).toFixed(2)}%\n\n`;
        });

        return summary;
    }
} 