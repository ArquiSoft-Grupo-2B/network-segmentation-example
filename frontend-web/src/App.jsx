import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8080";

  // Cargar entradas del usuario actual
  useEffect(() => {
    if (currentUser) {
      loadEntries();
    }
  }, [currentUser]);

  const loadEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/entries/${currentUser}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Error loading entries:", err);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim()) {
      setError("Por favor ingresa un nombre de usuario");
      setLoading(false);
      return;
    }

    try {
      // Verificar si el usuario existe
      const checkResponse = await fetch(`${API_URL}/api/users/${username}`);

      if (checkResponse.status === 404) {
        // Usuario no existe, crearlo
        const createResponse = await fetch(`${API_URL}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username.trim() }),
        });

        if (createResponse.ok) {
          setCurrentUser(username.trim());
          setError("");
        } else {
          const errorData = await createResponse.json();
          setError(errorData.error || "Error al crear usuario");
        }
      } else if (checkResponse.ok) {
        // Usuario existe
        setCurrentUser(username.trim());
        setError("");
      } else {
        setError("Error al verificar usuario");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!entryText.trim()) {
      setError("Por favor escribe algo en la entrada");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: currentUser,
          content: entryText.trim(),
        }),
      });

      if (response.ok) {
        setEntryText("");
        loadEntries();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar entrada");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername("");
    setEntries([]);
    setEntryText("");
    setError("");
  };

  return (
    <div className="app-container">
      <h1>Sistema de Entradas de Texto</h1>

      {!currentUser ? (
        <div className="login-section">
          <h2>Ingresa tu nombre de usuario</h2>
          <form onSubmit={handleUserSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              disabled={loading}
              className="input-field"
            />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Verificando..." : "Aceptar"}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="main-section">
          <div className="user-header">
            <h2>Bienvenido, {currentUser}!</h2>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>

          <div className="entry-form">
            <h3>Crear nueva entrada</h3>
            <form onSubmit={handleEntrySubmit}>
              <textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="Escribe tu entrada aquí..."
                disabled={loading}
                className="textarea-field"
                rows="4"
              />
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Guardando..." : "Guardar Entrada"}
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="entries-list">
            <h3>Mis Entradas</h3>
            {entries.length === 0 ? (
              <p className="no-entries">No tienes entradas aún</p>
            ) : (
              <div className="entries-container">
                {entries.map((entry) => (
                  <div key={entry.id} className="entry-card">
                    <p className="entry-content">{entry.content}</p>
                    <p className="entry-date">
                      {new Date(entry.created_at).toLocaleString("es-ES")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
