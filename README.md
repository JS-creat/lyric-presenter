# Lyric Presenter

App de escritorio para proyectar letras de canciones en iglesias, eventos y karaoke. El operador controla todo desde un panel, y la letra se muestra en una segunda ventana que ocupa el proyector o la pantalla externa.

## Funciones

- **Proyección en segunda pantalla**, con vista previa en vivo y selector de pantalla.
- **Biblioteca de canciones** con búsqueda, organizadas por estrofas (versos, coros, puentes).
- **Editor de canciones** con vista previa de cómo se dividen las estrofas.
- **Importación desde archivos `.txt`**, uno por canción, con detección de etiquetas y de tildes.
- **Lista de servicio:** varios servicios con nombre, con el orden de las canciones y salto rápido entre ellas.
- **Temas:** colores, degradados o imagen de fondo, tipo de letra, tamaño, alineación y sombra.
- **Limpiar y Blackout** para controlar lo que se ve en el proyector.
- Todo funciona **sin internet** y los datos se guardan en el equipo.

## Atajos de teclado

| Tecla              | Acción                                    |
| ------------------ | ----------------------------------------- |
| `→` `↓` `Espacio`  | Siguiente estrofa                         |
| `←` `↑`            | Estrofa anterior                          |
| `Ctrl` + `→` / `←` | Siguiente o anterior canción del servicio |
| `Esc`              | Limpiar el texto (se ve solo el fondo)    |
| `B`                | Blackout (pantalla negra)                 |

## Formato de los archivos `.txt`

- El **nombre del archivo** es el título de la canción.
- Las estrofas se separan con una **línea en blanco**.
- La etiqueta de cada estrofa es opcional: `[Coro]`, o una línea que diga solo `Coro`, `Verso 1`, `Puente:`, etc.

```
Verso 1
Primera línea
Segunda línea

[Coro]
Línea del coro
```

## Tecnologías

Electron, electron-vite, TypeScript, React, Tailwind CSS, Zustand y SQLite (`node:sqlite`, incluido en Node, sin compilar nada).

## Ejecutar el proyecto

Requisitos: Node.js 22 o superior y Windows 10 u 11.

```bash
git clone <URL-del-repositorio>
cd lyric-presenter
npm install
npm run dev
```

> Los avisos de `npm install` sobre dependencias y vulnerabilidades son normales. No ejecutes `npm audit fix --force`, porque rompe dependencias del proyecto.

| Comando                | Para qué sirve                         |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Abre la app en modo desarrollo         |
| `npm run typecheck`    | Revisa los tipos de TypeScript         |
| `npm run lint`         | Revisa el estilo del código            |
| `npm run format`       | Da formato al código                   |
| `npm run build:unpack` | Genera la app en `dist\win-unpacked\`  |
| `npm run build:win`    | Genera además el instalador de Windows |

## Estructura

```
src/main/             Proceso principal: ventanas, base de datos y archivos
src/preload/          Puente entre main y la interfaz; types.d.ts tiene los tipos compartidos
src/renderer/src/     Interfaz en React
  components/         Componentes de la interfaz
  lib/                Lógica sin interfaz (canciones, temas, importación)
  store.ts            Estado global
```

## Datos de la aplicación

Las canciones, los servicios y las imágenes de fondo se guardan en `%APPDATA%\lyric-presenter`. Para empezar de cero, cierra la app y borra esa carpeta.

## Pendiente

- Modo karaoke con resaltado de la línea actual.
- Modo de letras con efecto
- Video de fondo.
- Exportar un respaldo de la biblioteca.
