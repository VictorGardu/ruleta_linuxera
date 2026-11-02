// ============================================
// CONFIGURACIÓN DEL JUEGO
// Edita este archivo para personalizar el Basta.
// ============================================

const CONFIG = {

  // Ruleta externa: letras disponibles.
  // Quité la Ñ a propósito (casi nada tech empieza con ella).
  // Si hay letras muy difíciles para tu grupo, bórralas de aquí.
  letras: [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ],

  // Ruleta interna: categorías.
  // "ejemplos" son una ayuda para quien modera el juego
  // y para validar respuestas (la ruleta no los usa para girar).
  categorias: [
    {
      nombre: "Comandos de Linux",
      color: "#22d3ee",
      ejemplos: ["ls", "grep", "chmod", "cat", "ssh"]
    },
    {
      nombre: "Lenguajes de programación",
      color: "#a78bfa",
      ejemplos: ["Go", "Python", "Rust", "Java", "Bash"]
    },
    {
      nombre: "Herramientas de seguridad",
      color: "#f43f5e",
      ejemplos: ["Nmap", "Burp Suite", "Wireshark", "Metasploit"]
    },
    {
      nombre: "Protocolos de red",
      color: "#fbbf24",
      ejemplos: ["HTTP", "DNS", "SSH", "TCP", "FTP"]
    },
    {
      nombre: "Sistemas operativos y distros",
      color: "#34d399",
      ejemplos: ["Ubuntu", "Kali", "Debian", "Windows", "Fedora"]
    },
    {
      nombre: "Frameworks y librerías",
      color: "#fb923c",
      ejemplos: ["React", "Django", "Flask", "Laravel", "Express"]
    },
    {
      nombre: "Bases de datos",
      color: "#60a5fa",
      ejemplos: ["MySQL", "MongoDB", "Redis", "PostgreSQL"]
    },
    {
      nombre: "Ataques y vulnerabilidades",
      color: "#f472b6",
      ejemplos: ["Phishing", "XSS", "Ransomware", "SQL Injection"]
    }
  ],

  // Colores de la ruleta de letras (se alternan entre segmentos).
  coloresLetras: ["#1e293b", "#334155"],

  // Animación (en milisegundos). Cada ruleta puede durar distinto
  // para que no terminen exactamente al mismo tiempo.
  duracionGiroLetras: 5000,
  duracionGiroCategorias: 6500,
// Segundos para responder. Pon 0 para jugar sin temporizador.
  tiempoRespuesta: 30
};