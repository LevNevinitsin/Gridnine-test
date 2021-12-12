import { getNounPluralForm, createNodeFromTemplate, getOptions, getPropertyValueInterval } from '/js/util.js';
import { filterFlights } from '/js/filter-flights.js';

const FILTER_CONFIG = {
  filterLegendClass: '.js-filter-legend',
  filterTemplate: '#filter',
  filters: [
    {
      title: 'Сортировать',
      type: 'radio',
      name: 'sort',
      optionTemplate: '#filter-sort-option',
      class: 'js-filter-sort',
      options: [
        {value: 'price-asc', caption: 'по возрастанию цены', 'cb': (a, b) => a.cost - b.cost, isChecked: true},
        {value: 'price-desc', caption: 'по убыванию цены', 'cb': (a, b) => b.cost - a.cost},
        {value: 'duration-asc', caption: 'по времени в пути', 'cb': (a, b) => a.totalDuration - b.totalDuration},
      ],
    },
    {
      title: 'Фильтровать',
      type: 'checkbox',
      name: 'maxChangesCount',
      optionTemplate: '#filter-changes-count-option',
      optionProperties: 'caption:maxChangesCount->maxChangesCountCb',
      class: 'js-filter-changes-count',
    },
    {
      title: 'Цена',
      type: 'interval',
      name: 'cost',
      filterTemplate: '#filter--interval',
      class: 'js-filter-cost',
    },
    {
      title: 'Авиакомпании',
      type: 'checkbox',
      name: 'carrierId',
      optionTemplate: '#filter-carrier-option',
      optionProperties: 'caption:carrierName, minCost:cost->min',
      class: 'js-filter-carrier',
    },
  ],
  propertiesCallbacksMap : {
    'min': (value, minValue) => value < (minValue ?? value + 1) ? value : minValue,
    'max': (value, maxValue) => value > (maxValue ?? 0) ? value : maxValue,
    'maxChangesCountCb': (value) => parseInt(value) === 0
      ? 'без пересадок'
      : `${value} ${getNounPluralForm(value, 'пересадка', 'пересадки', 'пересадок')}`,
  },
}

function fillFormWithFilters(filterFormNode, config, flights) {
  filterFormNode.innerHTML = '';

  config.filters.forEach((filterConfig) => {
    const filterNode = createNodeFromTemplate(filterConfig?.filterTemplate ?? config.filterTemplate);
    filterNode.classList.add(filterConfig.class);
    const legendNode = filterNode.querySelector(config.filterLegendClass);
    legendNode.textContent = filterConfig.title;

    const filterName = filterConfig.name;

    if (filterConfig.type !== 'interval') {
      const options = filterConfig.options ?? getOptions(flights, filterConfig, config.propertiesCallbacksMap);

      options.forEach((option) => {
        const optionNode = createNodeFromTemplate(filterConfig.optionTemplate);
        const optionInputNode = optionNode.querySelector('input');
        const optionCaptionNode = optionNode.querySelector('.js-option-caption');

        optionInputNode.name = filterName;
        optionInputNode.value = option.value;
        optionCaptionNode.textContent = ` - ${option.caption}`;
        if (option?.isChecked) { optionInputNode.checked = true }
        if (option?.instancesCount) {optionInputNode.dataset.instancesCount = option.instancesCount}

        if (filterName === 'carrierId') {
          const optionPriceNode = optionNode.querySelector('.js-filter-carrier-price');
          optionPriceNode.textContent = `от ${option.minCost} р.`
        }

        filterNode.appendChild(optionNode);
      });
    } else {
      const inputsNodes = filterNode.querySelectorAll('input');
      const inputMinNode = inputsNodes[0];
      const inputMaxNode = inputsNodes[1];

      inputMinNode.name = `${filterName}-gt`;
      inputMaxNode.name = `${filterName}-lt`;
    }

    filterFormNode.appendChild(filterNode);
  })
}

function updateFilterCondition(filterFormNode, config, flights) {
  const parentNode = filterFormNode.parentNode;
  filterFormNode.remove();

  config.filters.forEach((filterConfig) => {
    const exclusivelyFilteredFlights = filterFlights(flights, filterFormNode, config, filterConfig.name);

    if (filterConfig.type === 'checkbox') {
      const options = filterConfig.options ?? getOptions(exclusivelyFilteredFlights, filterConfig, config.propertiesCallbacksMap);

      const optionsInputsNodes = filterFormNode.querySelectorAll(`.${filterConfig.class} input`);

      optionsInputsNodes.forEach((optionInputNode) => {
        const option = options.filter((option) => option.value.toString() === optionInputNode.value)[0];
        const optionInstancesCount = option?.instancesCount ?? 0;
        optionInputNode.dataset.instancesCount = optionInstancesCount;
        if (optionInstancesCount === 0) {
          if (!optionInputNode.disabled) { optionInputNode.disabled = true }
        } else {
          if (optionInputNode.disabled) { optionInputNode.disabled = false }
        }
      });
    } else if (filterConfig.type === 'interval') {
      const inputsNodes = filterFormNode.querySelectorAll(`.${filterConfig.class} input`);
      const inputMinNode = inputsNodes[0];
      const inputMaxNode = inputsNodes[1];

      const filterInterval = getPropertyValueInterval(exclusivelyFilteredFlights, filterConfig.name);
      inputMinNode.placeholder = filterInterval.min;
      inputMaxNode.placeholder = filterInterval.max;
    }
  });

  parentNode.appendChild(filterFormNode);
}

export { FILTER_CONFIG, fillFormWithFilters, updateFilterCondition };
