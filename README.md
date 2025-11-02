# Network Segmentation Example (breve)

Componentes:

- `frontend-web`: Interfaz de usuario (React + Vite) donde el usuario ingresa su
  nombre y deja entradas de texto.
- `api-gateway`: Nginx que actúa como puerta de enlace reversa, enruta
  `/api/users` a `users-service` y `/api/entries` a `entry-service`.
- `users-service`: Backend en Flask que gestiona la creación y verificación de
  usuarios (con MongoDB).
- `entry-service`: Backend en Node/Express que gestiona entradas de texto (con
  PostgreSQL).
- `mongodb` y `postgresdb`: Contenedores de base de datos para cada backend.

Flujo básico:

1. El frontend envía peticiones al API Gateway.
2. El API Gateway redirige las rutas `/api/users` y `/api/entries` a los
   servicios correspondientes.
3. `users-service` almacena y verifica usuarios en MongoDB.
4. `entry-service` almacena entradas de texto en PostgreSQL.

Redes y segmentación:

- Se usan cuatro redes Docker:
  - `frontend-net`: conecta el `frontend-web` y el `api-gateway`.
  - `orchestration-net`: Es la red intermediaria entre el frontend y los
    backends.
  - `backend-net`: conecta `api-gateway` con los servicios de backend para
    tráfico interno.
  - `database-net` (internal): aísla las bases de datos; solo los backends
    tienen acceso.

Cómo implementa el patrón de segmentación de red:

- Las bases de datos están en una red interna (`database-net`) sin exposición
  directa al frontend o a la máquina host, reduciendo la superficie de ataque.
- El `api-gateway` actúa como punto de entrada controlado para el frontend,
  mientras que los backends se comunican en redes internas separadas — esto
  limita la visibilidad y el acceso entre componentes.
- Separar frontend, backend y bases de datos en distintas redes permite aplicar
  reglas y políticas por segmento (p. ej. firewall, ACLs) y facilita auditoría y
  control.
