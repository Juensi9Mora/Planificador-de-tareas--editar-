// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

// Devuelve la fecha de hoy con formato AAAA-MM-DD (hora local)
function getTodayString() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

// Convierte el texto del usuario en texto seguro para usarlo dentro de HTML
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// =====================================================
// TAREA 1: VALIDACIÓN DEL FORMULARIO
// =====================================================

// Muestra los errores en el div de alertas
function showErrors(errores) {
    const divError = document.getElementById("mensaje-error");
    divError.innerHTML = errores.join("<br>");
    divError.classList.remove("d-none");
}

// Oculta el div de alertas
function hideErrors() {
    const divError = document.getElementById("mensaje-error");
    divError.innerHTML = "";
    divError.classList.add("d-none");
}

// Devuelve true si todos los campos son válidos, false si alguno no lo es
function validateTaskForm() {
    // trim() quita los espacios al inicio y al final
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const asignado = document.getElementById("asignado").value.trim();
    const fecha = document.getElementById("fecha").value;
    const estado = document.getElementById("estado").value;

    const errores = [];

    if (nombre.length <= 8) {
        errores.push("El nombre no puede estar en blanco y debe tener más de 8 caracteres.");
    }
    if (descripcion.length <= 15) {
        errores.push("La descripción no puede estar en blanco y debe tener más de 15 caracteres.");
    }
    if (asignado.length <= 8) {
        errores.push("El campo 'Asignado a' no puede estar en blanco y debe tener más de 8 caracteres.");
    }
    if (fecha === "") {
        errores.push("Debes seleccionar una fecha de entrega.");
    } else if (fecha < getTodayString()) {
        errores.push("La fecha de entrega no puede estar vencida: elige hoy o una fecha posterior.");
    }
    if (estado === "") {
        errores.push("Debes seleccionar un estado.");
    }

    if (errores.length > 0) {
        showErrors(errores);
        return false;
    }

    hideErrors();
    return true;
}


// =====================================================
// FUNCIÓN QUE CREA LA TARJETA DE UNA TAREA
// =====================================================

// Recibe un objeto tarea y devuelve el elemento HTML de su tarjeta
function createTaskCard(task) {
    // Columna de Bootstrap que envuelve la tarjeta
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    // ¿Ya está completada?
    const estaHecha = task.estado === "HECHO";

    // Template literal: ${...} inserta valores dentro del HTML
    // data-id guarda el ID de la tarea en el elemento (Paso 3)
    col.innerHTML = `
        <div class="card tarjeta-oscura h-100" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${escapeHTML(task.nombre)}</h5>
                <p>${escapeHTML(task.descripcion)}</p>
                <p class="mb-1">Asignado a: ${escapeHTML(task.asignadoA)}</p>
                <p class="mb-1">Fecha de entrega: ${task.fechaDeEntrega}</p>
                <p class="mb-1">Estado: ${task.estado}</p>

                <!-- Paso 1: botón para marcar como completada -->
                <button type="button" class="btn btn-compania btn-sm mt-2 btn-completar" ${estaHecha ? "disabled" : ""}>
                    ${estaHecha ? "Completada" : "Marcar como HECHO"}
                </button>
                <button type="button" class="btn btn-outline-light btn-sm mt-2 btn-eliminar">Eliminar</button>
            </div>
        </div>
    `;

    return col;
}


// =====================================================
// TAREA 2: CLASE TaskManager
// =====================================================

// Una tarea es un objeto así (compatible con JSON):
// { id, nombre, descripcion, asignadoA, fechaDeEntrega, estado }

class TaskManager {
    constructor() {
        this.tasks = [];   // array en memoria donde se guardan las tareas
        this.nextId = 1;   // contador para generar IDs únicos
    }

    // Devuelve todas las tareas
    getAllTasks() {
        return this.tasks;
    }

    // Devuelve solo las tareas que tienen ese estado
    getTasksWithStatus(status) {
        return this.tasks.filter(function (task) {
            return task.estado === status;
        });
    }

    // Paso 4: busca una tarea por su ID (devuelve null si no existe)
    getTaskById(taskId) {
        let foundTask = null;
        for (const task of this.tasks) {
            if (task.id === taskId) {
                foundTask = task;
            }
        }
        return foundTask;
    }

    // Agrega una tarea, le asigna un ID único y vuelve a dibujar la lista
    addTask(task) {
        task.id = this.nextId;
        this.nextId++;
        this.tasks.push(task);
        this.render();
        return task;
    }

