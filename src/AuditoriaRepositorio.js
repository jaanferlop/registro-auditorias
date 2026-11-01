const mysql = require("mysql2/promise");

// clase que se encarga solo del acceso a MySQL
class AuditoriaRepositorio {
  #pool;

  constructor() {
    // los datos de conexión vienen del archivo .env, no del código
    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  // convierte la fecha ISO del registro a un Date sin milésimas (DATETIME guarda segundos)
  #fecha(fechaISO) {
    const tiempo = fechaISO ? new Date(fechaISO).getTime() : Date.now();
    return new Date(Math.floor(tiempo / 1000) * 1000);
  }

  // inserta un registro; los ? evitan la inyección SQL
  async guardar(datos) {
    const sql =
      "INSERT INTO auditorias (area, hallazgo, riesgo, responsable, correo, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)";
    const [resultado] = await this.#pool.execute(sql, [
      datos.area,
      datos.hallazgo,
      datos.riesgo,
      datos.responsable,
      datos.correo,
      this.#fecha(datos.fecha),
    ]);
    return resultado.insertId;
  }

  // indica si el registro ya está en la tabla (evita duplicados al importar)
  async existe(datos) {
    const sql =
      "SELECT id FROM auditorias WHERE area = ? AND hallazgo = ? AND fecha_registro = ?";
    const [filas] = await this.#pool.execute(sql, [
      datos.area,
      datos.hallazgo,
      this.#fecha(datos.fecha),
    ]);
    return filas.length > 0;
  }

  // comprueba que MySQL responde
  async probarConexion() {
    await this.#pool.query("SELECT 1");
  }

  // cierra las conexiones del pool
  async cerrar() {
    await this.#pool.end();
  }
}

module.exports = AuditoriaRepositorio;
