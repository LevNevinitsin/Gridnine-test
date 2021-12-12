import { DATA } from '/data/data.js';
import { getFlights, prepareFlights } from '/js/models/flights.js';
import { filterFlights } from '/js/filter-flights.js';
import { fillListWithFlights } from '/js/views/flights.js';
import { debounce, setFilterState, generateQs } from '/js/util.js';
import { FILTER_CONFIG, fillFormWithFilters, updateFilterCondition } from '/js/views/filter.js';

const DEBOUNCE_INTERVAL = 100;
const FLIGHTS_TO_RENDER_LIMIT = 2;

const flightsSectionNode   = document.querySelector('.js-flights');
const filterFormNode       = document.querySelector('.js-filter-form');
const flightsContainerNode = document.querySelector('.js-flights-container');
const flightsListNode      = document.querySelector('.js-flights-list');
const flightsShowMoreNode  = document.querySelector('.js-flights-show-more');

const flightTemplate = document.querySelector('#flight').content.querySelector('.flight');
const legTemplate    = document.querySelector('#leg').content.querySelector('.flight__leg');

const flights = prepareFlights(getFlights(DATA));

let filteredFlights;
let flightsOffset = 0;

filterFormNode.remove();
fillFormWithFilters(filterFormNode, FILTER_CONFIG, flights);
flightsSectionNode.appendChild(filterFormNode);

setFilterState(window.location.href, filterFormNode);
updatePage();

const debouncedProcessState = debounce(() => processState(), DEBOUNCE_INTERVAL);
filterFormNode.addEventListener('change', onFilterFormNodeChange);
flightsShowMoreNode.addEventListener('click', onFlightsShowMoreNodeClick);

function onFilterFormNodeChange() { debouncedProcessState() };
function onFlightsShowMoreNodeClick() { updateFlightsContainer() };

function processState() {
  const url = `${window.location.href.split('?')[0]}?${generateQs(filterFormNode)}`;
  window.history.pushState('', '', url);
  flightsOffset = 0;
  updatePage();
}

function updatePage() {
  updateFilterCondition(filterFormNode, FILTER_CONFIG, flights);

  filteredFlights = filterFlights(flights, filterFormNode, FILTER_CONFIG);
  updateFlightsContainer();
}

function updateFlightsContainer() {
  flightsContainerNode.remove();

  const remainingFilteredFlightsCount = filteredFlights.length - flightsOffset;
  const areFlightsDepleted = remainingFilteredFlightsCount <= FLIGHTS_TO_RENDER_LIMIT;
  const flightsCountToRender = areFlightsDepleted ? remainingFilteredFlightsCount : FLIGHTS_TO_RENDER_LIMIT;

  fillListWithFlights(flightsListNode, filteredFlights, flightTemplate, legTemplate, flightsCountToRender, flightsOffset);

  flightsOffset += flightsCountToRender;
  //flightsShowMoreNode.textContent = `Показать ещё. Показано: ${flightsOffset}. Ещё осталось: ${filteredFlights.length - flightsOffset}`;

  if (areFlightsDepleted) {
    if (flightsShowMoreNode.parentNode) {
      flightsShowMoreNode.removeEventListener('click', onFlightsShowMoreNodeClick);
      flightsShowMoreNode.remove();
    }
  } else {
    if (!flightsShowMoreNode.parentNode) {
      flightsContainerNode.appendChild(flightsShowMoreNode);
      flightsShowMoreNode.addEventListener('click', onFlightsShowMoreNodeClick);
    }
  }

  flightsSectionNode.appendChild(flightsContainerNode);
}
