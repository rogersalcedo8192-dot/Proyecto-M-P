# Roadmap Proyecto-M&P

## Estado actual

La landing ya cuenta con:

- Hero con video de fondo y efectos visuales activos en desktop y mobile.
- Navegacion mobile mejorada con panel tactil mas amplio.
- Widget del bot optimizado para mobile, accesos rapidos y mejor experiencia de chat.
- Carrusel de servicios con movimiento automatico y controles manuales.
- Cinta de canales y herramientas con separacion uniforme y animacion bidireccional.
- Seccion de ofertas/precios en USD con tarjetas responsive.
- Tarjetas de ofertas compactas con detalles desplegables.
- Tarjeta visual con video del rompecabezas y reverso con imagen.
- Branding visual consistente con M&P.
- Formulario multi-paso de leads con consentimiento Habeas Data y backend inicial `POST /api/leads`.

## Servicios publicados

- Creacion de marca y branding: desde $500 USD.
- Landing page de conversion: desde $250 USD.
- Web app custom para operar y vender: desde $1.500 USD.
- Consultoria de automatizacion IA con apps de pago: desde $250 USD.
- App movil o producto digital: desde $1.800 USD.
- Pack de videos y posters IA: desde $250 USD.

## Completado recientemente

- [x] Mejorar efectos visuales en mobile para que se mantengan como en web.
- [x] Igualar distancia entre burbujas de redes sociales y herramientas.
- [x] Animar burbujas en ciclos alternos de izquierda a derecha y derecha a izquierda.
- [x] Mejorar UX/UI del widget del bot en mobile.
- [x] Mejorar navegabilidad mobile.
- [x] Compactar tarjetas del carrusel de servicios en mobile.
- [x] Reactivar movimiento automatico del carrusel en mobile.
- [x] Crear seccion de ofertas/precios con estetica integrada.
- [x] Convertir precios a USD.
- [x] Agregar tarjeta de creacion de marca.
- [x] Agregar tarjeta de automatizacion de WhatsApp e Instagram con IA.
- [x] Unificar videos e imagenes IA tipo poster en un solo pack.
- [x] Separar consultoria de automatizacion IA de la web app custom a medida.
- [x] Compactar tarjetas de ofertas y ocultar detalles hasta que el usuario los despliegue.
- [x] Crear formulario de leads en 3 pasos: contacto, empresa y necesidad/presupuesto.
- [x] Crear backend Node para recibir leads, guardar respaldo local y preparar notificacion por Resend.
- [x] Conectar backend de leads con Postgres mediante `DATABASE_URL`, manteniendo fallback local.

## Fase 1: QA visual y responsive

- Validar la pagina completa en mobile real.
- Revisar que ningun texto se corte en tarjetas de ofertas.
- Revisar que el carrusel de ofertas horizontal se sienta natural en mobile.
- Validar que el widget del bot no tape CTAs importantes.
- Revisar contraste de textos pequenos en tarjetas y chips.
- Probar enlaces `mailto:` de cada oferta.

## Fase 2: Pulido comercial

- Afinar copy de cada servicio para hacerlo mas persuasivo.
- Definir si los precios son "desde" o paquetes cerrados.
- Agregar una nota breve sobre alcance, revisiones y tiempos de entrega.
- Crear CTA alterno hacia WhatsApp para cada oferta.
- Definir si la automatizacion debe ser la oferta recomendada o se mantiene Web App.

## Fase 3: Preparacion tecnica

- Confirmar que todas las rutas de `assets/` y `video/` funcionan.
- Revisar textos con caracteres raros o problemas de codificacion.
- Validar pesos de imagen y video para mejor carga.
- Revisar que no queden referencias rotas en el menu.
- Documentar estructura del proyecto en `README.md`.
- Configurar variables de entorno de Resend para notificaciones de leads.
- Validar en Railway que los leads insertan en Postgres desde el formulario publico.
- Crear tabla `leads` y definir backups/retencion de datos.

## Fase 4: Preparacion para despliegue

- Definir si se desplegara como sitio estatico o con servidor.
- Si es estatico, subir `index.html`, `styles.css`, `script.js`, `assets/` y `video/`.
- Validar rutas relativas para produccion.
- Verificar carga de videos e imagenes desde el hosting.
- Agregar metadatos SEO y Open Graph.

## Fase 5: Mejoras futuras

- Formulario conectado a email, CRM o WhatsApp.
- Analitica y eventos de conversion.
- Bot conectado a una base de conocimiento real de servicios.
- Version en ingles si aplica.
- CMS o panel simple para editar textos, precios y ofertas sin tocar codigo.
- Integracion con Postgres para historico de leads, segmentacion y reporting.
- Integracion con Resend para notificacion interna y autorespuesta al lead.

## Vision operativa: M&P como empresa de agentes IA

Objetivo: evolucionar M&P hacia una operacion donde el humano actua como Director General y Arquitecto, mientras agentes especializados ejecutan tareas repetitivas con supervision humana.

### Estructura propuesta de agentes

- Agente Supervisor / Director: prioriza objetivos, asigna tareas, revisa resultados y escala decisiones sensibles.
- Agente Comercial: responde leads, califica prospectos, agenda reuniones, redacta propuestas base y hace seguimiento.
- Agente de Marketing: analiza oportunidades, redacta campanas, prepara contenido y optimiza mensajes comerciales.
- Agente de Atencion al Cliente: responde preguntas frecuentes, consulta politicas, gestiona incidencias y escala casos complejos.
- Agente de Operaciones / Project Manager: convierte ventas en briefs, tareas, fechas y seguimiento interno.
- Agente de Finanzas: registra pagos, prepara recordatorios, monitorea vencimientos y reporta salud financiera.

### Requisitos para construir esta operacion

- Definir el objetivo central de M&P y los procesos repetitivos por area.
- Documentar servicios, precios, politicas, tiempos, tono de marca, preguntas frecuentes y plantillas.
- Conectar herramientas reales: WhatsApp, correo, calendario, CRM, documentos, formularios y pasarelas de pago.
- Usar una base de conocimiento con RAG para que los agentes respondan con contexto propio de M&P.
- Crear permisos y limites: que puede hacer cada agente, que debe aprobar un humano y que nunca debe ejecutar solo.
- Probar cada flujo en entorno controlado antes de publicarlo hacia clientes.

### Primer MVP recomendado

- Empezar con un Agente Comercial M&P.
- Funciones: responder leads, calificar necesidad/presupuesto/urgencia, recomendar servicio, agendar llamada y guardar datos.
- Indicadores: tiempo de respuesta, leads calificados, reuniones agendadas, propuestas enviadas y conversion.
- Mantener human-in-the-loop para descuentos, cierres importantes, reclamos y entregables finales.

## Checklist inmediato recomendado

- [ ] Revisar la pagina completa en mobile.
- [ ] Validar ofertas/precios con el cliente o equipo comercial.
- [ ] Decidir CTA principal por oferta: correo, WhatsApp o ambos.
- [ ] Probar enlaces de contacto.
- [ ] Revisar performance de videos en mobile.
- [ ] Preparar SEO basico antes del despliegue.
- [ ] Subir a GitHub.
- [ ] Conectar a Railway o hosting estatico.
