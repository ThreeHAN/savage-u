export const formatSport = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

export const getStatusClass = (status) => `status status--${status}`;
