'use strict';

var initialLocations = [
  {
    name: 'Guinness Storehouse',
    lat: 53.3413402,
    long: -6.2890717
  },
,
  {
    name: 'Dublin Zoo',
    lat: 53.3561967,
    long: -6.3074785
  },
  {
    name: 'National Aquatic Centre',
    lat: 53.3969824,
    long: -6.3723277
  },
  {
    name: 'Book of Kells',
    lat: 53.3439361,
    long:-6.2589288
  }, {
    name: 'The National Gallery of Ireland',
    lat: 53.3409091,
    long:-6.2546912
  }
];

let map;
let clientID = "G4ZLYOJDLCW1PYMVQFK11QIL5YCHBLCU5BCSE3JGQ2TVYFZC";
let clientSecret = "X4L3313SSOWOHMWFWZZKDVDULOQW1ZMYHK1QREIFPXJOI4IM";

// location
class Location {
  constructor(location) {

    let self = this;
    this.name = location.name;
    this.lat = location.lat;
    this.long = location.long;
    this.visible = ko.observable(true);
    this.infoWindow = new google.maps.InfoWindow({content: `
        <div class="info-window-content">
          <div class="title">
            <b>${location.name}</b>
          </div>
          <div class="content"><a target="_blank" href="${self.URL}">${self.URL}</a></div>
          <div class="content">${self.street}</div>
          <div class="content">${self.city}</div>
          <div class="content">${self.phone}</div>
        </div>
      `});

    let foursquareURL = `https://api.foursquare.com/v2/venues/search?ll=${this.lat},${this.long}&client_id=${clientID}&client_secret=${clientSecret}&v=20160118&query=${this.name}`;

    fetch(foursquareURL).then((response) => {
      return response.json()
    }).then((data) => {
      let results = data.response.venues[0];
      self.URL = results.url;
      if (typeof self.URL === 'undefined'){
        self.URL = "";
      }
      self.street = results.location.formattedAddress[0];
      self.city = results.location.formattedAddress[1];
          self.phone = results.contact.phone;
          if (typeof self.phone === 'undefined'){
        self.phone = "";
      } else {
        self.phone = formatPhone(self.phone);
      }
    }).catch((error) => {
      console.log("There was an error with the Foursquare. Please refresh the page and try again.");
    })

    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(location.lat, location.long),
      map: map
      // title: name
    });

    this.showMarker = ko.computed(function() {
      if(this.visible() === true) {
        this.marker.setMap(map);
      } else {
        this.marker.setMap(null);
      }
      return true;
    }, this);


    this.marker.addListener('click', function(){

      self.contentString = `
        <div class="info-window-content">
          <div class="title">
            <b>${location.name}</b>
          </div>
          <div class="content"><a  target="_blank" href="${self.URL}">${self.URL}</a></div>
          <div class="content">${self.street}</div>
          <div class="content">${self.city}</div>
          <div class="content">${self.phone}</div>
        </div>
      `;

      let infoMap = self.infoWindow.getMap();
      if (infoMap != null && infoMap != 'undefined') {
        self.infoWindow.close();
      } else {
        self.infoWindow.open(map, this);
      }
      self.infoWindow.setContent(self.contentString);

      self.marker.setAnimation(google.maps.Animation.BOUNCE);

      setTimeout(function() {
        self.marker.setAnimation(null);
      }, 1000);

    });
  }

  bounce(place) {
    google.maps.event.trigger(this.marker, 'click');
  };
}


class AppViewModel {
  constructor() {
    let self = this;
    this.searchTerm = ko.observable("");
    this.locationList = ko.observableArray([]);
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: {lat: 53.3629772, lng: -6.30565}
    });
    initialLocations.forEach((locationItem) => {
      self.locationList.push(new Location(locationItem))
    });
    this.filteredList = ko.computed( function() {
      var filter = self.searchTerm().toLowerCase();
      if (!filter) {
        self.locationList().forEach(function(locationItem){
          locationItem.visible(true);
        });
        return self.locationList();
      } else {
        return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
          var string = locationItem.name.toLowerCase();
          var result = (string.search(filter) >= 0);
          locationItem.visible(result);
          return result;
        });
      }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
  }
}

function startApp() {
  ko.applyBindings(new AppViewModel());
}

function errorHandling() {
  alert("Google Maps has failed to load. Please check your internet connection and try again.");
}