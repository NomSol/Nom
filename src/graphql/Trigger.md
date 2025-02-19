1. **自动开始比赛触发器**
```sql
-- 监听 match_members 表的变化，当队伍人数满足时自动开始比赛
CREATE OR REPLACE FUNCTION auto_start_match()
RETURNS TRIGGER AS $$
DECLARE
  all_teams_ready BOOLEAN;
BEGIN
  -- 检查是否所有队伍都已满
  SELECT EXISTS (
    SELECT 1
    FROM match_teams
    WHERE match_id = NEW.match_id
    GROUP BY match_id
    HAVING BOOL_AND(current_players = max_players)
  ) INTO all_teams_ready;

  IF all_teams_ready THEN
    UPDATE treasure_matches
    SET 
      status = 'playing',
      start_time = NOW(),
      end_time = NOW() + duration
    WHERE id = NEW.match_id
    AND status = 'matching';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_auto_start
AFTER INSERT OR UPDATE ON match_members
FOR EACH ROW
EXECUTE FUNCTION auto_start_match();
```

2. **自动结束比赛触发器**
```sql
-- 监听 treasure_matches 表，到达结束时间时自动结算
CREATE OR REPLACE FUNCTION auto_end_match()
RETURNS TRIGGER AS $$
DECLARE
  winner_team_id uuid;
BEGIN
  IF NEW.status = 'playing' AND NOW() >= NEW.end_time THEN
    -- 找出得分最高的队伍
    SELECT team.id INTO winner_team_id
    FROM match_teams team
    WHERE team.match_id = NEW.id
    ORDER BY team.total_score DESC
    LIMIT 1;

    -- 更新比赛状态
    UPDATE treasure_matches
    SET 
      status = 'finished',
      end_time = NOW(),
      winner_team_id = winner_team_id
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_auto_end
AFTER UPDATE ON treasure_matches
FOR EACH ROW
WHEN (OLD.status = 'playing' AND OLD.end_time IS NOT NULL)
EXECUTE FUNCTION auto_end_match();
```

3. **更新队伍总分触发器**
```sql
-- 当有新的宝藏发现记录时，自动更新队伍总分
CREATE OR REPLACE FUNCTION update_team_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE match_teams
  SET total_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM match_discoveries
    WHERE team_id = NEW.team_id
  )
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discovery_update_team_score
AFTER INSERT ON match_discoveries
FOR EACH ROW
EXECUTE FUNCTION update_team_score();
```

4. **更新个人得分触发器**
```sql
-- 更新玩家个人得分
CREATE OR REPLACE FUNCTION update_member_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE match_members
  SET individual_score = (
    SELECT COALESCE(SUM(score), 0)
    FROM match_discoveries
    WHERE user_id = NEW.user_id
    AND team_id = NEW.team_id
  )
  WHERE user_id = NEW.user_id
  AND team_id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discovery_update_member_score
AFTER INSERT ON match_discoveries
FOR EACH ROW
EXECUTE FUNCTION update_member_score();
```

5. **清理触发器** (可选)
```sql
-- 清理过期的未开始比赛
CREATE OR REPLACE FUNCTION clean_stale_matches()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM treasure_matches
  WHERE status = 'matching'
  AND created_at < NOW() - INTERVAL '30 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_clean_stale_matches
AFTER INSERT ON treasure_matches
EXECUTE FUNCTION clean_stale_matches();
```

触发顺序和时机：
1. 创建比赛 -> 设置初始状态
2. 玩家加入 -> `auto_start_match` 触发器检查是否可以开始
3. 比赛进行中 -> `update_team_score` 和 `update_member_score` 触发器更新分数
4. 时间结束 -> `auto_end_match` 触发器执行结算
5. 定期清理 -> `clean_stale_matches` 触发器清理过期数据