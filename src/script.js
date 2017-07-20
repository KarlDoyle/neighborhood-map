"use strict";

// settings
let foursquare_id = "G4ZLYOJDLCW1PYMVQFK11QIL5YCHBLCU5BCSE3JGQ2TVYFZC";
let foursquare_secret = "X4L3313SSOWOHMWFWZZKDVDULOQW1ZMYHK1QREIFPXJOI4IM";

// cities
let cities = {
  "Dublin" : {lat: 53.3405386, lng: -6.2716861},
  "London" : {lat: 51.5243953, lng: -0.2024685},
  "Madrid" : {lat: 40.4157274, lng: -3.7092353}
}

// map config
let mapInstance;
let mapElement = document.getElementById('map');
let defaultLocations;

// location instance
class Location {
  constructor(data, bounds) {
    this.name = data.venue.name;
    this.lat = data.venue.location.lat;
    this.lng = data.venue.location.lng;
    this.url = data.venue.url || false;
    this.visible = ko.observable(true);
    this.infoWindow = new google.maps.InfoWindow({
      content: getInfoWindow(this.name, this.url, data.venue.location.formattedAddress[0], data.venue.location.formattedAddress[1])
    });
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(this.lat, this.lng),
      map: mapInstance,
    });

    let self = this;
    this.marker.addListener('click', function() {
      self.infoWindow.open(map, this);
      // https://stackoverflow.com/questions/7339200/bounce-a-pin-in-google-maps-once
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {self.marker.setAnimation(null)}, 750);
    })

    this.showMarker = ko.computed(function() {
      this.marker.setMap(this.visible() === true ? mapInstance : null)
      return true;
    }, this);

    self.marker.setAnimation(google.maps.Animation.DROP);
    bounds.extend(this.marker.position);
  }
  toggle() {
    google.maps.event.trigger(this.marker, 'click');
  }
}

class Application {
  constructor() {
    let self = this;
    // default values
    this.searchQuery = ko.observable("");
    this.defaultLocations = ko.observableArray([]);
    this.filteredLocations = ko.computed(getFilteredLocations, self);
    this.availableCities = ko.observableArray(['Dublin', 'London', 'Madrid'])
    this.selectedCity = ko.observable("Dublin");
    this.selectedCityTitle = ko.observable("Things to do in Dublin");

    this.toggleCities = function() {
      this.searchQuery("");
      this.defaultLocations([]);
      buildMap(cities, self)
      this.selectedCityTitle(`Things to do in ${this.selectedCity()}`);
    };
    buildMap(cities, self)

  }
}

/**
 * Initialise application
 * @return {Object} bind new instance to knockout
 */
function init() {
  ko.applyBindings(new Application(), document.getElementById("htmlTop"));
}

/**
 * build foursquare URL
 * @param  {int} lat
 * @param  {int} lng
 * @param  {string} id     foursquare id
 * @param  {string} secret foursquare secret
 * @return {string}        valid url
 */
function createFoursquareUrl(lat,lng,id,secret) {
  let dt = new Date();
  let today = `${dt.getUTCFullYear()}${dt.getMonth() < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1}${dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate()}`

  console.log(today)
  let url = "https://api.foursquare.com/v2/venues/explore";
  url += `?ll=${lat},${lng}&client_id=${id}&client_secret=${secret}&v=${today}&limit=10&section=trending`
  return url
}

/**
 * http request to get list of venues from foursquare
 * @param  {int} lat
 * @param  {int} lng
 * @return {array}     list of venues
 */
function getFoursquareLocations(lat, lng) {
  return fetch(createFoursquareUrl(lat,lng,foursquare_id,foursquare_secret))
    .then((response) => response.json())
    .then((data) => data.response.groups["0"].items)
    .catch((error) => alert("There was an error with the Foursquare, try again."))
}

/**
 * get list of filtered locations based on search query
 * @return {array} list of objects
 */
function getFilteredLocations() {
  var filter = this.searchQuery().toLowerCase();
  if (!filter) {
    this.defaultLocations().forEach((venue) => {
      venue.visible(true)
    });
    return this.defaultLocations();
  } else {
    return ko.utils.arrayFilter(this.defaultLocations(), (venue) => {
      var string = venue.name.toLowerCase();
      var result = (string.search(filter) >= 0);
      venue.visible(result);
      return result;
    });
  }
}

/**
 * Get HTML for infoWindow of Location
 * @param  {string} name
 * @param  {string} url
 * @param  {string} street
 * @param  {string} city
 * @return {string}
 */
function getInfoWindow(name, url, street, city) {
  return `
    <div class="info-window-content">
      <div class="title">
        <b>${name}</b>
      </div>
      ${url ? `<div class="content"><a href="${url}" target="_blank">${url}</a></div>` : ""}
      ${street ? `<div class="content">${street}</div>` : ""}
      ${city ? `<div class="content">${city}</div>` : ""}
    </div>
  `;
}

/**
 * build google Map
 * @param  {array} cities - list of cities user can select from
 * @param  {obj} self   parent `this`
 * @return {obj}        map instance
 */
function buildMap(cities, self) {
  mapInstance = new google.maps.Map(mapElement, {center: cities[self.selectedCity()]});
  var bounds = new google.maps.LatLngBounds();

  // generate markers + locations
  getFoursquareLocations(cities[self.selectedCity()].lat, cities[self.selectedCity()].lng).then((response) => {
    response.forEach((venue) => {
      self.defaultLocations.push(new Location(venue, bounds))
    });
    mapInstance.fitBounds(bounds);
  })
}
