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
