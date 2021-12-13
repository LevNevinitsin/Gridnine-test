function filterFlights(flights, filterFormNode, config, filterToExclude = '') {
  let filteredFlights = flights;

  config.filters.forEach((filterConfig) => {
    const filterNode = filterFormNode.querySelector(`.${filterConfig.class}`);
    const filterName = filterConfig.name;

    if (filterName === 'sort') {
      const sortValue = filterNode.querySelector('input[name="sort"]:checked').value;
      const sortCb = filterConfig.options.filter((option) => option.value === sortValue)[0].cb;
      filteredFlights = filteredFlights.sort(sortCb);
    } else if (filterConfig.type !== 'interval') {
      const allowedOptions = filterToExclude !== filterName
        ? Array.from(filterNode.querySelectorAll(`input[name="${filterName}"]:checked`))
          .map((inputNode) => inputNode.value)
        : [];

        filteredFlights = filteredFlights.filter((flight) => {
          return allowedOptions.length ? allowedOptions.includes(flight[filterName].toString()) : true
        });
    } else {
      const inputsNodes = filterNode.querySelectorAll('input');
      const minPrice = parseInt(inputsNodes[0].value || 0);
      const maxPrice = parseInt(inputsNodes[1].value);

      filteredFlights = filteredFlights
        .filter((flight) => minPrice <= flight.cost)
        .filter((flight) => maxPrice ? flight.cost <= maxPrice : true);
    }
  })

  return filteredFlights;
}

export { filterFlights }
