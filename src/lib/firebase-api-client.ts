import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_API || 'http://localhost:3000/api/firebase';

class FirebaseApiClient {
    // User API
    async getUserByEmail(email: string) {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { email }
        });
        return response.data;
    }

    async getUserByNickname(nickname: string) {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { nickname }
        });
        return response.data;
    }

    async createUser(userData: any) {
        const response = await axios.post(`${API_BASE_URL}/users`, userData);
        return response.data;
    }

    async updateUser(email: string, updates: any) {
        const response = await axios.patch(`${API_BASE_URL}/users`, {
            email,
            ...updates
        });
        return response.data;
    }

    async getWalletUser(walletAddress: string) {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { walletAddress }
        });
        return response.data;
    }

    // Treasures API
    async getAllTreasures() {
        const response = await axios.get(`${API_BASE_URL}/treasures`);
        return { treasures: response.data.treasures };
    }

    async getTreasureById(id: string) {
        const response = await axios.get(`${API_BASE_URL}/treasures/${id}`);
        return { treasures_by_pk: response.data.treasure };
    }

    async getUserPlacements(creatorId: string) {
        const response = await axios.get(`${API_BASE_URL}/treasures`, {
            params: { creatorId }
        });
        return { treasures: response.data.treasures };
    }

    async getUserFindings(finderId: string) {
        const response = await axios.get(`${API_BASE_URL}/treasures`, {
            params: { finderId }
        });
        return { treasures: response.data.treasures };
    }

    async createTreasure(treasure: any) {
        const response = await axios.post(`${API_BASE_URL}/treasures`, treasure);
        return { insert_treasures_one: response.data };
    }

    async updateTreasure(id: string, updates: any) {
        const response = await axios.patch(`${API_BASE_URL}/treasures`, {
            id,
            ...updates
        });
        return { update_treasures_by_pk: response.data };
    }

    async deleteTreasure(id: string) {
        const response = await axios.delete(`${API_BASE_URL}/treasures`, {
            params: { id }
        });
        return { delete_treasures_by_pk: response.data };
    }

    async verifyTreasure(id: string, verification_code: string, finder_id: string) {
        const response = await axios.patch(`${API_BASE_URL}/treasures`, {
            id,
            status: 'FOUND',
            finder_id,
            verification_code
        });
        return { update_treasures_by_pk: response.data };
    }

    // Likes API
    async getTreasureLikesCount(treasureId: string) {
        const response = await axios.get(`${API_BASE_URL}/likes`, {
            params: { treasureId }
        });
        return {
            treasures_by_pk: {
                likes_count: response.data.likes ? response.data.likes.length : 0
            }
        };
    }

    async getUserLikes(userId: string) {
        const response = await axios.get(`${API_BASE_URL}/likes`, {
            params: { userId }
        });
        return { likes: response.data.likes };
    }

    async likeTreasure(userId: string, treasureId: string) {
        const response = await axios.post(`${API_BASE_URL}/likes`, {
            user_id: userId,
            treasure_id: treasureId
        });
        return { insert_likes_one: response.data };
    }

    async unlikeTreasure(userId: string, treasureId: string) {
        const response = await axios.delete(`${API_BASE_URL}/likes`, {
            params: { userId, treasureId }
        });
        return { delete_likes: response.data };
    }

    // Matches API
    async getMatch(userId: string, treasureId: string) {
        const response = await axios.get(`${API_BASE_URL}/matches`, {
            params: { userId, treasureId }
        });
        return { matches: response.data.match ? [response.data.match] : [] };
    }

    async getUserMatches(userId: string, status?: string) {
        const response = await axios.get(`${API_BASE_URL}/matches`, {
            params: { userId, status }
        });
        return { matches: response.data.matches };
    }

    async getTreasureMatches(treasureId: string, status?: string) {
        const response = await axios.get(`${API_BASE_URL}/matches`, {
            params: { treasureId, status }
        });
        return { matches: response.data.matches };
    }

    async createMatch(userId: string, treasureId: string) {
        const response = await axios.post(`${API_BASE_URL}/matches`, {
            user_id: userId,
            treasure_id: treasureId
        });
        return { insert_matches_one: response.data };
    }

    async updateMatchStatus(id: string, status: string) {
        const response = await axios.patch(`${API_BASE_URL}/matches`, {
            id,
            status
        });
        return { update_matches_by_pk: response.data };
    }
}

export const firebaseApiClient = new FirebaseApiClient(); 