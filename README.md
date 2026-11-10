# Lyric Presenter

App de escritorio para proyectar letras de canciones. Tiene un panel de control para el operador y una ventana de proyección que se abre en el proyector o segunda pantalla.

## Tecnologías

Electron, electron-vite, TypeScript, React, Tailwind CSS, Zustand y SQLite (`node:sqlite`, ya viene incluido: no hay que compilar nada).

## Requisitos

- Node.js 24 o superior (`node -v`)
- Git
- Windows 10 u 11

## Primeros pasos

```bash
git clone https://github.com/JS-creat/lyric-presenter.git
cd lyric-presenter
npm install
npm run dev
```

Debe abrirse el panel de control. Para probar la proyección con un solo monitor, pulsa **Abrir proyección**: se abre como una ventana de prueba.

Notas de instalación:
- Los avisos `ERESOLVE` y las "vulnerabilidades" de `npm install` son normales.
- **No ejecutes `npm audit fix --force`**: rompe dependencias del proyecto.
- Los datos de prueba (canciones, imágenes) viven en `%APPDATA%\lyric-presenter`. Borra esa carpeta para empezar de cero.

## Comandos

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Abre la app en modo desarrollo |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm run lint` | Revisa el estilo del código |
| `npm run format` | Da formato al código |
| `npm run build:unpack` | Genera la app en `dist\win-unpacked\` |

## Estructura

```
src/main/             Proceso principal (Node): ventanas, base de datos, archivos
src/preload/          Puente entre main y la interfaz. types.d.ts tiene los tipos compartidos
src/renderer/src/     Interfaz en React
  components/         Componentes de la interfaz
  lib/                Lógica sin interfaz (canciones, temas, importación)
  store.ts            Estado global (Zustand)
```

Regla práctica: lo que es solo interfaz va en `renderer`. Todo lo que toque archivos, base de datos o ventanas pasa por `main`; si tu tarea lo necesita, avísalo en el issue antes de tocarlo.

## Cómo trabajamos con las ramas

### Reglas

1. **Nadie sube directo a `main`.** Todo entra por Pull Request.
2. Una rama por tarea, y cada tarea tiene un issue.
3. Pull Requests pequeños. Si tarda demasiado, hay que partirlo.
4. Cada PR lo revisa y aprueba la otra persona antes de mezclarse.
5. Se mezcla siempre con **Squash and merge**.
6. `main` debe funcionar siempre: si se rompe, se arregla primero.

### Configuración inicial (una sola vez)

```bash
git config branch.main.pushRemote no_push
```

Evita subir a `main` por accidente.

### Flujo de cada tarea

```bash
git switch main && git pull
git switch -c feat/nombre-de-la-tarea
# ...trabaja y haz commits pequeños...
git push -u origin feat/nombre-de-la-tarea
```

Antes de abrir el Pull Request, trae lo nuevo de `main` y revisa que todo pase:

```bash
git fetch && git merge origin/main
npm run typecheck && npm run lint
```

Abre el PR en GitHub y explica qué cambia y cómo probarlo. Cuando se mezcle:

```bash
git switch main && git pull
git branch -D feat/nombre-de-la-tarea
```

### Nombres de ramas

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feat/` | Función nueva | `feat/lista-servicio` |
| `fix/` | Corrección de un error | `fix/cursor-proyeccion` |
| `docs/` | Documentación | `docs/readme` |
| `test/` | Pruebas | `test/parse-estrofas` |
| `chore/` | Mantenimiento | `chore/actualizar-dependencias` |

### Mensajes de commit

Empiezan con el mismo prefijo: `feat: agrega botón de exportar`, `fix: corrige el cursor en la proyección`.

### Archivos delicados

`src/renderer/src/store.ts`, `src/renderer/src/App.tsx` y `src/preload/types.d.ts` los tocan muchas tareas y generan conflictos. Avisa en el issue antes de editarlos y haz cambios cortos.

### Qué no hacer

- No subas `node_modules`, `out`, `dist` ni archivos `.db`.
- No uses `git push --force` en ramas compartidas.
- No ejecutes `npm audit fix --force`.
- No mezcles un PR propio sin revisión.

## Antes de pedir revisión

- [ ] `npm run typecheck` y `npm run lint` pasan.
- [ ] Probé el cambio con `npm run dev`.
- [ ] El PR explica qué cambia y cómo probarlo.

## ¿Dudas?

Escribe en el issue de la tarea o pregunta antes de empezar algo grande.