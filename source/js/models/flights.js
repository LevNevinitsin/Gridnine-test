const getFlights = (data, flightsCount = 100) => {
  return data.result.flights;
}

export { getFlights };
