const debounce = (cb, ms) => {
  let timer;

  return () => {
    if (timer) {
      window.clearTimeout(timer);
    }

    timer = setTimeout(() => cb(), ms)
  }
}

const getNounPluralForm = (number, one, two, many) => {
  number = parseInt(number);
  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod100 >= 11 && mod100 <= 20) { return many }
  if (mod10 > 5) { return many }
  if (mod10 === 1) { return one }
  if (mod10 >= 2 && mod10 <= 4) { return two }

  return many;
}

const getTimeString = (date, locale = 'ru-RU', options = { hour: '2-digit', minute: '2-digit' }) => {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

const getDateString = (
  date,
  locale = 'ru-RU',
  dateOptions = { day: '2-digit', month: 'short'},
  weekdayOptions = { weekday: 'short' },
) => {
  const dateObject = new Date(date);
  const dateString = new Intl.DateTimeFormat(locale, dateOptions).format(dateObject);
  const weekdayString = new Intl.DateTimeFormat(locale, weekdayOptions).format(dateObject);
  return `${dateString} ${weekdayString}`;
}

const convertMinutes = (minutesCount) => {
  const hoursCount = Math.floor(minutesCount / 60);
  const remainingMinutesCount = minutesCount % 60;
  return `${hoursCount} ч ${remainingMinutesCount} мин`;
}

const setFilterState = (queryString, filterNode) => {
  const params = new URLSearchParams(queryString);

  Array.from(params.entries()).forEach((entry) => {
    const input = filterNode.querySelector(`input[name="${entry[0]}"][value="${entry[1]}"]`)
      || filterNode.querySelector(`input[name="${entry[0]}"][type="number"]`);

    if (input) {
      if (input.type === 'number') {
        input.value = entry[1];
      } else {
        input.checked = true
      }
    };
  });
}

const generateQs = (filterNode) => {
  const filterData = new FormData(filterNode);

  Array.from(filterData.entries()).forEach((entry) => {
    if (entry[1] === '') { filterData.delete(entry[0]) }
  })

  const params = new URLSearchParams(filterData);
  return params.toString();
}

export {
  getNounPluralForm,
  getTimeString,
  getDateString,
  convertMinutes,
  debounce,
  setFilterState,
  generateQs
};
