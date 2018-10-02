sap.ui.controller(["POC.controller.GoogleMapView"], {
    onInit: function () {
        this.getView().byId("map_canvas").addStyleClass("myMap");
        this.initialized = false;
        this.defaultCenterLocation = new google.maps.LatLng(-34.397, 150.644);

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
            this.placeAddressToMap();
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
    CreateMarker: function(address,position, modelIndex){
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


        marker.addListener('click', function(oEvent){
                infowindow.open(this.map, marker);
                this.setSelectedAddress("/Adresses/"+ modelIndex);
        }.bind(this));
    },
    setSelectedAddress(sSelectedPath){
        var model = this.getView().getModel("adress");
        model.oData.Adresses.forEach(function(address, index){
            var sPath = "/Adresses/"+index;
            model.setProperty(sPath+"/Selected", sPath === sSelectedPath);
        });
    },
    formatSelectionHighlighted : function (bSelected) {
            if (bSelected) {
                return sap.ui.core.MessageType.Success;
            }
            return sap.ui.core.MessageType.None;
        },
    onPress: function (oEvent) {
        var binding = oEvent.getSource().getBindingContext("adress");
        var path = binding.sPath;
        this.setSelectedAddress(path);
        this.goTo(path);
    },
    goTo: function (sSelectedPath) {
        var model = this.getView().getModel("adress");
        address = model.getProperty(sSelectedPath+"/Adress");
        city = model.getProperty(sSelectedPath+"/City");
        fullAddress = address + " " + city;

        var map = this.map;
        this.geocoder.geocode({ 'address': fullAddress, componentRestrictions: { country: 'NL' }}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(17);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    },
    placeAddressToMap : function(){
        var model = this.getView().getModel("adress");
        Addresses = model.oData.Adresses;
            Addresses.forEach(function(address, modelIndex){
                 this.GeocodeAddress(address).then(function(position){
                    console.log(address.Name);
                    this.CreateMarker(address, position, modelIndex);
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