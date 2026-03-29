const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseLocalDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

export function getRelativeDateLabel(dateString: string) {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseLocalDate(dateString));
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY);

  if (diffDays < 0) return "OVERDUE";
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "TOMORROW";
  if (diffDays <= 7) return `IN ${diffDays} DAYS`;
  return `IN ${diffDays} DAYS`;
}
