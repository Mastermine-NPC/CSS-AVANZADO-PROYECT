import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const EXPECTED_PROJECT_ID = 'utp-marketplace-d71fe';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = resolve(projectRoot, 'serviceAccountKey.json');

const users = [
  { name: 'Administrador UTP', email: 'admin.utp@test.com', password: 'Admin123456', career: 'Administración', campus: 'Arequipa', role: 'admin' },
  { name: 'Ana Torres', email: 'ana.utp@test.com', password: 'Test123456', career: 'Ingeniería de Sistemas', campus: 'Arequipa', role: 'student' },
  { name: 'Luis Quispe', email: 'luis.utp@test.com', password: 'Test123456', career: 'Ingeniería Industrial', campus: 'Arequipa', role: 'student' },
  { name: 'Camila Rojas', email: 'camila.utp@test.com', password: 'Test123456', career: 'Arquitectura', campus: 'Arequipa', role: 'student' },
  { name: 'Diego Vargas', email: 'diego.utp@test.com', password: 'Test123456', career: 'Ingeniería Civil', campus: 'Arequipa', role: 'student' },
  { name: 'Valeria Mendoza', email: 'valeria.utp@test.com', password: 'Test123456', career: 'Psicología', campus: 'Arequipa', role: 'student' }
];

const products = [
  { seedKey: 'calculadora-casio-ana', ownerEmail: 'ana.utp@test.com', name: 'Calculadora científica Casio', description: 'Calculadora científica en excelente estado, con tapa protectora y todas sus funciones operativas. Ideal para cursos de matemática e ingeniería.', category: 'Tecnología', transactionType: 'sale', price: 95, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'teclado-mecanico-ana', ownerEmail: 'ana.utp@test.com', name: 'Teclado mecánico', description: 'Teclado mecánico de formato compacto con conexión USB, switches suaves y cable desmontable. Funciona correctamente y tiene poco tiempo de uso.', category: 'Tecnología', transactionType: 'exchange', price: 0, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'protoboard-cables-ana', ownerEmail: 'ana.utp@test.com', name: 'Protoboard con cables', description: 'Kit de protoboard con cables jumper macho y hembra para prácticas de electrónica. Disponible para préstamo durante una semana académica.', category: 'Materiales', transactionType: 'loan', price: 0, condition: 'Usado', imageUrl: '' },
  { seedKey: 'libro-calculo-luis', ownerEmail: 'luis.utp@test.com', name: 'Libro de Cálculo I', description: 'Libro universitario de cálculo diferencial con teoría, ejercicios resueltos y problemas propuestos. Presenta anotaciones ligeras en algunas páginas.', category: 'Libros', transactionType: 'sale', price: 65, condition: 'Usado', imageUrl: '' },
  { seedKey: 'mouse-inalambrico-luis', ownerEmail: 'luis.utp@test.com', name: 'Mouse inalámbrico', description: 'Mouse inalámbrico ergonómico con receptor USB y batería incluida. Los botones y la rueda funcionan correctamente, sin fallas de conexión.', category: 'Tecnología', transactionType: 'sale', price: 38, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'memoria-usb-luis', ownerEmail: 'luis.utp@test.com', name: 'Memoria USB de 64 GB', description: 'Memoria USB de 64 GB formateada y lista para usar. Se intercambia por materiales de estudio o accesorios tecnológicos equivalentes.', category: 'Tecnología', transactionType: 'exchange', price: 0, condition: 'Usado', imageUrl: '' },
  { seedKey: 'escuadras-arquitectura-camila', ownerEmail: 'camila.utp@test.com', name: 'Juego de escuadras', description: 'Juego de escuadras transparentes de 30 y 45 grados, sin roturas y con medidas legibles. Adecuado para dibujo técnico y talleres de arquitectura.', category: 'Materiales', transactionType: 'sale', price: 28, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'mochila-universitaria-camila', ownerEmail: 'camila.utp@test.com', name: 'Mochila universitaria', description: 'Mochila resistente con compartimento acolchado para laptop de hasta 15 pulgadas y varios bolsillos. Está limpia y conserva todos sus cierres.', category: 'Otros', transactionType: 'sale', price: 72, condition: 'Usado', imageUrl: '' },
  { seedKey: 'lampara-escritorio-camila', ownerEmail: 'camila.utp@test.com', name: 'Lámpara de escritorio', description: 'Lámpara LED de escritorio con brazo flexible y tres niveles de intensidad. Se intercambia por implementos útiles para dibujo o maquetas.', category: 'Otros', transactionType: 'exchange', price: 0, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'casco-seguridad-diego', ownerEmail: 'diego.utp@test.com', name: 'Casco de seguridad', description: 'Casco de seguridad blanco con ajuste posterior, limpio y sin golpes. Disponible para préstamo en visitas de obra o prácticas de campo.', category: 'Materiales', transactionType: 'loan', price: 0, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'libro-fisica-diego', ownerEmail: 'diego.utp@test.com', name: 'Libro de Física universitaria', description: 'Texto de física universitaria con capítulos de mecánica, ondas y termodinámica. Se intercambia por un libro de resistencia de materiales.', category: 'Libros', transactionType: 'exchange', price: 0, condition: 'Usado', imageUrl: '' },
  { seedKey: 'bata-laboratorio-diego', ownerEmail: 'diego.utp@test.com', name: 'Bata de laboratorio', description: 'Bata blanca talla M, lavada y en buen estado general. Se presta por periodos cortos para laboratorios y actividades académicas.', category: 'Materiales', transactionType: 'loan', price: 0, condition: 'Usado', imageUrl: '' },
  { seedKey: 'audifonos-valeria', ownerEmail: 'valeria.utp@test.com', name: 'Audífonos Bluetooth', description: 'Audífonos de diadema con micrófono integrado y conexión de 3.5 mm. Útiles para clases virtuales, reuniones y sesiones de estudio.', category: 'Tecnología', transactionType: 'sale', price: 48, condition: 'Como nuevo', imageUrl: '' },
  { seedKey: 'cuaderno-cuadriculado-valeria', ownerEmail: 'valeria.utp@test.com', name: 'Cuaderno cuadriculado', description: 'Cuaderno cuadriculado nuevo de 100 hojas con tapa dura. Se intercambia por resaltadores, notas adhesivas u otros útiles de estudio.', category: 'Materiales', transactionType: 'exchange', price: 0, condition: 'Nuevo', imageUrl: '' },
  { seedKey: 'tablet-grafica-valeria', ownerEmail: 'valeria.utp@test.com', name: 'Tablet gráfica', description: 'Tablet gráfica compacta con lápiz digital y cable USB. Disponible para préstamo en proyectos académicos de diseño y presentaciones.', category: 'Tecnología', transactionType: 'loan', price: 0, condition: 'Usado', imageUrl: '' }
];

