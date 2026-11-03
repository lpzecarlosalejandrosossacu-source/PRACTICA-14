# PRACTICA-14: Ratón al queso - Misión Cóndor

Juego 3D desarrollado con React, Three.js, `@react-three/fiber` y `@react-three/drei`.

## Integrantes y Distribución de Trabajo
- **Carlos Alejandro Sossa** (`lpze.carlosalejandro.sossa.cu@unifranz.edu.bo`):
  - Lógica del juego y componentes React (`src/App.jsx`, `src/main.jsx`).
  - Rama: `main` / `rama-carlos`
- **Christian Yamil Aguilar** (`lpze.christianyamil.aguilar.ch@unifranz.edu.bo`):
  - Diseño y estilos visuales de la interfaz (`src/styles.css`).
  - Rama: `rama-christian`


## Abrir en Visual Studio Code

1. Abre esta carpeta con **File > Open Folder**.
2. Abre la terminal integrada con ``Ctrl + ñ``.
3. Instala las dependencias: `npm install`.
4. Ejecuta: `npm run dev`.
5. Abre la dirección que aparezca, normalmente `http://localhost:5173`.

## Controles

- `W`, `A`, `S`, `D` o flechas: mover el ratón.
- Arrastrar con el mouse: girar la cámara para mirar la escena.
- Botón **Reiniciar partida**: volver a A sin sumar un choque.

## Cómo explicarlo en la defensa

- `Canvas` crea el lienzo 3D. Viene de `@react-three/fiber`, que permite escribir objetos Three.js como componentes React.
- `OrbitControls` y `Text` vienen de `@react-three/drei`; sirven para mover la cámara y poner los textos 3D sin programarlos desde cero.
- `Player` escucha el teclado y, en cada cuadro, calcula la siguiente posición del ratón.
- `Obstacle` cambia su posición con `Math.sin(...)` en cada cuadro; por eso los tres bloques se mueven a velocidades distintas.
- Para saber si hay choque, se mide la distancia horizontal entre el ratón y cada obstáculo. Si es menor que sus radios sumados, se suma un choque y el ratón vuelve a A.
- Si la distancia al queso es pequeña, aparece el mensaje de victoria.

## Archivos principales

- `src/App.jsx`: componentes del juego y toda la lógica.
- `src/styles.css`: interfaz sobre el juego 3D.
- `src/main.jsx`: arranque de React.
