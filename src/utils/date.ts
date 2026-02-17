import { format, formatDistanceToNow, isValid } from 'date-fns';

export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (!isValid(date)) {
      return '--:--:--';
    }
    return format(date, 'HH:mm:ss');
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return '--:--:--';
  }
}

export function formatDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, 'MMM dd, HH:mm');
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return 'Invalid date';
  }
}

export function formatRelativeTime(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (!isValid(date)) {
      return 'unknown time';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return 'unknown time';
  }
}
