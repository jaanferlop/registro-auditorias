const fs = require("fs");
const path = require("path");
const AuditoriaRepositorio = require("./AuditoriaRepositorio");

const archivoCSV = path.join(__dirname, "..", "Datos.csv");

// separa el CSV en filas de campos; respeta comillas, comas y saltos de línea dentro de un campo
function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let entreComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i];

    if (entreComillas) {
      if (caracter === '"' && texto[i + 1] === '"') {
        campo += '"'; // comilla doble escapada
        i++;
      } else if (caracter === '"') {
        entreComillas = false;
      } else {
        campo += caracter;
      }
    } else if (caracter === '"') {
      entreComillas = true;
    } else if (caracter === ",") {
      fila.push(campo);
      campo = "";
    } else if (caracter === "\n") {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else if (caracter !== "\r") {
      campo += caracter;
    }
  }

  // última fila, si el archivo no termina en salto de línea
  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

// pasa a MySQL los registros de Datos.csv que todavía no estén en la tabla
async function importar() {
  const repositorio = new AuditoriaRepositorio();
  try {
    const texto = await fs.promises.readFile(archivoCSV, "utf-8");
    const filas = leerCSV(texto).slice(1); // se omite el encabezado

    let importados = 0;
    let omitidos = 0;

    for (const [area, hallazgo, riesgo, responsable, correo, fecha] of filas) {
      const datos = { area, hallazgo, riesgo, responsable, correo, fecha };

      if (await repositorio.existe(datos)) {
        omitidos++; // ya estaba en MySQL
        continue;
      }
      await repositorio.guardar(datos);
      importados++;
    }

    console.log(`Importados: ${importados} | Ya existían: ${omitidos}`);
  } catch (error) {
    console.error("Error al importar:", error.message);
    process.exitCode = 1;
  } finally {
    await repositorio.cerrar();
  }
}

importar();
