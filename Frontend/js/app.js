document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    const sprintForm = document.getElementById('sprintForm');
    const sprintIdInput = document.getElementById('sprintId');
    const saveSprintBtn = document.getElementById('saveSprintBtn');
    const cancelEditSprintBtn = document.getElementById('cancelEditSprintBtn');
    const sprintNombreInput = document.getElementById('sprintNombre');
    const sprintFechaInicioInput = document.getElementById('sprintFechaInicio');
    const sprintFechaFinInput = document.getElementById('sprintFechaFin');
    const sprintPanelTitle = document.getElementById('sprintPanelTitle');

    const historiaForm = document.getElementById('historiaForm');
    const historiaIdInput = document.getElementById('historiaId');
    const saveHistoriaBtn = document.getElementById('saveHistoriaBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const historiaSprintSelect = document.getElementById('historiaSprint');
    const historiaTituloInput = document.getElementById('historiaTitulo');
    const reportOutput = document.getElementById('reportOutput');
    const historiaDescripcionTextarea = document.getElementById('historiaDescripcion');
    const historiaPanelTitle = document.getElementById('historiaPanelTitle');
    const historiaResponsableInput = document.getElementById('historiaResponsable');
    const historiaEstadoSelect = document.getElementById('historiaEstado');
    const historiaPuntosInput = document.getElementById('historiaPuntos');
    const historiaFechaCreacionInput = document.getElementById('historiaFechaCreacion');
    const historiaFechaFinalizacionInput = document.getElementById('historiaFechaFinalizacion');
    const historiaFechaFinalizacionGroup = document.getElementById('historiaFechaFinalizacionGroup');

    const historiasPorSprintContainer = document.getElementById('historiasPorSprintContainer');
    const refreshHistoriasBtn = document.getElementById('refreshHistoriasBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportResponsableInput = document.getElementById('reportResponsable');

    function formatDateForInput(isoDateString) {
        if (!isoDateString) return '';
        try {
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) {
                console.warn('Fecha inválida recibida:', isoDateString);
                return '';
            }
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formateando fecha para input:', isoDateString, error);
            return '';
        }
    }

    function formatDateForDisplay(isoDateString) {
        if (!isoDateString) return 'N/A';
        try {
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) {
                console.warn('Fecha inválida recibida para display:', isoDateString);
                return 'N/A';
            }
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formateando fecha para display:', isoDateString, error);
            return 'N/A';
        }
    }

    async function makeApiRequest(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };
        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            if (!response.ok) {
                let errorMessage = 'Error en la solicitud.';
                if (result.errors) {
                    errorMessage += '\n' + Object.values(result.errors).flat().join('\n');
                } else if (result.message) {
                    errorMessage += '\n' + result.message;
                } else if (result.data) {
                    errorMessage += '\n' + result.data;
                }
                alert(errorMessage);
                console.error('Error API:', result);
                throw new Error(errorMessage);
            }
            return result;
        } catch (error) {
            console.error('Error de red o parseo:', error);
            alert('Hubo un problema de conexión o con el servidor. Consulta la consola para más detalles.');
            throw error;
        }
    }

    async function loadSprintsIntoDropdown() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/sprints`);
            historiaSprintSelect.innerHTML = '';

            if (result.data && result.data.length > 0) {
                result.data.forEach(sprint => {
                    const option = document.createElement('option');
                    option.value = sprint.id;
                    option.textContent = `${sprint.nombre} (${formatDateForDisplay(sprint.fecha_inicio)} - ${formatDateForDisplay(sprint.fecha_fin)})`;
                    historiaSprintSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay sprints disponibles';
                option.disabled = true;
                option.selected = true;
                historiaSprintSelect.appendChild(option);
            }
        } catch (error) {
        }
    }

    sprintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = sprintIdInput.value;
        const nombre = sprintNombreInput.value;
        const fecha_inicio = sprintFechaInicioInput.value;
        const fecha_fin = sprintFechaFinInput.value;

        const data = { nombre, fecha_inicio, fecha_fin };

        let method = 'POST';
        let url = `${API_BASE_URL}/sprints`;
        let successMessage = 'Sprint creado exitosamente.';

        if (id) {
            method = 'PUT';
            url = `${API_BASE_URL}/sprints/${id}`;
            successMessage = 'Sprint actualizado exitosamente.';
        }

        try {
            const result = await makeApiRequest(url, method, data);
            alert(result.message);
            sprintForm.reset();
            sprintIdInput.value = '';
            saveSprintBtn.textContent = 'Crear Sprint';
            cancelEditSprintBtn.style.display = 'none';
            sprintPanelTitle.textContent = 'Crear Nuevo Sprint';
            loadSprintsIntoDropdown();
            loadHistoriasPorSprint();
        } catch (error) {
        }
    });

    async function editSprint(id) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/sprints/${id}`);
            const sprint = result.data;

            sprintIdInput.value = sprint.id;
            sprintNombreInput.value = sprint.nombre;
            sprintFechaInicioInput.value = formatDateForInput(sprint.fecha_inicio);
            sprintFechaFinInput.value = formatDateForInput(sprint.fecha_fin);

            saveSprintBtn.textContent = 'Actualizar Sprint';
            cancelEditSprintBtn.style.display = 'inline-block';
            sprintPanelTitle.textContent = 'Actualizar Sprint';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
        }
    }

    async function deleteSprint(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este sprint y todas sus historias asociadas?')) {
            try {
                const result = await makeApiRequest(`${API_BASE_URL}/sprints/${id}`, 'DELETE');
                alert(result.data || 'Sprint eliminado exitosamente.');
                loadSprintsIntoDropdown();
                loadHistoriasPorSprint();
            } catch (error) {
            }
        }
    }

    cancelEditSprintBtn.addEventListener('click', () => {
        sprintForm.reset();
        sprintIdInput.value = '';
        saveSprintBtn.textContent = 'Crear Sprint';
        cancelEditSprintBtn.style.display = 'none';
        sprintPanelTitle.textContent = 'Crear Nuevo Sprint';
    });

    async function loadHistoriasPorSprint() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/sprints/historias`);
            historiasPorSprintContainer.innerHTML = '';

            if (result.data && result.data.length > 0) {
                result.data.forEach(sprint => {
                    const sprintCard = document.createElement('div');
                    sprintCard.className = 'sprint-card';
                    sprintCard.dataset.id = sprint.id;

                    sprintCard.innerHTML = `
                        <h3>${sprint.nombre} (${formatDateForDisplay(sprint.fecha_inicio)} - ${formatDateForDisplay(sprint.fecha_fin)})</h3>
                        <div class="sprint-actions">
                            <button class="edit-sprint-btn" data-id="${sprint.id}">Editar Sprint</button>
                            <button class="delete-sprint-btn" data-id="${sprint.id}">Eliminar Sprint</button>
                        </div>
                    `;

                    if (sprint.historias && sprint.historias.length > 0) {
                        const historiasList = document.createElement('div');
                        sprint.historias.forEach(historia => {
                            const historiaItem = document.createElement('div');
                            historiaItem.className = 'story-item';
                            historiaItem.innerHTML = `
                                <h4>${historia.titulo} (Puntos: ${historia.puntos})</h4>
                                <p><strong>Descripción:</strong> ${historia.descripcion}</p>
                                <p><strong>Responsable:</strong> ${historia.responsable}</p>
                                <p><strong>Estado:</strong> ${historia.estado}</p>
                                <p><strong>Creación:</strong> ${formatDateForDisplay(historia.fecha_creacion)}</p>
                                ${historia.fecha_finalizacion ? `<p><strong>Finalización:</strong> ${formatDateForDisplay(historia.fecha_finalizacion)}</p>` : ''}
                                <div class="actions">
                                    <button class="edit-btn" data-id="${historia.id}">Editar</button>
                                    <button class="delete-btn" data-id="${historia.id}">Eliminar</button>
                                </div>
                            `;
                            historiasList.appendChild(historiaItem);
                        });
                        sprintCard.appendChild(historiasList);
                    } else {
                        sprintCard.innerHTML += '<p>No hay historias para este sprint.</p>';
                    }
                    historiasPorSprintContainer.appendChild(sprintCard);
                });
            } else {
                historiasPorSprintContainer.innerHTML = '<p>No hay sprints o historias disponibles.</p>';
            }
        } catch (error) {
        }
    }

    function toggleFechaFinalizacionField() {
        if (historiaEstadoSelect.value === 'finalizada') {
            historiaFechaFinalizacionGroup.style.display = 'block';
            historiaFechaFinalizacionInput.setAttribute('required', 'required');
        } else {
            historiaFechaFinalizacionGroup.style.display = 'none';
            historiaFechaFinalizacionInput.removeAttribute('required');
            historiaFechaFinalizacionInput.value = '';
        }
    }

    historiaEstadoSelect.addEventListener('change', toggleFechaFinalizacionField);

    historiaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = historiaIdInput.value;
        const titulo = historiaTituloInput.value;
        const descripcion = historiaDescripcionTextarea.value;
        const responsable = historiaResponsableInput.value;
        const estado = historiaEstadoSelect.value;
        const puntos = historiaPuntosInput.value;
        const fecha_creacion = historiaFechaCreacionInput.value;
        let fecha_finalizacion = historiaFechaFinalizacionInput.value;
        const sprint_id = historiaSprintSelect.value;

        if (estado === 'finalizada' && !fecha_finalizacion) {
            fecha_finalizacion = new Date().toISOString().slice(0, 10);
        } else if (estado !== 'finalizada') {
            fecha_finalizacion = null;
        }

        const data = {
            titulo,
            descripcion,
            responsable,
            estado,
            puntos: parseInt(puntos),
            fecha_creacion,
            fecha_finalizacion,
            sprint_id: parseInt(sprint_id)
        };

        let method = 'POST';
        let url = `${API_BASE_URL}/historias`;
        let successMessage = 'Historia creada exitosamente.';

        if (id) {
            method = 'PUT';
            url = `${API_BASE_URL}/historias/${id}`;
            successMessage = 'Historia actualizada exitosamente.';
        }

        try {
            const result = await makeApiRequest(url, method, data);
            alert(result.message);
            historiaForm.reset();
            historiaIdInput.value = '';
            saveHistoriaBtn.textContent = 'Guardar Historia';
            cancelEditBtn.style.display = 'none';
            historiaPanelTitle.textContent = 'Crear Nueva Historia de Usuario';
            toggleFechaFinalizacionField();
            loadHistoriasPorSprint();
        } catch (error) {
        }
    });

    async function editHistoria(id) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/historias/${id}`);
            const historia = result.data;

            historiaIdInput.value = historia.id;
            historiaTituloInput.value = historia.titulo;
            historiaDescripcionTextarea.value = historia.descripcion;
            historiaResponsableInput.value = historia.responsable;
            historiaEstadoSelect.value = historia.estado;
            historiaPuntosInput.value = historia.puntos;
            historiaFechaCreacionInput.value = formatDateForInput(historia.fecha_creacion);
            historiaFechaFinalizacionInput.value = formatDateForInput(historia.fecha_finalizacion);

            historiaSprintSelect.value = historia.sprint_id;

            toggleFechaFinalizacionField();

            saveHistoriaBtn.textContent = 'Actualizar Historia';
            cancelEditBtn.style.display = 'inline-block';
            historiaPanelTitle.textContent = 'Actualizar Historia de Usuario';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
        }
    }

    async function deleteHistoria(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta historia de usuario?')) {
            try {
                const result = await makeApiRequest(`${API_BASE_URL}/historias/${id}`, 'DELETE');
                alert(result.data || 'Historia eliminada exitosamente.');
                loadHistoriasPorSprint();
            } catch (error) {
            }
        }
    }

    historiasPorSprintContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            editHistoria(id);
        } else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteHistoria(id);
        }
        else if (e.target.classList.contains('edit-sprint-btn')) {
            const id = e.target.dataset.id;
            editSprint(id);
        } else if (e.target.classList.contains('delete-sprint-btn')) {
            const id = e.target.dataset.id;
            deleteSprint(id);
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        historiaForm.reset();
        historiaIdInput.value = '';
        saveHistoriaBtn.textContent = 'Guardar Historia';
        cancelEditBtn.style.display = 'none';
        historiaPanelTitle.textContent = 'Crear Nueva Historia de Usuario';
        toggleFechaFinalizacionField();
    });

    refreshHistoriasBtn.addEventListener('click', loadHistoriasPorSprint);

    generateReportBtn.addEventListener('click', async () => {
        const responsable = reportResponsableInput.value.trim();
        let url = `${API_BASE_URL}/historias/reporte`;
        if (responsable) {
            url += `?responsable=${encodeURIComponent(responsable)}`;
        }

        try {
            const result = await makeApiRequest(url);

            let reportHTML = '<table>';
            reportHTML += '<thead><tr><th>Métrica</th><th>Valor</th></tr></thead><tbody>';
            reportHTML += `<tr><td>Responsable</td><td>${result.responsable || 'Todos'}</td></tr>`;
            reportHTML += `<tr><td>Total de Historias</td><td>${result.total_historias}</td></tr>`;
            reportHTML += `<tr><td>Historias Finalizadas</td><td>${result.finalizadas}</td></tr>`;
            reportHTML += `<tr><td>Historias Pendientes</td><td>${result.pendientes}</td></tr>`;
            reportHTML += `<tr><td>Historias en Impedimento</td><td>${result.impedimentos}</td></tr>`;
            reportHTML += '</tbody></table>';

            reportOutput.innerHTML = reportHTML;

        } catch (error) {
            reportOutput.innerHTML = '<p class="error-message">Error al generar el informe.</p>';
        }
    });

    async function initializeApp() {
        await loadSprintsIntoDropdown();
        loadHistoriasPorSprint();
        toggleFechaFinalizacionField();
    }

    initializeApp();
});