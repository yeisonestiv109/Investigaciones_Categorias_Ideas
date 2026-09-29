# Investigación 03 — Embudo Instagram → calculadora → agenda, y cómo cruzar los datos en Supabase

**Pregunta:** cuando ManyChat le envía a un lead el link de la calculadora externa, ¿se puede saber a qué lead se le envió para registrarlo sin volver a pedirle el @? ¿Y mandar ese link por DM pone en riesgo la cuenta?

**Respuesta corta:**
1. **Sí se puede, y es sencillo.** ManyChat deja meter variables del contacto en la URL de un botón. Lo correcto es que ManyChat le pida a Supabase un **token aleatorio por lead** y ponga ese token en el link (`?t=...`). La calculadora lee el token y ya sabe quién es. No hace falta pedir el @ otra vez.
2. **No existe una regla oficial de Meta que prohíba mandar links por DM.** La API oficial de Instagram trae botones de link (`web_url`), y el propio ManyChat recomienda mandar links en sus flujos. Lo que Meta sí prohíbe de forma documentada son los links **engañosos**: redirecciones automáticas a otro dominio, *cloaking* y suplantación. La guía "anti-baneo" es un playbook de comunidad: tiene buenas ideas, pero varias afirmaciones no tienen respaldo oficial y dos de sus recomendaciones **no se pueden configurar** en ManyChat tal como están escritas (ver sección 2).
3. En respuestas anteriores presenté como hechos varias heurísticas de la guía ("el link es bandera roja", "el chat que no inició el usuario"). Aquí quedan corregidas.

Cada afirmación lleva su nivel de evidencia:
- **[OFICIAL]**: documentación de Meta, WhatsApp, ManyChat, Calendly, Cal.com, Supabase o una ley.
- **[COMUNIDAD]**: foros, blogs de terceros o la guía. No está verificado.
- **[HIPÓTESIS]**: razonamiento propio que hay que medir.

---

## 1. Qué dice la documentación oficial y qué no dice

