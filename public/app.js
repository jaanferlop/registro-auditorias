const formulario = document.getElementById("formAuditoria");
const mensaje = document.getElementById("mensaje");

// al enviar: se detiene la recarga y se manda el registro al servidor
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  // recoge los campos por su atributo name y los convierte en objeto
  const datos = Object.fromEntries(new FormData(formulario));

  try {
    const respuesta = await fetch("/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (respuesta.ok) {
      mensaje.textContent = resultado.mensaje;
      mensaje.style.color = "green";
      formulario.reset();
    } else {
      // el servidor puede mandar una lista de errores o un solo error
      const errores = resultado.errores || [resultado.error];
      mensaje.textContent = errores.join(". ");
      mensaje.style.color = "red";
    }
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con el servidor";
    mensaje.style.color = "red";
  }
});
