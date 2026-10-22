# INNOVA TRANSLOGIC — Demo web sin base de datos

Esta demo parte del escáner anterior y añade reserva visual para vehículos de **13 y 25 pasajeros**, mapa Leaflet, GPS real del dispositivo y marcadores de abordajes que capturaron GPS. Es un **prototipo**, no un sistema listo para producción.

## Publicar gratis en GitHub Pages

1. Descomprimí este ZIP y copiá **index.html**, **demo-extra.js** y **logo-innovatrans.png** a la raíz del repositorio (podés conservar los README).
2. Guardá con `git add .`, `git commit -m "Demo reservas y GPS"` y `git push origin main` (o la rama principal que use tu repositorio).
3. En GitHub, ingresá a **Settings → Pages → Build and deployment**, seleccioná **Deploy from a branch**, la rama principal y `/ (root)`, y guardá.
4. Abrí la URL HTTPS que GitHub Pages muestre. En el celular, abrí la página y activá permisos de cámara/ubicación.

## Prueba sugerida

1. En **Reservas**, elegí pasajero ficticio, fecha, ruta, buseta o bus; tocá un asiento y reservá. Intentá otra reserva con otro pasajero y comprobá que el asiento está ocupado.
2. En **Mapa GPS**, presioná **Activar GPS real**, permití la ubicación y comprobá latitud, longitud y precisión. En exteriores normalmente la precisión mejora.
3. Sin cerrar esa página, entrá a **Abordaje**, creá un viaje y escaneá uno de los códigos ficticios de la pestaña Pasajeros (o escribilo en el campo manual).
4. Volvé a **Mapa GPS**: aparecerá un punto si, cuando se registró el abordaje, existía una lectura GPS de menos de 30 segundos de antigüedad.
5. Probá **Mostrar recorrido de ejemplo**; es una línea ilustrativa, NO rutas reales por calles.

## Limitaciones relevantes

- **Sin base de datos:** cada navegador guarda sus propios pasajeros, reservas y abordajes mediante localStorage. No se sincronizan entre celulares; no se debe utilizar para reservar espacios reales.
- **GPS:** requiere HTTPS o localhost y autorización; el navegador puede suspenderlo en segundo plano. La ubicación guardada es la del teléfono lector, no la del pasajero. Si no hay GPS reciente, se registra el abordaje sin coordenadas.
- **Plano de asientos:** distribución de ejemplo, debe adaptarse a cada modelo de bus.
- **Mapa:** OpenStreetMap requiere Internet. La polilínea demo es ilustrativa, no navegación o seguimiento remoto. Las librerías externas ZXing y Leaflet se descargan de una CDN.
- **Privacidad:** usar únicamente pasajeros y códigos inventados en un sitio público; no hay cuentas ni control de acceso.
Demo de reservas y GPS de INNOVATRANS.
