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
  function renderSeats(){fillPeople();const grid=$('seatsGrid');grid.replaceChildren();const max=Number($('bookingSize').value), own=current(), reserved=scope();
    for(let i=1;i<=Math.ceil(max/4)*4;i++){if((i-1)%4===2){const aisle=document.createElement('div');aisle.className='seat-empty';aisle.textContent='·';aisle.style.textAlign='center';grid.append(aisle)}
      if(i>max){const empty=document.createElement('div');empty.className='seat-empty';grid.append(empty);continue}
      const seat=document.createElement('button');seat.className='seat';seat.textContent=String(i).padStart(2,'0');seat.type='button';const owner=reserved.find(b=>b.seat===i);seat.title=owner?(owner.code===$('bookingPerson').value?'Tu asiento reservado':'Asiento ocupado'):'Asiento disponible';if(owner){seat.classList.add(owner.code===$('bookingPerson').value?'mine':'occupied')}if(selected===i&&!owner)seat.classList.add('chosen');seat.disabled=Boolean(owner);seat.onclick=()=>{selected=i;renderSeats()};grid.append(seat);
    }
    const free=max-reserved.length;$('bookingStatus').textContent=`${free} de ${max} asientos disponibles. ${own?'Tu reserva: asiento '+own.seat+'. ':''}${selected?'Seleccionaste asiento '+selected+'.':'Elegí un asiento disponible.'}`;
    $('confirmSeat').disabled=!selected||!$('bookingPerson').value||!$('bookingDate').value||!$('bookingRoute').value.trim();$('cancelSeat').disabled=!own;
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
