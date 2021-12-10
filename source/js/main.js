import { DATA } from '/data/data.js';
import { getFlights } from '/js/models/flights.js';
import { renderFlights } from '/js/views/flights.js';
import {
  debounce,
  setFilterState,
  generateQs
} from '/js/util.js';
import {
  renderChangesFilter,
  setPricePlaceholders,
  renderCarrierFilter,
  filterFlights,
  excludeFilterOptions
} from '/js/views/filter.js';

const DEBOUNCE_INTERVAL = 300;

const CARRIERS_LOGOS_MAP = {
  'SU1': '/img/aeroflot.png',
  'LO': '/img/lot-polish-airlines.png',
};

const CURRENCIES_SYMBOLS_MAP = {
  'RUB': '₽',
  'USD': '$',
  'EUR': '€',
};

const filterNode           = document.querySelector('.js-filter');
const filterChangesNode    = filterNode.querySelector('.js-filter-changes');
const filterMinPriceNode   = filterNode.querySelector('.js-min-price');
const filterMaxPriceNode   = filterNode.querySelector('.js-max-price');
const filterCarrierNode    = filterNode.querySelector('.js-filter-carrier');
const flightsContainerNode = document.querySelector('.js-flights__list');

const flightTemplate       = document.querySelector('#flight').content.querySelector('.flight');
const filterChangesCheckboxTemplate = document.querySelector('#filter-changes-checkbox')
  .content
  .querySelector('.js-filter-changes-checkbox');
const filterCarrierCheckboxTemplate = document.querySelector('#filter-carriers-checkbox')
  .content
  .querySelector('.js-filter-carriers-checkbox');
const legTemplate = document.querySelector('#leg').content.querySelector('.flight__leg');

const flightsData = getFlights(DATA);
const flights = flightsData
  .map((flight) => {
    const flightInfo = flight.flight;
    const flightPrepared = {};

    const carrierInfo = flightInfo.carrier;
    flightPrepared.carrierId = carrierInfo.uid;
    flightPrepared.carrierLogoSrc = CARRIERS_LOGOS_MAP[flightPrepared.carrierId] ?? null;
    flightPrepared.carrierName = carrierInfo.caption;

    const priceInfo = flightInfo.price.total;
    flightPrepared.cost = parseInt(priceInfo.amount);
    flightPrepared.costString = `${priceInfo.amount} ${CURRENCIES_SYMBOLS_MAP[priceInfo.currencyCode]}`;

    const legs = flightInfo.legs;
    flightPrepared.totalDuration = legs.reduce((total, leg) => { return total + leg.duration }, 0);

    flightPrepared.legs = legs.map((leg) => {
      const legPrepared = {};

      const legSegments      = leg.segments;
      const legFirstSegment  = legSegments[0];
      const legSegmentsCount = legSegments.length;
      const legLastSegment   = legSegments[legSegmentsCount - 1];

      legPrepared.departureCity     = legFirstSegment?.departureCity;
      legPrepared.departureAirport  = legFirstSegment.departureAirport;
      legPrepared.departureDatetime = legFirstSegment.departureDate;
      legPrepared.arrivalCity       = legLastSegment?.arrivalCity;
      legPrepared.arrivalAirport    = legLastSegment.arrivalAirport;
      legPrepared.arrivalDatetime   = legLastSegment.arrivalDate;
      legPrepared.duration          = leg.duration;
      legPrepared.changesCount      = legSegmentsCount - 1;
      legPrepared.carrier           = legFirstSegment.airline.caption;

      return legPrepared;
    });

    flightPrepared.maxChangesCount = Math.max(...flightPrepared.legs.map((leg) => leg.changesCount));

    return flightPrepared;
  })
  .sort((a, b) => a.cost - b.cost);

renderChangesFilter(getChangesCountsOptions(flights), filterChangesCheckboxTemplate, filterChangesNode);
renderCarrierFilter(getCarriersOptions(flights), filterCarrierCheckboxTemplate, filterCarrierNode);

setFilterState(window.location.search, filterNode);
processState(flights, filterNode);

filterNode.addEventListener('change', onFilterNodeChange(flights, filterNode));

function onFilterNodeChange(flights, filterNode) {
  return debounce(() => processState(flights, filterNode), DEBOUNCE_INTERVAL)
};

function processState(flights, filterNode) {
  const url = `${window.location.href.split('?')[0]}?${generateQs(filterNode)}`;
  window.history.pushState('', '', url);

  const changesCountsOptionsFiltered = getChangesCountsOptions(filterFlights(flights, filterNode, 'changes-count'));
  const carriersOptionsFiltered = getCarriersOptions(filterFlights(flights, filterNode, 'carrier'));
  excludeFilterOptions(filterChangesNode, changesCountsOptionsFiltered);
  excludeFilterOptions(filterCarrierNode, carriersOptionsFiltered, 'uid');

  const filteredFlights = filterFlights(flights, filterNode);
  const filteredPriceInterval = getPriceInterval(filteredFlights);
  setPricePlaceholders(filterMinPriceNode, filterMaxPriceNode, filteredPriceInterval.min, filteredPriceInterval.max);

  flightsContainerNode.innerHTML = '';
  renderFlights(filteredFlights, flightTemplate, legTemplate, flightsContainerNode);
}

function getChangesCountsOptions(flights) {
  const changesOptionsMap = flights.reduce((resultObject, flight) => {
    resultObject[flight.maxChangesCount] = (resultObject[flight.maxChangesCount] || 0) + 1;
    return resultObject;
  }, {});

  const changesOptionsArray = Object.keys(changesOptionsMap).map((key) => {
    return {
      value: parseInt(key),
      instancesCount: changesOptionsMap[key],
    };
  });

  return changesOptionsArray.sort((a, b) => b.value - a.value);
}

function getCarriersOptions(flights) {
  const carriersOptionsMap = flights.reduce((resultObject, flight) => {
    if (!resultObject[flight.carrierId]) {
      resultObject[flight.carrierId] = { name: flight.carrierName, minCost: flight.cost, instancesCount: 1 }
    } else {
      resultObject[flight.carrierId].instancesCount = resultObject[flight.carrierId].instancesCount + 1;

      if (flight.cost < resultObject[flight.carrierId].minCost) {
        resultObject[flight.carrierId].minCost = flight.cost;
      }
    }
    return resultObject;
  }, {});

  return Object.keys(carriersOptionsMap).map((key) => {
    return {
      uid: key,
      name: carriersOptionsMap[key].name,
      minCost: carriersOptionsMap[key].minCost,
      instancesCount: carriersOptionsMap[key].instancesCount
    }
  });
}

function getPriceInterval (flights) {
  const costValues = flights.map((flight) => flight.cost);
  const minPriceValue = Math.min(...costValues);
  const maxPriceValue = Math.max(...costValues);
  return { min: minPriceValue, max: maxPriceValue };
}
