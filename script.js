document.addEventListener('DOMContentLoaded', () => {
    // ⬇️ PEGA AQUÍ LA URL DE TU APLICACIÓN WEB (NO EL ID DEL SHEET) ⬇️
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycNxPoLm5KmtNzIBMQ_1Vu9JmNMhbCCQ7HibyN2W55xmo3bAwzMVju0ScgPbETUOKM/exec";

    // --- Referencias a los elementos y vistas ---
    const mainMenu = document.getElementById('mainMenu');
    const reportForm = document.getElementById('reportForm');
    const callOptions = document.getElementById('callOptions');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successMessage = document.getElementById('successMessage');
    const closeSuccessButton = document.getElementById('closeSuccess');
    const safetyReportForm = document.getElementById('safetyReportForm');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const showReportFormBtn = document.getElementById('showReportFormBtn');
    const showCallOptionsBtn = document.getElementById('showCallOptionsBtn');
    const backButtons = document.querySelectorAll('.back-button');
    // ✅ Se añade la referencia al botón que faltaba
    const removePhotoBtn = document.getElementById('removePhotoBtn'); 

    // --- Configuración inicial de las vistas ---
    mainMenu.classList.add('view');
    reportForm.classList.add('view', 'hidden');
    callOptions.classList.add('view', 'hidden');

    // --- Funciones de UI ---
    // ✅ Se actualiza la función para resetear también los botones de la foto
    const resetReportForm = () => {
        safetyReportForm.reset();
        photoInput.value = ""; // Limpia el input de la foto
        photoPreview.src = '';
        photoPreview.classList.add('hidden');
        removePhotoBtn.classList.add('hidden'); // Oculta el botón de quitar
        takePhotoBtn.classList.remove('hidden'); // Muestra el botón de tomar
    };

    const showView = (viewName) => {
        mainMenu.classList.add('hidden');
        reportForm.classList.add('hidden');
        callOptions.classList.add('hidden');
        document.getElementById(viewName).classList.remove('hidden');
    };

    // --- Lógica de navegación y cámara ---
    showReportFormBtn.addEventListener('click', () => showView('reportForm'));
    showCallOptionsBtn.addEventListener('click', () => showView('callOptions'));

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            resetReportForm();
            showView('mainMenu');
        });
    });

    takePhotoBtn.addEventListener('click', () => photoInput.click());

    // ✅ Se actualiza la lógica para intercambiar los botones al tomar una foto
    photoInput.addEventListener('change', () => {
        const file = photoInput.files?.[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.classList.remove('hidden');
            takePhotoBtn.classList.add('hidden');
            removePhotoBtn.classList.remove('hidden');
        }
    });
    
    // ✅ Se añade la lógica para el botón "Quitar foto"
    removePhotoBtn.addEventListener('click', () => {
        photoInput.value = ""; // Esencial para poder tomar otra foto
        photoPreview.src = "";
        photoPreview.classList.add('hidden');
        removePhotoBtn.classList.add('hidden');
        takePhotoBtn.classList.remove('hidden');
    });

    // --- GESTIÓN DEL ENVÍO DEL FORMULARIO ---
    safetyReportForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitButton = safetyReportForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
        loadingOverlay.style.display = 'flex';

        const formData = {
            fullName: document.getElementById('fullName').value,
            issueType: document.getElementById('issueType').value,
            description: document.getElementById('description').value,
            imageData: null
        };

        const file = photoInput.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                formData.imageData = reader.result;
                sendDataToApi(formData, submitButton);
            };
            reader.onerror = (error) => {
                console.error("Error al leer el archivo:", error);
                alert("Hubo un error al procesar la foto.");
                submitButton.disabled = false;
                submitButton.textContent = "Enviar Reporte";
                loadingOverlay.style.display = 'none';
            };
        } else {
            sendDataToApi(formData, submitButton);
        }
    });
    
    // --- Cerrar el mensaje de éxito con el botón ---
    closeSuccessButton.addEventListener('click', () => {
        successMessage.classList.remove('show');
        resetReportForm();
        showView('mainMenu');
    });

    /**
     * Envía los datos a la API y maneja la retroalimentación visual.
     */
    function sendDataToApi(data, button) {
        if (SCRIPT_URL === "URL_DE_TU_API_PEGAR_AQUI" || SCRIPT_URL.length < 50) {
            alert("Error: Debes configurar la URL de la Aplicación Web en el archivo script.js");
            button.disabled = false;
            button.textContent = "Enviar Reporte";
            loadingOverlay.style.display = 'none';
            return;
        }

        fetch(SCRIPT_URL, {
            method: 'POST',
            redirect: "follow",
            body: JSON.stringify(data),
            headers: { "Content-Type": "text/plain;charset=utf-8" },
        })
        .then(res => res.json())
        .then(response => {
            if (response.result === 'success') {
                successMessage.classList.add('show');
            } else {
                throw new Error(response.message || "Error desconocido desde la API.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Hubo un error al enviar el reporte: ${error.message}`);
        })
        .finally(() => {
            loadingOverlay.style.display = 'none';
            button.disabled = false;
            button.textContent = "Enviar Reporte";
        });
    }
});