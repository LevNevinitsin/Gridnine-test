import { getNounPluralForm, getTimeString, getDateString, convertMinutes } from '/js/util.js';

function renderFlights (flights, flightTemplate, legTemplate, containerNode) {
  flights.forEach((flight) => {
    const flightNode = flightTemplate.cloneNode(true);
    const costNode = flightNode.querySelector('.js-flight__cost');
    const legsNode = flightNode.querySelector('.js-flight__legs');
    const logoNode = flightNode.querySelector('.js-flight__carrier-logo');

    const logoSrc = flight.carrierLogoSrc;

    if (logoSrc) {
      logoNode.setAttribute('src', logoSrc);
      logoNode.setAttribute('alt', flight.carrierName);
    } else {
      logoNode.remove();
    }

    costNode.textContent = flight.costString;

    flight.legs.forEach((leg) => {
      const legNode = legTemplate.cloneNode(true);

      const legDeparturePointNode     = legNode.querySelector('.js-leg-departure-point');
      const legDeparturePointCodeNode = legNode.querySelector('.js-leg-departure-point-code');
      const legDepartureTimeNode      = legNode.querySelector('.js-leg-departure-time');
      const legDepartureDateNode      = legNode.querySelector('.js-leg-departure-date');
      const legDurationNode           = legNode.querySelector('.js-leg-duration');
      const legArrivalPointNode       = legNode.querySelector('.js-leg-arrival-point');
      const legArrivalPointCodeNode   = legNode.querySelector('.js-leg-arrival-point-code');
      const legArrivalDateNode        = legNode.querySelector('.js-leg-arrival-date');
      const legArrivalTimeNode        = legNode.querySelector('.js-leg-arrival-time');
      const legChangesTextNode        = legNode.querySelector('.js-leg-changes-text');
      const legCarrierNameNode        = legNode.querySelector('.js-leg-carrier-name');

      const departureCity = leg.departureCity?.caption ? leg.departureCity.caption + ', ' : '';
      const arrivalCity = leg.arrivalCity?.caption ? leg.arrivalCity.caption + ', ' : '';

      legDeparturePointNode.textContent     = `${departureCity}${leg.departureAirport.caption}`;
      legDeparturePointCodeNode.textContent = `(${leg.departureAirport.uid})`;;
      legDepartureTimeNode.textContent      = getTimeString(leg.departureDatetime);
      legDepartureDateNode.textContent      = getDateString(leg.departureDatetime);
      legDurationNode.textContent           = convertMinutes(leg.duration);
      legArrivalPointNode.textContent       =  `${arrivalCity}${leg.arrivalAirport.caption}`;
      legArrivalPointCodeNode.textContent   = `(${leg.arrivalAirport.uid})`;
      legArrivalDateNode.textContent        = getDateString(leg.arrivalDatetime);
      legArrivalTimeNode.textContent        = getTimeString(leg.arrivalDatetime);

      const legChangesCount = leg.changesCount;

      if (legChangesCount > 0) {
        const legchangesWordForm = getNounPluralForm(legChangesCount, 'пересадка', 'пересадки', 'пересадок');
        legChangesTextNode.textContent = `${legChangesCount} ${legchangesWordForm}`;
      } else {
        legChangesTextNode.remove();
      }

      legCarrierNameNode.textContent = `Рейс выполняет: ${leg.carrier}`;
      legsNode.appendChild(legNode);
    });

    containerNode.appendChild(flightNode);
  });
}

export { renderFlights };

