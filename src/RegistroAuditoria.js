// niveles de riesgo permitidos (debe coincidir con el select del formulario)
const NIVELES_RIESGO = ["bajo", "medio", "alto"];

class RegistroAuditoria {
  // campos privados: solo se accede a ellos desde dentro de la clase
  #area;
  #hallazgo;
  #riesgo;
  #responsable;
  #correo;
  #fecha;

  constructor(area, hallazgo, riesgo, responsable, correo) {
    // String(x ?? "") evita errores si algún dato no llega; trim quita espacios
    this.#area = String(area ?? "").trim();
    this.#hallazgo = String(hallazgo ?? "").trim();
    this.#riesgo = String(riesgo ?? "").trim().toLowerCase();
    this.#responsable = String(responsable ?? "").trim();
    this.#correo = String(correo ?? "").trim();
    this.#fecha = new Date().toISOString();
  }

  // devuelve la lista de errores; si está vacía, el registro es válido
  validar() {
    const errores = [];

    // ciclo: recorre los campos obligatorios y revisa que no estén vacíos
    const obligatorios = {
      area: this.#area,
      hallazgo: this.#hallazgo,
      riesgo: this.#riesgo,
      responsable: this.#responsable,
      correo: this.#correo,
    };
    for (const [campo, valor] of Object.entries(obligatorios)) {
      if (valor === "") {
        errores.push(`El campo ${campo} es obligatorio`);
      }
    }

    // decisiones: reglas específicas, solo si el campo no está vacío
    if (this.#hallazgo !== "" && this.#hallazgo.length < 10) {
      errores.push("El hallazgo debe tener al menos 10 caracteres");
    }
    if (this.#riesgo !== "" && !NIVELES_RIESGO.includes(this.#riesgo)) {
      errores.push("El nivel de riesgo debe ser bajo, medio o alto");
    }
    if (this.#correo !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.#correo)) {
      errores.push("El correo no tiene un formato válido");
    }

    return errores;
  }

  // una línea para Datos.csv; cada valor va entre comillas por si trae comas
  toCSV() {
    const celda = (texto) => `"${String(texto).replace(/"/g, '""')}"`;
    return (
      [
        this.#area,
        this.#hallazgo,
        this.#riesgo,
        this.#responsable,
        this.#correo,
        this.#fecha,
      ]
        .map(celda)
        .join(",") + "\n"
    );
  }

  // los datos como objeto, para usarlos después en el INSERT de MySQL
  datos() {
    return {
      area: this.#area,
      hallazgo: this.#hallazgo,
      riesgo: this.#riesgo,
      responsable: this.#responsable,
      correo: this.#correo,
      fecha: this.#fecha,
    };
  }
}

module.exports = RegistroAuditoria;
