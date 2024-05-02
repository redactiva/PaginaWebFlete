let zona = document.getElementById('zona')/* esto trae el select */
let seccionRosario = document.getElementById('rosario');
let seccionAlrededores = document.getElementById('alrededores');
let horasInput = document.getElementById('horas');
let precioInput = document.getElementById('precio');
let precioKilometroInput= document.getElementById('precioKilometro');
//PRECIO POR KM
const precioPorKilometro = 200;
//PRECIO POR HORA
const precioPorHora = 1000;
/* este escuchador de eventos sirve para que cuando se selecciona una zona
 se muestre un formulario distinto segun la zona elegida */
zona.addEventListener('change', function () {
    if (zona.value === "1") {
        seccionRosario.style.display = "block";
        seccionAlrededores.style.display = "none";
    } else if (zona.value === "2") {
        seccionAlrededores.style.display = "block";
        seccionRosario.style.display = "none";
    } else {
        seccionRosario.style.display = "none";
        seccionAlrededores.style.display = "none";
    }
    console.log(zona.value)
});

horasInput.addEventListener('input', function () {
    // Eliminar caracteres no numéricos (excepto .)
    this.value = this.value.replace(/[^0-9.]/g, '');

    // Verificar si el primer carácter es un guion (-)
    if (this.value.charAt(0) === '-') {
        this.value = this.value.slice(1); // Eliminar el guion (-)
    }
});

function actualizarPrecio() {
    let horasValue = parseFloat(horasInput.value);


    // Verificar si el valor ingresado es un número válido
    if (!isNaN(horasValue)) {
        precioTotal = horasValue * precioPorHora;

        precioInput.value = "$" + precioTotal.toFixed(2);// Para mostrar solo dos decimales
    } else {
        // Si no es un número válido, mostrar un mensaje de error en el campo de precio
        precioInput.value = 'Por favor, ingresa un número válido';
    }

}
horasInput.addEventListener('input', actualizarPrecio);

/**
 * MAPA
 */

let map = L.map('map').setView([-32.9442, -60.6505], 10); // Vista inicial en Rosario, Santa Fe
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

function buscarUbicacion() {
    let location = document.getElementById('location').value;
    
    // Realizar una solicitud a un servicio de geocodificación gratuito (por ejemplo, Nominatim)
    let url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location) + '&format=json';
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if(data.length > 0) {
            // Coordenadas de la ubicación ingresada
            let latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            
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
    let location1 = document.getElementById('location1').value;
    let location2 = document.getElementById('location2').value;

    // Validar que las ubicaciones no estén vacías
    if (location1.trim() === "" || location2.trim() === "") {
        alert("Por favor, ingresa ubicaciones válidas.");
        return;
    }
    
    // Realizar una solicitud a un servicio de geocodificación gratuito (por ejemplo, Nominatim) para ambas ubicaciones
    let url1 = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location1) + '&format=json';
    let url2 = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location2) + '&format=json';
    console.log(url1);
    
    Promise.all([fetch(url1), fetch(url2)])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        if(data[0].length > 0 && data[1].length > 0) {
            let latlng1 = L.latLng(parseFloat(data[0][0].lat), parseFloat(data[0][0].lon));
            let latlng2 = L.latLng(parseFloat(data[1][0].lat), parseFloat(data[1][0].lon));
            // Marcadores en las ubicaciones ingresadas
            L.marker(latlng1).addTo(map)
                .bindPopup('Ubicación 1').openPopup();
            L.marker(latlng2).addTo(map)
                .bindPopup('Ubicación 2').openPopup();
            
            // Calcular la distancia entre las ubicaciones
            let distancia = calcularDistancia(latlng1, latlng2) / 1000; // Convertir a kilómetros
            alert('La distancia entre las ubicaciones es de aproximadamente ' + distancia.toFixed(2) + ' kilómetros.');
            
            let precioTotal = distancia * precioPorKilometro;
            const formato = new Intl.NumberFormat('es-AR'); 
            precioKilometroInput.value = "$" + formato.format(precioTotal.toFixed(2));
            /* precioKilometroInput.addEventListener('input', actualizarPrecio); */    
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
    let R = 6371e3; // Radio de la Tierra en metros
    let φ1 = latlng1.lat * Math.PI / 180; // Latitud en radianes
    let φ2 = latlng2.lat * Math.PI / 180;
    let Δφ = (latlng2.lat - latlng1.lat) * Math.PI / 180;
    let Δλ = (latlng2.lng - latlng1.lng) * Math.PI / 180;

    let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let d = R * c; // Distancia en metros
    return d;
}
