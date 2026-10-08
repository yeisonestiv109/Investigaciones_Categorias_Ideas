# 08 · Análisis del brief "Automatización para creadores" y preguntas para precisar el problema

**Fecha:** octubre de 2026.
**Insumo:** brief de mercado "Automatización para creadores" (Colombia → Latam, corte 8 oct 2026), generado con la IA a partir del Prompt 1.

---

## 1. Veredicto sobre el brief

**Está bien hecho en la forma y mal enfocado en el fondo.**

### Lo que está bien
- **Etiqueta cada dato** (hecho, estimación, proyección, no verificable) y declara sus límites.
- **Tiene datos de Colombia** y actuales: IAB, Hotmart en Medellín, tarifas de WhatsApp.
- **Da un solo veredicto** de madurez y separa capas: el "comentario→DM" está saturado, y el resto está en crecimiento temprano.
- **Encuentra dos hallazgos muy valiosos** (ver la sección 3).

### Lo que está mal
1. **Investigó la categoría equivocada.** Usó "Automatización para creadores", la propuesta de la investigación 06. La versión vigente (07) es **"Ventas de ticket alto por redes sociales"**, porque tu evidencia real son las citas no calificadas en las ventas de ticket alto de una marca personal. *Esa confusión es en parte mía: la 06 proponía esa categoría y la corregí en la 07.*
2. **La demanda que mide no es la de tu cliente.** Los COP 227.360 millones son lo que las **marcas pagan a influenciadores** por publicidad. Tu cliente no vive de eso: vende formación de ticket alto con setters y closers. Igual con los 650.000 "creadores": la gran mayoría no vende un programa de COP millones. **El tamaño de mercado del brief no es tu mercado.**
3. **Confunde la oferta de herramientas con una oportunidad.** Que entre capital a ManyChat, n8n y Hotmart dice que la capa de herramientas crece **y se llena de gigantes**. Para ti es una señal de **competencia**, no de demanda.
4. **Contar señales (7 de crecimiento, 4 de naciente, 1 de saturación) no es un método.** No todas pesan igual.
5. **No responde lo que más importa para decidir:** quién paga, cuánto, cuáles son las métricas típicas de un embudo de ticket alto (calificación, asistencia, cierre, cobro) y si alguien cobra por resultado. Esas preguntas están en la versión vigente del Prompt 1, que no se usó.

## 2. Qué se puede rescatar

| Hallazgo | Qué significa para ti |
|---|---|
| La capa **comentario→DM está saturada** (8 o más alternativas a ManyChat) | No compitas en **captar** conversaciones. El valor está **después del DM**: calificar, agendar, cerrar, cobrar y medir. |
| **Hotmart lanzó agentes de IA de ventas y de cobro** por WhatsApp en Colombia (jun 2026) | Las plataformas absorben la automatización. **Vender "un bot" te pone a competir con Hotmart y Meta.** El propio brief dice que el espacio libre está en el servicio hecho por ti y en las integraciones locales. |
| **Desde el 1 oct 2026 WhatsApp cobra también las respuestas de servicio** (según Mercately) | Si es así, **cada conversación con alguien que no va a comprar ahora cuesta dinero.** Calificar bien deja de ser un "plus" y pasa a ser ahorro directo. Hay que verificarlo en la documentación de Meta. |
| **No hay un jugador colombiano especializado** | Es un hueco, pero no está verificado. Podría ser oportunidad o señal de que el mercado es chico. |
| Las marcas priorizan **confianza** sobre alcance | Los bots que parecen bots pueden quemar la confianza de una marca de alto valor. Lo humano + los datos vale más. |

## 3. Lo que todavía no sabemos: el problema exacto

"Citas no calificadas" es un **síntoma**. Detrás puede haber cuatro problemas distintos, y cada uno se arregla de forma diferente:

