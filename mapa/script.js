var map = L.map('map').setView([-32.9442, -60.6505], 10); // Vista inicial en Rosario, Santa Fe
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

function buscarUbicacion() {
    var location = document.getElementById('location').value;
    
    // Realizar una solicitud a un servicio de geocodificación gratuito (por ejemplo, Nominatim)
    var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location) + '&format=json';
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if(data.length > 0) {
            // Coordenadas de la ubicación ingresada
            var latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            
            // Actualizar la vista del mapa
            map.setView(latlng, 10);
            
            // Marcador en la ubicación ingresada
            L.marker(latlng).addTo(map)
                .bindPopup('Tu ubicación').openPopup();
        } else {
            alert('No se pudo encontrar la ubicación');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al buscar la ubicación');
    });
}

function buscarUbicaciones() {
    var location1 = document.getElementById('location1').value;
    var location2 = document.getElementById('location2').value;

    // Validar que las ubicaciones no estén vacías
    if (location1.trim() === "" || location2.trim() === "") {
        alert("Por favor, ingresa ubicaciones válidas.");
        return;
    }
    
    // Realizar una solicitud a un servicio de geocodificación gratuito (por ejemplo, Nominatim) para ambas ubicaciones
    var url1 = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location1) + '&format=json';
    var url2 = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location2) + '&format=json';
    
    Promise.all([fetch(url1), fetch(url2)])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        if(data[0].length > 0 && data[1].length > 0) {
            var latlng1 = L.latLng(parseFloat(data[0][0].lat), parseFloat(data[0][0].lon));
            var latlng2 = L.latLng(parseFloat(data[1][0].lat), parseFloat(data[1][0].lon));
            
            // Marcadores en las ubicaciones ingresadas
            L.marker(latlng1).addTo(map)
                .bindPopup('Ubicación 1').openPopup();
            L.marker(latlng2).addTo(map)
                .bindPopup('Ubicación 2').openPopup();
            
            // Calcular la distancia entre las ubicaciones
            var distancia = calcularDistancia(latlng1, latlng2) / 1000; // Convertir a kilómetros
            alert('La distancia entre las ubicaciones es de aproximadamente ' + distancia.toFixed(2) + ' kilómetros.');
            
            // Obtener la ruta más rápida entre las ubicaciones
            obtenerRutaMasRapida(latlng1, latlng2);
        } else {
            alert('No se pudo encontrar alguna de las ubicaciones');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al buscar las ubicaciones');
    });
}
// Función para calcular la distancia entre dos puntos en metros
function calcularDistancia(latlng1, latlng2) {
    var R = 6371e3; // Radio de la Tierra en metros
    var φ1 = latlng1.lat * Math.PI / 180; // Latitud en radianes
    var φ2 = latlng2.lat * Math.PI / 180;
    var Δφ = (latlng2.lat - latlng1.lat) * Math.PI / 180;
    var Δλ = (latlng2.lng - latlng1.lng) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c; // Distancia en metros
    return d;
}

function obtenerRutaMasRapida(direccionOrigen, direccionDestino) {
    var apiKey = '5b3ce3597851110001cf6248614e1047e6c84c07ab60e5a09a04ad21';
    
    // Realizar solicitud para obtener coordenadas de la dirección de origen
    var urlOrigen = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(direccionOrigen) + '&format=json';
    
    fetch(urlOrigen)
    .then(response => response.json())
    .then(dataOrigen => {
        if (dataOrigen.length > 0) {
            // Coordenadas de la dirección de origen
            var latlngOrigen = L.latLng(parseFloat(dataOrigen[0].lat), parseFloat(dataOrigen[0].lon));
            
            // Realizar solicitud para obtener coordenadas de la dirección de destino
            var urlDestino = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(direccionDestino) + '&format=json';
            
            fetch(urlDestino)
            .then(response => response.json())
            .then(dataDestino => {
                if (dataDestino.length > 0) {
                    // Coordenadas de la dirección de destino
                    var latlngDestino = L.latLng(parseFloat(dataDestino[0].lat), parseFloat(dataDestino[0].lon));
                    
                    // Realizar solicitud para obtener la ruta entre las coordenadas de origen y destino
                    var urlRuta = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + apiKey + '&start=' + latlngOrigen.lng + ',' + latlngOrigen.lat + '&end=' + latlngDestino.lng + ',' + latlngDestino.lat;
                    
                    fetch(urlRuta, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(dataRuta => {
                        if (dataRuta.features && dataRuta.features.length > 0 && dataRuta.features[0].geometry && dataRuta.features[0].geometry.coordinates) {
                            var coordinates = dataRuta.features[0].geometry.coordinates;
                            
                            // Convertir las coordenadas a un formato compatible con Leaflet
                            var routeCoordinates = coordinates.map(function(coord) {
                                return [coord[1], coord[0]];
                            });
                            
                            // Crear una capa de ruta con las coordenadas
                            var routeLayer = L.polyline(routeCoordinates, {color: 'blue'}).addTo(map);
                            
                            // Ajustar la vista del mapa para mostrar la ruta
                            map.fitBounds(routeLayer.getBounds());
                        } else {
                            alert('No se pudo encontrar una ruta');
                        }
                    })
                    .catch(error => {
                        console.error('Error al obtener la ruta:', error);
                        alert('Hubo un error al obtener la ruta');
                    });
                    
                } else {
                    alert('No se pudo encontrar la coordenada de destino');
                }
            })
            .catch(error => {
                console.error('Error al obtener coordenadas de destino:', error);
                alert('Hubo un error al obtener las coordenadas de destino');
            });
            
        } else {
            alert('No se pudo encontrar la coordenada de origen');
        }
    })
    .catch(error => {
        console.error('Error al obtener coordenadas de origen:', error);
        alert('Hubo un error al obtener las coordenadas de origen');
    });
}
