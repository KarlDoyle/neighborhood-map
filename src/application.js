let Application = {
  // settings
  settings: {
    search: document.getElementById('search'),
    map: document.getElementById('map'),
    results: document.getElementById('results'),
    filtered: [],
    locations: [
      ['Bondi Beach', -33.890542, 151.274856, 4],
      ['Coogee Beach', -33.923036, 151.259052, 5],
      ['Cronulla Beach', -34.028249, 151.157507, 3],
      ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
      ['Maroubra Beach', -33.950198, 151.259302, 1]
    ],
    mapDefault: {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    },
  },
  init: function() {
    return this.initMap();
  },
  viewModel: function(locations) {
    this.searchQuery = ko.observable();
    this.selectedLocation = ko.observable();
    this.notFoundText = ko.computed(() => {
      return 'No locations found for ' + this.searchQuery();
    })
    this.clickLocation = function(data) {
      this.selectedLocation(this.selectedLocation() != data ? data : null );
    };
    this.locations = ko.observableArray(locations);
    this.filterLocations = ko.computed(() => {
      this.selectedLocation(null);
      let search = this.searchQuery() ? this.searchQuery().toLowerCase() : '';
      if (search.length < 0) {
        filtered = this.locations;
      } else {
        filtered = ko.utils.arrayFilter(this.locations(), (res) => res[0].toLowerCase().indexOf(search) >= 0);
      }
      return filtered;
    })
  },
  initMap: function() {
    map = new google.maps.Map(this.settings.map, this.settings.mapDefault);
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    this.generateMapMarkers(map, window.filtered, bounds, infowindow)
    map.fitBounds(bounds)
  },
  addMarker: function(x, y, map) {
    return new google.maps.Marker({
      position: new google.maps.LatLng(x, y),
      map: map
    });
  },
  setMapOnAll: function(markers, map, selected) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  },
  showMarkers: function(map) {
    this.setMapOnAll(map);
  },
  generateMapMarkers: function(map, locations, bounds, infowindow) {
    var marker, i;
    for (i = 0; i < locations.length; i++) {
      marker = this.addMarker(locations[i][1], locations[i][2], map);
      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i][0]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
  }
};

function initMap() {
  ko.applyBindings(new Application.viewModel(Application.settings.locations));
  return Application.init();
}
