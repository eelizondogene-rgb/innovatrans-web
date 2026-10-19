# INNOVATRANS Web — prototipo de control de pasajeros

Este prototipo permite probar la lectura continua de **códigos de barras 1D** con la cámara del teléfono, sin instalar aplicaciones. **Es una demo, no el sistema definitivo de producción.**

## Qué hace

- Crear un viaje con ruta, conductor y unidad.
- Activar una cámara del teléfono desde el navegador y leer códigos de barras con la biblioteca ZXing.
- Reconocer códigos de una lista de pasajeros ficticios que se puede editar.
- Registrar una sola vez cada pasajero por viaje, con fecha y hora tomadas del dispositivo.
- Señal visual y sonora para confirmación, alerta de repetidos y desconocidos.
- Ver abordajes y exportar un archivo CSV compatible con Excel.
- Probar la lógica sin cámara escribiendo manualmente los códigos `123456789012` y `234567890123`.

## Cómo probarlo con el teléfono

Para usar la cámara **la página debe estar publicada bajo HTTPS** (o abrirse en `localhost` en el propio dispositivo). Si se abre el archivo HTML directamente o desde una dirección `http://` de otra computadora, la cámara puede estar bloqueada por seguridad.

Una alternativa para esta demo con datos inventados:

1. Crear un repositorio de prueba en GitHub, por ejemplo `innovatrans-demo`.
2. Subir el archivo `index.html` a la raíz del repositorio.
3. Entrar a **Settings > Pages** y publicar desde la rama principal, carpeta raíz `/`.
4. Abrir en el teléfono la dirección `https://TU-USUARIO.github.io/innovatrans-demo/` cuando esté publicada.
5. Conceder permiso de cámara. Crear la ruta y presionar **Iniciar escaneo** una vez. Luego acercar los códigos de barras uno por uno.

No introducir nombres reales, números de gafete reales ni información privada en esta demo publicada sin validar previamente las medidas de protección de datos y las autorizaciones correspondientes. GitHub Pages es para servir el código estático, **no es una base de datos privada**.

## Qué falta para producción

- Login y autorizaciones por rol para chofer y administradores.
- API + SQL Server y sincronización de varios vehículos y dispositivos.
- Funcionamiento offline confiable mediante cola local y sincronización segura.
- Carga autorizada de trabajadores y gestión de su información conforme a los acuerdos con Walmart y la legislación aplicable.
- Reportes consolidados en Excel/PDF y correos configurables.
- Auditoría, cifrado, respaldos, pruebas de rendimiento y políticas de retención.
- Validación física de cámara, distancias, calidad de impresión, brillo y velocidad de abordaje.
- Conexión opcional con escáner Bluetooth/USB en modo teclado (HID), sin cambiar de aplicación.

## Consideraciones

- Los datos de esta demo se guardan únicamente en el **localStorage** del navegador. No viajan a un servidor y pueden desaparecer si se limpian los datos del sitio. Tampoco aparecen en otros teléfonos.
- El lector ZXing se descarga de Internet desde `https://unpkg.com/@zxing/browser@latest`; se requiere conexión para cargarlo al iniciar.
- La cámara se inicia a petición del usuario y debe permanecer activa y en primer plano. La velocidad del escaneo depende del dispositivo, el enfoque y la iluminación.
- El archivo CSV puede contener datos personales; tratarlo de forma segura y limitarse a datos ficticios durante la prueba.
