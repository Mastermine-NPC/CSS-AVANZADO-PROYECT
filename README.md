# UTP Marketplace

Maqueta funcional multipágina de un marketplace universitario para vender, prestar, intercambiar o donar recursos entre estudiantes. La prioridad es una arquitectura académica clara, componentes reutilizables, navegación completa y una transición segura desde datos mock hacia Firebase.

## Tecnologías

- HTML5 semántico y accesible.
- Bootstrap 5.3 y Bootstrap Icons.
- Sass organizado por abstracts, base, layout, components, pages y vendors.
- JavaScript moderno con ES Modules, sin frameworks ni jQuery.
- Firebase Authentication, Cloud Firestore, Storage y Hosting (integración preparada).
- `localStorage` sólo para carrito y favoritos temporales.

## Funcionalidades

- Inicio con buscador, categorías, destacados, recientes, beneficios y CTA.
- Catálogo con búsqueda, modalidad, categoría, condición, precios, ordenamiento y paginación.
- Detalle por `pages/producto.html?id=p1`, galería, propietario, favoritos y solicitudes.
- Carrito persistente con cantidades, eliminación, vaciado y totales; no procesa pagos.
- Registro, login y recuperación con validación; los registros siempre reciben rol `student`.
- Panel del estudiante, perfil, publicaciones, formulario condicional, solicitudes e historial.
- Panel administrativo, usuarios, moderación de productos, reportes e indicadores.
- Estados de carga, error y vacío, diseño responsive y navegación por teclado.

## Estructura

```text
index.html                 Inicio
pages/                     Vistas públicas
pages/estudiante/          Área autenticada del estudiante
pages/admin/               Área protegida por rol admin
assets/scss/               Fuente Sass por responsabilidad
assets/css/                CSS compilado y minificado
js/components/             Componentes visuales reutilizables
js/pages/                  Controladores de vistas
js/firebase/               Servicios Firebase modulares
js/data/                   Productos, usuarios y solicitudes mock
js/utils/                  Rutas, guards, validadores y utilidades
firebase.json              Hosting multipágina
firestore.rules            Autorización de datos
storage.rules              Autorización de imágenes
```

## Instalación y ejecución

Requiere Node.js LTS únicamente como herramienta de desarrollo.

```bash
npm install
npm run build
npm run serve
```

Visita `http://localhost:3000`. Los módulos no deben abrirse mediante `file://`.

Otros comandos:

```bash
npm run dev          # Sass watch + servidor
npm run sass         # CSS con source map
npm run sass:watch   # compilación continua
npm run sass:build   # CSS minificado
npm test             # compila y revisa JS y enlaces
```

## Modo mock y Firebase

`js/config/app-config.js` inicia así:

```js
export const APP_CONFIG = { useFirebase: false, useMockData: true };
```

En este modo se puede navegar por todo el proyecto con datos simulados. Los guards usan un estudiante mock para facilitar la demostración; no representan seguridad real.

Para conectar Firebase:

1. Crea un proyecto desde Firebase Console.
2. Activa Authentication con Email/Password.
3. Crea Cloud Firestore en modo bloqueado o producción.
4. Activa Firebase Storage.
5. Registra una aplicación web y copia su objeto de configuración.
6. Copia `js/config/firebase-config.example.js` como `js/config/firebase-config.js` y reemplaza todos los valores `REEMPLAZAR`.
7. Cambia `useFirebase: true` y `useMockData: false` en `app-config.js`.
8. Despliega reglas e índices con `firebase deploy --only firestore,storage` después de revisarlos para tu proyecto.

La configuración web no es una clave privada; la seguridad depende de Authentication y Rules. Nunca subas cuentas de servicio, tokens, contraseñas, archivos `.env`, `.firebaserc` real ni `firebase-config.js` configurado.

## Modelo de datos

- `users/{uid}`: identidad, carrera, campus, rol (`student|admin`) y estado (`active|blocked`).
- `products/{productId}`: publicación, modalidad, condición, propietario, estado y moderación.
- `requests/{requestId}`: participantes, producto, tipo, mensaje y ciclo de estado.
- `users/{uid}/favorites/{productId}`: favorito privado del usuario. Se eligió subcolección para que propiedad y reglas sean directas.
- `reports/{reportId}`: motivo, producto, reportante y revisión administrativa.

Los servicios usan `serverTimestamp()`. Las consultas públicas filtran productos `active` y `approved`; solicitudes y productos propios se consultan por usuario con orden descendente. Los índices necesarios están en `firestore.indexes.json`.

## Seguridad y roles

`firestore.rules` permite lectura pública sólo de publicaciones activas y aprobadas. Un usuario autenticado y activo puede crear publicaciones y solicitudes; sólo el propietario edita su producto y nunca puede cambiar `ownerId` ni la moderación. Los estudiantes no pueden promover su rol ni cambiar su estado. Solicitudes sólo son visibles para participantes y admins.

`storage.rules` separa `users/{uid}/profile/` y `products/{uid}/{productId}/`, exige imágenes menores de 5 MB y limita escritura/eliminación al propietario o admin. Antes de producción, prueba las reglas con Firebase Emulator Suite.

Los roles admin deben asignarse por un proceso seguro fuera del frontend (por ejemplo, una operación administrativa controlada). Ocultar enlaces o usar guards del navegador mejora UX, pero no autoriza datos.

## Flujo de páginas

Inicio → catálogo → detalle → favorito/carrito/solicitud. Login o registro → panel estudiante → perfil, productos y solicitudes. Un usuario cuyo documento tenga `role: "admin"` puede entrar a `pages/admin/`; las Rules vuelven a verificar el rol.

## Pruebas sugeridas

- Anchos: 320, 375, 768, 1024, 1440 px; comprobar offcanvas de filtros, menú, tablas y ausencia de scroll horizontal.
- Chrome, Firefox y Edge actuales: navegación, módulos, formularios, localStorage y `?id=`.
- Teclado: foco visible, apertura/cierre de menú y modal, envío de formularios.
- Firebase Emulator: creación/edición por propietario, usuarios bloqueados, acceso admin y aislamiento de solicitudes.

## Distribución sugerida del equipo

- Integrante 1: componentes, inicio, catálogo y accesibilidad.
- Integrante 2: autenticación, perfiles y servicios de usuarios.
- Integrante 3: productos, carrito, favoritos y solicitudes.
- Integrante 4: administración, reglas, pruebas y documentación.

## Limitaciones académicas

No existen pagos, chat en tiempo real, notificaciones, entrega, verificación institucional ni backend propio. El modo mock no persiste publicaciones o solicitudes nuevas; simula la interacción. Las acciones administrativas del mock son visuales. Las imágenes mock proceden de `picsum.photos` y requieren conexión; en producción deben subirse a Storage.

## Hosting

Instala Firebase CLI, inicia sesión y selecciona tu proyecto manualmente. Copia `.firebaserc.example` como `.firebaserc` y reemplaza el identificador. Luego:

```bash
firebase emulators:start
firebase deploy --only hosting
```

No se incluyen rewrites de SPA: cada HTML conserva su ruta. No despliegues reglas ni hosting sin autorización del propietario del proyecto.
