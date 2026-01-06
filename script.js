// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyA2Y-_rfSHTSFb4oOSBzIXwW2CTFNF_jZY",
    authDomain: "msietez-global.firebaseapp.com",
    projectId: "msietez-global",
    storageBucket: "msietez-global.firebasestorage.app",
    messagingSenderId: "389248189010",
    appId: "1:389248189010:web:7e1acf9c02046f639f158b",
    measurementId: "G-ZWFBLBCGYR"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

/* =========================================
   1. AÑO AUTOMÁTICO EN EL FOOTER
   ========================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================
   2. SISTEMA DE PERSISTENCIA DE UTMS
   Captura ?utm_source=... de la URL principal
   y lo pega en los enlaces salientes.
   ========================================= */
(function() {
    var currentQuery = window.location.search;
    
    if (currentQuery) {
        // Obtener todos los links de la página
        var links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(function(link) {
            var currentHref = link.getAttribute('href');
            
            // Lógica para concatenar: si ya tiene '?', usa '&', si no, usa '?'
            var separator = currentHref.indexOf('?') !== -1 ? '&' : '?';
            
            // Limpiamos el '?' inicial del currentQuery porque el separador lo maneja
            var paramsToAdd = currentQuery.substring(1); 
            
            link.setAttribute('href', currentHref + separator + paramsToAdd);
        });
    }
})();

/* =========================================
   3. LÓGICA DEL MODAL (DISTRIBUIDORES B2B)
   ========================================= */
function openModal() { 
    document.getElementById('distribuidorModal').style.display = 'flex'; 
}

function closeModal() { 
    // 1. Ocultar el modal principal
    document.getElementById('distribuidorModal').style.display = 'none'; 
    
    // 2. Esperar un poco (300ms) para que la animación visual termine y luego resetear todo
    // Esto evita que el usuario vea el cambio brusco mientras se cierra
    setTimeout(() => {
        // A. Volver a mostrar el formulario
        document.getElementById('modal-step-form').style.display = 'block';
        
        // B. Ocultar el mensaje de éxito
        document.getElementById('modal-step-success').style.display = 'none';
        
        // C. Limpiar los campos escritos (input reset)
        document.getElementById('formB2B').reset();

        // D. Reactivar el botón de envío (por si quedó desactivado)
        const btn = document.getElementById('btnSubmit');
        btn.disabled = false;
        btn.innerText = "Enviar Solicitud";
    }, 300);
}

// Cerrar al hacer clic fuera del modal (en el fondo oscuro)
window.onclick = function(e) {
    if (e.target == document.getElementById('distribuidorModal')) {
        closeModal();
    }
}

// --- 4. LOGICA DE ENVÍO A FIREBASE (CORREGIDA) ---
document.getElementById('formB2B').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const btnSubmit = document.getElementById('btnSubmit');
    
    // Feedback visual
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Registrando...";

    // Guardar en Colección 'leads_b2b' con los IDs REALES de la HTML
    db.collection("leads_b2b").add({
        propietario: document.getElementById('propietario').value, // ID corregido
        negocio: document.getElementById('negocio').value,
        whatsapp: document.getElementById('whatsapp').value,       // ID corregido
        email: document.getElementById('email').value,             // ID corregido
        ciudad: document.getElementById('ciudad').value,
        provincia: document.getElementById('provincia').value,     // ID corregido
        marca: "gauss",
        fecha: new Date(),
        origen: window.location.href
    })
    .then((docRef) => {
        // ÉXITO
        console.log("Lead guardado con ID: ", docRef.id);
        
        // 1. Ocultar formulario y mostrar mensaje de éxito
        document.getElementById('modal-step-form').style.display = 'none';
        document.getElementById('modal-step-success').style.display = 'block';

        // 2. Preparar el botón de WhatsApp del mensaje de éxito
        const prop = document.getElementById('propietario').value;
        const neg = document.getElementById('negocio').value;
        const city = document.getElementById('ciudad').value;
        
        const msj = `Hola, soy *${prop}* del negocio *${neg}* en ${city}. Ya llené el formulario para ser distribuidor.`;
        
        // Asignamos el link al botón para que el usuario haga clic voluntariamente (mejor UX y evita bloqueos)
        const btnWa = document.getElementById('btnSuccessWa');
        // Numero Contacto
        btnWa.href = `https://wa.me/59177499928?text=${encodeURIComponent(msj)}`;
    })
    .catch((error) => {
        // ERROR
        console.error("Error al guardar: ", error);
        alert("Error: " + error.message);
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Enviar Solicitud";
    });
});