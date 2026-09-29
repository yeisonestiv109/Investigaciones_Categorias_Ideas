# 04 — Flujo completo y plan de implementación (sin código)

**Piezas que ya existen:** anuncios de Instagram, ManyChat (Pro), un Cloudflare Worker que guarda el lead cuando escribe, Supabase, un dashboard en Next con los leads y sus métricas, la calculadora en HTML y Google Calendar sincronizado con `pg_cron`.

**Objetivo:** saber de quién es cada dato en cada paso (conversación → diagnóstico → cita → resultado), sin pedirle al lead su @ y cumpliendo las reglas de Meta que están documentadas.

Las decisiones y las fuentes están en [`03_embudo_instagram_supabase_cruce_datos.md`](03_embudo_instagram_supabase_cruce_datos.md). Aquí solo va el flujo y el plan.

---

## 1. El flujo de punta a punta

```
 ① Anuncio en Instagram (palabra clave distinta por campaña)
        │  el lead escribe la palabra clave → abre la ventana de 24 h
        ▼
 ② ManyChat detecta la palabra clave → Worker → Supabase
        crea o actualiza el LEAD: contact_id, @ (normalizado), campaña, fecha
        estado: NUEVO
        ▼
 ③ Setter conversa y filtra la intención a mano (sin montos ni urgencia)
        si no califica → estado DESCARTADO (con motivo)
        si califica   → estado FILTRADO
        ▼
 ④ Setter toca "Generar link" en el DASHBOARD (ficha del lead)
        el servidor crea el token (o reutiliza el vigente) y copia el link
        diagnostico.tumarca.com/?t=XXXXXXXXXXXX
        estado: LINK_ENVIADO
        ▼
 ⑤ Setter pega el link en el chat de Instagram, con una explicación corta
        ▼
 ⑥ CALCULADORA (HTML, en tu dominio)
    6a. Nombre + correo + casilla de autorización de datos (sin marcar)  → estado: INICIO
    6b. Salario, deudas, etc. → se muestra el diagnóstico                → estado: CALCULÓ
    6c. Si quiere agendar: teléfono → calendario incrustado en la misma página
        ▼
 ⑦ GOOGLE CALENDAR (agenda de citas incrustada)
        la persona reserva con correo y teléfono (campo obligatorio)
        ▼
 ⑧ pg_cron sincroniza las citas nuevas, cambiadas y canceladas
        cruce automático: correo → teléfono → cercanía en el tiempo (un solo candidato)
        si cruza    → cita ligada al lead, estado: AGENDÓ
        si no cruza → cola "Citas sin cruzar" en el dashboard
        ▼
 ⑨ Setter o closer revisa en el DASHBOARD
        asigna a mano las citas sin cruzar
        hace seguimiento a "calculó y no agendó" (WhatsApp o correo, o IG a mano)
        ▼
 ⑩ Después de la llamada: ASISTIÓ / NO_SHOW → CLIENTE / NO_COMPRÓ
```

### Estados del lead (uno solo a la vez, y solo avanza)

| Estado | Lo marca | Momento |
|---|---|---|
| NUEVO | Worker (automático) | Escribió la palabra clave |
| FILTRADO / DESCARTADO | Setter (dashboard) | Terminó la conversación de filtro |
| LINK_ENVIADO | Servidor al generar el token | El setter generó el link |
| INICIO | Worker de la calculadora | Envió nombre, correo y autorización |
| CALCULÓ | Worker de la calculadora | Envió la calculadora |
| AGENDÓ | Cruce (automático o manual) | Cita ligada al lead |
| ASISTIÓ / NO_SHOW | Closer (dashboard) | Después de la hora de la cita |
| CLIENTE / NO_COMPRÓ | Closer (dashboard) | Resultado de la llamada |

**Regla:** un estado nunca retrocede de forma automática. Si un lead que ya calculó recibe un link nuevo, sigue en CALCULÓ. Solo una persona, desde el dashboard, puede corregir un estado hacia atrás, y queda registrado quién lo hizo.

**Además del estado, guarda un historial de eventos** (lead, tipo de evento, fecha, quién). El estado dice dónde está el lead hoy. El historial permite medir cuánto tardó entre un paso y otro, y reconstruir lo que pasó.

---

## 2. Qué hace cada pieza

