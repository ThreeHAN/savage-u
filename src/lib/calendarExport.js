export const generateCalendarFile = (tournaments, parseLocalDate, scheduleTitle) => {
  const events = [];
  
  tournaments.forEach((tournament) => {
    const startDate = parseLocalDate(tournament.startDate);
    const endDate = parseLocalDate(tournament.endDate);
    
    if (startDate) {
      const event = {
        id: tournament._id,
        title: tournament.title,
        description: `Location: ${tournament.location?.name || 'TBD'}${tournament.notes ? `\nNotes: ${tournament.notes}` : ''}`,
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()],
        duration: {
          days: endDate && tournament.endDate !== tournament.startDate 
            ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
            : 1
        },
        location: tournament.location?.address || tournament.location?.name || 'TBD'
      };
      events.push(event);
    }
  });

  // Generate calendar file
  const filename = scheduleTitle ? `${scheduleTitle}-tournaments.ics` : 'tournaments.ics';
  
  let calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Savage U//Tournament Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${scheduleTitle || 'Tournaments'}
X-WR-TIMEZONE:UTC
`;

  events.forEach((event) => {
    const startDate = event.start;
    const dateStr = `${startDate[0]}${String(startDate[1]).padStart(2, '0')}${String(startDate[2]).padStart(2, '0')}`;
    const now = new Date();
    const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;
    
    calendarContent += `BEGIN:VEVENT
UID:${event.id}@savageu.com
DTSTAMP:${dtstamp}
DTSTART;VALUE=DATE:${dateStr}
DURATION:P${event.duration.days}D
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description}
END:VEVENT
`;
  });

  calendarContent += `END:VCALENDAR`;

  return { filename, calendarContent };
};

export const downloadCalendarFile = (filename, calendarContent) => {
  const filetype = 'text/plain';
  const blob = new Blob([calendarContent], { type: filetype });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
