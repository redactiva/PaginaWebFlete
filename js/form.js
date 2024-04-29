let zona = document.getElementById('zona')/* esto trae el select */
let seccionRosario = document.getElementById('rosario');
let seccionAlrededores = document.getElementById('alrededores');
let horasInput = document.getElementById('horas');
let precioInput = document.getElementById('precio');
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

const precioPorHora = 1000;

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