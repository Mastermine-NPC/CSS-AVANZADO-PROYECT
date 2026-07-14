const img = (seed) => [`https://picsum.photos/seed/${seed}/900/700`, `https://picsum.photos/seed/${seed}b/900/700`];
export const mockProducts = [
  ['p1','Cálculo de una variable — Stewart','Libro de séptima edición con anotaciones ligeras y todos sus capítulos completos.','Libros','sale',45,'Buen estado','Lima Centro',1,'u1','Valeria Quispe','calculo'],
  ['p2','Calculadora científica Casio fx-991','Calculadora funcional, con tapa y manual. Ideal para ingeniería.','Electrónica','sale',70,'Como nuevo','Lima Norte',1,'u5','Ana Torres','casio'],
  ['p3','Arduino Mega 2560 con cable','Placa probada para proyectos de electrónica y automatización.','Electrónica','exchange',0,'Buen estado','Lima Centro',1,'u5','Ana Torres','arduino'],
  ['p4','Kit de arquitectura A3','Escalímetro, escuadras, cúter y base de corte para taller.','Arquitectura','sale',60,'Como nuevo','Arequipa',1,'u2','Diego Ramos','arquitectura'],
  ['p5','Mochila para laptop 15 pulgadas','Mochila impermeable con compartimentos y puerto USB.','Accesorios','sale',55,'Buen estado','Chiclayo',1,'u3','Lucía Salazar','mochila'],
  ['p6','Guitarra acústica de estudio','Instrumento disponible para préstamo por proyectos culturales.','Instrumentos','loan',0,'Buen estado','Lima Centro',1,'u1','Valeria Quispe','guitarra'],
  ['p7','Cuadernos cuadriculados x3','Cuadernos nuevos de 100 hojas. Se donan juntos.','Accesorios','donation',0,'Nuevo','Lima Norte',3,'u3','Lucía Salazar','cuadernos'],
  ['p8','Protoboard y jumpers','Kit completo para laboratorios de circuitos digitales.','Electrónica','sale',28,'Como nuevo','Lima Centro',2,'u5','Ana Torres','proto'],
  ['p9','Física universitaria — Sears','Volumen 1 en buen estado, sin páginas faltantes.','Libros','loan',0,'Usado','Arequipa',1,'u3','Lucía Salazar','fisica'],
  ['p10','Teclado mecánico compacto','Switches rojos, cable USB-C y luces configurables.','Electrónica','exchange',0,'Buen estado','Lima Centro',1,'u1','Valeria Quispe','teclado'],
  ['p11','Asesoría de programación básica','Sesión de orientación en algoritmos y JavaScript; no incluye tareas evaluadas.','Servicios','sale',25,'Nuevo','Lima Norte',4,'u2','Diego Ramos','programacion'],
  ['p12','Regla T de 80 cm','Regla de acrílico sin fisuras para dibujo técnico.','Arquitectura','donation',0,'Usado','Chiclayo',1,'u4','Mateo Flores','reglat'],
  ['p13','Mouse inalámbrico Logitech','Incluye receptor USB y batería nueva.','Electrónica','sale',38,'Buen estado','Lima Centro',1,'u1','Valeria Quispe','mouse'],
  ['p14','Química general — Chang','Décima edición, forrado y con ejercicios resueltos a lápiz.','Libros','exchange',0,'Usado','Arequipa',1,'u3','Lucía Salazar','quimica'],
  ['p15','Mandil blanco de laboratorio','Talla M, limpio y disponible para préstamo semanal.','Accesorios','loan',0,'Como nuevo','Lima Norte',1,'u5','Ana Torres','mandil'],
  ['p16','Compás profesional','Compás metálico con estuche y repuestos.','Arquitectura','sale',32,'Como nuevo','Lima Centro',1,'u2','Diego Ramos','compas']
].map(([id,title,description,category,transactionType,price,condition,campus,quantity,ownerId,ownerDisplayName,seed], index) => ({ id,title,normalizedTitle:title.toLowerCase(),description,category,transactionType,price,condition,campus,quantity,imageURLs:img(seed),exchangePreferences: transactionType === 'exchange' ? 'Escucho propuestas de artículos académicos.' : '',loanConditions: transactionType === 'loan' ? 'Préstamo máximo por 7 días, previa coordinación.' : '',ownerId,ownerDisplayName,status:'active',moderationStatus:index % 5 === 0 ? 'pending' : 'approved',createdAt:`2026-0${(index % 6)+1}-${String((index % 25)+1).padStart(2,'0')}`,updatedAt:'2026-07-01' }));

