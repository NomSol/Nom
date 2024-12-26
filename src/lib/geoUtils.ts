// lib/geo-utils.ts
export function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360) - 180; // 将经度限制在 -180 到 180 之间
}

export function normalizeLatitude(latitude: number): number {
  while (latitude > 90 || latitude < -90) {
    if (latitude > 90) {
      latitude = 180 - latitude; // 翻转超过 90 的纬度
    }
    if (latitude < -90) {
      latitude = -180 - latitude; // 翻转小于 -90 的纬度
    }
  }
  return latitude;
}
