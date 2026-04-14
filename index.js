document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading state
        submitBtn.classList.add('loading');

        // Extract form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Log the collected data (for demonstration purposes)
        console.log('Resultados de la encuesta enviados:', data);

        // Prepare the payload for Airtable
        const airtableUrl = CONFIG.AIRTABLE_URL;
        const airtableToken = CONFIG.AIRTABLE_TOKEN;
        
        const fieldsData = {
            "IdEstudiante": data.id_estudiante,
            "NivelSatifaccion": parseInt(data.nivel_satisfaccion),
            "ClaridadContenido": parseInt(data.claridad_contenido),
            "AplicabilidadPractica": parseInt(data.aplicabilidad_practica)
        };

        if (data.comentarios_adicionales && data.comentarios_adicionales.trim() !== "") {
            fieldsData["ComentariosAdicionales"] = data.comentarios_adicionales;
        }

        const payload = {
            records: [
                {
                    fields: fieldsData
                }
            ],
            typecast: true
        };

        // Send data to Airtable via Fetch API
        const airtableFetch = fetch(airtableUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${airtableToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                // Parse possible errors from Airtable to surface them in debugging
                return response.json().then(errInfo => Promise.reject(errInfo));
            }
            return response.json();
        });

        // Send data to n8n webhook
        const n8nWebhookUrl = CONFIG.N8N_WEBHOOK_URL;
        const n8nFetch = fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(err => {
            console.warn('Network error for n8n webhook:', err);
        });

        // Wait for both requests to finish
        Promise.all([airtableFetch, n8nFetch])
        .then(([responseData]) => {
            console.log('Registro creado en Airtable y webhook enviado:', responseData);
            // Remove loading state
            submitBtn.classList.remove('loading');
            
            // Hide form and show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error details:', error);
            alert('Hubo un problema al enviar la encuesta. Revisa la consola para más detalles.');
            submitBtn.classList.remove('loading');
        });
    });

    // Add interactive click effect for rating buttons
    const ratingInputs = document.querySelectorAll('.rating-btn input');
    
    ratingInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            // When a radio is selected, we can add a tiny pulse animation or log it
            const parent = e.target.parentElement;
            parent.style.transform = 'scale(0.95)';
            setTimeout(() => {
                parent.style.transform = '';
            }, 100);
        });
    });
});
