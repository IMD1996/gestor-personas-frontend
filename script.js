const API_URL = "https://api-personas-py.onrender.com";

let personasGlobal = [];

function mostrarToast(mensaje, esError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.style.background = esError ? "#dc3545" : "#222";
  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2500);
}

function mostrarLoader() {
  document.getElementById("loader").classList.remove("oculto");
}

function ocultarLoader() {
  document.getElementById("loader").classList.add("oculto");
}

function validarCampos(nombre, edad, correo) {
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;

  if (!nombre || !edad || !correo) {
    mostrarToast("Todos los campos son obligatorios", true);
    return false;
  }

  if (!soloLetras.test(nombre)) {
    mostrarToast("El nombre solo debe contener letras", true);
    return false;
  }

  if (isNaN(edad)) {
    mostrarToast("La edad debe ser un número", true);
    return false;
  }

  return true;
}

function limpiarCampos() {
  document.getElementById("personaId").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("edad").value = "";
  document.getElementById("correo").value = "";
}

async function cargarPersonas() {
  const lista = document.getElementById("listaPersonas");
  lista.innerHTML = "";
  mostrarLoader();

  try {
    const response = await fetch(`${API_URL}/personas`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const personas = await response.json();
    personasGlobal = personas;
    personasGlobal.sort((a, b) => a.nombre.localeCompare(b.nombre));
    renderizarPersonas(personasGlobal);

  } catch (error) {
    mostrarToast("No se pudo conectar con la API", true);
    console.error(error);
  } finally {
    ocultarLoader();
  }
}

let idAEliminar = null;

function eliminarPersona(id) {
  console.log("ID recibido en eliminarPersona:", id);
  idAEliminar = id;
  document.getElementById("modal").classList.remove("oculto");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("oculto");
}

async function confirmarEliminar() {

  console.log("ID que se va a eliminar:", idAEliminar);

  try {
    const response = await fetch(`${API_URL}/personas/${idAEliminar}`, {
      method: "DELETE"
    });

    if (response.ok) {
      cargarPersonas();
      mostrarToast("Persona eliminada");
    } else {
      mostrarToast("No se pudo eliminar", true);
    }
  } catch {
    mostrarToast("Error al conectar con la API", true);
  }

  cerrarModal();
}

function renderizarPersonas(personas) {
  const lista = document.getElementById("listaPersonas");

  lista.innerHTML = ""; // ← limpia la lista

  // 🔥 AQUÍ VA EL CONTADOR
  document.getElementById("contador").textContent = `Total: ${personas.length} personas`;

  // luego recorres las personas
  personas.forEach(persona => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${persona.nombre}</strong><br>
      Edad: ${persona.edad}<br>
      Correo: ${persona.correo}
      <div class="acciones">
        <button class="btn-item-editar" onclick="seleccionarPersona(${persona.id}, '${persona.nombre}', ${persona.edad}, '${persona.correo}')">Editar</button>
        <button class="btn-item-eliminar" onclick="eliminarPersona(${persona.id})">Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });
}


function filtrarPersonas() {
  const texto = document.getElementById("buscador").value.toLowerCase();

  const filtradas = personasGlobal.filter(persona =>
    persona.nombre.toLowerCase().includes(texto)
  );

  renderizarPersonas(filtradas);
}

function toggleModoOscuro() {
  document.body.classList.toggle("dark");

  const oscuroActivo = document.body.classList.contains("dark");
  localStorage.setItem("modoOscuro", oscuroActivo);
}

async function agregarPersona() {
  const nombre = document.getElementById("nombre").value.trim();
  const edad = document.getElementById("edad").value.trim();
  const correo = document.getElementById("correo").value.trim();

  if (!validarCampos(nombre, edad, correo)) return;

  const data = {
    nombre,
    edad: parseInt(edad),
    correo
  };

  try {
    const response = await fetch(`${API_URL}/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      limpiarCampos();
      cargarPersonas();
      mostrarToast("Persona agregada correctamente");
    } else {
      mostrarToast("No se pudo agregar", true);
    }
  } catch (error) {
    mostrarToast("Error al conectar con la API", true);
  }
}

function seleccionarPersona(id, nombre, edad, correo) {
  document.getElementById("personaId").value = id;
  document.getElementById("nombre").value = nombre;
  document.getElementById("edad").value = edad;
  document.getElementById("correo").value = correo;
}

async function editarPersona() {
  const id = document.getElementById("personaId").value;
  const nombre = document.getElementById("nombre").value.trim();
  const edad = document.getElementById("edad").value.trim();
  const correo = document.getElementById("correo").value.trim();

  if (!id) {
    mostrarToast("Selecciona una persona para editar", true);
    return;
  }

  if (!validarCampos(nombre, edad, correo)) return;

  const data = {
    nombre,
    edad: parseInt(edad),
    correo
  };

  try {
    const response = await fetch(`${API_URL}/personas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      limpiarCampos();
      cargarPersonas();
      mostrarToast("Persona actualizada");
    } else {
      mostrarToast("No se pudo actualizar", true);
    }
  } catch (error) {
    mostrarToast("Error al conectar con la API", true);
  }
}

window.onload = () => {
  const guardado = localStorage.getItem("modoOscuro");
  if (guardado === "true") {
    document.body.classList.add("dark");
  }

  cargarPersonas();
};

// 👇 AGREGA ESTO
window.eliminarPersona = eliminarPersona;
window.confirmarEliminar = confirmarEliminar;
window.cerrarModal = cerrarModal;
window.seleccionarPersona = seleccionarPersona;
window.agregarPersona = agregarPersona;
window.editarPersona = editarPersona;
window.filtrarPersonas = filtrarPersonas;
window.toggleModoOscuro = toggleModoOscuro;