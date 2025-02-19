1. **基础类型定义**
```typescript
// 1. 核心实体类型
interface Match {...}        // 比赛主体
interface MatchTeam {...}    // 队伍信息
interface MatchMember {...}  // 队员信息
interface MatchDiscovery {...} // 宝藏发现记录

// 2. 输入类型
interface CreateMatchInput {...}      // 创建比赛
interface CreateTeamInput {...}       // 创建队伍
interface AddTeamMemberInput {...}    // 添加队员
interface UpdateTeamPlayersInput {...} // 更新队伍人数
interface UpdateMatchStatusInput {...} // 更新比赛状态
interface UpdateTeamScoreInput {...}  // 更新分数
interface SettleMatchInput {...}      // 结算输入

// 3. 响应类型
interface CreateMatchResponse {...}    // 创建比赛响应
interface CreateTeamResponse {...}     // 创建队伍响应
interface AddTeamMemberResponse {...}  // 添加队员响应
interface MatchStatusResponse {...}    // 状态查询响应
interface SettleMatchResponse {...}    // 结算响应
```

2. **GraphQL 操作分类**

A. **比赛创建与匹配**
```typescript
CREATE_MATCH          // 创建比赛
CREATE_TEAMS         // 创建队伍
ADD_TEAM_MEMBER      // 添加队员
GET_WAITING_MATCHES  // 获取等待中的比赛
CHECK_EXISTING_MATCH // 检查现有比赛
```

B. **比赛进行中的操作**
```typescript
UPDATE_MATCH_STATUS  // 更新比赛状态
UPDATE_TEAM_PLAYERS  // 更新队伍人数
UPDATE_TEAM_SCORE    // 更新队伍分数
RECORD_DISCOVERY     // 记录宝藏发现
GET_MATCH_DETAILS    // 获取比赛详情
```

C. **实时订阅**
```typescript
MATCH_SUBSCRIPTION          // 比赛状态订阅
WAITING_MATCHES_SUBSCRIPTION // 等待队列订阅
```

D. **结算相关**
```typescript
SETTLE_MATCH         // 手动结算
GET_MATCH_RESULT     // 获取结算结果
```

E. **异常处理**
```typescript
LEAVE_MATCH         // 离开比赛
DELETE_MATCH        // 删除比赛
```

3. **状态流转**
```
created -> matching -> playing -> finished
```

4. **字段重要性分级**
```typescript
// 必要字段（一定需要）
id, status, match_type, required_players_per_team

// 状态相关字段
start_time, end_time, duration, is_finished

// 结算相关字段
winner_team_id, total_score, individual_score

// 元数据字段
created_at, updated_at
```