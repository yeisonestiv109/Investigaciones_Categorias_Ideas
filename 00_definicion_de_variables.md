# Definición de variables · Fase 1

**Estado:** propuesta construida con lo que contó el fundador. Falta confirmar dos decisiones (sección 6).
**Fecha:** octubre de 2026.

---

## 1. La idea, en limpio

**De dónde nace:** del propio fundador. Trabaja duro, incluso con IA, y siente que no avanza rápido. No logra ver sus cuellos de botella. "La IA me ahorró mucho tiempo" no le sirve: quiere saber **cuánto exactamente** y verlo reflejado en sus resultados.

**La creencia de fondo:** trabajar duro no es proporcional a los resultados. Lo que no se mide no se puede mejorar, y el mejor método no sirve si no se vuelve hábito.

**Idea en una frase (borrador):**
> Ayudo a emprendedores que trabajan duro pero no ven resultados a **medir con números exactos en qué se les van el tiempo y el dinero**, encontrar su verdadero cuello de botella y **convertir el método en hábito en 66 días**.

**Por qué el diagnóstico une todo:** los dolores del perfil son muy distintos entre sí (no tiene plan, se abruma con información, no usa bien la IA, no delega, investiga mal). Eso no es un problema: cada persona tiene un cuello de botella diferente, y **la medición es lo que dice cuál es el de cada uno**. El diagnóstico es la puerta de entrada; el hábito es lo que sostiene el resultado.

## 2. Los activos que se atacan

Dinero que se genera, dinero que se ahorra y tiempo que se ahorra. Para que la promesa sea clara, se recomienda separar así:

| Rol | Métrica | Por qué |
|---|---|---|
| **Se mide y se garantiza** | Horas recuperadas, y **% del tiempo dedicado a tareas que generan ingresos** | Depende del cliente y del método, y se puede medir en 66 días. |
| **Se mide y se reporta, pero no se garantiza** | Ingresos y gastos | Dependen también del mercado, así que garantizarlos es arriesgado. |

El "% del tiempo en tareas que generan ingresos" conecta directamente con la creencia central: trabajar duro no es lo mismo que trabajar en lo que produce resultados.

## 3. Sobre los 66 días

No es un número mágico: tiene respaldo. Sale del estudio de Lally y colegas (University College London, 2010, *European Journal of Social Psychology*), donde **la mediana para que un hábito se vuelva automático fue de 66 días**, con un rango de 18 a 254 según la persona y el hábito.
- **Úsalo como "basado en un estudio"**, no como número mágico. Es más creíble.
- **Ojo:** es una mediana, no una garantía para cada persona.

## 4. Las variables

### [PAÍS / REGIÓN]
**Colombia.**

### [CATEGORÍA] para investigar en la Fase 1
> **Productividad emprendedora** (productividad para emprendedores)

Alcance para el prompt: cómo los emprendedores en Colombia manejan su tiempo, foco, uso de la IA, delegación y prioridades, y qué compran para mejorarlo: mentorías, coaching de negocios, cursos, comunidades y herramientas.

**Importante, son dos categorías distintas:**
- **La categoría que se investiga** es el terreno que ya existe, con las palabras que el mercado usa hoy. Es la de arriba.
- **La categoría que vas a ser dueño** es el nombre propio de tu posicionamiento. Se define en fases posteriores, ya con evidencia. Hipótesis de dos palabras para ese momento: **Productividad medible**, **Rendimiento medible** o **Diagnóstico productivo**.

### [PERFIL DE CLIENTE]
> **Emprendedor en Colombia que ya factura y usa IA a diario, trabaja muy duro pero sus ingresos no reflejan su esfuerzo.** (Ajustado con el barrido de `01_barrido_dolor_comun.md`.) No tiene un plan definido y siente que en vez de avanzar retrocede. Está abrumado de información y de cosas nuevas cada día, no usa la IA de forma eficiente, no sabe delegar, y una mala investigación le cuesta tiempo y dinero. Sabe qué tiene que hacer, pero no logra "despegar".

## 5. Riesgos honestos

1. **El perfil se parece mucho al fundador.** Eso es una ventaja, porque entiende el dolor desde adentro, pero también es un sesgo de proyección: no todos lo sienten igual ni pagarían por resolverlo. Se corrige con 10 a 15 entrevistas a emprendedores reales.
2. **Quien más sufre el problema puede ser quien menos puede pagar.** Un emprendedor que todavía no vende rara vez paga un ticket alto. Por eso la decisión A de la sección 6.
3. **Todavía no hay resultados demostrados.** Para asentar la idea, y no solo validarla, el camino es:
   - **Caso 0:** el fundador se aplica el método 66 días con números reales.
   - **Casos 1 a 5:** emprendedores con precio de lanzamiento, a cambio de usar sus resultados.
   - **Después:** ticket alto con garantía, ya con pruebas.
