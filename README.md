# Proyecto Eventos

API REST para una plataforma de gestión de eventos.

## Tema del proyecto

El proyecto consiste en una plataforma donde los usuarios podrán consultar y registrarse a eventos.

La API incorpora autenticación mediante **Passport.js, JWT y cookies**, manteniendo una estructura preparada para incorporar futuras estrategias de autenticación mediante proveedores externos.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- JavaScript
- ESM (ECMAScript Modules)
- dotenv
- bcrypt
- jsonwebtoken
- cookie-parser
- Passport.js
- passport-local
- passport-jwt

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/PabloBalcar/proyecto-eventos.git
```

Ingresar al proyecto:

```bash
cd proyecto-eventos
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=8080

NODE_ENV=development

MONGO_URL=

JWT_SECRET=

JWT_EXPIRES_IN=1h
```

No subir el archivo `.env` al repositorio.

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor se ejecuta por defecto en:

```text
http://localhost:8080
```

## Rutas principales

### Health Check

```http
GET /api/health
```

Verifica que el servidor se encuentre activo.

### Sesiones

```http
POST /api/sessions/register
POST /api/sessions/login
GET /api/sessions/current
POST /api/sessions/logout
GET /api/sessions/users
```

### Eventos

```http
GET /api/events
POST /api/events
PUT /api/events/:eventId
```

## Autenticación con Passport.js

La autenticación está centralizada mediante **Passport.js**.

Se utilizan tres estrategias:

### Register

La estrategia `register` se encarga de:

- Validar los campos obligatorios.
- Validar el formato del email.
- Validar la longitud de la contraseña.
- Normalizar el email.
- Verificar que el email no esté registrado.
- Generar el hash de la contraseña mediante bcrypt.
- Crear el usuario.
- Asignar el rol `user` por defecto.

El registro público no permite asignar los roles `organizer` o `admin` desde el body de la petición.

### Login

La estrategia `login` se encarga de:

- Normalizar el email.
- Buscar el usuario.
- Verificar la contraseña mediante bcrypt.
- Rechazar credenciales inválidas de forma genérica.

Una vez autenticado el usuario, el **controller** genera el JWT y lo almacena en la cookie `currentUser`.

### Current

La estrategia `current` se encarga de:

- Obtener el JWT desde la cookie `currentUser`.
- Validar el token.
- Buscar el usuario correspondiente en MongoDB.
- Colocar el usuario autenticado en `req.user`.

La ruta `GET /api/sessions/current` utiliza el middleware de autenticación para obtener los datos del usuario autenticado.

## Roles y autorización

La aplicación implementa autorización basada en roles mediante middlewares reutilizables.

### Roles disponibles

- `user`: usuario registrado estándar.
- `organizer`: puede crear eventos y modificar únicamente sus propios eventos.
- `admin`: puede crear eventos, modificar cualquier evento y consultar todos los usuarios.

El registro público asigna automáticamente el rol `user`, evitando que un usuario pueda registrarse directamente como `organizer` o `admin`.

### Matriz de permisos

| Acción                             | user | organizer | admin |
| ---------------------------------- | ---- | --------- | ----- |
| Consultar eventos publicados       | Sí   | Sí        | Sí    |
| Crear eventos                      | No   | Sí        | Sí    |
| Modificar/cancelar eventos propios | No   | Sí        | Sí    |
| Modificar cualquier evento         | No   | No        | Sí    |
| Ver todos los usuarios             | No   | No        | Sí    |

### Middlewares

#### Authentication

El middleware `authMiddleware` utiliza la estrategia `current` de Passport para validar el JWT almacenado en la cookie `currentUser`.

Si no existe una sesión válida, devuelve:

```text
401 Unauthorized
```

Si la autenticación es correcta, coloca el usuario autenticado en `req.user`.

#### Authorization

El middleware `authorizeRoles` recibe los roles permitidos y verifica el rol del usuario autenticado.

Si el usuario está autenticado pero no posee el rol requerido, devuelve:

```text
403 Forbidden
```

#### Ownership de eventos

El middleware `authorizeEventOwnerOrAdmin` controla la propiedad de los eventos.

Un `organizer` solamente puede modificar eventos cuyo campo `organizer` coincida con su propio usuario.

Un `admin` puede modificar cualquier evento.

## Rutas protegidas

### Obtener usuario actual

```http
GET /api/sessions/current
```

Requiere autenticación.

Sin una sesión válida devuelve `401`.

### Crear evento

```http
POST /api/events
```

Requiere los roles:

```text
organizer
admin
```

Un usuario con rol `user` recibe `403`.

El organizador del evento se obtiene automáticamente desde `req.user`, evitando que pueda ser enviado manualmente desde el body.

### Modificar evento

```http
PUT /api/events/:eventId
```

Requiere autenticación y los roles `organizer` o `admin`.

Además, el middleware de ownership verifica que:

- El `organizer` sea propietario del evento.
- El `admin` pueda modificar cualquier evento.

### Consultar todos los usuarios

```http
GET /api/sessions/users
```

Requiere el rol `admin`.

Las contraseñas no se incluyen en la respuesta.

## Códigos de autorización

### 401 Unauthorized

Se utiliza cuando el usuario no está autenticado o no posee una sesión válida.

Ejemplos:

- No existe la cookie `currentUser`.
- El JWT es inválido.
- El JWT expiró.
- El usuario asociado al token no existe.

### 403 Forbidden

Se utiliza cuando el usuario está autenticado pero no tiene permisos suficientes para realizar la acción.

Ejemplos:

- Un `user` intenta crear un evento.
- Un `organizer` intenta acceder a una ruta exclusiva de `admin`.
- Un `organizer` intenta modificar un evento perteneciente a otro organizador.

## Configuración de Passport

Passport se inicializa en:

```text
src/app.js
```

Las estrategias se encuentran centralizadas en:

```text
src/config/passport.config.js
```

Las rutas utilizan:

```text
session: false
```

ya que el proyecto utiliza JWT y cookies en lugar de sesiones de Passport.

La estructura está preparada para incorporar futuras estrategias mediante proveedores externos, como Google o GitHub, sin necesidad de modificar `app.js`.

## Estructura del proyecto

```text
src/
├── config/
│   ├── database.js
│   └── passport.config.js
│
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── eventOwnership.middleware.js
│
├── models/
│   ├── Event.js
│   └── User.js
│
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
│
├── utils/
│   ├── hash.js
│   └── jwt.js
│
├── app.js
└── server.js
```

## Seguridad

- Las contraseñas se almacenan utilizando hashes generados con bcrypt.
- El JWT se almacena en una cookie `httpOnly`.
- El secreto JWT se mantiene en variables de entorno.
- El archivo `.env` no se incluye en el repositorio.
- Las contraseñas no se devuelven en las respuestas de la API.
- Los permisos se validan mediante middlewares en el backend.
- El rol asignado durante el registro público siempre es `user`.

## Entidad Event

La entidad `Event` representa los eventos gestionados por la plataforma.

Cada evento contiene:

- `title`: título del evento.
- `description`: descripción.
- `category`: referencia a una categoría mediante `ObjectId`.
- `date`: fecha y hora.
- `location`: ubicación.
- `capacity`: capacidad máxima.
- `price`: precio, con valor `0` por defecto.
- `status`: estado del evento.
- `organizer`: referencia al usuario que creó el evento.

El campo `organizer` utiliza una referencia a `User` y se asigna automáticamente desde el usuario autenticado. No puede ser enviado manualmente desde el body.

### Estados

Los eventos pueden tener los siguientes estados:

- `draft`: evento creado pero no publicado.
- `published`: evento publicado.
- `cancelled`: evento cancelado.
- `finished`: evento finalizado.

Los eventos cancelados no se eliminan físicamente de la base de datos.

## Endpoints de eventos

| Método | Ruta                     | Acceso                     |
| ------ | ------------------------ | -------------------------- |
| GET    | `/api/events`            | Público                    |
| GET    | `/api/events/:id`        | Público                    |
| POST   | `/api/events`            | `organizer`, `admin`       |
| PUT    | `/api/events/:id`        | Dueño del evento o `admin` |
| PATCH  | `/api/events/:id/status` | Dueño del evento o `admin` |

### Crear evento

```http
POST /api/events
```

Requiere autenticación y rol `organizer` o `admin`.

La fecha debe ser futura, la capacidad debe ser mayor a `0` y el precio no puede ser negativo.

### Consultar eventos

```http
GET /api/events
```

Permite utilizar filtros, paginación y ordenamiento.

Filtros disponibles:

```text
status
category
location
dateFrom
dateTo
page
limit
sort
```

Ejemplo:

```http
GET /api/events?status=published&category=workshop&page=2&limit=5
```

La respuesta incluye información de paginación:

```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

