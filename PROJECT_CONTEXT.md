Requerimientos
El objetivo de este desafío es desarrollar una aplicación web que permita gestionar un listado de
jugadores de FIFA utilizando Node.js para el backend y Angular para el frontend.
La aplicación deberá conectarse a una base de datos que contiene información sobre jugadores
de fútbol (de ambos géneros) junto con sus habilidades correspondientes. Los datos comprenden
distintas versiones del juego FIFA desde 2015 hasta 2023, por lo que un mismo jugador puede
aparecer en varias ediciones del juego, con variaciones en su edad, versión y habilidades.
Código Base (opcional):
Les proporcionamos un repositorio de ejemplo que incluye una arquitectura ya armada con:
● Frontend en Angular
● Backend en NestJS
● Base de datos MySQL configurada
● Archivos Docker para levantar la solución
Este código base está pensado como un punto de partida. Pueden optar por continuar
desarrollando sobre esta base o, si lo prefieren, comenzar el proyecto desde cero.
Mejoramos la calidad de vida de las personas
y su entorno a través de la tecnología.
Funcionalidades Requeridas:
1. Listado de jugadores:
○ Crear endpoint y pantalla que devuelva un listado de los jugadores paginados y
filtrado por nombre, club, o posición, etc.
○ Implementar la posibilidad de descargar el listado filtrado en formato CSV ( Hint:
xlsx).
2. Obtener información de un solo jugador:
○ Crear endpoint y pantalla que devuelva los detalles de un jugador específico, dado
su ID e implementar algun grafico para mostrar sus skills (Hint: pueden utilizar
Chart.js Radar Chart)
3. Editar la información de un jugador:
○ Crear endpoint y pantalla que permita modificar la información de un jugador
(nombre, posición, club, calificación, nacionalidad y sus skills).
4. Create a vos como jugador:
○ Crear un endpoint que te permita crear un jugador, crear uno con tu nombre y las
skills que quieras.
5. Crear Login:
○ Crear un Login para solo ver la info de forma autenticada
○ Los endpoints del back no deben dar información si no estás logueado
Detalles Técnicos para el desarrollo:
● El backend debe estar construido en Node.js y utilizar un ORM (Ejemplo Sequelize).
● El frontend debe estar construido en Angular.
● Utilizar MySQL como base de datos.
● La aplicación debe incluir validaciones tanto en el frontend como en el backend. (Hint:
Utilizar reactive forms de Angular y express-validator o class-validator en Node.js)
● Manejo adecuado de errores y respuestas de la API. (Hint: Status codes)
● Documentar cómo correr la aplicación y los endpoints disponibles. (Compartir colección de
Postman o implementar Swagger)
● Se debe incluir en el repositorio un archivo docker-compose.yml que permita levantar
toda la aplicación con un solo comando (docker-compose up)
Mejoramos la calidad de vida de las personas
y su entorno a través de la tecnología.
Puntos Extra:
● En la base de datos se almacenan las diferentes habilidades de los jugadores a lo largo de
los años. Se debe desarrollar una pantalla con una línea de tiempo que permita seleccionar
una habilidad específica y visualizar cómo ha variado a lo largo de los años.
● Análisis de Evolución con IA (LangChain): Incorporar a la línea de tiempo un análisis
narrativo automático sobre la trayectoria del jugador. ○ Crear un endpoint que envíe el
historial de habilidades (2015-2023) a un LLM utilizando LangChain. ○ El modelo debe
evaluar la evolución de las métricas (picos, declives o transiciones) y devolver un párrafo
resumen (Ej: "A partir de 2019 se nota una baja en su aceleración, compensada por una
mejora en la visión de juego"). ○ Visualizar este insight generado directamente en la
pantalla de la línea de tiempo del frontend.
● Crear endpoint para cargar un CSV para importar los datos a la base de datos. Implementar
un mecanismo (puede ser un endpoint o un script) para subir un archivo CSV con
información de jugadores y almacenar los datos en la base de datos. Compartir excel de Fifa
de Hombres y Mujeres. (Este es un punto extra, ya se lo damos cargado)
Entrega:
● Se deberá subir el desarrollo a un repositorio personal de github y luego invitar al repo a los
usuarios con permiso de lectura: lorenzo-santex, manuvarelsantex,
drodriguez-santex, razielsantex, luupesado, gastonnieto3211 y mbergallosantex
● Se deberán agregar al repositorio un archivo “readme.md” donde indique todas las
decisiones técnicas y funcionales que han tomado durante el desarrollo del proyecto. A
medida que avancen, creen registros sobre cada decisión, cada uno idealmente en su
propio commit.
● Cargar el link al repositorio en el siguiente buzón de entrega antes del 28/05 a las
23:59: https://forms.gle/h7xhMTjV3BeP97kR6
● Opcionalmente, podrán cargar un video breve a modo de “Demo” mostrando cómo se
desenvuelve el front.
○ Aquí les dejamos una guía ejemplo de cómo armarlo
○ Puede cargarse también la presentación solamente, incluyendo en ese caso
imágenes con vistas del front.
Importante: No se aceptarán entregas que no contemplen todos los requisitos
mencionados anteriormente
Esperamos que puedan aprovechar esta instancia para mostrar los resultados de todo el trabajo
que han realizado durante XAcademy y concluir así una gran experiencia de aprendizaje.
¡Felicitaciones por haber llegado hasta acá y esperamos verlos en la próxima etapa!
Mejoramos la calidad de vida de las personas
y su entorno a través de la tecnología.