4. **Los cuatro imperios y "los problemas del alma"** van como parte del método, no como la promesa principal. Si encabezan la promesa, la categoría se va a "desarrollo personal", que está más saturada y es menos medible.

## 6. Decisiones que faltan

- **A. ¿El emprendedor ya factura o todavía no?** Se recomienda **"ya factura"**, por la capacidad de pago. Los dos prompts piden comparar ambos casos para que decida la evidencia.
- **B. Nombre de la categoría para investigar:** "Productividad emprendedora" (recomendada) o "Productividad con IA" (más de moda y más competida).

## 7. Prompts listos

### Prompt 1: categoría y tendencia

```
Actúa como analista de mercado senior. Investiga la categoría «Productividad emprendedora»
(productividad para emprendedores) para el mercado de Colombia.

Alcance: cómo los emprendedores manejan su tiempo, su foco, el uso de la IA, la delegación
y sus prioridades, y qué compran hoy para mejorarlo (mentorías, coaching de negocios, cursos,
comunidades y herramientas).

Quiero entender:
1. Qué está pasando ahora mismo en esta categoría (hechos y señales recientes).
2. Hacia dónde va la tendencia en los próximos 12–24 meses.
3. Qué tan madura está: naciente, en crecimiento o saturada — con señales concretas que lo
   justifiquen. Da UN solo veredicto y dime si llego temprano, a tiempo o tarde.
4. Los principales players y referentes en Colombia y en español, con su formato (curso,
   mentoría, comunidad, programa) y su precio cuando sea público.
5. El vocabulario y los términos que usa el mercado, incluyendo lo que se busca en Google
   en Colombia.
6. Si existe una oferta que mida con números exactos el tiempo y los resultados del
   emprendedor (horas recuperadas, % del tiempo en tareas que generan ingresos, y si la IA
   le ahorra tiempo neto o se le va en corregir), o si eso es un hueco. Incluye las
   mentorías públicas gratuitas (Alcaldía de Bogotá, Cámara de Comercio) y los métodos
   de auditoría de tiempo (por ejemplo, Buy Back Your Time de Dan Martell).
7. Quién tiene más capacidad de pagar un acompañamiento de ticket alto: el emprendedor que
   ya factura o el que todavía no vende.

Distingue hechos de opiniones y cita fuentes cuando puedas. Si algo no se puede verificar,
dilo. Separa los datos de Colombia de los globales, y advierte cuando un dato venga de una
empresa que vende en la categoría.

Entrega: un resumen ejecutivo de 1 página + una tabla de «señales de madurez».
```

### Prompt 2: voz del cliente (después de revisar la salida del 1)

```
Actúa como investigador de «voz del cliente» (VoC). Para el perfil «emprendedor en Colombia
que ya factura y usa IA a diario, trabaja muy duro, pero sus ingresos no reflejan su esfuerzo»
dentro de la categoría «Productividad emprendedora», quiero un mapa de su lenguaje real.

Basándote en reseñas, foros (Reddit, grupos de Facebook, etc.), comentarios y preguntas
frecuentes, con prioridad para fuentes en español de Colombia y después de Latinoamérica:
1. Sus dolores, en frases textuales (entre comillas).
2. Sus deseos y aspiraciones.
3. Sus objeciones y desconfianzas, en especial hacia mentores, coaches y gurús.
4. Qué soluciones ya probaron y por qué las abandonaron.
5. Qué los detonó a buscar ayuda (qué les pasó).

Tengo estas hipótesis. Confírmalas o refútalas con evidencia, y repórtame también lo que las
contradiga:
- «Trabajo duro pero no avanzo; siento que retrocedo».
- «Sé que la IA me ahorra tiempo, pero no sé cuánto ni si se refleja en mis resultados».
- «Me abruma tanta información y tantas cosas nuevas cada día».
- «No sé delegar».
- «Uso la IA todos los días, pero se me va tiempo corrigiendo lo que hace».

Agrupa por tema y marca las 5 frases más repetidas. No inventes citas; si no hay evidencia,
indícalo. Indica el país y el idioma de cada cita.
```
