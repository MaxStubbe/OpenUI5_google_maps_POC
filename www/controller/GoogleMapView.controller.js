sap.ui.controller(["POC.controller.GoogleMapView"], {
    onInit: function () {
        this.getView().byId("map_canvas").addStyleClass("myMap");
        this.initialized = false;
        this.defaultCenterLocation = new google.maps.LatLng(-34.397, 150.644)
    },
    onAfterRendering: function () {
        if (!this.initialized) {
            this.initialized = true;
            var Addresses;

            this.geocoder = new google.maps.Geocoder();
            var mapOptions = {
                center: this.defaultCenterLocation,
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            this.map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(),mapOptions);
            this.bounds = new google.maps.LatLngBounds();

            this.getAddressJson().then(this.placeAddressToMap.bind(this));
        }
    },
    actSearch: function () {
        var map = this.map;
        var address = this.getView().byId("inpSearch").getValue();
        this.geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    },
    CreateMarker: function(address,position){
        console.log("plaats marker op " + address.Name);

        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var icontype = "";
        var contentString = '<div id="content">'+
                          '<h1 id="firstHeading" class="firstHeading">'+ address.Adress +'</h1>'+
                          '<div id="bodyContent">'+
                          '<p>'+ address.Name + '</p>'+
                          '</div>'+
                          '</div>';
        var infowindow = new google.maps.InfoWindow({
        content: contentString
        });
        var mapconfig = {map: this.map,position: position};

        switch(address.Type){
          case("School"):
              mapconfig.icon = iconBase + "library_maps.png";
          break;
          case("Work"):
              mapconfig.icon = iconBase + "info-i_maps.png";
          break;
        };
        var marker = new google.maps.Marker(mapconfig);


        marker.addListener('click', function(){
                infowindow.open(this.map, marker);

                   var items = this.getView().byId("addressList").getItems();
                   items.forEach(function(item){
                       attributes = item.getAttributes()
                       if(attributes[0].getText() == address.Adress + " " + address.City ){
                           item.setHighlight(sap.ui.core.MessageType.Success);
                       }else{
                           item.setHighlight(sap.ui.core.MessageType.None);
                       }
                   });
        }.bind(this));

    },
    onPress: function (oEvent) {
        var name = oEvent.getSource().getTitle();
        console.log(name);
        var attributes = oEvent.getSource().getAttributes();
        var address = attributes[0].getText();
        var type = attributes[1].getText();
        console.log(address);
        this.goTo(name, address, type);

        var items = this.getView().byId("addressList").getItems();
        items.forEach(function(item){
            if(item._active){
                item.setHighlight(sap.ui.core.MessageType.Success);
            }else{
                item.setHighlight(sap.ui.core.MessageType.None);
            }
        });
    },
    goTo: function (name, address, type) {
        var map = this.map;
        this.geocoder.geocode({ 'address': address, componentRestrictions: { country: 'NL' }}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(17);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    },
    getAddressJson: function(){
        return new Promise((resolve, reject) => {
                jQuery.getJSON('file:///android_asset/www/Adresses.json')
                                .done(function (results){
                                   resolve(results);
                                })
                                .error(function(e){
                                    console.log(e);
                                    reject();
                                });
              });

    },
    placeAddressToMap : function(AddressJson){
        Addresses = AddressJson.Adresses;
            Addresses.forEach(function(address){
                 this.GeocodeAddress(address).then(function(position){
                    console.log(address.Name);
                    this.CreateMarker(address,position);
                    this.bounds.extend(position);
                    this.map.fitBounds(this.bounds);
                 }.bind(this));
            }.bind(this));
    },
    GeocodeAddress: function(address){
        return new Promise((resolve,reject) => {
            this.geocoder.geocode({'address': address.Adress + " " + address.City, componentRestrictions: { country: 'NL' }}, function(results,status){
                if(status === 'OK'){
                    var position = results[0].geometry.location
                    resolve(position);
                }else {
                    console.log("Error when searching for position : " + address.Name);
                }
            });
        });
    }
});