export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA'); // 返回 YYYY-MM-DD 格式
}
