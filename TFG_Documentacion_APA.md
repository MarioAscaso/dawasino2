# Estructura del Documento TFG - dawCasino2 (Formato APA 7ª Edición)

> **Nota para el estudiante**: Copia y pega el contenido de este archivo en tu documento Word (`Plantilla Proyecto.docx`). Asegúrate de que tu Word tiene configurada la fuente (ej. Times New Roman 12, Arial 11), doble interlineado, sangría en la primera línea de cada párrafo (1.27 cm) y márgenes de 2.54 cm en todos los lados, tal como exige la normativa APA 7.

---

## [Página de Portada]
**Título del proyecto**: dawCasino2: Plataforma Web Full-Stack para Juegos de Azar en Línea
**Nombre del Autor**: [Tu Nombre y Apellidos]
**Nombre de la Institución**: [Nombre de tu Instituto/Centro de FP]
**Nombre del Ciclo**: Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)
**Nombre del Tutor/a**: [Nombre de tu tutor/a]
**Fecha**: [Fecha de entrega]

---

## Resumen

El presente Trabajo de Fin de Grado describe el diseño y desarrollo de `dawCasino2`, una plataforma web interactiva de juegos de azar simulados. El proyecto ha sido desarrollado utilizando un enfoque Full-Stack, empleando Java 21 y Spring Boot en el backend para gestionar la lógica de negocio, la seguridad y la persistencia de datos mediante Spring Data JPA y MySQL. En el frontend, se ha implementado una arquitectura basada en tecnologías web estándar (HTML5, CSS3, JavaScript "Vanilla") para garantizar un alto rendimiento y modularidad sin depender de frameworks pesados. El resultado es una aplicación segura, escalable y dockerizada, que permite a los usuarios registrarse, autenticarse y participar en distintos juegos como la Ruleta y el Blackjack de manera interactiva.

**Palabras clave**: Desarrollo Web, Spring Boot, Java, JavaScript, Docker, Full-Stack, Casino en línea.

---

## Abstract

This Final Degree Project describes the design and development of `dawCasino2`, an interactive web platform for simulated gambling games. The project has been developed using a Full-Stack approach, employing Java 21 and Spring Boot on the backend to manage business logic, security, and data persistence through Spring Data JPA and MySQL. On the frontend, an architecture based on standard web technologies (HTML5, CSS3, "Vanilla" JavaScript) has been implemented to ensure high performance and modularity without relying on heavy frameworks. The result is a secure, scalable, and dockerized application that allows users to register, authenticate, and participate in various games such as Roulette and Blackjack interactively.

**Keywords**: Web Development, Spring Boot, Java, JavaScript, Docker, Full-Stack, Online Casino.

---

## 1. Introducción

### 1.1 Contexto y Motivación
[Explica aquí por qué decidiste hacer un casino. Por ejemplo: La industria del entretenimiento en línea ha crecido exponencialmente. Este proyecto nace de la motivación por aplicar los conocimientos adquiridos durante el ciclo de DAW en un entorno complejo que requiere sincronización en tiempo real, seguridad y una interfaz atractiva.]

### 1.2 Objetivos del Proyecto
**Objetivo General:**
Desarrollar una aplicación web Full-Stack funcional que simule un entorno de casino en línea seguro y modular.

**Objetivos Específicos:**
*   Implementar una API REST robusta utilizando Spring Boot.
*   Diseñar una base de datos relacional para gestionar usuarios y estados de los juegos.
*   Construir una interfaz de usuario interactiva y modular usando HTML, CSS y JavaScript puro.
*   Garantizar la seguridad de la aplicación mediante autenticación (Spring Security).
*   Desplegar el entorno de manera aislada utilizando Docker y Docker Compose.

---

## 2. Marco Tecnológico

Para el desarrollo de `dawCasino2` se han seleccionado tecnologías modernas y ampliamente utilizadas en la industria:

### 2.1 Backend
*   **Java 21**: Lenguaje de programación principal, aprovechando sus últimas características de rendimiento.
*   **Spring Boot 4.0.2**: Framework principal que simplifica la configuración y el desarrollo de la API REST.
*   **Spring Data JPA e Hibernate**: Para el mapeo objeto-relacional (ORM) y la comunicación ágil con la base de datos.
*   **Spring Security**: Para proteger las rutas y gestionar la autenticación de los usuarios.

