-- crea la base de datos solo si no existe
CREATE DATABASE IF NOT EXISTS registro_auditorias;
USE registro_auditorias;

-- tabla donde se guarda cada auditoría registrada
CREATE TABLE IF NOT EXISTS auditorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  hallazgo TEXT NOT NULL,
  riesgo VARCHAR(10) NOT NULL,
  responsable VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);
