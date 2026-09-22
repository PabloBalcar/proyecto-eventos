# Proyecto Eventos

API REST para una plataforma de gestión de eventos.

## Tema del proyecto

El proyecto consiste en una plataforma donde los usuarios pueden consultar eventos e inscribirse a ellos.

La API incorpora autenticación mediante **Passport.js, JWT y cookies**, autorización basada en roles, gestión de eventos e inscripciones, control de capacidad y notificaciones por email.

La aplicación utiliza una arquitectura en capas para separar responsabilidades y facilitar el mantenimiento y la evolución del proyecto.

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
- Nodemailer

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

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
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

## Arquitectura

El proyecto utiliza una arquitectura en capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model
  ↓
MongoDB
```

Cada capa tiene una responsabilidad específica.

### Routes

Definen los endpoints de la API y conectan las peticiones HTTP con los controllers y middlewares correspondientes.

### Controllers

Se encargan de coordinar la petición y la respuesta HTTP.

Los controllers:

- obtienen parámetros, query y body;
- llaman a los services;
- transforman las respuestas mediante DTOs;
- devuelven el código HTTP correspondiente.

Los controllers no importan modelos de Mongoose ni contienen reglas de negocio.

### Services

Contienen la lógica de negocio de la aplicación.

Por ejemplo:

- validación de fechas;
- validación de capacidad;
- validación de precios;
- control de estados;
- control de inscripciones duplicadas;
- cálculo de cupos disponibles;
- validación de permisos relacionados con recursos;
- cancelación de tickets;
- envío de emails.

Los services trabajan con repositories y no acceden directamente a los modelos de Mongoose.

### Repositories

Actúan como una capa de abstracción entre los services y los DAOs.

Utilizan métodos orientados al dominio, por ejemplo:

- `findByEmail`;
- `findPublishedEvents`;
- `countReservedTickets`;
- `findActiveTicket`;
- `cancelTicket`.

Los repositories no importan directamente los modelos de Mongoose.

### DAOs

Los Data Access Objects encapsulan el acceso directo a MongoDB mediante los modelos de Mongoose.

Existe un DAO para cada entidad principal:

- `UserDAO`
- `EventDAO`
- `TicketDAO`

También se utiliza `CategoryDAO` para la entidad de categorías.

Los modelos de Mongoose son importados únicamente por los DAOs.

### DTOs

Los Data Transfer Objects controlan la información que se devuelve al cliente.

Se utilizan DTOs para:

- usuario autenticado;
- eventos;
- tickets e inscripciones.

Las respuestas no exponen contraseñas, ni siquiera cuando se encuentran almacenadas como hash.

Cuando existen documentos relacionados mediante `populate`, el DTO también limita los campos que se devuelven.

## Estructura del proyecto

```text
src/
├── config/
│   ├── database.js
│   ├── mailer.config.js
│   └── passport.config.js
│
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   └── ticket.controller.js
│
├── dao/
│   ├── category.dao.js
│   ├── event.dao.js
│   ├── ticket.dao.js
│   └── user.dao.js
│
├── dto/
│   ├── current-user.dto.js
│   ├── event-response.dto.js
│   └── ticket-response.dto.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── eventOwnership.middleware.js
│
├── models/
│   ├── Category.js
│   ├── Event.js
│   ├── Ticket.js
│   └── User.js
│
├── repositories/
│   ├── category.repository.js
│   ├── event.repository.js
│   ├── ticket.repository.js
│   └── user.repository.js
│
├── routes/
│   ├── categories.router.js
│   ├── events.router.js
│   ├── sessions.router.js
│   └── tickets.router.js
│
├── services/
│   ├── category.service.js
│   ├── event.service.js
│   ├── mail.service.js
│   ├── session.service.js
│   └── ticket.service.js
│
├── utils/
│   ├── hash.js
│   └── jwt.js
│
├── app.js
└── server.js
```

## Autenticación con Passport.js

La autenticación está centralizada mediante Passport.js.

Se utilizan tres estrategias:

### Register

La estrategia `register` se encarga de:

- validar los campos obligatorios;
- validar el formato del email;
- validar la longitud de la contraseña;
- normalizar el email;
- verificar que el email no esté registrado;
- generar el hash de la contraseña mediante bcrypt;
- crear el usuario;
- asignar el rol `user` por defecto.

El registro público no permite asignar los roles `organizer` o `admin` desde el body.

### Login

La estrategia `login` se encarga de:

- normalizar el email;
- buscar el usuario;
- verificar la contraseña mediante bcrypt;
- rechazar credenciales inválidas.

Una vez autenticado el usuario, el controller genera el JWT y lo almacena en la cookie `currentUser`.

### Current

La estrategia `current`:

- obtiene el JWT desde la cookie `currentUser`;
- valida el token;
- busca el usuario correspondiente;
- coloca el usuario autenticado en `req.user`.

La ruta:

```http
GET /api/sessions/current
```

utiliza `authMiddleware` para validar la sesión.

## Roles y autorización

La aplicación implementa autorización basada en roles mediante middlewares reutilizables.

### Roles disponibles

- `user`: usuario registrado estándar.
- `organizer`: puede crear eventos y modificar sus propios eventos.
- `admin`: puede crear y modificar eventos y consultar todos los usuarios.

El registro público asigna automáticamente el rol `user`.

### Matriz de permisos

| Acción                          | user | organizer | admin |
| ------------------------------- | ---- | --------- | ----- |
| Consultar eventos               | Sí   | Sí        | Sí    |
| Crear eventos                   | No   | Sí        | Sí    |
| Modificar eventos propios       | No   | Sí        | Sí    |
| Modificar cualquier evento      | No   | No        | Sí    |
| Ver todos los usuarios          | No   | No        | Sí    |
| Ver tickets de un evento propio | No   | Sí        | Sí    |

### Middlewares

#### Authentication

`authMiddleware` utiliza la estrategia `current` de Passport para validar el JWT almacenado en `currentUser`.

Si no existe una sesión válida:

```text
401 Unauthorized
```

Si la autenticación es correcta, coloca el usuario en `req.user`.

#### Authorization

`authorizeRoles` recibe los roles permitidos y verifica el rol del usuario autenticado.

Si el usuario está autenticado pero no posee el rol requerido:

```text
403 Forbidden
```

#### Ownership de eventos

`eventOwnership` verifica que un organizer sea propietario del evento.

Un `organizer` solamente puede modificar eventos cuyo `organizer` coincida con su usuario.

Un `admin` puede modificar cualquier evento.

## Códigos HTTP

La API utiliza códigos HTTP según el resultado de cada operación:

### 400 Bad Request

Datos inválidos o reglas de negocio incumplidas.

Ejemplos:

- fecha inválida;
- fecha pasada;
- capacidad inválida;
- precio negativo;
- estado inválido;
- evento no disponible para inscripción.

### 401 Unauthorized

El usuario no está autenticado o la sesión no es válida.

Ejemplos:

- no existe la cookie `currentUser`;
- JWT inválido;
- JWT expirado;
- usuario inexistente.

### 403 Forbidden

El usuario está autenticado pero no tiene permisos suficientes.

Ejemplos:

- un `user` intenta crear un evento;
- un organizer intenta modificar el evento de otro organizer;
- un organizer intenta acceder a una operación exclusiva de admin.

### 404 Not Found

El recurso solicitado no existe.

Ejemplo:

- evento inexistente;
- ticket inexistente.

### 409 Conflict

Existe un conflicto con el estado actual del recurso.

Ejemplo:

- un usuario intenta inscribirse nuevamente a un evento en el que ya tiene una inscripción activa.

### 500 Internal Server Error

Error interno inesperado del servidor.

## Endpoints

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
GET /api/events/:eid
POST /api/events
PUT /api/events/:eid
PATCH /api/events/:eid/status
POST /api/events/:eid/tickets
GET /api/events/:eid/tickets
```

