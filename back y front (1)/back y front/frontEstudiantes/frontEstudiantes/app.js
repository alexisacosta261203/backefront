async function checkApiStatus1() {
    try {
        // Petición GET simple a la ruta de salud del backend
        const res = await fetch("http://localhost:3000/health", {
            method: 'GET'
            // NO usamos mode: 'no-cors' para obtener una respuesta real
        });

        // Si la conexión fue exitosa y el backend respondió con 200 OK
        if (res.ok) {
            console.log('✅ Verificación de API: Conexión establecida y servidor UP.');
            alert("Enlazado correctamente");
        } else {
            // El servidor respondió, pero con un error (ej. 404 si la ruta '/health' falla)
            console.warn(`⚠️ Verificación de API: Servidor UP, pero la ruta /health devolvió ${res.status}.`);
        }

    } catch (err) {
        // Esto captura errores de red: el servidor no está corriendo o el puerto es incorrecto.
        console.error("❌ Error de Conexión: No se pudo conectar a http://localhost:3000. Asegúrate de que el servidor esté corriendo.", err);
        alert("Error de conexión con el backend. Revisa la consola.");
    }
}

// Llama a la nueva función de prueba
checkApiStatus1();

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    // --- NUEVA FUNCIONALIDAD: Verificar la conexión a la API al cargar ---
    async function checkApiStatus() {
        try {
            // Intentar una petición ligera (HEAD) a la URL base de la API
            const res = await fetch("http://localhost:3000/api/login", {
                method: 'HEAD', // Usamos HEAD para solo pedir las cabeceras y ser más eficientes
                mode: 'no-cors' // 'no-cors' es útil para verificar conectividad sin problemas de CORS en un 'HEAD'
            });

            // Si el fetch no falla por error de red/servidor (el 'catch'), consideramos que el enlace es correcto.
            // Con 'no-cors', res.ok siempre es falso, pero si llegamos aquí, la conexión existe.
            console.log('Verificación de API: Conexión establecida.');
            alert("Enlazado correctamente");

        } catch (err) {
            // Si hay un error de red (servidor caído o no responde)
            console.warn("Verificación de API: No se pudo conectar a http://localhost:3000", err);
            // No se muestra alerta para evitar confusión si el servidor está simplemente caído
        }
    }

    checkApiStatus();
    // ----------------------------------------------------------------------

    if (loginBtn && loginModal && closeModal) {
        loginBtn.onclick = function() {
            loginModal.style.display = 'block';
        };
        closeModal.onclick = function() {
            loginModal.style.display = 'none';
        };
        window.onclick = function(event) {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
        };
    }

    // Capturamos el formulario (Asegurarse de que el form existe antes de agregar el listener)
    const form = document.getElementById("formLogin");

    if (form) {
        // Escuchamos el evento "submit"
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // evita que la página se recargue

            // Obtener los valores escritos por el usuario
            const login = document.getElementById("username").value;
            const contrasena = document.getElementById("password").value;

            // Enviar los datos al servidor usando fetch + async/await
            try {
                const res = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cuenta: login, // nombre del campo esperado el backend
                        contrasena: contrasena
                    })
                });

                // Intentamos parsear el JSON (puede fallar si el servidor responde vacío)
                let data;
                try {
                    data = await res.json();
                } catch (parseErr) {
                    console.warn("Respuesta no JSON del servidor", parseErr);
                    data = {};
                }

                // Revisar la respuesta
                if (res.ok) {
                    const cuenta = data.usuario?.cuenta;
                    if (cuenta) {
                        alert("Acceso permitido: " + cuenta);
                        console.log("Usuario recibido:", data.usuario);
                        // mostrar el nombre junto al candado
                        const userNameSpan = document.getElementById('userName');
                        if (userNameSpan) userNameSpan.textContent = cuenta;
                        // cerrar modal automáticamente
                        const loginModal = document.getElementById('loginModal');
                        if (loginModal) loginModal.style.display = 'none';
                    } else {
                        // Caso inesperado: 200 OK pero sin usuario en body
                        console.warn('200 OK sin usuario:', data);
                        alert('Error: respuesta incompleta del servidor. No se permite el acceso.');
                    }
                } else {
                    // Respuesta de error: mostrar mensaje si viene en el body
                    alert(data?.error ?? `Error ${res.status}: ${res.statusText}`);
                    // limpiar los campos del formulario tras error
                    const loginInput = document.getElementById("login");
                    const passInput = document.getElementById("password");
                    if (loginInput) loginInput.value = "";
                    if (passInput) passInput.value = "";
                }

            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
                alert("Error de conexión con el servidor");
            }
        });
    }
});