| Pieza | Responsabilidad | Lo que NO debe hacer |
|---|---|---|
| **ManyChat** | Detectar la palabra clave y avisar al Worker. Opcional: marcar etiquetas. | Mandar mensajes automáticos después de 24 h. Hacer seguimientos en secuencia. |
| **Worker (Cloudflare)** | (1) Registrar el lead cuando escribe. (2) Recibir los envíos de la calculadora, validar el token y guardar. | Exponer datos de un lead a partir del token. Mostrar contenido distinto según quién visita. |
| **Supabase** | Única fuente de verdad: leads, tokens, diagnósticos, citas, eventos, cruces. `pg_cron` para sincronizar el calendario y cruzar. | Recibir escrituras desde el navegador con claves públicas. Todo pasa por el Worker o por el servidor del dashboard. |
| **Dashboard (Next)** | Ficha del lead, botón "Generar link", cola de citas sin cruzar, asignación manual, cambios de estado del setter y del closer, métricas del embudo. | Generar el token en el navegador. Usar la clave secreta de Supabase en el cliente: solo en el servidor. |
| **Calculadora (HTML)** | Leer el token de la URL, pedir nombre, correo y autorización, calcular, mostrar el diagnóstico, pedir el teléfono y mostrar el calendario incrustado. | Bloquear o redirigir al cargar según el token. Enviar datos financieros a analytics de terceros. |
| **Google Calendar** | Agenda de citas incrustada, con correo y teléfono obligatorios. | — (no admite token: por eso existe el cruce) |

### Dónde vive el generador de links

Antes propuse una página `/setter` dentro del Worker. **Con tu dashboard en Next, es mejor ponerlo en el dashboard:** el setter ya está ahí, ya tiene sesión iniciada y ve la ficha del lead.
- El botón llama a una acción del servidor de Next que crea o reutiliza el token con la clave secreta de Supabase.
- La página `/setter` del Worker queda solo como respaldo, o se elimina.

---

## 3. Plan de implementación por fases

Cada fase tiene un **criterio de terminado**. No pases a la siguiente sin cumplirlo.

### Fase 0: Preparación (1 día)
1. Decidir el subdominio de la calculadora (ej. `diagnostico.tumarca.com`). Que sea el mismo que aparece en la bio y en los anuncios.
2. Verificar el dominio en Meta Business Suite → Seguridad de la marca → Dominios, con un registro TXT en el DNS de Cloudflare.
3. Publicar la política de tratamiento de datos (Ley 1581) en tu dominio: responsable, finalidad, derechos y cómo ejercerlos.
4. Definir **una palabra clave por campaña o anuncio**. Es la forma más simple de saber de qué campaña vino cada lead.
5. Iniciar la verificación del negocio en el Centro de seguridad de Meta. Es independiente del resto y puede tardar.

**Terminado cuando:** el dominio aparece verificado en Meta, la política está publicada y hay una lista de palabras clave por campaña.

### Fase 1: Modelo de datos en Supabase (1–2 días)
1. **Leads.** Agrega o confirma estos campos: contact_id de ManyChat (puede quedar vacío), @ normalizado (sin arroba y en minúsculas), campaña o palabra clave, nombre, correo, teléfono (formato +57), token, vencimiento del token, estado, fecha de autorización, setter asignado, motivo de descarte.
2. **Diagnósticos:** lead, entradas, resultado, fecha. Un lead puede tener varios.
3. **Citas:** lead (puede quedar vacío), id del evento de Google (único), correo y teléfono de quien reservó, hora de la cita, hora en que se creó, estado (agendada, cancelada, reprogramada), método de cruce, quién cruzó y cuándo.
4. **Eventos del lead:** lead, tipo, fecha, actor.
5. **Normalización de @ existentes:** pasa todos a minúsculas y sin arroba.
6. **Seguridad de filas (RLS):** actívala en todas las tablas. El dashboard lee con usuarios autenticados de tu equipo. El Worker y el servidor escriben con la clave secreta. El navegador de la calculadora no toca Supabase.

**Terminado cuando:** las tablas existen, los @ están normalizados y un usuario sin sesión no puede leer nada.

### Fase 2: Worker (2 días)
1. **Palabra clave:** además de lo que ya guarda, normalizar el @, guardar la campaña o palabra clave, dejar el estado en NUEVO y registrar el evento.
2. **Endpoint de inicio** (nombre, correo, autorización):
   - valida el token (que exista y no haya vencido);
   - guarda los datos;
   - cambia el estado a INICIO sin retroceder;
   - registra el evento.