### Tickets

```http
GET /api/tickets/my-tickets
PATCH /api/tickets/:tid/cancel
```

### Categorías

```http
GET /api/categories
POST /api/categories
```

## Entidad Event

La entidad `Event` representa los eventos gestionados por la plataforma.

Cada evento contiene:

- `title`: título del evento.
- `description`: descripción.
- `category`: referencia a `Category` mediante `ObjectId`.
- `date`: fecha y hora.
- `location`: ubicación.
- `capacity`: capacidad máxima.
- `price`: precio.
- `status`: estado del evento.
- `organizer`: referencia al usuario que creó el evento.

El campo `organizer` se asigna automáticamente desde el usuario autenticado.

### Estados

Los eventos pueden tener los siguientes estados:

- `draft`: evento creado pero no publicado.
- `published`: evento publicado.
- `cancelled`: evento cancelado.
- `finished`: evento finalizado.

Los eventos cancelados no se eliminan físicamente de MongoDB.

## Reglas de negocio de eventos

- No se pueden crear eventos con fecha pasada.
- `capacity` debe ser un entero mayor que `0`.
- `price` debe ser mayor o igual a `0`.
- El estado solo puede ser `draft`, `published`, `cancelled` o `finished`.
- Los eventos cancelados no pueden modificarse.
- Un organizer solamente puede modificar sus propios eventos.
- Un admin puede modificar cualquier evento.
- No se puede publicar o cancelar un evento cuya fecha ya pasó.
- El listado utiliza paginación.

