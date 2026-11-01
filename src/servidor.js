const express = require ("express");
const path = require ("path");

const fs = require("fs");
const RegistroAuditoria = require("./RegistroAuditoria");
const AuditoriaRepositorio = require("./AuditoriaRepositorio");


const app = express();
const puerto = 3000;

// acceso a MySQL (los datos de conexión vienen del .env)
const repositorio = new AuditoriaRepositorio();


// el CSV queda en la raíz del proyecto
const archivoCSV = path.join(__dirname, "..", "Datos.csv");
const encabezadoCSV = '"area","hallazgo","riesgo","responsable","correo","fecha"\n';

// asegura que el archivo CSV exista y tenga el encabezado
if (!fs.existsSync(archivoCSV)) {
  fs.writeFileSync(archivoCSV, encabezadoCSV);
}

//permite leer los datos que llegan del formulario
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//configuracion de la carpeta publica
app.use(express.static(path.join(__dirname, "..", "public")));

// recibe el formulario, valida y guarda en el CSV y en MySQL
app.post("/registrar", async (req, res) => {
  try {
    const { area, hallazgo, riesgo, responsable, correo } = req.body;
    const registro = new RegistroAuditoria(area, hallazgo, riesgo, responsable, correo);

    // si hay errores de validación, responde 400 y no guarda nada
    const errores = registro.validar();
    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }

    // si el CSV no existe, se crea primero con el encabezado
    if (!fs.existsSync(archivoCSV)) {
      await fs.promises.writeFile(archivoCSV, encabezadoCSV);
    }

    // agrega la línea al final sin borrar los registros anteriores
    await fs.promises.appendFile(archivoCSV, registro.toCSV());

        // guarda el mismo registro en MySQL
    await repositorio.guardar(registro.datos());

    res.status(201).json({ mensaje: "Auditoría registrada correctamente" });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ error: "No se pudo guardar el registro" });
  }
});


app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
});