# Roadmap Proyecto-M&P

## Estado actual

La landing ya cuenta con:

- Hero con video de fondo
- Visual futurista con fondo interactivo
- Carrusel de servicios
- Cinta de herramientas y canales
- Tarjeta visual con video del rompecabezas y reverso con imagen
- Navegacion mobile mejorada
- Branding visual consistente con M&P

## Fase 1: Limpieza antes de GitHub

- Eliminar archivos que ya no se usan
- Confirmar que todas las rutas de `assets/` y `video/` funcionan
- Revisar textos con caracteres raros o problemas de codificacion
- Verificar que no queden referencias rotas en el menu
- Agregar `.gitignore`
- Crear `README.md` basico del proyecto

## Fase 2: Pulido de producto

- Mejorar textos comerciales para que comuniquen mejor servicios y resultados
- Revisar la seccion mobile completa
- Afinar velocidades y continuidad de las cintas infinitas
- Validar pesos de imagen y video para mejor carga
- Ajustar microinteracciones para que no saturen la experiencia

## Fase 3: Preparacion tecnica

- Inicializar repositorio git
- Primer commit limpio
- Crear repositorio publico: `Proyecto-M&P`
- Subir rama principal a GitHub
- Documentar estructura del proyecto

## Fase 4: Preparacion para Railway

- Definir si se desplegara como sitio estatico o con servidor
- Si es estatico:
  subir `index.html`, `styles.css`, `script.js`, `assets/` y `video/`
- Si requiere backend despues:
  separar frontend y backend desde el inicio
- Validar rutas relativas para produccion
- Verificar carga de videos e imagenes desde Railway

## Fase 5: Mejoras futuras

- Formulario conectado a email, CRM o WhatsApp
- Analitica y eventos de conversion
- SEO basico: Open Graph, favicon final, metadatos limpios
- Version en ingles si aplica
- CMS o panel simple para editar textos sin tocar codigo

## Checklist inmediato recomendado

- [ ] Borrar `script (2).js` si ya no se usa
- [ ] Revisar enlace `#tecnologia` si esa seccion ya no existe
- [ ] Validar todo en mobile
- [ ] Crear `.gitignore`
- [ ] Crear `README.md`
- [ ] Inicializar git
- [ ] Subir a GitHub
- [ ] Conectar a Railway