| Tema | Lo que está documentado | Nivel | Fuente |
|---|---|---|---|
| Botones con link en DMs de Instagram | La API de mensajería de Instagram admite botones `web_url` en las plantillas *Button* y *Generic*. Es una función oficial, no un truco. | OFICIAL | [Meta: Button Template](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/button-template/), [Generic Template](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/generic-template/) |
| Qué links prohíbe Meta | La política de Spam prohíbe URLs o dominios **engañosos**: *cloaking*, redirecciones que **cambian de dominio automáticamente sin acción del usuario**, pedir likes o follows para ver contenido e imitar funciones de Meta. No prohíbe los links en general. | OFICIAL | [Meta: Spam](https://transparency.meta.com/policies/community-standards/spam/) |
| Quién inicia el chat | Con la API (y por tanto con ManyChat), la cuenta **solo puede escribir dentro de las 24 h** después de que el usuario escribió, comentó o tocó un botón. Así que el chat automatizado **siempre lo inicia el usuario**. Decir que "Meta ve un link en un chat que no inició el usuario" era falso para tu caso. | OFICIAL | [Meta: Send Messages](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api), [ManyChat: ventanas 24 h / 7 días](https://help.manychat.com/hc/en-us/articles/14281199732892-How-to-send-messages-outside-the-24-hour-and-7-day-windows-in-Messenger-and-Instagram) |
| Mensajes después de 24 h | Solo con la etiqueta `HUMAN_AGENT` (hasta 7 días), la tiene que enviar **una persona** y **no puede tener promociones**. | OFICIAL | ídem |
| ManyChat y los links | ManyChat promueve en su propio blog mandar links ("share links to your shop or courses") en la bienvenida a nuevos seguidores. | OFICIAL (del proveedor) | [ManyChat: Follow to DM](https://manychat.com/blog/introducing-follow-to-dm/) |
| "Un link repetido en cientos de chats es de lo peor" | No hay documento de Meta que lo diga. Algunos blogs de terceros hablan de umbrales, como "más de 25 mensajes idénticos por hora", pero sin fuente verificable. | COMUNIDAD | [creatorflow](https://creatorflow.so/blog/instagram-dm-compliance-meta-rules/), [usewave](https://www.usewave.co/blog/instagram-dm-limits) |
| Acortadores (bit.ly y similares) | Varias fuentes de terceros coinciden en que penalizan. No es oficial, pero no cuesta nada evitarlos. | COMUNIDAD | [creatorflow](https://creatorflow.so/blog/instagram-dm-compliance-meta-rules/) |
| Límite de volumen | Se habla de ~200 DMs automáticos por hora. Son cifras de la comunidad de ManyChat, sin documento oficial de Meta que las fije. | COMUNIDAD | [ManyChat Community](https://community.manychat.com/general-q-a-43/api-rate-limit-no-of-autodms-that-can-be-sent-in-an-hour-415) |

**Por qué tu link de Google Calendar "no hizo nada":** la explicación más simple y consistente con la documentación es que **un link normal, enviado dentro de una conversación que el usuario inició, no viola ninguna política**. No hace falta suponer que Google lo "protegía".

**El riesgo real que sí existe:** los reportes y bloqueos de usuarios, y el volumen alto de mensajes idénticos. Ninguno de los dos tiene umbral público, así que es una caja negra. En un nicho de deudas conviene ser prudente, pero la prudencia se consigue **con buen diseño**, no eliminando el link:

1. Link a **tu dominio**, sin acortador.
2. **Un solo link por mensaje.**
3. Enviarlo **solo después de que el lead respondió el filtro** (nunca en frío).
4. **Token único por lead**, así la URL no se repite.
5. Texto del mensaje sin montos ni urgencia.
6. En la página, **nada de redirecciones automáticas a otro dominio**. El paso de la calculadora a la agenda debe ser un botón que la persona toca, o un calendario incrustado en tu mismo dominio. Esto sale literal de la política de Spam: "automatically redirects users to a substantially different domain without user action".

---

## 2. Auditoría de la guía "Anti Baneos" frente a la documentación

| Recomendación de la guía | Veredicto | Por qué |
|---|---|---|
| Escribir "100K" en vez de "$", "USD" o "CASH" | Razonable, sin prueba oficial | Meta no publica cómo funcionan sus clasificadores. No cuesta nada aplicarlo. [COMUNIDAD] |
| Sin precio ni urgencia en el DM | Razonable | Coincide con el espíritu de la política de fraudes y estafas. [COMUNIDAD, alineado con [Meta: Fraud & Scams](https://transparency.meta.com/policies/community-standards/fraud-and-scams/)] |
| Bienvenida: verificados o +10K directo, el resto 50/50 | **Se puede configurar** | ManyChat tiene los campos de sistema *Verified on Instagram* y *Follower Count on Instagram*, y el bloque *Randomizer*. [OFICIAL: [ManyChat System Fields IG](https://help.manychat.com/hc/en-us/articles/14281292522652-System-Fields-for-Instagram)] Lo del "50 % menos de señal" es una hipótesis. |
| **Primer mensaje a los 60 minutos** | **No se puede configurar así en ManyChat** | *Follow to DM* solo deja elegir un retraso **de 5 a 10 minutos**. Además está en beta, solo para cuentas elegibles, Meta permite **un solo Follow-to-DM por usuario por semana** y la persona tiene que tocar un botón para abrir la ventana de 24 h. [OFICIAL: [ManyChat Follow to DM](https://help.manychat.com/hc/en-us/articles/23096654243740-Follow-to-DM-on-Instagram-Say-Hi-to-New-Followers-BETA)] |
| **Un follow-up en IG a las 48–72 h** | **No se puede hacer automatizado** | Fuera de las 24 h la API rechaza el envío. Con `HUMAN_AGENT` solo lo puede mandar una persona, y sin promoción. Queda una sola vía: **un humano escribiendo a mano desde la app de Instagram**. [OFICIAL] |
| Apagar las secuencias automáticas de follow-up | Correcto, y de todos modos obligatorio | Fuera de 24 h no son legales por API. [OFICIAL] |
| "Pedí el número, no mandes el link" | **Exagerado** | No hay regla oficial contra los links (sección 1). Tiene una ventaja real: el número queda en tu base. Pero mover al lead a WhatsApp tiene costos y reglas propias (sección 4). |
| Máximo 2 personas con contraseña, el resto con permisos delegados | Correcto | Es buena práctica de seguridad. Meta sí documenta restricciones por actividad sospechosa de inicio de sesión. |
| Si te cae la cuenta: esperar 14 días, nombre y foto nuevos | Sin evidencia | Además, crear cuentas para evadir una inhabilitación va contra los términos de Instagram. [COMUNIDAD] |

---

## 3. La pregunta central: cómo saber a qué lead le mandaste el link

### Qué identificadores existen

| Identificador | ¿Cambia? | ¿Usarlo en la URL? |
|---|---|---|
| `instagram_username` (@) | **Sí**, el usuario lo puede cambiar | No. Es dato personal y deja de servir si lo cambian. |
| **Contact ID de ManyChat** (`{{contact_id}}`) | No | **No directamente**: es numérico y predecible. Si alguien cambia el número en la URL, podría escribir sobre la ficha de otro lead. |
| **Token aleatorio generado por Supabase** | Lo controlas tú | **Sí.** No se puede adivinar, no expone datos y lo puedes invalidar. |

Fuentes: [ManyChat Variables](https://help.manychat.com/hc/en-us/articles/14281183702556-Variables), [ManyChat System Fields](https://help.manychat.com/hc/en-us/articles/14281292522652-System-Fields), [ManyChat: botones dinámicos con campos](https://manychat.com/resources/video-course/instagram-dm-automation-beyond-the-basics/lesson-2-how-to-use-dynamic-buttons-with-bot-fields).

### El flujo exacto

```
[IG] Lead responde el filtro de intención
   │
   ▼
[ManyChat] Acción "External Request" (POST)  ──►  Supabase Edge Function `lead-upsert`
           body: { contact_id, ig_username, respuestas_filtro }      │ crea o actualiza el lead
           header: x-webhook-secret                                  │ genera un token (12 caracteres)
           ◄──────────────────────────────  { "token": "k3Xf9Qa2LmP0" }
           Response mapping: $.token → campo personalizado `lead_token`
   │
   ▼
[ManyChat] Mensaje con botón URL: https://tudominio.com/calculo?t={{lead_token}}
   │
   ▼
[Tu web] Lee ?t=, la persona hace el cálculo y acepta el tratamiento de datos
         POST a la Edge Function `calc-submit` { t, datos }  →  inserta en `calculations`
         Muestra el resultado y un BOTÓN "Elegir horario" (sin redirección automática)
   │
   ▼
[Agenda] Calendly: ?utm_content=<token>&name=..&email=..
         o Cal.com: ?metadata[lead_token]=<token>&name=..&email=..
   │
   ▼
[Webhook de la agenda] → Edge Function `booking-webhook` (verifica la firma)
         cruza por token → si falta, por email → si falta, por teléfono
         inserta en `bookings` y pone leads.status = 'agendo'
   │
   ▼ (opcional)
[API de ManyChat] setCustomField status=agendo → la automatización deja de escribirle
```

### Datos técnicos verificados de cada pieza

| Pieza | Dato | Fuente |
|---|---|---|
| External Request de ManyChat | Guarda valores de la respuesta en campos personalizados con JSONPath (*Response mapping*). **Tiempo máximo de espera: 10 s**, así que la función tiene que responder rápido. Es una función de *Dev Tools* que requiere **plan Pro**. | [ManyChat: External request](https://help.manychat.com/hc/en-us/articles/14281285374364-Dev-Tools-External-request) |
| Calendly | Acepta `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term` (máximo 255 caracteres), y **devuelve esos valores en el webhook** (`tracking`). Calendly aclara que ahí se puede poner un userID. **Los webhooks requieren plan pago** (Standard o superior). | [Calendly UTM](https://help.calendly.com/hc/en-us/articles/1500005575121-How-to-track-conversions-with-UTM-parameters), [Calendly FAQ dev](https://developer.calendly.com/frequently-asked-questions) |
| Cal.com | Rellena campos por URL (`name`, `email`, campos propios) y `metadata[clave]=valor` **llega en `payload.metadata` del webhook**. Máximo 50 claves, de hasta 40 caracteres cada una. | [Cal.com prefill](https://cal.com/help/bookings/prefill-fields), [Cal.com webhooks](https://cal.com/docs/developing/guides/automation/webhooks) |
| **Google Calendar (agenda de citas)** | **No tiene parámetros de URL documentados para rellenar datos ni webhooks.** En los foros oficiales la gente lo pregunta y no hay solución nativa. **Con Google Calendar el cruce por token no funciona**, solo se podría cruzar a mano por email. | [Foro Google Calendar](https://support.google.com/calendar/thread/182872278/does-appointment-scheduling-support-url-parameters-so-you-can-pass-in-information?hl=en) |
| Edge Functions que reciben webhooks externos | Hay que desactivar `verify_jwt` para esa función y **verificar la firma del proveedor dentro del código**. Si no, cualquiera puede llamarla. | [Supabase: Function configuration](https://supabase.com/docs/guides/functions/function-configuration), [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth) |

**Decisión que tienes que tomar:** si sigues con Google Calendar, pierdes el cruce automático. Hay dos alternativas: Calendly en plan pago (lo más simple) o Cal.com (tiene plan gratuito con webhooks y `metadata` directa).

### Esquema mínimo en Supabase (SQL)

```sql
create table leads (
  id               uuid primary key default gen_random_uuid(),
  manychat_contact_id text unique not null,      -- ID estable
  ig_username      text,                         -- solo informativo, puede cambiar
  phone            text,
  email            text,
  token            text unique not null,
  token_expires_at timestamptz not null default now() + interval '14 days',
  status           text not null default 'filtrado'
                   check (status in ('filtrado','link_enviado','calculo','agendo','asistio','no_show','cliente')),
  consent_at       timestamptz,                  -- autorización Ley 1581
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table calculations (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade,
  inputs     jsonb not null,
  result     jsonb not null,
  created_at timestamptz default now()
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id),         -- null si no se pudo cruzar
  provider    text not null,                     -- 'calendly' | 'cal.com'
  external_id text unique not null,              -- evita duplicados si el webhook se repite
  start_at    timestamptz,
  status      text,                              -- 'agendada','cancelada','reprogramada'
  match_method text,                             -- 'token' | 'email' | 'phone' | 'ninguno'
  raw         jsonb,
  created_at  timestamptz default now()
);

alter table leads enable row level security;
alter table calculations enable row level security;
alter table bookings enable row level security;
-- Sin políticas públicas: solo las Edge Functions (service role) leen y escriben.
```

**Reglas de seguridad que no son opcionales:**
- Genera el token con `crypto.getRandomValues`, no con `Math.random`. Con 12 caracteres base62 hay unos 71 bits de entropía, más que suficiente.
- La web **nunca** habla directo con las tablas. Solo llama a `calc-submit`, que valida el token (que exista y no haya vencido) antes de escribir.
- `lead-upsert` verifica un secreto que ManyChat manda en un header. `booking-webhook` verifica la firma de Calendly o de Cal.com.
- Usa el `external_id` de la reserva como único. Los proveedores reintentan los webhooks, y sin eso tendrías citas duplicadas.

---

## 4. Ir a WhatsApp no es gratis ni está libre de riesgo

| Punto | Dato | Nivel | Fuente |
|---|---|---|---|
| Actividades prohibidas en WhatsApp Business | Préstamos *payday*, adelantos de nómina, préstamos P2P, **cobranza de deudas** y fianzas, **aunque tengas licencia**. La educación financiera no está en la lista, pero tus mensajes no pueden parecer ofertas de crédito ni cobranza. | OFICIAL | [WhatsApp Business Policy](https://business.whatsapp.com/policy) |
| Consentimiento | Necesitas el consentimiento (opt-in) de la persona para escribirle por WhatsApp. | OFICIAL | ídem |
| Escribir primero por la API | Si el lead no te escribió antes, el primer mensaje tiene que ser una **plantilla aprobada** (normalmente de categoría *marketing*), y **se cobra por mensaje** según el país. Si el lead te escribe primero, se abre una ventana de servicio y responder no tiene costo. | OFICIAL | [WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) |
| WhatsApp Business App (manual) | También banea cuentas por reportes y bloqueos de usuarios. | OFICIAL | [WhatsApp FAQ: baneos](https://faq.whatsapp.com/723378546580115) |

**Conclusión:** pedir el número y escribir tú primero agrega un paso, un costo por plantilla y un segundo canal que también se puede caer. Vale la pena como **activo** (el número queda en tu base), pero **no** como supuesta "protección" contra una regla de links que no existe.

---

## 5. Fricción: lo que no se sabe y cómo averiguarlo

No encontré ningún estudio público y confiable que mida **cuánto se pierde por cada paso extra** en un embudo IG → WhatsApp → calculadora. Cualquier porcentaje que te den sin fuente es inventado. Tu cuenta tiene que dar el dato. La forma de obtenerlo es esta:

- **Grupo A:** el link de la calculadora con token, directo en el DM después del filtro.
- **Grupo B:** pedir el número y mandar el link por WhatsApp.
- Reparte con el *Randomizer* de ManyChat en 50/50 y mide en Supabase: % que abre la calculadora, % que calcula, % que agenda, % que asiste. En IG mide además reportes, bloqueos y avisos de restricción.
- **Tamaño de muestra:** para detectar una diferencia entre 30 % y 38 % de agendamiento (α = 0,05, potencia del 80 %) necesitas unos **550 leads por grupo**. Con diferencias menores hacen falta más. Si tu volumen no llega a eso, el test no concluye nada y tienes que decidir por criterio.

---

## 6. Datos personales (Colombia)

La calculadora recoge información financiera de la persona. La **Ley 1581 de 2012** exige autorización **previa, expresa e informada**, y un aviso de privacidad que diga quién es el responsable, para qué se usan los datos y cómo se consulta la política, **a más tardar al momento de recoger los datos**. En la práctica:

- Un checkbox que no venga marcado.
- Un link a tu política de tratamiento de datos.
- Guardar `consent_at` en `leads`.

Fuente: [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981).

---

## 7. Veredicto sobre tu estrategia

| Parte | Veredicto |
|---|---|
| Filtro de intención en IG | Bien. Además abre la ventana de 24 h de forma legítima. |
| Mandar el link de la calculadora por DM | **Permitido por Meta.** Hazlo con token único, tu dominio, sin acortador, un link por mensaje y solo después de que el lead respondió. |
| Calculadora → agenda | Bien, siempre que el paso a la agenda sea un **botón**, no una redirección automática. |
| Google Calendar como agenda | **Es el punto débil del cruce de datos.** Cámbialo por Calendly (pago) o Cal.com. |
| Seguimiento | Automatizado solo dentro de 24 h. Después, a mano desde la app o por WhatsApp o email con opt-in. |
| WhatsApp | Como canal de seguimiento y activo propio, sí. Como "obligatorio para no mandar links", no hace falta. Valídalo con el test A/B. |

### Lo que queda sin certeza, dicho sin rodeos
- Meta **no publica** los umbrales de su detección de spam. Nadie, ni la guía ni yo, puede asegurarte que X links por hora son seguros.
- Las cifras de "200 DMs por hora" y "25 mensajes idénticos" son de la comunidad, no oficiales.
- El plan exacto de ManyChat y de Calendly que necesitas conviene confirmarlo en tu cuenta, porque cambian sus planes con frecuencia.

---

## 8. Actualización: tu flujo real (anuncio → palabra clave → filtro → link → formulario → Google Calendar)

### 8.1 ¿Es seguro mandar el link por DM en este flujo?

Tu flujo es el caso de uso para el que Meta diseñó la mensajería:
- El lead llega desde un anuncio y **él escribe primero** (la palabra clave). Eso abre la ventana estándar de 24 h. [OFICIAL: [Meta: anuncios Click to Instagram](https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-creative/messaging-ads/click-to-instagram), [ManyChat: ventanas de mensajería](https://help.manychat.com/hc/en-us/articles/23358636027932-Understanding-messaging-windows)]
- Tú respondes a lo que él pidió, con un botón de link, que es una función oficial de la API. [OFICIAL]
- La política de Spam no prohíbe esto. Prohíbe links engañosos. [OFICIAL]

Nadie puede darte "riesgo cero", porque Meta no publica sus umbrales. Estos son los controles concretos que sí dependen de ti:

| Control | Por qué | Base |
|---|---|---|
| Mandar el link **dentro de las 24 h** y nunca en automatizaciones después de ese plazo | Pasadas las 24 h, las automatizaciones ya no se entregan. Después solo se puede escribir a mano. | OFICIAL |
| **Dominio propio verificado** en Meta Business (Brand Safety → Domains) | Meta reconoce que el dominio es de tu empresa y controla quién edita las vistas previas de tus links. | [Meta: Domain Verification](https://www.facebook.com/business/help/286768115176155) |
| La misma página para el rastreador de Meta y para el usuario (sin *cloaking*) | Meta abre los links para generar la vista previa. Mostrarle a Meta un contenido y al usuario otro está prohibido. | [OFICIAL: Spam](https://transparency.meta.com/policies/community-standards/spam/) |
| Sin acortadores y con un solo link por mensaje | No es oficial, pero no cuesta nada. | COMUNIDAD |
| El texto del mensaje dice qué es el link ("aquí haces tu diagnóstico") | Lo que realmente daña la cuenta son los **reportes de usuarios**. Un link que se explica solo genera menos desconfianza. | HIPÓTESIS razonable |
| El paso del formulario a la agenda: **calendario incrustado en tu página** mejor que saltar a otro dominio | La política prohíbe redirigir automáticamente a otro dominio "sin acción del usuario". Enviar un formulario sí es una acción del usuario, así que tu redirección actual probablemente no la viola. Incrustar elimina la duda por completo. | OFICIAL + interpretación |
| Página sin promesas tipo "sal de tus deudas en 30 días" | Ese tipo de promesa encaja en los patrones de la política de Fraude y Estafas. | [OFICIAL: Fraud & Scams](https://transparency.meta.com/policies/community-standards/fraud-and-scams/) |

### 8.2 Cómo saber de quién es cada cita en Google Calendar

**El problema:** la página de reservas de Google Calendar **no tiene parámetros de URL documentados** para recibir tu token. La cita llega a tu calendario sin saber de qué lead viene.

**Lo que sí entrega Google:**
- El formulario de reserva exige **nombre, apellido y email**.
- Se le pueden agregar campos con **"Agregar elemento"**: *Teléfono* o un texto libre, y se pueden marcar como obligatorios.
- Hay una opción para exigir **verificación del email** antes de confirmar la cita. Esa opción requiere un plan Workspace elegible.
- Por la API, la cita trae el email del invitado en `attendees`, y la fecha de creación en `created`.

Fuentes: [Google: crear agenda de citas](https://support.google.com/calendar/answer/10729749?hl=en), [Google Calendar API: Events](https://developers.google.com/workspace/calendar/api/v3/reference/events).

> **Tienes que comprobarlo:** en qué campo exacto de la API aparecen las respuestas a los campos extra (normalmente en `description`). Haz una reserva de prueba y consulta el evento con `events.get` antes de programar el cruce.

**Opción A: seguir con Google Calendar y cruzar por email y teléfono.**
1. En tu formulario pide **email y teléfono** (además del token que ya viene en tu link). Guarda el email en minúsculas y el teléfono en formato internacional (+57...).
2. En la agenda de Google activa el teléfono como campo obligatorio y, si tu plan lo permite, la verificación de email.
3. Justo encima del calendario pon el texto: "Usa el mismo correo que pusiste en tu diagnóstico".
4. Tu `pg_cron` trae las citas nuevas. Para no volver a descargar todo cada vez, usa `syncToken` (sincronización incremental), o cambia a notificaciones push con `events.watch`. Ver [Google: Push notifications](https://developers.google.com/workspace/calendar/api/guides/push).
5. Cruza en este orden y guarda cómo se cruzó cada cita en `match_method`:
   1. **Email** igual al de un lead.
   2. Si no, **teléfono** igual.
   3. Si no, **un solo lead** que haya hecho el diagnóstico en los 30 minutos anteriores a la creación de la cita. Solo se asigna si hay exactamente un candidato.
   4. Si no, la cita queda **sin cruzar**, en una cola para revisión manual.
6. Mide el % de citas que quedan sin cruzar. Si pasa de un nivel que te parezca aceptable, pasa a la opción B.

**Opción B: cruce exacto sin perder Google Calendar.**
Usa **Cal.com conectado a tu Google Calendar**. Las citas se siguen creando en tu Google Calendar, así que el equipo no cambia nada. Pero el link de la agenda lleva `?metadata[lead_token]=...&name=...&email=...`, y el webhook de Cal.com te devuelve el token. El cruce es exacto, sin adivinar por email.
[OFICIAL: [Cal.com prefill](https://cal.com/help/bookings/prefill-fields), [Cal.com webhooks](https://cal.com/docs/developing/guides/automation/webhooks)]

**Opción C: agenda propia.**
Tu web consulta los horarios libres con `freebusy.query` y crea la cita con `events.insert`, guardando el `lead_id` en `extendedProperties.private`. El cruce es exacto y todo es tuyo, pero es la opción que más trabajo lleva (zonas horarias, cancelaciones, recordatorios).
[OFICIAL: [Google Calendar API: Events](https://developers.google.com/workspace/calendar/api/v3/reference/events)]

| | Precisión del cruce | Trabajo | Costo |
|---|---|---|---|
| A. Google Calendar + email/teléfono | Alta si la persona usa el mismo email; nunca del 100 % | Bajo (ya tienes `pg_cron`) | Ninguno extra |
| B. Cal.com sobre Google Calendar | Exacta (token) | Bajo a medio | Confirmar el plan de Cal.com |
| C. Agenda propia | Exacta (token) | Alto | Ninguno extra |

---

## 9. Diseño del formulario: nombre → calculadora → diagnóstico → contacto → agenda

Propuesta del negocio: el formulario pide solo el nombre, la calculadora pide salario y deudas, se muestra el diagnóstico y la persona decide si agenda. Si agenda, escribe su email, su teléfono y su @ de Instagram.

| Punto | Veredicto | Motivo |
|---|---|---|
| Mostrar el diagnóstico **antes** de pedir el contacto | Bien | La persona recibe valor antes de dar sus datos, y pide la llamada con información real. El costo: de quien no agenda no te queda email ni teléfono. Lo compensa el token (ver abajo). No encontré datos públicos confiables sobre cuánto cambia la conversión si el resultado se muestra antes o después de pedir el contacto. Si quieres saberlo, mídelo con un test A/B. |
| Pedir **solo el nombre** al inicio | Bien | Es fricción mínima. Además, ManyChat no tiene el nombre de los contactos de Instagram por defecto (solo el @), así que es un dato que te sirve. |
| **Pedir el @ de Instagram** | **No hace falta. Quítalo.** | El link que manda ManyChat ya trae el token, y el token ya dice quién es la persona, con su ID de contacto. Si le pides el @ escrito a mano: (1) se equivoca con arrobas, mayúsculas o letras; (2) el @ puede cambiar; (3) es un campo más que no le aporta nada. Si quieres mostrarlo, sácalo del token y muéstralo ya escrito ("¿Eres @fulano?"). |
| Pedir email y teléfono **solo si va a agendar** | Bien, con una condición | Es el dato que usas para cruzar la cita. Con Google Calendar la persona **vuelve a escribir** el email en la página de reservas de Google (no se puede rellenar por URL), así que escribe el mismo dato dos veces. Con Cal.com se rellena solo y el cruce va por token (opción B de la sección 8.2). |
| Quien calcula y **no** agenda | Recuperable | Sus datos de la calculadora quedan ligados al token, y el token al contacto de ManyChat. Así sabes que "calculó y no agendó". Si todavía está dentro de las 24 h desde su último mensaje, le puedes escribir por IG; después, solo a mano. |
| Salario y deudas | Pedir autorización **antes** de guardarlos | La Ley 1581 exige autorización previa, expresa e informada para tratar datos personales. El checkbox va **en el paso de la calculadora**, no al final. Los datos financieros no están en la lista de "datos sensibles" del artículo 5, pero esa lista usa "tales como" y los datos financieros sí afectan la intimidad: trátalos con el mismo cuidado (acceso restringido, sin exponerlos en el navegador y sin enviarlos a herramientas de terceros). |

### Qué llega a Supabase en cada paso

| Paso | Qué escribe la página | Tabla |
|---|---|---|
| Abre el link `?t=` | Nada. Solo valida el token. | — |
| Escribe el nombre y acepta el tratamiento de datos | `name`, `consent_at` | `leads` |
| Envía la calculadora | entradas y resultado | `calculations` → `leads.status = 'calculo'` |
| Toca "Quiero agendar" y escribe email y teléfono | `email`, `phone` (normalizados) | `leads` |
| Reserva (webhook de Cal.com o `pg_cron` sobre Google) | cita + `match_method` | `bookings` → `leads.status = 'agendo'` |

---

## 10. Flujo final acordado: token de ManyChat → nombre + email → calculadora → Google Calendar → cruce por email + cruce manual

### 10.1 Cómo se conecta cada dato

1. **Link con token.** ManyChat llama a `lead-upsert` con el `contact_id`, recibe un token y manda `tudominio.com/calculo?t=<token>`.
   - **Si no tienes ManyChat Pro** (sin External Request), puedes poner `{{contact_id}}` directo en la URL, con una condición: la página **solo crea filas nuevas**. Nunca sobrescribe datos ni muestra datos guardados. Así, si alguien cambia el número en la URL, lo peor que pasa es que aparece una fila basura, no que se pisa o se filtra la ficha de otra persona.
2. **Nombre + email + autorización de datos.** Se guardan en `leads`, ligados al token, así que ya sabes de qué contacto de ManyChat es.
3. **Calculadora.** Las entradas y el resultado se guardan en `calculations`, y `status` pasa a `'calculo'`.
4. **Google Calendar.** La persona escribe su email en la página de reservas de Google. `pg_cron` trae la cita y la cruza con el lead **por email**.
5. **Si no cruza**, la cita queda en la cola de cruce manual.

### 10.2 Por qué a veces el email no va a coincidir (y está documentado)

Google dice: *"When you sign in to a Google Account and make an appointment, your booking details are pre-filled"*. O sea, si la persona tiene una sesión de Google abierta, **la página de reservas le rellena su correo de Gmail**, aunque en tu formulario haya puesto otro (por ejemplo Hotmail). [OFICIAL: [Google Calendar: agenda de citas](https://support.google.com/calendar/answer/11608416?hl=en)]

Esa va a ser la causa más común de citas que no cruzan. Tres medidas:
- Texto encima del calendario: "Revisa que el correo sea el mismo que pusiste en tu diagnóstico".
- **Teléfono** como campo obligatorio en el formulario de Google, para tener una segunda llave de cruce.
- Cruce por **cercanía en el tiempo** y **cola manual**.

### 10.3 SQL: columnas extra, cruce automático y cruce manual

```sql
-- Columnas adicionales sobre el esquema de la sección 3
alter table leads    add column if not exists name text;
alter table bookings add column if not exists attendee_email text;
alter table bookings add column if not exists attendee_phone text;
alter table bookings add column if not exists booked_at timestamptz;   -- event.created de Google
alter table bookings add column if not exists matched_by text;         -- 'auto' o el nombre del setter
alter table bookings add column if not exists matched_at timestamptz;

create index if not exists leads_email_idx on leads (email);
create index if not exists leads_phone_idx on leads (phone);

-- Normalización: guardar SIEMPRE así desde las funciones
create or replace function norm_email(e text) returns text
language sql immutable as $$ select nullif(lower(trim(e)), '') $$;

create or replace function norm_phone(p text) returns text
language sql immutable as $$
  -- deja solo dígitos; si son 10 dígitos (celular Colombia) antepone 57
  select case
    when length(regexp_replace(coalesce(p,''), '\D', '', 'g')) = 10
      then '57' || regexp_replace(p, '\D', '', 'g')
    else nullif(regexp_replace(coalesce(p,''), '\D', '', 'g'), '')
  end
$$;

-- Cruce automático de una cita: email → teléfono → ventana de tiempo (solo si hay 1 candidato)
create or replace function match_booking(p_booking uuid) returns text
language plpgsql as $$
declare
  b bookings%rowtype;
  v_lead uuid;
  v_candidates uuid[];
begin
  select * into b from bookings where id = p_booking;
  if b.lead_id is not null then return b.match_method; end if;

  -- 1) email
  select id into v_lead from leads
   where email = norm_email(b.attendee_email)
   order by updated_at desc limit 1;
  if v_lead is not null then
    update bookings set lead_id = v_lead, match_method = 'email',
           matched_by = 'auto', matched_at = now() where id = p_booking;
    update leads set status = 'agendo', updated_at = now() where id = v_lead;
    return 'email';
  end if;

  -- 2) teléfono
  select id into v_lead from leads
   where phone = norm_phone(b.attendee_phone)
   order by updated_at desc limit 1;
  if v_lead is not null then
    update bookings set lead_id = v_lead, match_method = 'phone',
           matched_by = 'auto', matched_at = now() where id = p_booking;
    update leads set status = 'agendo', updated_at = now() where id = v_lead;
    return 'phone';
  end if;

  -- 3) ventana de tiempo: leads que calcularon en los 30 min previos y aún no tienen cita
  select array_agg(distinct l.id) into v_candidates
    from leads l
    join calculations c on c.lead_id = l.id
   where c.created_at between b.booked_at - interval '30 minutes' and b.booked_at
     and not exists (select 1 from bookings x where x.lead_id = l.id);
  if array_length(v_candidates, 1) = 1 then
    update bookings set lead_id = v_candidates[1], match_method = 'ventana_tiempo',
           matched_by = 'auto', matched_at = now() where id = p_booking;
    update leads set status = 'agendo', updated_at = now() where id = v_candidates[1];
    return 'ventana_tiempo';
  end if;

  update bookings set match_method = 'ninguno' where id = p_booking;
  return 'ninguno';
end $$;

-- Cola para el cruce manual
create or replace view citas_sin_cruzar as
select b.id, b.attendee_email, b.attendee_phone, b.start_at, b.booked_at, b.raw->>'summary' as titulo
  from bookings b
 where b.lead_id is null and coalesce(b.status, '') <> 'cancelada'
 order by b.start_at;

-- Candidatos: calcularon y no tienen cita
create or replace view leads_sin_cita as
select l.id, l.name, l.email, l.phone, l.manychat_contact_id, max(c.created_at) as ultimo_calculo
  from leads l
  join calculations c on c.lead_id = l.id
 where not exists (select 1 from bookings b where b.lead_id = l.id)
 group by l.id
 order by ultimo_calculo desc;

-- Asignación manual (también sirve para corregir un cruce automático equivocado)
create or replace function assign_booking_manual(p_booking uuid, p_lead uuid, p_who text)
returns void language plpgsql as $$
declare v_old uuid;
begin
  select lead_id into v_old from bookings where id = p_booking;
  update bookings set lead_id = p_lead, match_method = 'manual',
         matched_by = p_who, matched_at = now() where id = p_booking;
  update leads set status = 'agendo', updated_at = now() where id = p_lead;
  if v_old is not null and v_old <> p_lead then
    update leads set status = 'calculo', updated_at = now() where id = v_old;
  end if;
end $$;
```

**Uso diario del setter:** abre `citas_sin_cruzar` y `leads_sin_cita` en el editor de tablas de Supabase y compara nombre, hora y teléfono. Luego asigna con `select assign_booking_manual('<id_cita>', '<id_lead>', 'nombre_setter');`.

### 10.4 Lo que el `pg_cron` debe manejar

- **Cancelaciones y reprogramaciones.** Con sincronización incremental (`syncToken`), la API de Google también devuelve los eventos cancelados, con `status = 'cancelled'`. Actualiza `bookings.status` y usa el `id` del evento como `external_id` único, para no duplicar citas. [OFICIAL: [Google Calendar API: Events](https://developers.google.com/workspace/calendar/api/v3/reference/events)]
- **Solo citas de la agenda de reservas.** Filtra para no cruzar reuniones internas. Por ejemplo, por el título que Google pone a las citas o usando un calendario secundario dedicado.
- **Medición semanal:** qué % de citas cruzó por email, por teléfono, por ventana de tiempo y a mano. Si el cruce manual pasa de un nivel que te parezca aceptable, es la señal para pasar a Cal.com (cruce exacto por token, sección 8.2 opción B).

---

## 11. Implementación con ManyChat Pro + Cloudflare Worker + Supabase

Arquitectura actual del negocio: ManyChat → Cloudflare Worker (guarda el lead en cuanto escribe) → Supabase. El token se genera **en ese mismo Worker**, así que no hacen falta Edge Functions de Supabase para esto.

El código completo está en [`03_worker_token.js`](03_worker_token.js). Lo probé con Node 22 contra un Supabase simulado, en estos casos:
- sin el secreto de ManyChat → rechazado;
- el mismo lead recibe siempre el mismo token;
- cada lead recibe uno distinto;
- sin autorización de datos no se guarda el cálculo;
- un token falso o vencido se rechaza;
- al vencer se genera uno nuevo sin hacer retroceder el estado del lead.

**No lo probé contra tu proyecto real de Supabase.**

### 11.1 Cómo se genera un link distinto por lead

1. Cuando el lead pasa el filtro, ManyChat llama al Worker con su `contact_id`.
2. El Worker genera **9 bytes aleatorios** con `crypto.getRandomValues` (criptográficamente seguro) y los convierte a **12 caracteres base64url** (72 bits). Ejemplo: `om3KfsQENtYB`.
3. Lo guarda en `leads.token`, con vencimiento a 14 días, y lo devuelve.
4. Si el mismo lead vuelve a pedir el link, recibe **el mismo token** mientras siga vigente.

**Así se ve el link** (cada lead tiene el suyo):
```
https://diagnostico.tudominio.com/?t=om3KfsQENtYB
https://diagnostico.tudominio.com/?t=Di2uFt_WQ6f7
```
El link no contiene ni el @, ni el nombre, ni el ID. Quien lo vea no puede sacar ningún dato de él, y no se puede adivinar el de otra persona: habría 2⁷² combinaciones posibles.

### 11.2 Cambios en Supabase

```sql
-- Tu Worker actual crea el lead cuando escribe (todavía sin token): el token debe poder ser NULL.
alter table leads alter column token drop not null;
alter table leads alter column token_expires_at drop not null;
alter table leads alter column token_expires_at drop default;
alter table leads add column if not exists name text;
create unique index if not exists leads_token_uidx on leads (token) where token is not null;
```
Si tu tabla actual tiene otros nombres de columna, adapta el Worker a esos nombres, no al revés.

### 11.3 Secretos del Worker

```bash
wrangler secret put SUPABASE_URL          # https://<proyecto>.supabase.co
wrangler secret put SUPABASE_SECRET_KEY   # sb_secret_...  (Supabase → Settings → API Keys)
wrangler secret put MANYCHAT_SECRET       # p. ej. salida de: openssl rand -hex 32
wrangler secret put SITE_ORIGIN           # https://diagnostico.tudominio.com
```
- La clave `sb_secret_...` va en el header `apikey`, no en `Authorization: Bearer`, porque no es un JWT.
- Supabase va a retirar las claves antiguas `anon` y `service_role` a finales de 2026.
- Esa clave **nunca** puede ir en la página. Por eso la página habla con el Worker y no directo con Supabase.

[OFICIAL: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Migración a claves nuevas](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)]

### 11.4 Configuración en ManyChat (paso a paso)

1. **Settings → Fields → New User Field:** `lead_token` (Text) y `link_diagnostico` (Text).
2. En el flujo, **después** de que el lead pasa el filtro, agrega **Actions → External Request**:
   - **Method:** `POST`
   - **URL:** `https://api.tudominio.com/manychat/link`, o la ruta de tu Worker.
   - **Headers:** `X-Webhook-Secret` = el mismo valor de `MANYCHAT_SECRET`.
   - **Body (JSON):**
     ```json
     { "contact_id": "{{contact_id}}", "ig_username": "{{instagram_username}}" }
     ```
     Inserta las variables con el selector de variables del editor. No las escribas a mano: así ManyChat pone el nombre exacto de cada campo.
   - **Test Request:** revisa en la pestaña *Response* que llegue `{"token": "...", "url": "..."}`.
   - **Response mapping:** `$.token` → `lead_token` y `$.url` → `link_diagnostico`.
3. Mensaje siguiente, con un **botón** tipo URL:
   - Texto, por ejemplo: "Aquí haces tu diagnóstico, toma unos 3 minutos".
   - URL del botón: `https://diagnostico.tudominio.com/?t=` + el campo `lead_token` (insertado con el selector).
4. **Condición de seguridad:** si `lead_token` está vacío (el Worker falló o tardó más de 10 s), manda un mensaje de respaldo y avisa al setter, **sin** botón roto.
5. Prueba con tu propia cuenta. Abre el link y confirma que el `?t=` coincide con lo guardado en `leads.token`.

[OFICIAL: [ManyChat External Request](https://help.manychat.com/hc/en-us/articles/14281285374364-Dev-Tools-External-request): mapeo con JSONPath, límite de 10 s]

### 11.5 Lo que hace la página

```html
<script>
  const API = "https://api.tudominio.com";
  const t = new URLSearchParams(location.search).get("t");   // el token del link

  // Paso 1: nombre + email + checkbox de autorización (sin marcar por defecto)
  async function enviarInicio(name, email, consent) {
    const r = await fetch(API + "/api/start", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ t, name, email, consent })
    });
    if (!r.ok) throw new Error((await r.json()).error);  // invalid_token → "pide un link nuevo por Instagram"
  }

  // Paso 2: calculadora
  async function enviarCalculo(inputs, result) {
    await fetch(API + "/api/calc", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ t, inputs, result })
    });
  }
</script>
```
- Si el link llega sin `t` o con un token vencido, la página no debe fallar sin decir nada. Debe mostrar: "Este link venció, escríbenos 'DIAGNÓSTICO' por Instagram y te mandamos uno nuevo".
- **No uses un analytics de terceros que guarde la URL completa** si te preocupa que el token quede en registros ajenos. Si lo usas, quita el `t` de la URL después de leerlo: `history.replaceState(null, "", location.pathname)`.

---

## 12. Verificación en Meta: qué existe, para qué sirve y qué no hace

Hay **tres cosas distintas** que se suelen confundir:

| | Qué es | Cómo se hace | Qué aporta | Qué NO está documentado que haga |
|---|---|---|---|---|
| **Verificación de dominio** | Demostrar que `tudominio.com` es de tu portafolio comercial | Meta Business Suite → Configuración → **Seguridad de la marca → Dominios → Agregar**. Tres métodos: **registro DNS TXT** (el más fácil con Cloudflare: DNS → Add record → TXT), meta-tag en el `<head>` de la página principal o archivo HTML en la raíz. | Solo tú controlas cómo se ven las vistas previas de tus links y evitas que otros abusen de tu dominio. | Meta no dice que baje el riesgo de spam en DMs. Es buena práctica, no un escudo. |
| **Verificación del negocio** | Demostrar que la empresa existe legalmente | Business Suite → Configuración → **Centro de seguridad → Verificación del negocio**. Pide razón social, dirección, teléfono y documentos (en Colombia, normalmente Cámara de Comercio o RUT). | Habilita funciones que la exigen, como límites más altos en la API de WhatsApp. Le da a Meta información verificada del negocio. | Tampoco pone insignia visible en Instagram. |
| **Meta Verified para empresas** | Suscripción paga que pone la **insignia azul** en el perfil | Desde la app o Business Suite, si tu cuenta es elegible en tu país. | Es lo único que **el usuario ve** como señal de confianza. Incluye protección contra suplantación y soporte. | La disponibilidad y el precio en Colombia para Instagram no están confirmados en fuentes oficiales que haya podido revisar. TechCrunch sí confirma el lanzamiento en **WhatsApp Business** en Colombia (2024). Revisa en la app si te aparece. |

**Orden recomendado:**
1. Dominio. Es gratis y toma 10 minutos con el TXT en Cloudflare. Meta indica que puede tardar hasta 72 h en propagarse.
2. Negocio.
3. Meta Verified, si aparece disponible y el precio te hace sentido.

Fuentes: [Meta: verificar dominio](https://en-gb.facebook.com/business/help/321167023127050), [Meta: sobre la verificación de dominio](https://www.facebook.com/business/help/286768115176155), [Meta: verificación del negocio](https://www.facebook.com/business/help/2058515294227817), [Meta Verified](https://www.meta.com/meta-verified/), [TechCrunch: Meta Verified WhatsApp Business en Colombia](https://techcrunch.com/2024/06/06/meta-rolls-out-meta-verified-for-whatsapp-business-users-in-brazil-india-indonesia-and-colombia/).

**Una sugerencia de confianza que no depende de Meta:** usa un **subdominio de tu marca** (`diagnostico.tumarca.com`), el mismo que aparece en tu bio y en tus anuncios. Que el link coincida con lo que la persona ya vio reduce la desconfianza, y con ella los reportes, que son el riesgo real (sección 8.1).

---

## 13. Envío manual: el setter manda el link desde Instagram, sin bot

Si el setter escribe a mano (app de Instagram o bandeja de ManyChat), también necesita un link **distinto para cada lead**. La solución: una **página interna** en tu mismo Worker (`/setter`) donde el setter escribe el @ del lead y obtiene el link ya copiado.

### 13.1 Cómo funciona

```
Lead escribe la palabra clave  →  tu Worker actual guarda el lead (con su @)
Setter conversa y filtra a mano
Setter abre  https://api.tudominio.com/setter   (en el celular o en el computador)
   escribe  @maria.lopez_   →  toca "Generar y copiar"
   el Worker busca ese @ en Supabase, crea el token (o reutiliza el vigente)
   y devuelve  https://diagnostico.tudominio.com/?t=ZDP-gSDoeZuM   (ya copiado)
Setter lo pega en el chat de Instagram con su mensaje
```

- **Por qué aquí sí se usa el @:** lo escribe **el setter**, que está viendo el chat, no el lead. El riesgo de que cambie en esos minutos es mínimo, y el lead nunca tiene que escribirlo.
- **Si el @ no estaba en la base** (por ejemplo, tu Worker no lo guardó), la página crea el lead y te avisa.
- **Si ya tenía un link vigente**, devuelve el mismo. Así no hay dos links para la misma persona.

Probado con Node 22 contra un Supabase simulado:
- sin la clave del setter → rechazado;
- encuentra el lead aunque se escriba `@Maria.Lopez_` con arroba y mayúsculas;
- reutiliza el token vigente;
- crea el lead si no existe;
- rechaza un @ inválido;
- el link del setter funciona en la calculadora.

**No lo probé contra tu Supabase real.**

### 13.2 Qué hay que configurar

```sql
-- Un lead creado por el setter puede no tener contact_id de ManyChat
alter table leads alter column manychat_contact_id drop not null;
-- Guardar el @ normalizado (sin @, en minúsculas) para que la búsqueda coincida
update leads set ig_username = lower(ltrim(trim(ig_username), '@')) where ig_username is not null;
create index if not exists leads_ig_idx on leads (ig_username);
```
- **Tu Worker actual** debe guardar el @ de la misma forma a partir de ahora: sin `@` y en minúsculas.
- **Nuevo secreto:** `wrangler secret put SETTER_SECRET`, una clave distinta a la de ManyChat que le das al setter.
- **Recomendado:** pon la ruta `/setter` detrás de **Cloudflare Access** (Zero Trust → Access → Applications). Así solo entran los correos de tu equipo, además de la clave.

### 13.3 El mensaje del setter

Un ejemplo, sin montos ni urgencia, que explica qué es el link:

> Listo, con lo que me contaste te preparé el diagnóstico. Son unas preguntas cortas y al final ves tu resultado:
> https://diagnostico.tudominio.com/?t=ZDP-gSDoeZuM

- **Un solo link por mensaje**, sin acortadores. Varía la redacción entre chats en vez de pegar siempre el mismo texto.
- **En la app de Instagram el link se envía como texto** y se muestra con vista previa, no como botón. Por eso la verificación de dominio (sección 12) y las etiquetas Open Graph de la página (título, descripción e imagen) importan: son lo que el lead ve en esa vista previa.
- **La ventana de 24 h aplica a la API y a las automatizaciones**, no a una persona escribiendo desde la app. Aun así, escribirle a quien no respondió sigue sumando al riesgo de reportes.
