# 📖 Guía para contribuidores — Resistencia de Materiales UNI

> **¿Eres nuevo en el proyecto?** Esta guía te explica todo lo que necesitas para agregar contenido al curso. No necesitas saber React ni programación — solo Markdown.

---

## Tabla de contenidos

- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [¿Cómo agregar contenido?](#cómo-agregar-contenido)
- [Sintaxis MDX](#sintaxis-mdx)
- [Componentes disponibles](#componentes-disponibles)
- [Imágenes](#imágenes)
- [Ecuaciones con LaTeX](#ecuaciones-con-latex)
- [Tablas](#tablas)
- [Ejemplo completo de un tema](#ejemplo-completo-de-un-tema)
- [Previsualizar tu contenido](#previsualizar-tu-contenido)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Requisitos previos

Solo necesitas tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| **Node.js** | 18 o superior | [nodejs.org](https://nodejs.org/) |
| **npm** | Viene con Node.js | — |
| **Git** | Cualquiera | [git-scm.com](https://git-scm.com/) |

Un editor de texto como [VS Code](https://code.visualstudio.com/) es recomendado.

---

## Instalación

```bash
# 1. Clona el repositorio
git clone <URL-del-repositorio>
cd resistencia-materiales

# 2. Instala dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador. ¡Ya puedes ver el curso!

---

## Estructura del proyecto

```
resistencia-materiales/
├── app/                          ← Rutas y páginas (NO tocar)
├── components/                   ← Componentes de la UI (NO tocar)
├── lib/                          ← Utilidades y datos del curso
│   └── course-data.ts            ← 📌 Registrar secciones nuevas aquí
├── src/content/                  ← ⭐ TU CONTENIDO VA AQUÍ
│   └── resistencia/
│       ├── 01-introduccion/
│       │   ├── panorama-del-curso/
│       │   │   └── index.mdx     ← Contenido del tema
│       │   └── unidades-y-dimensiones/
│       │       └── index.mdx
│       ├── 02-esfuerzo-deformacion/
│       │   ├── esfuerzo-normal/
│       │   │   ├── index.mdx     ← Contenido MDX
│       │   │   └── barra-axial.png  ← Imágenes locales
│       │   ├── esfuerzo-cortante/
│       │   │   └── index.mdx
│       │   └── ...
│       └── ...
├── public/                       ← Archivos estáticos (favicon, etc.)
├── package.json
└── README.md                     ← Esta guía
```

### Regla de oro

> **Solo necesitas editar archivos dentro de `src/content/resistencia/`.**
> No necesitas tocar `app/`, `components/`, ni crear páginas React.

---

## ¿Cómo agregar contenido?

### Paso 1 — Crea tu carpeta y archivo

Cada tema tiene su propia carpeta con un archivo `index.mdx` dentro:

```bash
# Ejemplo: agregar contenido sobre Ley de Hooke
mkdir -p src/content/resistencia/02-esfuerzo-deformacion/ley-de-hooke
```

Luego crea el archivo `index.mdx` dentro de esa carpeta.

### Paso 2 — Verifica si la sección ya está registrada

Abre `lib/course-data.ts` y busca si tu sección ya aparece. Por ejemplo:

```ts
{ id: '2.5', title: 'Ley de Hooke', slug: '02-esfuerzo-deformacion/ley-de-hooke' }
```

- ✅ **Si ya existe** → solo crea el archivo `index.mdx` y el sistema lo detecta automáticamente.
- ❌ **Si no existe** → agrégala dentro del capítulo correspondiente:

```ts
{
  number: '02',
  title: 'Esfuerzo y deformación',
  sections: [
    // ... secciones existentes ...
    { id: '2.5', title: 'Ley de Hooke', slug: '02-esfuerzo-deformacion/ley-de-hooke' },  // ← nueva
  ],
},
```

> ⚠️ El `slug` debe coincidir exactamente con la ruta de tu carpeta dentro de `src/content/resistencia/`.

### Paso 3 — Escribe tu contenido

Abre tu `index.mdx` y escribe usando Markdown + los componentes del curso. Mira la sección [Sintaxis MDX](#sintaxis-mdx) y el [Ejemplo completo](#ejemplo-completo-de-un-tema).

### Paso 4 — Previsualiza

```bash
npm run dev
```

Navega a tu sección en el navegador. También puedes usar **Ctrl+K** para buscar tu tema.

---

## Sintaxis MDX

MDX es **Markdown normal** con la capacidad de usar componentes de React. Si sabes Markdown, ya sabes el 90% de MDX.

### Texto básico

```mdx
# Título principal (h1)

## Subtítulo (h2)

### Sub-subtítulo (h3)

Párrafo normal con **negrita**, *cursiva* y `código en línea`.

- Lista con viñetas
- Otro punto
  - Sub-punto

1. Lista numerada
2. Segundo paso
3. Tercer paso

> Cita o bloque destacado

---   ← Línea divisoria
```

### Links

```mdx
[Texto del link](https://ejemplo.com)
```

---

## Componentes disponibles

Estos componentes están disponibles en **todos** los archivos `.mdx` sin necesidad de importarlos. Solo escríbelos directamente:

### `<Definition>` — Definiciones y conceptos clave

```mdx
<Definition>
El **esfuerzo normal** es la intensidad de la fuerza interna
que actúa perpendicularmente a una sección.
</Definition>

<Definition title="Módulo de Young">
Relación entre el esfuerzo y la deformación en la zona elástica.
</Definition>
```

### `<Formula>` — Ecuaciones destacadas

```mdx
<Formula label="Ley de Hooke">
σ = Eε
</Formula>
```

> **Nota:** Para ecuaciones complejas, usa LaTeX dentro de `$$...$$` (ver [Ecuaciones con LaTeX](#ecuaciones-con-latex)).

### `<Example>` — Ejemplos resueltos

```mdx
<Example title="Problema 2.1 — Barra de acero bajo tracción">
Una barra de acero de sección circular está sometida a una
carga axial de **12 kN**. Si su diámetro es de **25 mm**,
determine el esfuerzo normal promedio.

**Datos:**
- P = 12 000 N
- d = 25 mm

**Solución:**

$$
A = \frac{\pi d^2}{4} = \frac{\pi (25)^2}{4} = 490.9 \text{ mm}^2
$$

$$
\sigma = \frac{P}{A} = \frac{12\,000}{490.9} = 24.4 \text{ MPa}
$$
</Example>
```

### `<Problem>` — Problemas propuestos

```mdx
<Problem>
Una varilla de aluminio de 18 mm de diámetro soporta una
carga de compresión de 8 kN. ¿Cuál es el esfuerzo normal
promedio? ¿Es de tracción o de compresión?
</Problem>

<Problem title="Ejercicio 3.5">
Calcule la deformación total de una barra sometida a...
</Problem>
```

### `<Note>` — Notas y observaciones

```mdx
<Note>
Una carga axial produce un estado de esfuerzo uniforme solo
cuando actúa en el centroide del área.
</Note>

<Note title="Importante">
Este resultado solo aplica en el rango elástico del material.
</Note>
```

### `<Image>` — Imágenes con descripción

```mdx
<Image
  src="./barra-axial.png"
  alt="Barra sometida a carga axial"
  caption="Figura 2.1 — Barra prismática bajo tracción"
/>
```

> Coloca tus imágenes en la **misma carpeta** que tu `index.mdx`. Ver sección [Imágenes](#imágenes).

### `<Quiz>` — Preguntas con respuesta oculta

```mdx
<Quiz
  question="¿Qué sucede con el esfuerzo si se duplica el área?"
  answer={<>El esfuerzo se reduce a la mitad, ya que σ = P/A.</>}
/>
```

### `<StressCalculator>` — Calculadora interactiva

```mdx
<StressCalculator />
```

### `<BeamDiagram>` y `<MohrCircle>` — Diagramas interactivos

```mdx
<BeamDiagram />
<MohrCircle />
```

### Resumen rápido

| Componente | Uso | Props opcionales |
|---|---|---|
| `<Definition>` | Definiciones | `title` |
| `<Formula>` | Ecuación destacada | `label` |
| `<Example>` | Ejemplo resuelto | `title` |
| `<Problem>` | Problema propuesto | `title` |
| `<Note>` | Nota/observación | `title` |
| `<Image>` | Imagen con caption | `src` (obligatorio), `alt` (obligatorio), `caption` |
| `<Quiz>` | Pregunta interactiva | `question` (obligatorio), `answer` |
| `<StressCalculator>` | Calculadora σ = P/A | — |
| `<BeamDiagram>` | Diagrama de viga | — |
| `<MohrCircle>` | Círculo de Mohr | — |

---

## Imágenes

### Cómo funciona

Las imágenes se colocan **en la misma carpeta** que tu `index.mdx`. El sistema las sirve automáticamente — **no necesitas copiarlas a otra carpeta**.

```
esfuerzo-normal/
├── index.mdx           ← tu contenido
├── barra-axial.png     ← imagen co-ubicada
├── diagrama.png
└── ejemplo-resuelto.jpg
```

### Uso en MDX

```mdx
<Image
  src="./barra-axial.png"
  alt="Barra sometida a carga axial"
  caption="Figura 2.1 — Barra prismática bajo tracción"
/>
```

También funciona sin el `./`:

```mdx
<Image src="diagrama.png" alt="Diagrama de sección transversal" />
```

### Formatos soportados

| Formato | Extensiones |
|---|---|
| PNG | `.png` |
| JPEG | `.jpg`, `.jpeg` |
| WebP | `.webp` |
| AVIF | `.avif` |
| GIF | `.gif` |
| SVG | `.svg` |

### Recomendaciones

- ✅ Usa rutas relativas: `./mi-imagen.png`
- ✅ Nombra las imágenes descriptivamente: `diagrama-seccion-transversal.png`
- ✅ Usa PNG para diagramas técnicos, JPEG para fotos
- ❌ No uses rutas absolutas del sistema de archivos
- ❌ No necesitas mover imágenes a `public/`

---

## Ecuaciones con LaTeX

El curso soporta ecuaciones matemáticas con LaTeX (renderizadas con KaTeX).

### En línea

Usa un solo `$`:

```mdx
La fórmula del esfuerzo es $\sigma = P/A$ donde $P$ es la fuerza.
```

Resultado: La fórmula del esfuerzo es σ = P/A donde P es la fuerza.

### En bloque (centrada)

Usa doble `$$`:

```mdx
$$
\sigma = \frac{P}{A}
$$
```

### Ejemplos comunes para Resistencia de Materiales

```mdx
<!-- Esfuerzo normal -->
$$
\sigma = \frac{P}{A}
$$

<!-- Ley de Hooke -->
$$
\sigma = E \cdot \varepsilon
$$

<!-- Deformación axial -->
$$
\delta = \frac{PL}{AE}
$$

<!-- Momento de inercia -->
$$
I = \frac{\pi d^4}{64}
$$

<!-- Esfuerzo de flexión -->
$$
\sigma = \frac{Mc}{I}
$$

<!-- Esfuerzo cortante -->
$$
\tau = \frac{VQ}{It}
$$

<!-- Fórmula de Euler -->
$$
P_{cr} = \frac{\pi^2 EI}{L_e^2}
$$

<!-- Círculo de Mohr -->
$$
\sigma_{1,2} = \frac{\sigma_x + \sigma_y}{2} \pm \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}
$$
```

### Referencia rápida de símbolos

| Símbolo | LaTeX | Resultado |
|---|---|---|
| Sigma | `\sigma` | σ |
| Tau | `\tau` | τ |
| Epsilon | `\varepsilon` | ε |
| Delta | `\delta` | δ |
| Pi | `\pi` | π |
| Fracción | `\frac{a}{b}` | a/b |
| Raíz | `\sqrt{x}` | √x |
| Superíndice | `x^2` | x² |
| Subíndice | `x_1` | x₁ |
| Texto en ecuación | `\text{ MPa}` | MPa |
| Espacio fino | `\,` | (espacio) |

---

## Tablas

Usa la sintaxis estándar de Markdown:

```mdx
| Propiedad | Símbolo | Unidades |
|---|---|---|
| Esfuerzo | σ | MPa |
| Fuerza | P | N |
| Área | A | mm² |
| Módulo de Young | E | GPa |
```

---

## Ejemplo completo de un tema

Aquí tienes una plantilla completa que puedes copiar para empezar un tema nuevo:

```mdx
{/*
  Título del tema — Capítulo XX
  Autor: Tu nombre
*/}

# Título del tema

Párrafo introductorio que explica de qué trata este tema y por qué
es importante en resistencia de materiales.

---

## Conceptos fundamentales

Explicación del concepto principal...

<Definition title="Nombre del concepto">
Definición formal del concepto, incluyendo las variables
y su significado físico.
</Definition>

## Ecuación principal

La ecuación fundamental para este tema es:

$$
\sigma = \frac{P}{A}
$$

donde:
- **σ** — esfuerzo normal (MPa)
- **P** — fuerza aplicada (N)
- **A** — área de la sección transversal (mm²)

## Diagrama

<Image
  src="./diagrama-principal.png"
  alt="Descripción del diagrama"
  caption="Figura X.1 — Título del diagrama"
/>

<Note>
Observación importante sobre el concepto o condiciones
de aplicabilidad.
</Note>

## Ejemplo resuelto

<Example title="Problema X.1 — Título descriptivo">
Enunciado del problema con los datos necesarios.

**Datos:**
- Variable₁ = valor
- Variable₂ = valor

**Solución:**

$$
\text{Paso 1: } A = \frac{\pi d^2}{4}
$$

$$
\text{Paso 2: } \sigma = \frac{P}{A}
$$
</Example>

## Problema propuesto

<Problem>
Enunciado del problema para que el estudiante resuelva.
Incluir todos los datos necesarios.
</Problem>

<Quiz
  question="¿Pregunta conceptual sobre el tema?"
  answer={<>Respuesta explicada claramente.</>}
/>
```

---

## Previsualizar tu contenido

```bash
# Inicia el servidor de desarrollo
npm run dev
```

1. Abre **http://localhost:3000** en tu navegador
2. Usa **Ctrl+K** para buscar tu tema
3. Cada vez que guardes tu archivo `.mdx`, la página se actualiza automáticamente

---

## Preguntas frecuentes

### ¿Necesito saber React?
**No.** Solo necesitas saber Markdown (y opcionalmente LaTeX para ecuaciones). Los componentes como `<Definition>` y `<Example>` se usan como etiquetas HTML simples.

### ¿Necesito crear una página React para mi tema?
**No.** Solo crea tu archivo `index.mdx` y el sistema genera la página automáticamente.

### ¿Dónde pongo mis imágenes?
En la **misma carpeta** que tu `index.mdx`. Referéncialas con `<Image src="./mi-imagen.png" alt="..." />`.

### ¿Cómo veo mi contenido en el navegador?
Ejecuta `npm run dev` y navega a `/curso/<tu-slug>`. Ejemplo: si tu archivo está en `src/content/resistencia/02-esfuerzo-deformacion/ley-de-hooke/index.mdx`, la URL es `http://localhost:3000/curso/02-esfuerzo-deformacion/ley-de-hooke`.

### ¿Qué pasa si mi sección aparece como "Próximamente"?
Significa que el slug está registrado en `lib/course-data.ts` pero el archivo `index.mdx` no existe todavía. ¡Créalo!

### ¿Cómo agrego un capítulo completamente nuevo?
Edita `lib/course-data.ts` y agrega un nuevo objeto al array `chapters` con su número, título y secciones.

### ¿Puedo usar HTML normal en mi MDX?
Sí, pero para la mayoría de casos los componentes disponibles (`<Definition>`, `<Example>`, etc.) son suficientes y mantienen el estilo consistente.

### ¿Las ecuaciones se renderizan bien?
Sí, usamos KaTeX. Cualquier expresión LaTeX estándar funciona. Si algo no se ve bien, consulta la [documentación de KaTeX](https://katex.org/docs/supported).

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework web |
| React 19 | Componentes de UI |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| MDX | Contenido del curso |
| KaTeX | Ecuaciones matemáticas |
| Lucide | Íconos |

---

**¿Tienes dudas?** Abre un issue en el repositorio o contacta al equipo del curso.