### Consultar un evento

```http
GET /api/events/:id
```

Es una ruta pública y devuelve el evento correspondiente al identificador.

Si el evento no existe, devuelve `404`.

### Modificar evento

```http
PUT /api/events/:id
```

Requiere autenticación.

Un `organizer` solamente puede modificar sus propios eventos. Un `admin` puede modificar cualquier evento.

Los eventos cancelados no pueden modificarse.

### Cambiar estado

```http
PATCH /api/events/:id/status
```

Permite cambiar el estado del evento.

Los eventos cancelados no pueden cambiar nuevamente de estado.

No se permite publicar o cancelar un evento cuya fecha ya pasó.

## Arquitectura de eventos

La lógica de eventos se encuentra separada en diferentes capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MongoDB
```

### Controllers

Los controllers reciben las peticiones HTTP y construyen las respuestas.

### Services

Los services contienen las reglas de negocio, como:

- validar fechas;
- validar capacidad;
- validar precio;
- controlar estados;
- impedir modificaciones de eventos cancelados;
- impedir publicar o cancelar eventos finalizados.

### Repositories

Los repositories centralizan el acceso a MongoDB mediante Mongoose.

## Reglas de negocio

- No se pueden crear eventos con fecha pasada.
- `capacity` debe ser mayor que `0`.
- `price` debe ser mayor o igual a `0`.
- El estado solo puede ser `draft`, `published`, `cancelled` o `finished`.
- Los eventos cancelados no pueden modificarse.
- Un organizer solo puede modificar sus propios eventos.
- Un admin puede modificar eventos de cualquier organizer.
- Cancelar un evento cambia su estado a `cancelled`; no se elimina de MongoDB.
- No se puede publicar o cancelar un evento cuya fecha ya pasó.
- El listado utiliza paginación para evitar devolver todos los documentos sin límite.

## Tickets e inscripciones

La entidad `Ticket` representa la inscripción de un usuario a un evento.

El ticket utiliza referencias mediante `ObjectId` hacia `User` y `Event`, sin almacenar objetos completos.

### Estados de Ticket

Los estados disponibles son:

- `confirmed`: inscripción confirmada.
- `pending`: inscripción pendiente.
- `cancelled`: inscripción cancelada.

Los tickets cancelados no ocupan cupo.

### Endpoints

| Método | Ruta                       | Acceso                        |
| ------ | -------------------------- | ----------------------------- |
| POST   | `/api/events/:eid/tickets` | Usuario autenticado           |
| GET    | `/api/tickets/my-tickets`  | Usuario autenticado           |
| GET    | `/api/events/:eid/tickets` | Organizer propietario o admin |
| PATCH  | `/api/tickets/:tid/cancel` | Dueño del ticket o admin      |

### Flujo de inscripción

Al crear una inscripción, el backend verifica:

- que el evento exista;
- que esté publicado;
- que no haya finalizado;
- que la cantidad sea mayor a cero;
- que existan suficientes cupos;
- que el usuario no tenga una inscripción activa previa.

La cantidad de cupos ocupados se calcula considerando únicamente tickets `confirmed` o `pending`. Los tickets `cancelled` no ocupan cupo.

El usuario se obtiene desde `req.user` y no desde el body.

Cada ticket genera un código de reserva único.

### Cancelación

La cancelación no elimina físicamente el ticket.

El estado cambia a `cancelled` y se registra la fecha en `cancelledAt`.

Al dejar de contar el ticket cancelado en el cálculo de cupos, el lugar queda disponible nuevamente.

Un usuario solamente puede cancelar sus propios tickets. Un `admin` puede cancelar cualquier ticket.

### Notificaciones por email

Las confirmaciones de inscripción utilizan Nodemailer.

Las credenciales se configuran mediante variables de entorno:

```env
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Las credenciales reales no se incluyen en el repositorio.

El envío del email funciona como una notificación posterior a la creación del ticket. Si el envío falla, la inscripción continúa siendo válida.

### Arquitectura

La lógica de negocio de tickets se encuentra en `services`.

El acceso a MongoDB se encuentra en `repositories`.

La estructura utilizada es:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB
```
