# Pruebas manuales Firebase

Estas pruebas deben ejecutarse con Firebase real después de desplegar `firestore.rules`, `storage.rules` e índices. No uses contraseñas reales ni las guardes en el repositorio.

## Preparación

1. Usa tres correos de prueba: Estudiante A, Estudiante B y Administrador.
2. Registra A y B desde `pages/registro.html`; confirma en Authentication y Firestore que el ID de `users/{uid}` coincide con el UID y que ambos tienen `role: student` y `status: active`.
3. Crea la cuenta del administrador mediante registro normal. Promueve su documento a `role: admin` mediante un proceso administrativo confiable en Firebase Console. El frontend no puede crear el primer administrador.
4. Abre sesiones en perfiles de navegador separados para evitar compartir Authentication o localStorage.

## Matriz de comprobación

### Sesión y perfil

- A inicia sesión y llega a `pages/estudiante/dashboard.html`.
- El administrador inicia sesión y llega a `pages/admin/dashboard.html`.
- El administrador bloquea a B; B debe cerrar sesión o ser rechazado en el siguiente guard/login.
- Reactiva a B y comprueba que puede acceder nuevamente.
- A cambia nombres y fotografía. Verifica Firestore, Storage, Firebase Auth `displayName` y el nombre del header.

### Productos

- A crea un producto de venta con dos imágenes. Verifica `ownerId`, `ownerDisplayName`, `status: active`, `moderationStatus: pending` y las rutas `products/{uid}/{productId}/...`.
- El administrador aprueba la publicación. B debe verla en catálogo y detalle; antes de aprobarla no debe verla públicamente.
- A edita título y precio, luego desactiva el producto. B ya no debe verlo.
- Confirma que B no puede editar el producto de A escribiendo su ID en la URL de edición.

### Favoritos y carrito

- B agrega y elimina el producto de favoritos. Comprueba `users/{uidB}/favorites/{productId}`.
- Cierra y abre sesión; el favorito debe persistir en Firestore.
- B agrega el producto de venta al carrito, cambia cantidad y recarga la página.
- A no debe poder agregar su propio producto.
- Modifica precio o disponibilidad como A; al abrir el carrito de B deben recalcularse desde Firestore.

### Solicitudes e historial

- B envía una compra desde el carrito. Verifica que no pueda crear otra solicitud pendiente para el mismo producto.
- A ve la solicitud recibida y la acepta; el producto pasa a `reserved`.
- A completa la solicitud; el producto pasa a `sold`, la solicitud a `completed` y se crea `transactions/{id}`.
- Repite con un préstamo y un intercambio; los estados finales deben ser `loaned` y `exchanged`.
- Crea otra solicitud y prueba rechazo por A y cancelación por B.
- Confirma que un tercero no participante no puede leer ni modificar solicitudes o transacciones.

### Administración y reportes

- El administrador lista usuarios y productos, bloquea/reactiva usuarios y aprueba/oculta/rechaza publicaciones.
- Comprueba que el administrador no puede bloquearse a sí mismo desde la interfaz.
- Crea un reporte mediante el servicio o una interfaz conectada, luego márcalo `reviewed` y `dismissed` desde reportes.
- Verifica que estadísticas y actividad cambian al crear usuarios, productos y solicitudes.

## Comandos

Con Node.js 20 o superior y Firebase CLI autenticado:

```bash
npm test
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase emulators:start
```

No ejecutes `firebase deploy --only hosting` durante estas pruebas salvo autorización explícita.
