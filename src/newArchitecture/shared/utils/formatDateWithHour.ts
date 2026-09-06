export function formatDateWithHour(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const half = parseInt(hour) < 12 ? '00' : '12';
  return `${day}.${month}.${year} ${half}:00`;
}