function validateSeedData() {
  const students = users.filter((user) => user.role === 'student');
  const admins = users.filter((user) => user.role === 'admin');
  if (students.length !== 5 || admins.length !== 1) throw new Error('El seed debe contener cinco estudiantes y un administrador.');
  if (products.length !== 15) throw new Error('El seed debe contener exactamente 15 productos.');

  const allowedCategories = new Set(['Libros', 'Tecnología', 'Materiales', 'Otros']);
  const allowedTypes = new Set(['sale', 'loan', 'exchange']);
  const allowedConditions = new Set(['Nuevo', 'Como nuevo', 'Usado']);
  const studentEmails = new Set(students.map((student) => student.email));
  const seedKeys = new Set();

  products.forEach((product) => {
    if (seedKeys.has(product.seedKey)) throw new Error(`seedKey duplicado: ${product.seedKey}.`);
    seedKeys.add(product.seedKey);
    if (!studentEmails.has(product.ownerEmail)) throw new Error(`Propietario inválido para ${product.seedKey}.`);
    if (!allowedCategories.has(product.category) || !allowedTypes.has(product.transactionType) || !allowedConditions.has(product.condition)) {
      throw new Error(`Datos no permitidos en ${product.seedKey}.`);
    }
    if (product.description.length < 60 || product.description.length > 220) throw new Error(`Descripción fuera de rango en ${product.seedKey}.`);
    if (product.transactionType === 'sale' && product.price <= 0) throw new Error(`Precio inválido en ${product.seedKey}.`);
    if (product.transactionType !== 'sale' && product.price !== 0) throw new Error(`El precio debe ser cero en ${product.seedKey}.`);
  });
}

function readServiceAccount() {
  if (!existsSync(keyPath)) {
    throw new Error('Falta serviceAccountKey.json en la raíz del proyecto.');
  }
  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
  if (serviceAccount.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(`La clave pertenece a ${serviceAccount.project_id || 'un proyecto desconocido'}, no a ${EXPECTED_PROJECT_ID}.`);
  }
  return serviceAccount;
}

async function findOrCreateUser(auth, data, summary) {
  let record;
  try {
    record = await auth.getUserByEmail(data.email);
    summary.usersExisting += 1;
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    record = await auth.createUser({ email: data.email, password: data.password, displayName: data.name });
    summary.usersCreated += 1;
  }
  return record;
}

async function saveProfile(db, record, data) {
  const reference = db.collection('users').doc(record.uid);
  const snapshot = await reference.get();
  const profile = {
    uid: record.uid,
    name: data.name,
    email: data.email,
    career: data.career,
    campus: data.campus,
    role: data.role,
    status: 'active'
  };
  if (!snapshot.exists || !snapshot.get('createdAt')) profile.createdAt = Timestamp.now();
  await reference.set(profile, { merge: true });
}

async function seedProducts(db, owners, summary) {
  for (const product of products) {
    const existing = await db.collection('products').where('seedKey', '==', product.seedKey).limit(1).get();
    if (!existing.empty) {
      summary.productsExisting += 1;
      continue;
    }
    const owner = owners.get(product.ownerEmail);
    if (!owner) throw new Error(`No se encontró el propietario ${product.ownerEmail}.`);
    const { ownerEmail, ...data } = product;
    await db.collection('products').add({
      ...data,
      ownerId: owner.uid,
      ownerName: owner.name,
      status: 'active',
      createdAt: Timestamp.now()
    });
    summary.productsCreated += 1;
  }
}

async function main() {
  validateSeedData();
  const serviceAccount = readServiceAccount();
  const app = initializeApp({ credential: cert(serviceAccount), projectId: EXPECTED_PROJECT_ID });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const summary = { usersCreated: 0, usersExisting: 0, profilesSaved: 0, productsCreated: 0, productsExisting: 0 };
  const owners = new Map();

  try {
    for (const data of users) {
      const record = await findOrCreateUser(auth, data, summary);
      await saveProfile(db, record, data);
      summary.profilesSaved += 1;
      if (data.role === 'student') owners.set(data.email, { uid: record.uid, name: data.name });
    }
    await seedProducts(db, owners, summary);
    console.log(`Usuarios creados: ${summary.usersCreated}`);
    console.log(`Usuarios existentes: ${summary.usersExisting}`);
    console.log(`Perfiles guardados: ${summary.profilesSaved}`);
    console.log(`Productos creados: ${summary.productsCreated}`);
    console.log(`Productos existentes: ${summary.productsExisting}`);
  } finally {
    await deleteApp(app);
  }
}

main().catch((error) => {
  console.error(`Seed cancelado: ${error.message}`);
  process.exitCode = 1;
});
