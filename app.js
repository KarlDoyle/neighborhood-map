let map, markers = [], locations = [
  ['Bondi Beach', -33.890542, 151.274856, 4],
  ['Coogee Beach', -33.923036, 151.259052, 5],
  ['Cronulla Beach', -34.028249, 151.157507, 3],
  ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
  ['Maroubra Beach', -33.950198, 151.259302, 1]
];

function ViewModel() {
  this.searchQuery = ko.observable();
  this.locations = ko.observableArray(locations);
  this.filterLocations = ko.computed(() => {
    let search = this.searchQuery() ? this.searchQuery().toLowerCase() : '';
    if (search.length > 0) {
      return ko.utils.arrayFilter(this.locations(), (location) => location[0].toLowerCase().indexOf(search) >= 0);
    }
  })
}

ko.applyBindings(new ViewModel());

// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: -34.397, lng: 150.644},
//     zoom: 8
//   });
//   var infowindow = new google.maps.InfoWindow();
//   var marker, i;
//   var bounds = new google.maps.LatLngBounds();

//   for (i = 0; i < locations.length; i++) {
//     marker = new google.maps.Marker({
//       position: new google.maps.LatLng(locations[i][1], locations[i][2]),
//       map: map
//     });
//     bounds.extend(marker.getPosition());
//     google.maps.event.addListener(marker, 'click', (function(marker, i) {
//       return function() {
//         infowindow.setContent(locations[i][0]);
//         infowindow.open(map, marker);
//       }
//     })(marker, i));
//   }
//   map.fitBounds(bounds)
// }



// function addMarker(x, ) {
//   var marker = new google.maps.Marker({
//     position: new google.maps.LatLng(x, y),
//     map: map
//   });
//   markers.push(marker);
// }

// let ViewModel = {
//   searchQuery: ko.observable(0),
//   locations: ko.observableArray(locations),
//   example: function(data) {
//     console.log(data)
//     this.searchQuery(data);
//   },
//   filterLocations: ko.computed(function() {
//     console.log(this)
//     // var search = this.searchQuery().toLowerCase();
//     // return ko.utils.arrayFilter(locations, function (location, index) {
//     //     return location[index].toLowerCase().indexOf(search) >= 0;
//     // });
//   })
// }

// ko.applyBindings(ViewModel);