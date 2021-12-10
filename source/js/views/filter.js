import { getNounPluralForm } from '/js/util.js';

const FILTER_CONFIG = [
  {
    title: 'Сортировать',
    type: 'radio',
    name: 'sort',
    class: 'js-filter-sort',
    optionTemplate: 'filter-sort',
    options: [
      {value: 'price-asc', caption: 'по возрастанию цены', 'cb': (a, b) => a.cost - b.cost},
      {value: 'price-desc', caption: 'по убыванию цены', 'cb': (a, b) => b.cost - a.cost},
      {value: 'duration-asc', caption: 'по времени в пути', 'cb': (a, b) => a.totalDuration - b.totalDuration},
    ],
  },
  {
    title: 'Фильтровать',
    type: 'checkbox',
    name: 'changes-count',
    class: 'js-filter-changes',
    optionTemplate: 'filter-changes-count-option',
  }
]

function renderChangesFilter(filterChangesData, filterChangesCheckboxTemplate, filterChangesNode) {
  if (filterChangesData.length > 1) {
    filterChangesData.forEach((filterChangesOption) => {
      const checkboxNode = filterChangesCheckboxTemplate.cloneNode(true);
      const inputNode = checkboxNode.querySelector('.js-filter-changes-checkbox-input');
      const textNode = checkboxNode.querySelector('.js-filter-changes-checkbox-text');

      const value = filterChangesOption.value
      inputNode.value = value;
      const text = value === 0
        ? 'без пересадок'
        : `${value} ${getNounPluralForm(value, 'пересадка', 'пересадки', 'пересадок')}`;
      textNode.textContent = ` - ${text}`;
      inputNode.dataset.instancesCount = filterChangesOption.instancesCount;

      filterChangesNode.appendChild(checkboxNode);
    })
  } else {
    filterChangesNode.remove();
  }
}

function setPricePlaceholders(filterMinPriceNode, filterMaxPriceNode, minPriceValue, maxPriceValue) {
  filterMinPriceNode.placeholder = minPriceValue;
  filterMaxPriceNode.placeholder = maxPriceValue;
};

function renderCarrierFilter(filterCarriersData, filterCarrierCheckboxTemplate, filterCarrierNode) {
  if (filterCarriersData.length > 1) {
    filterCarriersData.forEach((filterCarriersOption) => {
      const checkboxNode = filterCarrierCheckboxTemplate.cloneNode(true);
      const inputNode = checkboxNode.querySelector('.js-filter-carrier-checkbox-input');
      const nameNode = checkboxNode.querySelector('.js-filter-carrier-checkbox-name');
      const priceNode = checkboxNode.querySelector('.js-filter-carrier-checkbox-price');

      inputNode.value = filterCarriersOption.uid;
      nameNode.textContent = ` - ${filterCarriersOption.name}`;
      priceNode.textContent = `от ${filterCarriersOption.minCost} р.`;
      inputNode.dataset.instancesCount = filterCarriersOption.instancesCount;

      filterCarrierNode.appendChild(checkboxNode);
    })
  } else {
    filterCarrierNode.remove();
  }
};

function filterFlights(flights, filterNode, filterToExclude = '') {
  const SORTING_MAP = {
    'price-asc': (a, b) => a.cost - b.cost,
    'price-desc': (a, b) => b.cost - a.cost,
    'duration-asc': (a, b) => a.totalDuration - b.totalDuration,
  };

  const filterSortingNode = filterNode.querySelector('.js-filter-sort');
  const chosenSorting = filterSortingNode.querySelector('input:checked').value;

  const allowedChangesCounts = filterToExclude !== 'changes-count'
    ? Array.from(filterNode.querySelectorAll('.js-filter-changes-checkbox-input:checked'))
      .map((node) => parseInt(node.value))
    : [];

  const minPrice = parseInt(filterNode.querySelector('.js-min-price').value || 0);
  const maxPrice = parseInt(filterNode.querySelector('.js-max-price').value);

  const allowedCarriers = filterToExclude !== 'carrier'
    ? Array.from(filterNode.querySelectorAll('.js-filter-carrier-checkbox-input:checked'))
      .map((node) => node.value)
    : [];

  return flights
    .sort(SORTING_MAP[chosenSorting])
    .filter((flight) => allowedChangesCounts.length ? allowedChangesCounts.includes(flight.maxChangesCount) : true)
    .filter((flight) => minPrice <= flight.cost)
    .filter((flight) => maxPrice ? flight.cost <= maxPrice : true)
    .filter((flight) => allowedCarriers.length ? allowedCarriers.includes(flight.carrierId) : true);
}

function excludeFilterOptions(filterNode, filteredOptions, propertyName = 'value') {
  filterNode.querySelectorAll('input').forEach((input) => {
    input.dataset.instancesCount = filteredOptions.filter((option) => {
      return option[propertyName].toString() === input.value
    })[0]?.instancesCount ?? 0;

    if (parseInt(input.dataset.instancesCount) === 0) {
      if (input.disabled === false) { input.disabled = true }
    } else {
      if (input.disabled === true) { input.disabled = false }
    }
  });
}

export { renderChangesFilter, setPricePlaceholders, renderCarrierFilter, filterFlights, excludeFilterOptions };