### 2.2 Frontend
*   **HTML5 y CSS3**: Para la estructura semántica y el diseño visual responsivo.
*   **Vanilla JavaScript (ES6+)**: Se ha optado por no usar frameworks (como React o Angular) para demostrar un dominio profundo del DOM y la lógica asíncrona (Fetch API) nativa del navegador.

### 2.3 Base de Datos y DevOps
*   **MySQL 8.0**: Sistema de gestión de bases de datos relacional para persistir la información de los usuarios.
*   **Docker y Docker Compose**: Utilizados para la contenerización de la aplicación, definiendo tres servicios distintos (Base de datos, Backend y servidor web Nginx para el Frontend) para un despliegue homogéneo.

---

## 3. Análisis y Diseño de la Arquitectura

### 3.1 Arquitectura del Sistema
El sistema sigue una arquitectura cliente-servidor tradicional dividida en tres capas contenedorizadas:
1.  **Capa de Presentación (Frontend)**: Servida por Nginx, compuesta por módulos estáticos.
2.  **Capa de Lógica de Negocio (Backend)**: Expone endpoints RESTful.
3.  **Capa de Datos**: Servidor MySQL.

### 3.2 Estructura del Proyecto
El proyecto está dividido en dos grandes repositorios/carpetas:
*   `dawCasino2Front`: Estructurado por componentes lógicos de interfaz (`blackjack`, `roulette`, `login`, `register`, `userPage`).
*   `dawCasino2Back`: Organizado por dominios de aplicación (`games` y `user`).

---

## 4. Desarrollo e Implementación

### 4.1 Desarrollo del Backend
[Explica aquí cómo creaste los controladores, servicios y repositorios. Menciona la configuración en `application.properties` y cómo manejas las contraseñas.]

### 4.2 Desarrollo del Frontend
[Describe cómo te conectas al backend desde Javascript usando `fetch()`. Menciona cómo manejas el estado del juego en el cliente.]

### 4.3 Dockerización
Para solventar los problemas de despliegue, el proyecto fue dockerizado creando una orquestación con `docker-compose.yml`. El backend se compila mediante un contenedor intermedio de Maven (Multi-stage build) y el frontend se empaqueta en un servidor Nginx ligero (Alpine).

---

## 5. Pruebas y Resultados

[Aquí debes incluir capturas de pantalla de tu aplicación funcionando. Explica qué pruebas has hecho: registro exitoso, login, jugar una partida de blackjack o ruleta. También puedes mencionar si has hecho pruebas en Postman para la API.]

---

## 6. Conclusiones y Trabajo Futuro

### 6.1 Conclusiones
El desarrollo de `dawCasino2` ha permitido consolidar los conocimientos adquiridos en el ciclo formativo de DAW. Se ha logrado crear un sistema estable, seguro y modular que cumple con los objetivos iniciales. La decisión de utilizar Vanilla JS en el frontend fortaleció el entendimiento de las bases de la web, mientras que Spring Boot demostró ser una herramienta excepcionalmente robusta para el backend.

### 6.2 Posibles Mejoras (Trabajo Futuro)
*   Integración de WebSockets para una experiencia multijugador en tiempo real.
*   Refactorización del frontend hacia un framework como React o Vue si la complejidad aumenta.
*   Implementación de pasarelas de pago simuladas (Stripe API).

---

## Referencias

> **Nota sobre referencias**: Deben ir con sangría francesa. Aquí tienes ejemplos de cómo citar las tecnologías usadas.

García, M. (2023). *Guía de Spring Boot 3 y Java 21*. Ediciones Técnicas.
Oracle. (2024). *Java Documentation*. Recuperado de https://docs.oracle.com/en/java/
Spring. (2024). *Spring Boot Reference Guide*. Recuperado de https://docs.spring.io/spring-boot/
Docker Inc. (2024). *Docker Compose Documentation*. Recuperado de https://docs.docker.com/compose/
MDN Web Docs. (2024). *JavaScript*. Mozilla Foundation. Recuperado de https://developer.mozilla.org/es/docs/Web/JavaScript