| Hipótesis | Cómo se vería en los datos | Qué lo arregla |
|---|---|---|
| **H1. Llegan personas que no pueden o no quieren pagar** (calificación) | Asisten a la cita, pero no compran por "no tengo el dinero" o "no es para mí" | Precalificar antes de agendar: preguntas, filtros, puntaje del prospecto |
| **H2. Agendan pero no llegan** (asistencia) | Muchas citas agendadas y pocas asistidas | Confirmaciones, recordatorios, menos tiempo entre el agendamiento y la cita |
| **H3. Venden pero no cobran** (cobro) | Ventas altas y dinero cobrado bajo por mora o cancelaciones | Seguimiento de cuotas, medios de pago, contratos |
| **H4. El contenido atrae al público equivocado** (origen) | La mayoría de prospectos viene de contenido viral con poca intención de compra | Medir qué contenido trae a quienes compran y producir más de ese |

**El problema verdadero es la hipótesis que tus datos confirmen.** Por eso las preguntas de abajo.

## 4. Las preguntas correctas

### A. El embudo, con números (últimos 30 días)
1. ¿Cuántas conversaciones nuevas entraron por Instagram y WhatsApp?
2. ¿Cuántas agendaron una cita? ¿Cuántas las agendó el bot y cuántas una persona?
3. ¿Cuántas asistieron a la cita?
4. ¿Cuántas compraron? ¿Cuál es el ticket promedio?
5. ¿Cuántos closers hay y cuántas horas de llamadas hicieron?

### B. La definición
6. Para ustedes, **¿qué es exactamente una "cita calificada"?** ¿Quién lo decide, y antes o después de la llamada?
7. Cuando alguien no compra, **¿se registra la razón?** ¿Cuáles son las 3 más comunes?

### C. El origen
8. ¿De dónde vienen las personas que **sí** compran: un contenido, un anuncio, un referido? ¿Hoy se puede saber?
9. ¿Qué cambió entre los "meses mejores" y este: contenido, pauta, oferta, precio o setter?

### D. El cobro
10. De los cerca de COP 200 millones vendidos y COP 107 millones cobrados, **¿cuánto es cuota que aún no vence y cuánto es mora o cancelación?**
11. ¿Qué formas de pago y de financiación ofrecen? ¿Usan Hotmart u otra plataforma?

### E. El valor
12. **¿Cuánto vale una cita calificada?** Fórmula: ticket promedio × tasa de cierre. Por ejemplo, con un ticket de COP 4 millones y un cierre del 25 %, cada cita calificada vale en promedio COP 1 millón.
13. Si tu sistema sube el cierre en 5 puntos, ¿cuánto dinero más es al mes?

### F. El mercado
14. ¿Tu cliente (o Andrés) conoce 3 a 5 marcas personales de ticket alto en Colombia? ¿Te las presentaría?
15. ¿Alguna de ellas ya pagó a una agencia de setters o a un software, y cómo le fue?

## 5. El clímax (hipótesis a confirmar con los datos)

> **Las marcas personales de ticket alto miden cuánto venden, pero no saben en qué etapa se les escapa el dinero entre el DM y el cobro. Tu negocio: encontrar esa etapa con datos, arreglarla y cobrar por la mejora.**

- **Es tu idea original** (diagnosticar el cuello de botella con datos, sostenerlo con hábito y cobrar por resultado), aplicada a donde hay dinero y datos.
- **No compite con Hotmart ni con ManyChat:** los usa. Tú vendes el resultado, no la herramienta.
- **Tu ventaja es haber sido setter:** conoces el embudo desde adentro, no solo el código.
- **Candidatas de categoría propia (dos palabras):** **Citas calificadas** (si se confirma H1), **Embudo medible** o **Ventas medibles** (si el problema cambia según la marca).

**Riesgo:** sigue siendo una sola marca. El clímax se confirma cuando 3 marcas más digan "no sé dónde se me escapa el dinero" y una acepte pagarte por resultado.
