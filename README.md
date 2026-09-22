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
```

### Eventos

Las rutas de eventos se encuentran disponibles bajo:

```http
/api/events
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

La ruta `GET /api/sessions/current` utiliza esta estrategia para obtener los datos del usuario autenticado.

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
├── controllers/
│   ├── events.controller.js
│   └── sessions.contro
```
