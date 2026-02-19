import { parse, format } from 'date-fns';

export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

export const parseLocalDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  // Parse ISO string and convert to local time
  const date = new Date(dateTimeString);
  return date;
};

export const formatDate = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date) return 'No date';
  return format(date, 'EEE, MMM d');
};

export const formatDateWithDay = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date) return '';
  return format(date, 'EEE, MMM dd');
};

export const formatTime = (dateTimeString) => {
  const date = parseLocalDateTime(dateTimeString);
  if (!date) return 'No time';
  return format(date, 'h:mm a');
};

export const formatTimeNoPeriod = (dateTimeString) => {
  const date = parseLocalDateTime(dateTimeString);
  if (!date) return '';
  return format(date, 'h:mm');
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return 'No dates set';
  if (!endDate || startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const isSamePeriod = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const startDate = parseLocalDateTime(startTime);
  const endDate = parseLocalDateTime(endTime);
  if (!startDate || !endDate) return false;
  return format(startDate, 'a') === format(endDate, 'a');
};