3. **Endpoint de cálculo:**
   - valida el token;
   - exige que haya autorización;
   - guarda entradas y resultado;
   - cambia a CALCULÓ;
   - registra el evento.
4. **Endpoint de teléfono** (antes de mostrar el calendario): valida, normaliza y guarda.
5. **CORS** solo para el dominio de la calculadora. Si puedes, pon límite de peticiones por IP.
6. **Respuestas claras** para token inválido o vencido, para que la calculadora muestre "pide un link nuevo".

**Terminado cuando:** con un token de prueba se completan los tres pasos y aparecen en Supabase; con un token falso o vencido se rechaza sin guardar nada.

### Fase 3: Dashboard (Next) (3–4 días)
1. **Ficha del lead:** datos, estado, historial de eventos, diagnósticos y citas.
2. **Botón "Generar link":**
   - lo ejecuta el servidor;
   - reutiliza el token si está vigente;
   - lo copia al portapapeles;
   - pasa el estado a LINK_ENVIADO solo si estaba en NUEVO o FILTRADO;
   - registra quién lo generó.
3. **Búsqueda por @:** con o sin arroba y en mayúsculas o minúsculas. Si el @ no existe, permite crear el lead a mano.
4. **Acciones del setter:** marcar FILTRADO o DESCARTADO (con motivo).
5. **Acciones del closer:** marcar ASISTIÓ o NO_SHOW, y después CLIENTE o NO_COMPRÓ.
6. **Cola "Citas sin cruzar":**
   - lista de citas sin lead, al lado de los candidatos (leads que calcularon sin cita, ordenados por cercanía en hora, correo o teléfono);
   - botón "Asignar";
   - botón "Corregir" para citas mal cruzadas.
7. **Vista "Calculó y no agendó":** para el seguimiento, con la fecha del diagnóstico y el resultado.
8. **Métricas** (sección 4).

**Terminado cuando:** un setter encuentra un lead por su @, genera el link en menos de 10 segundos y puede asignar a mano una cita de prueba.

### Fase 4: Calculadora (HTML) (2 días)
1. **Leer el token de la URL** al cargar, y luego quitarlo de la barra de direcciones para que no quede en analytics ni en capturas.
2. **Misma página siempre,** con token válido, vencido o sin token. El token solo se revisa al enviar.
3. **Paso 1:** nombre, correo y casilla de autorización (sin marcar), con link a la política.
4. **Paso 2:** calculadora y diagnóstico. Si el resultado decide algo importante, el servidor debe recalcularlo, no confiar en el navegador.
5. **Paso 3:** botón "Quiero agendar" → pide el teléfono → muestra el calendario incrustado, con el texto "usa el mismo correo que pusiste arriba".
6. **Metadatos Open Graph** (título, descripción e imagen): son la vista previa que ve el lead en el chat.
7. **Textos sin promesas** del tipo "sal de deudas en X días".

**Terminado cuando:** en el celular, desde el link en Instagram, se completa todo el recorrido y los datos aparecen en la ficha del lead en el dashboard.

### Fase 5: Google Calendar y cruce (2 días)
1. **En la agenda de citas:** teléfono como campo obligatorio y, si tu plan lo permite, verificación de correo.
2. **Reserva de prueba:** consulta el evento por la API y confirma en qué campo quedan el correo y el teléfono de quien reservó (el teléfono suele quedar en la descripción).
3. **`pg_cron` incremental:** trae solo lo nuevo o cambiado desde la última vez, incluidas cancelaciones. El id del evento es único, para no duplicar.
4. **Filtro:** solo citas de la agenda de reservas, no reuniones internas. Lo más limpio es un calendario secundario dedicado.
5. **Cruce automático en orden:**
   1. correo;
   2. teléfono;
   3. un único lead que calculó en los 30 minutos anteriores;
   4. si nada funciona, sin cruzar.

   Siempre se guarda el método.
6. **Cancelaciones:** si la cita se cancela, se marca y el lead vuelve a "calculó y no agendó" para seguimiento. Esta es la única excepción a la regla de "no retroceder", y queda en el historial.