    // Elimina la tarea que tenga ese ID
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(function (task) {
            return task.id !== taskId;
        });
    }

    // Cambia el estado de una tarea
    updateTask(taskId, status) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.estado = status;
        }
    }

    // Cambia la persona asignada a una tarea
    assignTask(taskId, assignee) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.asignadoA = assignee;
        }
    }

    // Vuelve a dibujar TODAS las tarjetas a partir de this.tasks
    render() {
        const lista = document.getElementById("lista-tareas");

        // 1. Limpia el contenedor para no duplicar tarjetas
        lista.innerHTML = "";

        // 2. Recorre las tareas
        for (const task of this.tasks) {
            // 3. Crea la tarjeta de cada tarea
            const tarjeta = createTaskCard(task);
            // 4. La agrega al contenedor
            lista.appendChild(tarjeta);
        }
    }

    // Tarea 8 - Paso 1: guarda las tareas y el contador de IDs en localStorage
    save() {
        // localStorage solo guarda texto: convertimos el array a un string JSON
        const tasksString = JSON.stringify(this.tasks);
        localStorage.setItem("tasks", tasksString);

        // El contador también se guarda (como texto) para seguir la numeración
        localStorage.setItem("nextId", String(this.nextId));
    }

    // Tarea 8 - Paso 3: carga las tareas y el contador desde localStorage
    load() {
        const savedTasks = localStorage.getItem("tasks");

        // Si no hay nada guardado, getItem devuelve null y no hacemos nada
        if (savedTasks !== null) {
            try {
                // Convertimos el texto JSON de vuelta a un array
                this.tasks = JSON.parse(savedTasks);
            } catch (error) {
                // Si el texto guardado estaba dañado, empezamos con la lista vacía
                console.error("No se pudieron leer las tareas guardadas:", error);
                this.tasks = [];
            }
        }

        const savedId = localStorage.getItem("nextId");

        if (savedId !== null) {
            // El contador se guardó como texto: lo convertimos a número
            this.nextId = Number(savedId);
        }
    }
}


// =====================================================
// CONEXIÓN CON LA PÁGINA
// =====================================================

// Un solo TaskManager para toda la página
const taskManager = new TaskManager();

// Tarea 8 - Paso 4: primero se cargan las tareas guardadas y luego se dibujan
taskManager.load();
taskManager.render();

const formulario = document.getElementById("formulario-tarea");
const listaTareas = document.querySelector("#lista-tareas");

// El calendario no permite elegir fechas anteriores a hoy
document.getElementById("fecha").min = getTodayString();

// Cuando se envía el formulario
formulario.addEventListener("submit", function (event) {
    // Evita que la página se recargue
    event.preventDefault();

    // Si la validación falla, NO se agrega la tarea
    if (!validateTaskForm()) {
        return;
    }

    // Lee los valores de los campos y crea el objeto tarea
    const nuevaTarea = {
        id: 0, // el ID real lo asigna addTask
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        asignadoA: document.getElementById("asignado").value.trim(),
        fechaDeEntrega: document.getElementById("fecha").value,
        estado: document.getElementById("estado").value
    };

    // addTask guarda la tarea y llama a render() para dibujarla
    taskManager.addTask(nuevaTarea);

    // Tarea 8 - Paso 2: guarda en localStorage después de agregar
    taskManager.save();

    // Limpia el formulario para la siguiente tarea
    formulario.reset();
});

// Paso 2: UN solo listener para toda la lista (delegación de eventos)
listaTareas.addEventListener("click", function (event) {
    const target = event.target; // el elemento donde se hizo clic

    // Subimos desde el botón hasta la tarjeta que tiene data-id
    const taskElement = target.closest("[data-id]");

    // Si el clic no fue dentro de una tarjeta, no hacemos nada
    if (!taskElement) {
        return;
    }

    // Paso 3 y 5: el data-id llega como texto, lo convertimos a número
    const taskId = Number(taskElement.dataset.id);

    // PRUEBA (puedes borrarla después): muestra la tarjeta en la consola
    console.log(taskElement);

    // ¿Se hizo clic en el botón de completar?
    if (target.classList.contains("btn-completar")) {
        const task = taskManager.getTaskById(taskId); // Paso 4
        console.log(task); // PRUEBA (puedes borrarla después)

        if (task) {
            task.estado = "HECHO";  // Paso 5: cambia el estado
            taskManager.render();   // vuelve a dibujar la lista
            taskManager.save();     // Tarea 8: guarda el cambio
        }
    }

    // ¿Se hizo clic en el botón de eliminar?
    if (target.classList.contains("btn-eliminar")) {
        taskManager.deleteTask(taskId);
        taskManager.render();
        taskManager.save();     // Tarea 8: guarda el cambio
    }
});