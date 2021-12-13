function debounce(cb, ms) {
  let timer;

  return () => {
    if (timer) {
      window.clearTimeout(timer);
    }

    timer = setTimeout(() => cb(), ms);
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

function getTimeString(date, locale = 'ru-RU', options = { hour: '2-digit', minute: '2-digit' }) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

function getDateString(
  date,
  locale = 'ru-RU',
  dateOptions = { day: '2-digit', month: 'short'},
  weekdayOptions = { weekday: 'short' },
) {
  const dateObject = new Date(date);
  const dateString = new Intl.DateTimeFormat(locale, dateOptions).format(dateObject);
  const weekdayString = new Intl.DateTimeFormat(locale, weekdayOptions).format(dateObject);
  return `${dateString} ${weekdayString}`;
}

function convertMinutes(minutesCount) {
  const hoursCount = Math.floor(minutesCount / 60);
  const remainingMinutesCount = minutesCount % 60;
  return `${hoursCount} ч ${remainingMinutesCount} мин`;
}

function setFilterState(queryString, filterFormNode) {
  const params = new URLSearchParams(queryString);

  Array.from(params.entries()).forEach((entry) => {
    const input = filterFormNode.querySelector(`input[name="${entry[0]}"][value="${entry[1]}"]`)
      || filterFormNode.querySelector(`input[name="${entry[0]}"][type="number"]`);

    if (input) {
      if (input.type === 'number') {
        input.value = entry[1];
      } else {
        input.checked = true
      }
    };
  });
}

function generateQs(filterNode) {
  const filterData = new FormData(filterNode);

  Array.from(filterData.entries()).forEach((entry) => {
    if (entry[1] === '') { filterData.delete(entry[0]) }
  })

  const params = new URLSearchParams(filterData);
  return params.toString();
}

function createNodeFromTemplate(templateId) {
  return document.querySelector(templateId).content.querySelector('*').cloneNode(true);
}

function getOptions(flights, filterConfig, propertiesCallbacksMap) {
  const filterName = filterConfig.name;

  const filterOptionProperties = filterConfig.optionProperties?.split(', ') ?? [];
  const propertyConfigStringRegex = /(\w+):(\w+)(?:->(\w*))?/;

  const options = flights.reduce((result, flight) => {
    const optionValue = flight[filterName];

    if (!result[optionValue]) {
      result[optionValue] = { instancesCount: 1 }
    } else {
      result[optionValue].instancesCount++;
    }

    filterOptionProperties.forEach((property) => {
      const propertyData = property.match(propertyConfigStringRegex);
      const propertyName = propertyData[1];
      const propertyValue = flight[propertyData[2]];

      const propertyCb = propertiesCallbacksMap[propertyData[3]];

      result[optionValue][propertyName] = propertyCb
        ? propertyCb(propertyValue, result[optionValue][propertyName])
        : propertyValue;
    });

    return result
  }, {});

  return Object.keys(options).map((optionKey) => {
    return {
      value: optionKey,
      ...options[optionKey],
    }
  });
}

function getPropertyValueInterval(flights, propertyName) {
  const propertyValues = flights.map((flight) => flight[propertyName]);
  const propertyMinValue = Math.min(...propertyValues);
  const propertyMaxValue = Math.max(...propertyValues);
  return { min: propertyMinValue, max: propertyMaxValue };
}

export {
  getNounPluralForm,
  getTimeString,
  getDateString,
  convertMinutes,
  debounce,
  setFilterState,
  generateQs,
  createNodeFromTemplate,
  getOptions,
  getPropertyValueInterval
};
