function getFlights (data) {
  return data.result.flights;
}

function prepareFlights(flights) {
  return flights
    .map((flight) => {
      const flightInfo = flight.flight;
      const flightPrepared = {};

      const carrierInfo = flightInfo.carrier;
      flightPrepared.carrierId = carrierInfo.uid;
      flightPrepared.carrierName = carrierInfo.caption;

      const priceInfo = flightInfo.price.total;
      flightPrepared.currencyCode = priceInfo.currencyCode;
      flightPrepared.cost = parseInt(priceInfo.amount);

      const legs = flightInfo.legs;
      flightPrepared.totalDuration = legs.reduce((total, leg) => { return total + leg.duration }, 0);

      flightPrepared.legs = legs.map((leg) => {
        const legPrepared = {};

        const legSegments      = leg.segments;
        const legFirstSegment  = legSegments[0];
        const legSegmentsCount = legSegments.length;
        const legLastSegment   = legSegments[legSegmentsCount - 1];

        legPrepared.departureCity     = legFirstSegment.departureCity;
        legPrepared.departureAirport  = legFirstSegment.departureAirport;
        legPrepared.departureDatetime = legFirstSegment.departureDate;
        legPrepared.arrivalCity       = legLastSegment.arrivalCity;
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
}

export { getFlights, prepareFlights };
