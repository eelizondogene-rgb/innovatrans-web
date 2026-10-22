(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY='innovatrans-demo-v1', BOOK='innovatrans-reservas-demo-v1';
  const read = key => {try{return JSON.parse(localStorage.getItem(key))}catch{return null}};
  const today=new Date();today.setDate(today.getDate()+1);$('bookingDate').value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
  let selected=null, bookings=Array.isArray(read(BOOK))?read(BOOK):[];
  const db=()=>read(KEY)||{people:[],records:[],trips:[]};
  const bookingKey=()=>`${$('bookingDate').value}|${$('bookingRoute').value.trim().toLowerCase()}|${$('bookingSize').value}`;
  const scope=()=>bookings.filter(b=>b.key===bookingKey());
  const current=()=>scope().find(b=>b.code===$('bookingPerson').value);
  const saveBookings=()=>{try{localStorage.setItem(BOOK,JSON.stringify(bookings));return true}catch{alert('No se pudo guardar la reserva en este navegador.');return false}};
  function fillPeople(){const previous=$('bookingPerson').value;$('bookingPerson').replaceChildren();for(const p of db().people){const o=document.createElement('option');o.value=p.code;o.textContent=p.name+' · '+p.code;$('bookingPerson').append(o)}if([...$('bookingPerson').options].some(o=>o.value===previous))$('bookingPerson').value=previous;}
  // Each row contains left-left-aisle-right-right. Null cells remain empty.
  // Only positions 1-7 are grounded in the provided bus photograph; all remaining numbering is provisional.
  const layouts={
    bus22:{label:'Bus 22+1',rows:[['driver',null,'aisle',null,1],[2,3,'aisle',null,8],[4,5,'aisle',null,9],[6,7,'aisle',null,10],[11,12,'aisle',null,13],[14,15,'aisle',null,16],[17,18,'aisle',null,19],[20,21,'aisle',22,null]],note:'Croquis del bus: se respetan los primeros asientos 1–7 visibles en la foto. Los restantes 8–22 son numeración de demostración hasta confirmar el plano completo. 22 plazas de pasajeros + chofer.'},
    hiace13:{label:'Toyota Hiace 2022',rows:[['driver',null,'aisle',null,1],[2,3,'aisle',4,null],[5,6,'aisle',7,null],[8,9,'aisle',10,null],[11,12,'aisle',13,null]],note:'Toyota Hiace 2022: disposición provisional de 13 pasajeros. Las Hiace pueden tener distintas configuraciones; hay que verificar físicamente filas, puerta y números antes de reservar de verdad.'}
  };
  const layout=()=>layouts[$('bookingSize').value]||layouts.hiace13;
  function renderSeats(){
    fillPeople();const grid=$('seatsGrid');grid.replaceChildren();const plan=layout();const all=plan.rows.flat().filter(Number.isInteger);const reserved=scope();const own=current();
    $('vehicleNote').textContent=plan.note;
    const person=$('bookingPerson').value;
    for(const row of plan.rows){for(const cell of row){
      if(!Number.isInteger(cell)){
        const el=document.createElement('div');el.className='seat-placeholder '+(cell||'aisle');
        el.textContent=cell==='driver'?'Chofer':cell==='door'?'Puerta':'';grid.append(el);continue;
      }
      const owner=reserved.find(b=>b.seat===cell);const seat=document.createElement('button');seat.type='button';seat.className='seat';seat.textContent=String(cell).padStart(2,'0');seat.setAttribute('aria-label',`Asiento ${cell}: ${owner?'reservado':'disponible'}`);
      if(owner)seat.classList.add(owner.code===person?'mine':'occupied');
      if(selected===cell&&!owner)seat.classList.add('chosen');seat.disabled=!!owner;
      seat.onclick=()=>{selected=cell;renderSeats()};grid.append(seat);
    }}
    const free=all.length-reserved.length;
    $('bookingStatus').textContent=`${plan.label} · ${free} de ${all.length} asientos libres. ${own?'Tu reserva: '+own.seat+'. ':''}${selected?'Asiento elegido: '+selected+'.':'Seleccioná un asiento.'}`;
    $('confirmSeat').disabled=!selected||!person||!$('bookingDate').value||!$('bookingRoute').value.trim();$('cancelSeat').disabled=!own;
    if($('confirmSeatMobile'))$('confirmSeatMobile').disabled=$('confirmSeat').disabled;
  }
  $('confirmSeat').onclick=()=>{const code=$('bookingPerson').value,key=bookingKey();if(!selected||!code)return;if(scope().some(b=>b.seat===selected)){alert('Ese asiento ya está reservado.');renderSeats();return}bookings=bookings.filter(b=>!(b.key===key&&b.code===code));bookings.push({key,code,seat:selected,createdAt:new Date().toISOString()});if(saveBookings()){selected=null;renderSeats();alert('Reserva demo confirmada. Solo se guardó en este dispositivo.')}};
  $('cancelSeat').onclick=()=>{const code=$('bookingPerson').value,key=bookingKey();bookings=bookings.filter(b=>!(b.key===key&&b.code===code));if(saveBookings()){selected=null;renderSeats()}};
  ['bookingSize','bookingPerson','bookingDate','bookingRoute'].forEach(id=>$(id).addEventListener(id==='bookingRoute'?'input':'change',()=>{selected=null;renderSeats()}));
  const sampleRoute=[[9.9342,-84.1836],[9.9355,-84.1709],[9.9454,-84.1527]];
  let map=null, gpsMarker=null, markerGroup=null, routeLayer=null, watchId=null, lastPos=null;
  const safeDate=iso=>new Date(iso).toLocaleString('es-CR');
  function initMap(){if(map)return;if(!window.L){$('gpsStatus').textContent='No se cargó Leaflet. Revisá tu conexión a Internet.';return}map=L.map('routeMap').setView([9.935,-84.17],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:19}).addTo(map);markerGroup=L.layerGroup().addTo(map);renderPoints();}
  function showMap(){initMap();if(map)setTimeout(()=>map.invalidateSize(),120)}
  function renderPoints(){if(!map)return;markerGroup.clearLayers();const rec=db().records.filter(r=>typeof r.lat==='number'&&typeof r.lng==='number'&&Number.isFinite(r.lat)&&Number.isFinite(r.lng));const div=$('gpsRecords');div.replaceChildren();if(!rec.length){div.innerHTML='<div class="empty">Aún no hay escaneos con ubicación GPS registrada.</div>';return}
    for(const r of rec.slice().reverse()){const marker=L.circleMarker([r.lat,r.lng],{radius:8,color:'#0d2346',weight:2,fillColor:'#ca2537',fillOpacity:.95}).addTo(markerGroup);const popup=document.createElement('div');const strong=document.createElement('strong');strong.textContent=r.name;popup.append(strong,document.createElement('br'),document.createTextNode(`${safeDate(r.at)} · ${r.route}`));marker.bindPopup(popup);const item=document.createElement('div');item.className='demo-item';const b=document.createElement('b');b.textContent=r.name;item.append(b,document.createTextNode(`${safeDate(r.at)} · ±${Math.round(r.accuracy||0)} m`));item.onclick=()=>{map.setView([r.lat,r.lng],16);marker.openPopup()};div.append(item)}
  }
  function gpsSuccess(position){const c=position.coords;lastPos={lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,at:new Date(position.timestamp).toISOString(),timestamp:position.timestamp};$('gpsStatus').textContent='Ubicación actualizada correctamente.';if($('gpsChip')){$('gpsChip').textContent='GPS activo';$('gpsChip').style.color='#087f5b';$('gpsChip').style.background='#e6f6ed'};$('gpsDetails').textContent=`Latitud: ${c.latitude.toFixed(6)} · Longitud: ${c.longitude.toFixed(6)} · Precisión aproximada: ±${Math.round(c.accuracy)} m · ${safeDate(lastPos.at)}`;if(map){if(!gpsMarker){gpsMarker=L.circleMarker([lastPos.lat,lastPos.lng],{radius:10,color:'#fff',weight:3,fillColor:'#136bc0',fillOpacity:1}).addTo(map).bindPopup('Posición actual del dispositivo')}else gpsMarker.setLatLng([lastPos.lat,lastPos.lng]);}}
  const gpsError=e=>{$('gpsStatus').textContent='⚠️ No se pudo obtener GPS: '+(e.code===1?'permiso denegado':e.code===2?'posición no disponible':'tiempo de espera agotado')+'. Revisá permisos, señal y ubicación del teléfono.'};
  window.INNOVA_GPS={getFreshPosition(){return lastPos&&Date.now()-lastPos.timestamp<30000?{...lastPos}:null}};
  $('enableGps').onclick=()=>{showMap();if(!window.isSecureContext||!navigator.geolocation){$('gpsStatus').textContent='Para usar GPS necesitás HTTPS (GitHub Pages) o localhost y un navegador compatible.';return}if(watchId!==null)navigator.geolocation.clearWatch(watchId);$('gpsStatus').textContent='Solicitando acceso a ubicación…';watchId=navigator.geolocation.watchPosition(gpsSuccess,gpsError,{enableHighAccuracy:true,maximumAge:3000,timeout:18000})};
  $('stopGps').onclick=()=>{if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;lastPos=null;$('gpsStatus').textContent='GPS detenido. Los próximos abordajes no guardarán coordenadas hasta reactivarlo.'};
  $('centerGps').onclick=()=>{showMap();if(lastPos&&map)map.setView([lastPos.lat,lastPos.lng],16);else $('gpsStatus').textContent='Activá GPS y esperá a que el teléfono obtenga la ubicación.'};
  $('demoRoute').onclick=()=>{showMap();if(!map)return;if(routeLayer)map.removeLayer(routeLayer);routeLayer=L.layerGroup().addTo(map);L.polyline(sampleRoute,{color:'#c52b3d',weight:5,dashArray:'8 7'}).addTo(routeLayer);for(const [i,pt] of sampleRoute.entries())L.circleMarker(pt,{radius:6,color:'#1a447c',fillColor:'#fff',fillOpacity:1}).addTo(routeLayer).bindTooltip(['Santa Ana (ejemplo)','Pozos (ejemplo)','Lindora (ejemplo)'][i]);map.fitBounds(L.latLngBounds(sampleRoute),{padding:[25,25]});$('gpsStatus').textContent='Recorrido ilustrativo cargado (línea entre puntos; no corresponde a calles ni a una ruta verificada).'};
  document.querySelector('[data-page="mapdemo"]').addEventListener('click',showMap);
  document.querySelector('[data-page="booking"]').addEventListener('click',renderSeats);
  window.addEventListener('innova-boarding',renderPoints);
  window.addEventListener('storage',e=>{if(e.key===KEY){fillPeople();renderPoints()}if(e.key===BOOK){bookings=Array.isArray(read(BOOK))?read(BOOK):[];renderSeats()}});
  window.addEventListener('pagehide',()=>{if(watchId!==null)navigator.geolocation.clearWatch(watchId)});
  renderSeats();
})();