**Terminado cuando:** tres reservas de prueba se cruzan cada una por su método (una con el mismo correo, otra con otro correo pero el mismo teléfono, otra con datos distintos que cae en la cola y se asigna a mano).

### Fase 6: Prueba de punta a punta (1 día)
Con 3 cuentas de Instagram de prueba, recorre el flujo completo y verifica:
- [ ] Palabra clave → el lead aparece en el dashboard como NUEVO con la campaña correcta.
- [ ] Generar link dos veces → el mismo link.
- [ ] Link pegado en Instagram → la vista previa muestra título e imagen correctos.
- [ ] Calculadora sin marcar la autorización → no guarda.
- [ ] Link con el token alterado → la página se ve igual, pero al enviar dice "pide un link nuevo".
- [ ] Reserva → aparece cruzada en el dashboard tras la siguiente ejecución de `pg_cron`.
- [ ] Cancelación en Google → se refleja en el dashboard.
- [ ] Los estados nunca retroceden solos.

### Fase 7: Operación
- **Setter, diario:**
  1. revisa los NUEVOS;
  2. filtra;
  3. genera y envía links;
  4. vacía la cola de citas sin cruzar;
  5. hace seguimiento a "calculó y no agendó" (WhatsApp o correo con autorización, o IG a mano; nunca en secuencia).
- **Closer, diario:** marca asistencia y resultado de cada llamada del día.
- **Semanal:** revisa las métricas de la sección 4 y el % de citas cruzadas a mano.
- **Regla de salida:** si el cruce manual pasa del 15–20 % de las citas durante dos semanas seguidas, migra la agenda a Cal.com conectado a Google Calendar, que cruza exacto por token. Ese umbral es criterio propio, ajústalo a tu volumen.

---

## 4. Métricas del dashboard

**Embudo, por campaña y por setter, con la tasa entre cada paso:**
NUEVO → FILTRADO → LINK_ENVIADO → INICIO → CALCULÓ → AGENDÓ → ASISTIÓ → CLIENTE

| Métrica | Para qué sirve |
|---|---|
| % INICIO / LINK_ENVIADO | Si la gente abre y empieza. Si es bajo: revisa el mensaje del setter o la vista previa. |
| % CALCULÓ / INICIO | Si la calculadora es demasiado larga o confusa. |
| % AGENDÓ / CALCULÓ | Si el diagnóstico motiva a agendar. |
| % ASISTIÓ / AGENDÓ | Calidad de la cita y de los recordatorios. |
| % CLIENTE / ASISTIÓ | Cierre. |
| Tiempo mediano entre pasos | Dónde se enfría el lead. Por ejemplo, de LINK_ENVIADO a INICIO. |
| Citas por método de cruce (correo / teléfono / tiempo / manual / sin cruzar) | Calidad de los datos. Si el manual crece, aplica la regla de salida. |
| Distribución de resultados del diagnóstico | Qué perfil llega y cuál agenda. |
| Costo por lead y por cita (si importas el gasto de cada campaña) | Qué campaña rinde de verdad. |

**Para contar bien:**
- "Abrió el link" no se mide al cargar la página, porque Meta abre los links para la vista previa. Se cuenta desde INICIO.
- Las tasas deben verse por cohorte (leads que entraron en la misma semana). Si no, un lead que agenda días después distorsiona la semana en que agendó.

---

## 5. Riesgos que quedan y cómo se vigilan

| Riesgo | Señal | Qué hacer |
|---|---|---|
| Reportes o restricciones en Instagram | Avisos en la app o en el Centro de cuentas | Revisar los textos del setter, bajar el volumen y confirmar que no hay mensajes en secuencia. |
| La persona reserva con otro correo | Sube el % de citas sin cruzar | Texto más visible sobre el calendario y teléfono obligatorio. Si no alcanza, pasar a Cal.com. |
| Token filtrado o reenviado | Diagnósticos repetidos con correos distintos en el mismo token | El token vence a los 14 días. El dashboard puede invalidarlo a mano. |
| Datos financieros expuestos | — | Solo el Worker y el servidor del dashboard escriben. Seguridad de filas activa. Nada de analytics de terceros en la calculadora. |
| El Worker o `pg_cron` fallan sin avisar | No entran leads o citas nuevas en varias horas | Alerta simple en el dashboard: "última cita sincronizada hace X horas". |