## Consultar eventos

```http
GET /api/events
```

Permite utilizar:

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
GET /api/events?status=published&page=1&limit=10
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

## Tickets e inscripciones

La entidad `Ticket` representa la inscripción de un usuario a un evento.

Utiliza referencias mediante `ObjectId` hacia `User` y `Event`.

### Estados de Ticket

- `confirmed`: inscripción confirmada.
- `pending`: inscripción pendiente.
- `cancelled`: inscripción cancelada.

Los tickets cancelados no ocupan cupo.

## Flujo de inscripción

Al crear una inscripción, el backend verifica:

- que el evento exista;
- que esté publicado;
- que no haya finalizado;
- que la cantidad sea un entero mayor a cero;
- que existan suficientes cupos;
- que el usuario no tenga una inscripción activa previa.

Los tickets `confirmed` y `pending` ocupan cupo.

Los tickets `cancelled` no ocupan cupo.

El usuario se obtiene desde `req.user` y no desde el body.

Cada ticket genera un código de reserva.

## Cancelación de tickets

```http
PATCH /api/tickets/:tid/cancel
```

La cancelación no elimina físicamente el ticket.

El estado cambia a `cancelled` y se registra la fecha en `cancelledAt`.

Un usuario solamente puede cancelar sus propios tickets.

Un `admin` puede cancelar cualquier ticket.

## Notificaciones por email

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

El ticket se mantiene creado aunque falle el envío del email.

## Seguridad

- Las contraseñas se almacenan utilizando hashes generados con bcrypt.
- El JWT se almacena en una cookie `httpOnly`.
- El secreto JWT se mantiene en variables de entorno.
- El archivo `.env` no se incluye en el repositorio.
- Las contraseñas no se devuelven en las respuestas.
- Los DTOs controlan la información expuesta al cliente.
- Los permisos se validan mediante middlewares.
- El rol asignado durante el registro público siempre es `user`.

## Pruebas realizadas

Se verificó el flujo principal:

```text
Registro
   ↓
Login
   ↓
Crear evento
   ↓
Publicar evento
   ↓
Inscripción
   ↓
Consultar mis tickets
   ↓
Cancelar inscripción
```

También se verificaron respuestas de autorización y negocio:

- `401` sin sesión.
- `403` sin permisos.
- `404` para recursos inexistentes.
- `409` para inscripción duplicada.
- `400` para datos o estados inválidos.

## Estado de la arquitectura PE8

La aplicación separa las responsabilidades de acceso a datos, lógica de negocio y presentación:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
DAO
    ↓
Model
```

Los controllers no importan modelos.

Los services no importan modelos ni DAOs.

Los repositories utilizan los DAOs.

Los DAOs son la única capa que accede directamente a los modelos de Mongoose.

Los DTOs controlan la información expuesta en las respuestas.
