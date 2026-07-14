# UTP Marketplace

Aplicación académica multipágina para que estudiantes publiquen productos y los ofrezcan en venta, préstamo o intercambio. Usa una arquitectura pequeña: HTML, Sass y módulos JavaScript sin frameworks.

## Tecnologías

- HTML5, Bootstrap 5 y Sass/SCSS.
- JavaScript con módulos ES.
- Firebase Authentication y Cloud Firestore.
- `localStorage` para el carrito.

## Páginas

Inicio, catálogo, detalle del producto, carrito, inicio de sesión, registro, publicación, mis productos, perfil y administración.

## Instalación y ejecución

```bash
npm install
cp js/config/firebase-config.example.js js/config/firebase-config.js
npm run dev
```

Abre `http://localhost:3000`. También puedes ejecutar por separado `npm run serve` y `npm run sass:watch`. Para compilar CSS normal y minificado usa:

```bash
npm run build
```

## Configuración de Firebase

1. Crea una aplicación web en Firebase.
2. Activa Authentication con correo y contraseña.
3. Crea una base de datos Cloud Firestore.
4. Copia la configuración web en `js/config/firebase-config.js`. Este archivo está ignorado por Git.
5. Publica manualmente las reglas e índices cuando estés listo:

```bash
npx firebase login
npx firebase use TU_PROJECT_ID
npx firebase deploy --only firestore:rules,firestore:indexes
```

El proyecto no usa Firebase Storage. Las imágenes se indican mediante URL o usan el marcador local.

## Datos y roles

`users/{uid}` guarda `uid`, `name`, `email`, `career`, `campus`, `role`, `status` y `createdAt`. El rol puede ser `student` o `admin`; el estado, `active` o `blocked`.

`products/{productId}` guarda `name`, `description`, `category`, `transactionType`, `price`, `condition`, `imageUrl`, `ownerId`, `ownerName`, `status` y `createdAt`. La modalidad puede ser `sale`, `loan` o `exchange`.

Las descripciones tienen entre 20 y 500 caracteres. En las tarjetas se muestran hasta cuatro líneas y el botón **Ver más** permite expandirlas; la página de detalle siempre muestra el texto completo.

## Crear una cuenta administradora

No existen credenciales administrativas en el código. Para crear una cuenta admin:

1. Registra la cuenta normalmente desde `pages/registro.html`.
2. Abre Firebase Console.
3. Entra a **Firestore Database**.
4. Abre la colección `users`.
5. Abre el documento cuyo identificador sea el UID de la cuenta.
6. Cambia el campo `role` de `student` a `admin`.
7. Conserva `status` con el valor `active`.
8. Cierra sesión en UTP Marketplace y vuelve a iniciarla.
9. Abre `pages/admin.html`.

El panel muestra los totales, usuarios y productos. Solo permite activar o bloquear usuarios y activar o desactivar productos; no permite cambiar roles ni bloquear la propia cuenta administradora.

## Carrito y pruebas

El carrito acepta productos en venta, calcula el total y guarda sus datos en `localStorage`; no procesa pagos ni escribe compras en Firestore.

Prueba registro, login, cierre de sesión, publicación, catálogo, filtros, detalle, carrito, productos propios y panel admin con Firebase real. Revisa el diseño en Chrome, Firefox y Edge, en tamaños móvil, tableta y escritorio. Las reglas no se despliegan automáticamente.
