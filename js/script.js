// Tarea 1: Vvalidacion formulario
//Muestra los errores en el div de alertas
function showErrors(errores) {
    const divError = document.getElementById("mensaje-error");
    divError.innerHTML = errores.join("<br>");
    divError.classList.remove("d-none");
}

//Oculta el div de alertas
function hideErrors() {
    const divError = document.getElementById("mensaje-error");
    divError.innerHTML = "";
    divError.classList.add("d-none");
}

//Devuelve true si todos los campos son válidos, false si alguno no lo es
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
    }
    if (estado === "") {
        errores.push("Debes seleccionar un estado.");
    }

    //Si hay errores, se deben mostrar y devolvemos false
    if (errores.length > 0) {
        showErrors(errores);
        return false;
    }

    //Si todo está bien, se borra/limpia los errores y devolvemos true
    hideErrors();
    return true;
}

//tarea 2
// Una tarea es un objeto así (compatible con JSON):
// { id, nombre, descripcion, asignadoA, fechaDeEntrega, estado }

class TaskManager {
    constructor() {
        this.tasks = [];   // array en memoria donde se guardan las tareas
        this.nextId = 1;   // contador para generar IDs únicos
    }

    //Devuelve todas las tareas
    getAllTasks() {
        return this.tasks;
    }

    //Devuelve solo las tareas que tienen ese estado
    getTasksWithStatus(status) {
        return this.tasks.filter(function (task) {
            return task.estado === status;
        });
    }

    //Agrega una tarea y le asigna un ID único
    addTask(task) {
        task.id = this.nextId;
        this.nextId++;
        this.tasks.push(task);
        return task;
    }

    //Elimina la tarea que tenga ese ID
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(function (task) {
            return task.id !== taskId;
        });
    }

    //Cambia el estado de una tarea
    updateTask(taskId, status) {
        const task = this.tasks.find(function (t) {
            return t.id === taskId;
        });
        if (task) {
            task.estado = status;
        }
    }

    //Cambia la persona asignada a una tarea
    assignTask(taskId, assignee) {
        const task = this.tasks.find(function (t) {
            return t.id === taskId;
        });
        if (task) {
            task.asignadoA = assignee;
        }
    }
}

//Tarea 3 Y 4: agregar y eliminar tareas
//Un solo TaskManager para toda la página
const taskManager = new TaskManager();

const formulario = document.getElementById("formulario-tarea");
const listaTareas = document.getElementById("lista-tareas");

//Se crea una línea de texto con un valor para la tarjeta
function createInfoLine(label, value) {
    const p = document.createElement("p");
    p.className = "mb-1";
    p.textContent = label + ": " + value;
    return p;
}

//Recibe un objeto tarea y devuelve la tarjeta lista para mostrar
function createTaskCard(task) {
    //Columna (para que Bootstrap acomode las tarjetas)
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    //Tarjeta
    const card = document.createElement("div");
    card.className = "card tarjeta-oscura h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    //Nombre de la tarea
    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = task.nombre;

    //Descripción
    const description = document.createElement("p");
    description.textContent = task.descripcion;

    //Botón de eliminar (Tarea 4)
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-compania btn-sm mt-2";
    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", function () {
        //Elimina la tarea del array usando su ID
        taskManager.deleteTask(task.id);
        //Elimina la tarjeta de la pantalla
        col.remove();
    });

    //Armamos la tarjeta (estudiar mas)
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(createInfoLine("Asignado a", task.asignadoA));
    body.appendChild(createInfoLine("Fecha de entrega", task.fechaDeEntrega));
    body.appendChild(createInfoLine("Estado", task.estado));
    body.appendChild(deleteButton);

    card.appendChild(body);
    col.appendChild(card);

    return col;
}

//Cuando se envía el formulario
formulario.addEventListener("submit", function (event) {
    // 1. Evita que la página se recargue
    event.preventDefault();

    //Valida el formulario; si falla, NO se agrega la tarea
    if (!validateTaskForm()) {
        return;
    }

    //Lee los valores de los campos y crea el objeto tarea
    const nuevaTarea = {
        id: 0, // el ID real lo asigna addTask
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        asignadoA: document.getElementById("asignado").value.trim(),
        fechaDeEntrega: document.getElementById("fecha").value,
        estado: document.getElementById("estado").value
    };

    //Se guarda la tarea en el array (recibe la tarea ya con su ID)
    const tareaGuardada = taskManager.addTask(nuevaTarea);

    //Se crea la tarjeta y la agrega a la pantalla
    listaTareas.appendChild(createTaskCard(tareaGuardada));

    //Limpia el formulario para ingresar la siguiente tarea
    formulario.reset();
});