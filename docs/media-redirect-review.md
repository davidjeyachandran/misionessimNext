# Media redirect review — /wp-content/uploads/

Generated 2026-08-23 by `yarn build:media-map`.

WordPress is being decommissioned, so every URL below 404s at cutover unless it is redirected. Review the **unresolved** section — those are the ones needing a decision.

| Bucket | Count | Handling |
|---|---:|---|
| VAMOS issue PDFs | 140 | 1:1 → `/revistavamos/<slug>/` |
| Matched to Contentful asset | 151 | 1:1 → asset URL |
| **Unresolved docs** | 12 | **needs a decision** |
| Images | 531 | pattern rule (cannot enumerate) |
| Junk | 5 | let 404 |

## Unresolved — decide these

No VAMOS date and no Contentful asset with a matching filename. Each needs either an upload to Contentful, or a sensible page destination (likely `/recursos/`).

| URL | Type |
|---|---|
| `/wp-content/uploads/2024/11/aniversariosimvamosnov18.pdf` | pdf |
| `/wp-content/uploads/2024/11/asiajunio2013.pdf` | pdf |
| `/wp-content/uploads/2024/11/desarollocomunitariofebrero14.pdf` | pdf |
| `/wp-content/uploads/2024/11/discipuladoenero14_0.pdf` | pdf |
| `/wp-content/uploads/2024/11/idiomayculturadiciembre2012.pdf` | pdf |
| `/wp-content/uploads/2024/11/llamadovamosset14.pdf` | pdf |
| `/wp-content/uploads/2024/11/ocupacion_vamos_0.pdf` | pdf |
| `/wp-content/uploads/2024/11/ocupacion_vamos_1.pdf` | pdf |
| `/wp-content/uploads/2024/11/ocupacion_vamos.pdf` | pdf |
| `/wp-content/uploads/2024/11/pastor_es_clave_vamos.pdf` | pdf |
| `/wp-content/uploads/2024/11/traficohumanovamos.pdf` | pdf |
| `/wp-content/uploads/2026/07/CampanaORA1002-SIMLatinoamerica-2026.pdf` | pdf |

## VAMOS issue PDFs → edition pages

| URL | → | Derived via |
|---|---|---|
| `/wp-content/uploads/2024/11/alianzasvamosjulio14_0.pdf` | `/revistavamos/alianzas-estrategicas/` | month 2014-07 -> "Alianzas Estratégicas" |
| `/wp-content/uploads/2024/11/amorenmisionesvamosjunio19.pdf` | `/revistavamos/amor-en-misiones/` | month 2019-06 -> "Amor en Misiones" |
| `/wp-content/uploads/2024/11/apolgeticavamosoct21.pdf` | `/revistavamos/apologetica/` | month 2021-10 -> "Apologética" |
| `/wp-content/uploads/2024/11/arteenmisionvamosoct19_0.pdf` | `/revistavamos/arte-en-misiones/` | month 2019-10 -> "Arte en misiones" |
| `/wp-content/uploads/2024/11/arteenmisionvamosoct19.pdf` | `/revistavamos/arte-en-misiones/` | month 2019-10 -> "Arte en misiones" |
| `/wp-content/uploads/2024/11/bamvamosoct15.pdf` | `/revistavamos/negocios-como-mision/` | month 2015-10 -> "Negocios Como Misión" |
| `/wp-content/uploads/2024/11/budismovamosdic17.pdf` | `/revistavamos/el-budismo/` | month 2017-12 -> "El Budismo" |
| `/wp-content/uploads/2024/11/capactiacionvamosjunio16.pdf` | `/revistavamos/la-capacitacion-misionera/` | month 2016-06 -> "La capacitación misionera" |
| `/wp-content/uploads/2024/11/conferenciamisioneravamosjun24.pdf` | `/revistavamos/conferencias-misioneras/` | month 2024-06 -> "Conferencias misioneras" |
| `/wp-content/uploads/2024/11/contextualizacionvamosoct16.pdf` | `/revistavamos/la-contextualizacion/` | month 2016-10 -> "La contextualización " |
| `/wp-content/uploads/2024/11/creatividadvamosago14_0.pdf` | `/revistavamos/evangelismo-creativo/` | month 2014-08 -> "Evangelismo Creativo" |
| `/wp-content/uploads/2024/11/creatividadvamosago14.pdf` | `/revistavamos/evangelismo-creativo/` | month 2014-08 -> "Evangelismo Creativo" |
| `/wp-content/uploads/2024/11/crisisvamosago20.pdf` | `/revistavamos/misiones-en-tiempos-de-crisis/` | month 2020-08 -> "Misiones en tiempos de crisis" |
| `/wp-content/uploads/2024/11/cuidadoivamosdic15.pdf` | `/revistavamos/cuidado-integral-del-misionero/` | month 2015-12 -> "Cuidado integral del misionero" |
| `/wp-content/uploads/2024/11/diasporavamosfeb17.pdf` | `/revistavamos/recibiendo-las-naciones-0/` | month 2017-02 -> "Recibiendo a las naciones" |
| `/wp-content/uploads/2024/11/equiposmulticulturalesvamosjun23.pdf` | `/revistavamos/equipos-multiculturales-2024/` | month 2023-06 -> "Equipos multiculturales" |
| `/wp-content/uploads/2024/11/evangelismovamosago16.pdf` | `/revistavamos/evangelismo-eficaz/` | month 2016-08 -> "Evangelismo eficaz" |
| `/wp-content/uploads/2024/11/familiamisioneravamosfeb20.pdf` | `/revistavamos/familias-misioneras/` | month 2020-02 -> "Familias Misioneras" |
| `/wp-content/uploads/2024/11/fondosenmisionvamosdic22.pdf` | `/revistavamos/fondos-misioneros-2022/` | month 2022-12 -> "Fondos Misioneros" |
| `/wp-content/uploads/2024/11/fondosvamosfeb16.pdf` | `/revistavamos/fondos-misioneros/` | month 2016-02 -> "Fondos Misioneros" |
| `/wp-content/uploads/2024/11/fondosvamosoct10.pdf` | `/revistavamos/fondos-y-misiones-orig/` | month 2010-10 -> "Fondos y misiones" |
| `/wp-content/uploads/2024/11/glocalvamosdic14_0.pdf` | `/revistavamos/mision-local-y-global/` | month 2014-12 -> "Misión Local y Global" |
| `/wp-content/uploads/2024/11/glocalvamosdic14.pdf` | `/revistavamos/mision-local-y-global/` | month 2014-12 -> "Misión Local y Global" |
| `/wp-content/uploads/2024/11/grandesnecesidadesvamosfeb18_0.pdf` | `/revistavamos/grandes-necesidades/` | month 2018-02 -> "Grandes Necesidades" |
| `/wp-content/uploads/2024/11/grandesnecesidadesvamosfeb18.pdf` | `/revistavamos/grandes-necesidades/` | month 2018-02 -> "Grandes Necesidades" |
| `/wp-content/uploads/2024/11/hinduismovamosjun21.pdf` | `/revistavamos/hinduismo/` | month 2021-06 -> "Hinduismo" |
| `/wp-content/uploads/2024/11/htcvamosjun20.pdf` | `/revistavamos/hijos-de-la-tercera-cultura/` | month 2020-06 -> "Hijos de la Tercera Cultura" |
| `/wp-content/uploads/2024/11/idiomaculturavamossep22_0.pdf` | `/revistavamos/idioma-y-cultura-2022/` | month 2022-09 -> "Idioma y cultura" |
| `/wp-content/uploads/2024/11/influencersvamosmar24.pdf` | `/revistavamos/soy-influencer/` | month 2024-03 -> "Soy influencer" |
| `/wp-content/uploads/2024/11/islamvamosfeb15_0.pdf` | `/revistavamos/conociendo-el-mundo-musulman/` | month 2015-02 -> "Conociendo el Mundo Musulmán" |
| `/wp-content/uploads/2024/11/islamvamosfeb15.pdf` | `/revistavamos/conociendo-el-mundo-musulman/` | month 2015-02 -> "Conociendo el Mundo Musulmán" |
| `/wp-content/uploads/2024/11/jovenesenmisionvamosoct18_0.pdf` | `/revistavamos/jovenes-en-mision/` | month 2018-10 -> "Jóvenes en mision" |
| `/wp-content/uploads/2024/11/jovenesenmisionvamosoct18.pdf` | `/revistavamos/jovenes-en-mision/` | month 2018-10 -> "Jóvenes en mision" |
| `/wp-content/uploads/2024/11/judaismovamosago18.pdf` | `/revistavamos/judaismo/` | month 2018-08 -> "Judaísmo" |
| `/wp-content/uploads/2024/11/liderazgovamosnov13.pdf` | `/revistavamos/liderazgo-y-capacitacion-de-lideres/` | month 2013-11 -> "Liderazgo Y Capacitación De Líderes" |
| `/wp-content/uploads/2024/11/limitesvamosnov14.pdf` | `/revistavamos/limitaciones-que-no-limitan/` | month 2014-11 -> "Limitaciones que No Limitan" |
| `/wp-content/uploads/2024/11/losquequedanvamosago19.pdf` | `/revistavamos/cuidando-de-los-que-se-quedan/` | month 2019-08 -> "Cuidando de los que se quedan" |
| `/wp-content/uploads/2024/11/matrimoniosvamosoct20.pdf` | `/revistavamos/matrimonio-misionero/` | month 2020-10 -> "Matrimonio misionero" |
| `/wp-content/uploads/2024/11/medioorientevamosabril18.pdf` | `/revistavamos/luz-para-el-medio-oriente/` | month 2018-04 -> "Luz para el Medio Oriente" |
| `/wp-content/uploads/2024/11/mediosenmisionvamosagosto17.pdf` | `/revistavamos/los-medios-en-mision/` | month 2017-08 -> "Los Medios en Misión" |
| `/wp-content/uploads/2024/11/misionesmedicasvamosabril20.pdf` | `/revistavamos/misiones-medicas/` | month 2020-04 -> "Misiones médicas" |
| `/wp-content/uploads/2024/11/misionesurbanasvamosjunio17_0.pdf` | `/revistavamos/misiones-urbanas/` | month 2017-06 -> "Misiones Urbanas" |
| `/wp-content/uploads/2024/11/movilizacionesdiscipuladovamosjago21.pdf` | `/revistavamos/la-movilizacion-es-discipulado/` | month 2021-08 -> "La movilización es discipulado" |
| `/wp-content/uploads/2024/11/movilizacionvamosdic13_0.pdf` | `/revistavamos/la-movilizacion-misionera/` | month 2013-12 -> "La Movilización Misionera" |
| `/wp-content/uploads/2024/11/moviljuventudvamosabril14.pdf` | `/revistavamos/movilizando-la-juventud/` | month 2014-04 -> "Movilizando a la Juventud" |
| `/wp-content/uploads/2024/11/mujeresenmisionvamosdic19_0.pdf` | `/revistavamos/mujeres-en-mision/` | month 2019-12 -> "Mujeres en misión" |
| `/wp-content/uploads/2024/11/noalcanzadosvamossep23.pdf` | `/revistavamos/no-alcanzados/` | month 2023-09 -> "No Alcanzados " |
| `/wp-content/uploads/2024/11/oracionvamosjunio14.pdf` | `/revistavamos/la-oracion/` | month 2014-06 -> "La Oración" |
| `/wp-content/uploads/2024/11/persecucionvamosmayo14.pdf` | `/revistavamos/persecucion/` | month 2014-05 -> "Persecución" |
| `/wp-content/uploads/2024/11/plantacionvamosjunio18.pdf` | `/revistavamos/plantacion-de-iglesias/` | month 2018-06 -> "Plantación de Iglesias" |
| `/wp-content/uploads/2024/11/procesosvamosdic20_0.pdf` | `/revistavamos/envio-responsable/` | month 2020-12 -> "Envío responsable " |
| `/wp-content/uploads/2024/11/regresoacasavamosdic23.pdf` | `/revistavamos/regresando-a-casa/` | month 2023-12 -> "Regresando a casa" |
| `/wp-content/uploads/2024/11/saludmentalvamosfeb21.pdf` | `/revistavamos/salud-mental/` | month 2021-02 -> "Salud Mental" |
| `/wp-content/uploads/2024/11/solteriavamosabr16_0.pdf` | `/revistavamos/la-solteria-un-regalo/` | month 2016-04 -> "La soltería, un regalo" |
| `/wp-content/uploads/2024/11/tecnologiavamosabr21.pdf` | `/revistavamos/tecnologia-en-misiones/` | month 2021-04 -> "Tecnología en misiones" |
| `/wp-content/uploads/2024/11/trabajoequipovamosabril19.pdf` | `/revistavamos/trabajo-en-equipo/` | month 2019-04 -> "Trabajo en Equipo" |
| `/wp-content/uploads/2024/11/trabajoyfevamosjunio22.pdf` | `/revistavamos/tu-trabajo-en-el-reino/` | month 2022-06 -> "Tu trabajo en el Reino" |
| `/wp-content/uploads/2024/11/traduccionvamosoct17_0.pdf` | `/revistavamos/traduccion-bibilica/` | month 2017-10 -> "Traducción Biblica" |
| `/wp-content/uploads/2024/11/traduccionvamosoct17.pdf` | `/revistavamos/traduccion-bibilica/` | month 2017-10 -> "Traducción Biblica" |
| `/wp-content/uploads/2024/11/transicionesvamosmar23.pdf` | `/revistavamos/termina-bien/` | month 2023-03 -> "Termina Bien" |
| `/wp-content/uploads/2024/11/vamosabr2010.pdf` | `/revistavamos/misiones-en-zonas-de-conflicto/` | month 2010-04 -> "Misiones en zonas de conflicto" |
| `/wp-content/uploads/2024/11/vamosabr2011.pdf` | `/revistavamos/misiones-y-jovenes/` | month 2011-04 -> "Misiones y jovenes" |
| `/wp-content/uploads/2024/11/vamosabr2013.pdf` | `/revistavamos/hijos-de-misioneros/` | month 2013-04 -> "Hijos de Misioneros" |
| `/wp-content/uploads/2024/11/vamosabril2011.pdf` | `/revistavamos/misiones-y-jovenes/` | month 2011-04 -> "Misiones y jovenes" |
| `/wp-content/uploads/2024/11/vamosabril2012.pdf` | `/revistavamos/trabajando-con-ninos/` | month 2012-04 -> "Trabajando con Niños" |
| `/wp-content/uploads/2024/11/vamosago2010.pdf` | `/revistavamos/biocupacionales/` | month 2010-08 -> "Biocupacionales" |
| `/wp-content/uploads/2024/11/vamosago2011.pdf` | `/revistavamos/mobilizacion/` | month 2011-08 -> "Movilizacion" |
| `/wp-content/uploads/2024/11/vamosago2012.pdf` | `/revistavamos/trabajo-en-paises-restringidos/` | month 2012-08 -> "Trabajo en Países Restringidos" |
| `/wp-content/uploads/2024/11/vamosagosto13.pdf` | `/revistavamos/redes-sociales/` | month 2013-08 -> "Redes Sociales" |
| `/wp-content/uploads/2024/11/vamosagosto2011.pdf` | `/revistavamos/mobilizacion/` | month 2011-08 -> "Movilizacion" |
| `/wp-content/uploads/2024/11/vamosdic09iglesia.pdf` | `/revistavamos/iglesia-y-misiones/` | month 2009-12 -> "Iglesia y Misiones" |
| `/wp-content/uploads/2024/11/vamosdic2009.pdf` | `/revistavamos/iglesia-y-misiones/` | month 2009-12 -> "Iglesia y Misiones" |
| `/wp-content/uploads/2024/11/vamosdic2010.pdf` | `/revistavamos/sida/` | month 2010-12 -> "SIDA" |
| `/wp-content/uploads/2024/11/vamosdic2011.pdf` | `/revistavamos/comunicacion-integral/` | month 2011-12 -> "Comunicación Integral" |
| `/wp-content/uploads/2024/11/vamosene2010.pdf` | `/revistavamos/la-solteria/` | month 2010-01 -> "La Solteria" |
| `/wp-content/uploads/2024/11/vamosene2011.pdf` | `/revistavamos/volviendo-casa/` | month 2011-01 -> "Volviendo a casa" |
| `/wp-content/uploads/2024/11/vamosene2012.pdf` | `/revistavamos/resolucion-de-conflictos/` | month 2012-01 -> "Resolución de Conflictos" |
| `/wp-content/uploads/2024/11/vamosene2013.pdf` | `/revistavamos/antes-de-ir/` | month 2013-01 -> "Antes de Ir" |
| `/wp-content/uploads/2024/11/vamosenero2011.pdf` | `/revistavamos/volviendo-casa/` | month 2011-01 -> "Volviendo a casa" |
| `/wp-content/uploads/2024/11/vamosfeb2011.pdf` | `/revistavamos/misiones-de-corto-plazo/` | month 2011-02 -> "Misiones de corto plazo" |
| `/wp-content/uploads/2024/11/Vamosfeb2012.pdf` | `/revistavamos/conferencia-misionera/` | month 2012-02 -> "Conferencia Misionera" |
| `/wp-content/uploads/2024/11/vamosfeb2013.pdf` | `/revistavamos/seguridad-en-el-campo/` | month 2013-02 -> "Seguridad en el campo" |
| `/wp-content/uploads/2024/11/vamosfebrero2011.pdf` | `/revistavamos/misiones-de-corto-plazo/` | month 2011-02 -> "Misiones de corto plazo" |
| `/wp-content/uploads/2024/11/vamosjul2010.pdf` | `/revistavamos/preparacion-misionera/` | month 2010-07 -> "Preparacion misionera" |
| `/wp-content/uploads/2024/11/vamosjul2011.pdf` | `/revistavamos/equipos-multiculturales/` | month 2011-07 -> "Equipos Multiculturales" |
| `/wp-content/uploads/2024/11/vamosjul2012.pdf` | `/revistavamos/agotamiento/` | month 2012-07 -> "Agotamiento" |
| `/wp-content/uploads/2024/11/vamosjul2013.pdf` | `/revistavamos/africa/` | month 2013-07 -> "Africa" |
| `/wp-content/uploads/2024/11/vamosjulio2011.pdf` | `/revistavamos/equipos-multiculturales/` | month 2011-07 -> "Equipos Multiculturales" |
| `/wp-content/uploads/2024/11/vamosjun2010.pdf` | `/revistavamos/la-oracion/` | month 2010-06 -> "La Oracion" |
| `/wp-content/uploads/2024/11/vamosjun2011.pdf` | `/revistavamos/guerra-espiritual/` | month 2011-06 -> "Guerra Espiritual" |
| `/wp-content/uploads/2024/11/vamosjun2012-nuevo.pdf` | `/revistavamos/salud-fisica/` | month 2012-06 -> "Salud Física" |
| `/wp-content/uploads/2024/11/vamosjun2012.pdf` | `/revistavamos/salud-fisica/` | month 2012-06 -> "Salud Física" |
| `/wp-content/uploads/2024/11/vamosjun2013.pdf` | `/revistavamos/oscuridad-en-los-colores-vibrantes-asia/` | month 2013-06 -> "Asia" |
| `/wp-content/uploads/2024/11/vamosjunio2011.pdf` | `/revistavamos/guerra-espiritual/` | month 2011-06 -> "Guerra Espiritual" |
| `/wp-content/uploads/2024/11/vamosmar2010.pdf` | `/revistavamos/familia-en-misiones/` | month 2010-03 -> "Familia en Misiones" |
| `/wp-content/uploads/2024/11/vamosmar2011.pdf` | `/revistavamos/cuidado-pastoral/` | month 2011-03 -> "Cuidado Pastoral" |
| `/wp-content/uploads/2024/11/vamosmar2012.pdf` | `/revistavamos/de-pastor-pastor/` | month 2012-03 -> "De Pastor a Pastor" |
| `/wp-content/uploads/2024/11/vamosmar2013.pdf` | `/revistavamos/esperanza-para-las-mujeres-valiosas/` | month 2013-03 -> "Esperanza para las Mujeres Valiosas" |
| `/wp-content/uploads/2024/11/vamosmarzo2011.pdf` | `/revistavamos/cuidado-pastoral/` | month 2011-03 -> "Cuidado Pastoral" |
| `/wp-content/uploads/2024/11/vamosmay2010.pdf` | `/revistavamos/el-llamado/` | month 2010-05 -> "El Llamado" |
| `/wp-content/uploads/2024/11/vamosmay2011.pdf` | `/revistavamos/negocio-como-mision/` | month 2011-05 -> "Negocio como mision" |
| `/wp-content/uploads/2024/11/vamosmay2012.pdf` | `/revistavamos/mentoria/` | month 2012-05 -> "Mentoría" |
| `/wp-content/uploads/2024/11/vamosmay2013.pdf` | `/revistavamos/vida-espiritual/` | month 2013-05 -> "Vida Espiritual" |
| `/wp-content/uploads/2024/11/vamosmayo2011.pdf` | `/revistavamos/negocio-como-mision/` | month 2011-05 -> "Negocio como mision" |
| `/wp-content/uploads/2024/11/vamosnov2010.pdf` | `/revistavamos/agencias-misioneras/` | month 2010-11 -> "Agencias Misioneras" |
| `/wp-content/uploads/2024/11/vamosnov2011.pdf` | `/revistavamos/traduccion-de-la-biblia/` | month 2011-11 -> "Traducción de la Biblia" |
| `/wp-content/uploads/2024/11/vamosnov2012.pdf` | `/revistavamos/involucrar-tu-iglesia/` | month 2012-11 -> "Involucrar a tu iglesia" |
| `/wp-content/uploads/2024/11/vamosoct13.pdf` | `/revistavamos/caballeros-de-dios/` | month 2013-10 -> "Caballeros de Dios" |
| `/wp-content/uploads/2024/11/vamosoct2010.pdf` | `/revistavamos/fondos-y-misiones-orig/` | month 2010-10 -> "Fondos y misiones" |
| `/wp-content/uploads/2024/11/vamosoct2011.pdf` | `/revistavamos/plantacion-de-iglesias-0/` | month 2011-10 -> "Plantación de iglesias" |
| `/wp-content/uploads/2024/11/vamosoct2012.pdf` | `/revistavamos/emocionalmente-libres/` | month 2012-10 -> "Emocionalmente Libres" |
| `/wp-content/uploads/2024/11/vamosselvaabril17.pdf` | `/revistavamos/trabajo-en-la-selva/` | month 2017-04 -> "Trabajo en la selva" |
| `/wp-content/uploads/2024/11/vamossep2010.pdf` | `/revistavamos/fondos-y-misiones/` | month 2010-09 -> "Mision Integral" |
| `/wp-content/uploads/2024/11/vamossep2011.pdf` | `/revistavamos/donde-cristo-ya-no-es-conocido/` | month 2011-09 -> "Donde Cristo ya no es conocido" |
| `/wp-content/uploads/2024/11/vamossep2012.pdf` | `/revistavamos/obstaculos-y-perseverancia/` | month 2012-09 -> "Obstáculos y Perseverancia" |
| `/wp-content/uploads/2024/11/vamossept13_0.pdf` | `/revistavamos/alcanzando-los-aprendices-de-orales/` | month 2013-09 -> "Alcanzando a los Aprendices de Orales" |
| `/wp-content/uploads/2024/11/vamossept2011.pdf` | `/revistavamos/donde-cristo-ya-no-es-conocido/` | month 2011-09 -> "Donde Cristo ya no es conocido" |
| `/wp-content/uploads/2024/11/vamossimabril10.pdf` | `/revistavamos/misiones-en-zonas-de-conflicto/` | month 2010-04 -> "Misiones en zonas de conflicto" |
| `/wp-content/uploads/2024/11/vamossimagosto10.pdf` | `/revistavamos/biocupacionales/` | month 2010-08 -> "Biocupacionales" |
| `/wp-content/uploads/2024/11/vamossimdic09.pdf` | `/revistavamos/iglesia-y-misiones/` | month 2009-12 -> "Iglesia y Misiones" |
| `/wp-content/uploads/2024/11/vamossimdic10.pdf` | `/revistavamos/sida/` | month 2010-12 -> "SIDA" |
| `/wp-content/uploads/2024/11/vamossimenero10.pdf` | `/revistavamos/la-solteria/` | month 2010-01 -> "La Solteria" |
| `/wp-content/uploads/2024/11/vamossimjulio10.pdf` | `/revistavamos/preparacion-misionera/` | month 2010-07 -> "Preparacion misionera" |
| `/wp-content/uploads/2024/11/vamossimjunio10.pdf` | `/revistavamos/la-oracion/` | month 2010-06 -> "La Oracion" |
| `/wp-content/uploads/2024/11/vamossimmarzo10.pdf` | `/revistavamos/familia-en-misiones/` | month 2010-03 -> "Familia en Misiones" |
| `/wp-content/uploads/2024/11/vamossimmayo10.pdf` | `/revistavamos/el-llamado/` | month 2010-05 -> "El Llamado" |
| `/wp-content/uploads/2024/11/vamossimnov10.pdf` | `/revistavamos/agencias-misioneras/` | month 2010-11 -> "Agencias Misioneras" |
| `/wp-content/uploads/2024/11/vamossimsept10.pdf` | `/revistavamos/fondos-y-misiones/` | month 2010-09 -> "Mision Integral" |
| `/wp-content/uploads/2024/11/vidaespiritualvamosdic16_0.pdf` | `/revistavamos/mi-vida-espiritual/` | month 2016-12 -> "Mi Vida Espiritual " |
| `/wp-content/uploads/2024/11/vidaespiritualvamosdic16.pdf` | `/revistavamos/mi-vida-espiritual/` | month 2016-12 -> "Mi Vida Espiritual " |
| `/wp-content/uploads/2024/11/voluntariadovamosfeb19_0.pdf` | `/revistavamos/voluntariado/` | month 2019-02 -> "Voluntariado" |
| `/wp-content/uploads/2025/04/AdaptacionVAMOSdic24.pdf` | `/revistavamos/latinos-en-adaptacion/` | month 2024-12 -> "Latinos en adaptación, sus retos y resilencia" |
| `/wp-content/uploads/2025/04/GenteQueNoVemosVAMOSsept24.pdf` | `/revistavamos/la-gente-que-no-vemos/` | month 2024-09 -> "La gente que no vemos" |
| `/wp-content/uploads/2025/05/DiscipuladoVAMOSjunio25.pdf` | `/revistavamos/discipulos-que-hacen-discipulos/` | month 2025-06 -> "Discípulos que hacen discípulos" |
| `/wp-content/uploads/2025/08/CaracterVAMOSseptiembre25.pdf` | `/revistavamos/caracter-misionero/` | month 2025-09 -> "Carácter misionero" |
| `/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-1.pdf` | `/revistavamos/lucha-espiritual/` | month 2026-03 -> "Lucha espiritual" |
| `/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-2.pdf` | `/revistavamos/lucha-espiritual/` | month 2026-03 -> "Lucha espiritual" |
| `/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-3.pdf` | `/revistavamos/lucha-espiritual/` | month 2026-03 -> "Lucha espiritual" |
| `/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-4.pdf` | `/revistavamos/lucha-espiritual/` | month 2026-03 -> "Lucha espiritual" |
| `/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26.pdf` | `/revistavamos/lucha-espiritual/` | month 2026-03 -> "Lucha espiritual" |

## Matched to a Contentful asset

| URL | → |
|---|---|
| `/wp-content/uploads/2024/11/13leccionessobremisiones.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1bJwuRlxq0M33dLzDTEVLp/72ffd6eeb7aa01069dccb7374539660c/13leccionessobremisiones.pdf` |
| `/wp-content/uploads/2024/11/autocuidadovamosfeb22.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1OcpDP22RkDunrzbHUZhMW/f5c510d69f0b32a7644455ff24122dd2/autocuidadovamosfeb22.pdf` |
| `/wp-content/uploads/2024/11/engnewsmar14.pdf` | `https://assets.ctfassets.net/i46buyptg48q/3pTQSdg9jiwp3lzK77V3OI/9abca25e52e6e208d7ae7480398407cd/engnewsmar14.pdf` |
| `/wp-content/uploads/2024/11/equiposmisionerosmarzo14.pdf` | `https://images.ctfassets.net/i46buyptg48q/68lnmpwCjPh1qcQtqDlrQF/a074454b294b73cd892247c8d6a769c3/equiposmisionerosmarzo14.jpg` |
| `/wp-content/uploads/2024/11/latinosal100.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5LYRU5ThSw53ZaiJzU6LCC/f557a63e99b899632ae5dff35a969ea0/Latinosal100.pdf` |
| `/wp-content/uploads/2025/04/100dxven.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1eABw2yi89Ft9KdRsxp5NB/2a6280cfc5b621b7242d00626bf17246/100dxven.pdf` |
| `/wp-content/uploads/2025/04/3_jovenes_un_mismo_pastor.docx` | `https://assets.ctfassets.net/i46buyptg48q/41nrQSfn0Z4a0GF1ow6u5x/49868ff4afa43ba8abf51b4a62d01002/3_jovenes_un_mismo_pastor.docx` |
| `/wp-content/uploads/2025/04/30_formas_de_expresar_gratitud.pdf` | `https://assets.ctfassets.net/i46buyptg48q/Hh6xcVQfUR5Fow5aO2yyZ/27fd8a6e6e1ed06152aeeec5482bd749/30_formas_de_expresar_gratitud.pdf` |
| `/wp-content/uploads/2025/04/aprender_vs_estudiar.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5zYSCODoTpCycSmxZbmt2c/26b162ae590832f81b8ddddba75035df/aprender_vs_estudiar.pdf` |
| `/wp-content/uploads/2025/04/aspectos_fundamentales_del_modelo_de_discipulado_de_jesucristo.doc` | `https://assets.ctfassets.net/i46buyptg48q/g7MYHUuMRl5tpICuCtjAv/70796a4b70d91fb8182776761fbffae3/aspectos_fundamentales_del_modelo_de_discipulado_de_jesucristo.doc` |
| `/wp-content/uploads/2025/04/ayudando_al_que_es_diferente_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/3iWGjjQepXB7a05GEQhC15/b70dfa347b99c7499cd2e9d1e77e5e2a/ayudando_al_que_es_diferente_0.docx` |
| `/wp-content/uploads/2025/04/budismo_en_asia.docx` | `https://assets.ctfassets.net/i46buyptg48q/3Et4MAIIxnZQR1WPQ9C9QS/f7f3961f3f7e860d406c1aacb7edda57/budismo_en_asia.docx` |
| `/wp-content/uploads/2025/04/budismo_fedemec.doc` | `https://assets.ctfassets.net/i46buyptg48q/2BewQOUW7jVeLNUiu0gDqT/197197bb766c93269945f5a50883d2e9/budismo_fedemec.doc` |
| `/wp-content/uploads/2025/04/budismo_spanish.ppt` | `https://assets.ctfassets.net/i46buyptg48q/sN3d2ol0Px3Ii4tsuZk7x/45726687675db7e7b4ff83db987b6d85/budismo_spanish.ppt` |
| `/wp-content/uploads/2025/04/campana_de_oracion-_7_dias_por_siria_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/3Nq0vaZgHfHG50jmROpAYV/36ae1245252dd07bbddc962dd6e9ded5/campana_de_oracion-_7_dias_por_siria_0.docx` |
| `/wp-content/uploads/2025/04/campana_fondos_1.docx` | `https://assets.ctfassets.net/i46buyptg48q/5EGjK8DOAK8a1RZZG8BMxL/1441a99629fc933d2f65dbb0b5d148b0/campana_fondos_1.docx` |
| `/wp-content/uploads/2025/04/chatarra_0.pptx` | `https://assets.ctfassets.net/i46buyptg48q/1UNcOynSrDac5cm4ZZkLgB/0648b49be27ef02f11c3bf2a6fd416b1/chatarra_0.pptx` |
| `/wp-content/uploads/2025/04/christian_words.pdf` | `https://assets.ctfassets.net/i46buyptg48q/4zPuRxMv9M2AbNLuJSW8G0/26234fd2231a2680a421dcf2965a7209/christian_words.pdf` |
| `/wp-content/uploads/2025/04/comibam_articulo_para_enciclopedia.docx` | `https://assets.ctfassets.net/i46buyptg48q/2PRtbZb4TZ3azCSgSlXrSc/60d23b15c55c80fb16b15cb605ca285b/comibam_articulo_para_enciclopedia.docx` |
| `/wp-content/uploads/2025/04/como_discipular_a_un_creyente_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/7nrFG4kcpg1grJfwnKXpCq/da8de62901a1fd6636dcd0482aa65ced/como_discipular_a_un_creyente_0.docx` |
| `/wp-content/uploads/2025/04/como_hacer_el_discipulado.docx` | `https://assets.ctfassets.net/i46buyptg48q/6Tzrz9SgDQYQ6EVYbFaokO/c757fea64d630a912662636328b05939/como_hacer_el_discipulado.docx` |
| `/wp-content/uploads/2025/04/como_murieron_los_discipulos.docx` | `https://assets.ctfassets.net/i46buyptg48q/10vIuP4IDLDKalXrWO74HP/08c1c49159def3fa714b4c8d289e9f55/como_murieron_los_discipulos.docx` |
| `/wp-content/uploads/2025/04/como_orar_por_los_pueblos_no_alcanzados.docx` | `https://assets.ctfassets.net/i46buyptg48q/56UKur6JQYp9iUqy2TpGtO/82aa01bc290e3885a512b621642db9ef/como_orar_por_los_pueblos_no_alcanzados.docx` |
| `/wp-content/uploads/2025/04/conociendo_los_dones_y_talentos.docx` | `https://assets.ctfassets.net/i46buyptg48q/2HEsEBZ1iBVg9Iu4y6TJxi/4b5d6092970af90609dda51638dd1e6a/conociendo_los_dones_y_talentos.docx` |
| `/wp-content/uploads/2025/04/consejos_para_jovenes_predicadores.docx` | `https://assets.ctfassets.net/i46buyptg48q/3rP3ATxBliHMOCwuCLB5Ef/1b9a41aa4cb00b05b5a95a7537773f56/consejos_para_jovenes_predicadores.docx` |
| `/wp-content/uploads/2025/04/cronologia_de_proyecto_misionero_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/4dBANx4aOgEBWH5LywEhTu/581ec19948f08e2409d2dd5642594da0/cronologia_de_proyecto_misionero_0.docx` |
| `/wp-content/uploads/2025/04/cuando_simplemente_dicen_no-1.pdf` | `https://assets.ctfassets.net/i46buyptg48q/4eRGuDoN9rsHs5wuHgDlwY/ec0640ceda9915f55d86a6f615013504/cuando_simplemente_dicen_no.pdf` |
| `/wp-content/uploads/2025/04/cuando_simplemente_dicen_no.pdf` | `https://assets.ctfassets.net/i46buyptg48q/4eRGuDoN9rsHs5wuHgDlwY/ec0640ceda9915f55d86a6f615013504/cuando_simplemente_dicen_no.pdf` |
| `/wp-content/uploads/2025/04/cuestionario_de_parejas_-_cuan_bien_conoces_a_tu_pareja.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5DmuTaRZpfSMoKCijVCdyZ/69f559271351d5aa2174bae9a0d3186b/cuestionario_de_parejas_-_cuan_bien_conoces_a_tu_pareja.pdf` |
| `/wp-content/uploads/2025/04/cuestionario_de_parejas_-_que_tan_saludable_es_tu_matrimonio_.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1hFUvH1KGezcbzcacnhhrF/fe2eb947b30cc750625427d9bd82fcf3/cuestionario_de_parejas_-_que_tan_saludable_es_tu_matrimonio_.pdf` |
| `/wp-content/uploads/2025/04/CuidadoIntegralMarzo25.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7zMQmx6YaP5EqhI1oKwiRu/fb2ad5dfc1fb878218bfbe355c43e8fb/CuidadoIntegralMarzo25.pdf` |
| `/wp-content/uploads/2025/04/cuidando_integral_de_las_familias_misioneras.docx` | `https://assets.ctfassets.net/i46buyptg48q/fhv33anm1gS18SSxV33cE/c58fbd4145c4f8cbed400551038f3365/cuidando_integral_de_las_familias_misioneras.docx` |
| `/wp-content/uploads/2025/04/curso_basico_sobre_etnias.docx` | `https://assets.ctfassets.net/i46buyptg48q/2QVZWzHBeVbYZINMpRoyCx/1ebad268baf795eb2cea3785406d2430/curso_basico_sobre_etnias.docx` |
| `/wp-content/uploads/2025/04/desarrollar_una_visionbam.docx` | `https://assets.ctfassets.net/i46buyptg48q/gG3wYCDwx2gSZJAFs8K0I/ae0c6d2a02c7b1110c561bf2773d3b3e/desarrollar_una_visionbam.docx` |
| `/wp-content/uploads/2025/04/desde_la_iglesia_como_facilitamos_el_levantamiento_de_nuevos_misioneros_iglesia_local_y_la_mision_mundial_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/1jlDlYqD1B62PdHtxt0anu/67ee49e3f067d2e5c07169922d4aae19/desde_la_iglesia_como_facilitamos_el_levantamiento_de_nuevos_misioneros_iglesia_local_y_la_mision_mundial_0.docx` |
| `/wp-content/uploads/2025/04/devo_raim_kids_orando_por_los_hijos_de_los_misioneros.pdf` | `https://assets.ctfassets.net/i46buyptg48q/kMmHXiWvlweja6FTK2jSH/6db29e9a3e02ec6f7d12052d9bb3d6b1/devo_raim_kids_orando_por_los_hijos_de_los_misioneros.pdf` |
| `/wp-content/uploads/2025/04/discerniendo_la_voluntad_de_dios.docx` | `https://assets.ctfassets.net/i46buyptg48q/5J0RmilhPSCEx1bJ0WKTae/530cddf83488356663f19232c7a0c679/discerniendo_la_voluntad_de_dios.docx` |
| `/wp-content/uploads/2025/04/discipulado_en_las_familias_-_ministerio_confines.docx` | `https://assets.ctfassets.net/i46buyptg48q/4ezjXyXYO4e7H2DfYOFcbk/8c171b1d4f2a1ca8c1ff4f3eec9867d3/discipulado_en_las_familias_-_ministerio_confines.docx` |
| `/wp-content/uploads/2025/04/discipulos_que_hacen_discipulos.docx` | `https://assets.ctfassets.net/i46buyptg48q/2tVITxkLmQnqvCBujVaKDC/86a944c37a5cdaa664880c233e300e6a/discipulos_que_hacen_discipulos.docx` |
| `/wp-content/uploads/2025/04/dudas_de_los_jovenes.docx` | `https://assets.ctfassets.net/i46buyptg48q/4NlyQtayiYr4Rzmz8f3c9a/45c6acd7a5c56d38ba726b88974a74b6/dudas_de_los_jovenes.docx` |
| `/wp-content/uploads/2025/04/el_agente_secreto_de_misiones_por_dr.docx` | `https://assets.ctfassets.net/i46buyptg48q/4ZaoIZTxvLO3pvCH0mp1Gp/72a1462301d4cb7f0506f8ec21b25bb6/el_agente_secreto_de_misiones_por_dr.docx` |
| `/wp-content/uploads/2025/04/el_budismo_occidental.docx` | `https://assets.ctfassets.net/i46buyptg48q/4YgiFTFZE8N7XrhrWMqAfA/31b147af0064f5b174c2cc2c38e9ada2/el_budismo_occidental.docx` |
| `/wp-content/uploads/2025/04/el_budismo.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1xIUnKEVcFrwOojBusjkba/2f7ae2190ed8034157509533618b2b57/el_budismo.pdf` |
| `/wp-content/uploads/2025/04/el_cuidado_de_dios_por_los_desplazados_los_refugiados_y_los_migrantes__0.docx` | `https://assets.ctfassets.net/i46buyptg48q/4FAJImUr0TElK0RNwr170S/7ab2ec3c0a7b7c1ba435ba376a6d494e/el_cuidado_de_dios_por_los_desplazados_los_refugiados_y_los_migrantes__0.docx` |
| `/wp-content/uploads/2025/04/el_discipulo_en_crecimiento.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1Nq2El3x75EQehNWskENZW/865bc4811c6424ad792687596ae543a8/el_discipulo_en_crecimiento.pdf` |
| `/wp-content/uploads/2025/04/el_legado_tesalonico.docx` | `https://assets.ctfassets.net/i46buyptg48q/4eaVK4uBOct6aPdSRrUqYP/8c03ab69a31f6d4f48ed231a2418dfad/el_legado_tesalonico.docx` |
| `/wp-content/uploads/2025/04/el_mensaje_de_jesus.pdf` | `https://assets.ctfassets.net/i46buyptg48q/3oXPGTJOMHGOba4jwHoCa5/7f2c3aba1ab8af91949a5b9246c82263/el_mensaje_de_jesus.pdf` |
| `/wp-content/uploads/2025/04/el_pastoreado_del_rebano_de_dios.docx` | `https://assets.ctfassets.net/i46buyptg48q/XLBVWcn613grvtd1RvLOH/f2757b36421f2b074d59839e775489f8/el_pastoreado_del_rebano_de_dios.docx` |
| `/wp-content/uploads/2025/04/el_perfil_del_misionero_transcultural_ideal.doc` | `https://assets.ctfassets.net/i46buyptg48q/4LKlEFBj7HcUZqeiNcW0BY/a5040feaf744b25c935f56f428a9b300/el_perfil_del_misionero_transcultural_ideal.doc` |
| `/wp-content/uploads/2025/04/el_plan_maestro_del_evangelismo.docx` | `https://assets.ctfassets.net/i46buyptg48q/426ra3sACqqN38QxupUv4E/33b9eeb464e67a300e25898ab6e1b45c/el_plan_maestro_del_evangelismo.docx` |
| `/wp-content/uploads/2025/04/el_poder_de_los_individuos.docx` | `https://assets.ctfassets.net/i46buyptg48q/5iyhT6KjjLILxhOZF31Rz6/6c961c82c592295fe9833d88e6a2bf43/el_poder_de_los_individuos.docx` |
| `/wp-content/uploads/2025/04/en_que_estas_gastando.docx` | `https://assets.ctfassets.net/i46buyptg48q/6LlzNNYSCGszFOPo3hISPB/cdf3cdd2e7a266623c7519305954e7c3/en_que_estas_gastando.docx` |
| `/wp-content/uploads/2025/04/encontrando_tus_dones.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1EZNS91hQMFAYFYgzrxAKU/d1aa57ad53d4370e48856aa4d687fc86/encontrando_tus_dones.pdf` |
| `/wp-content/uploads/2025/04/ensenando_misiones_a_los_ninos.ppt` | `https://assets.ctfassets.net/i46buyptg48q/5IRISZ6028Lr7qlc4DNCTc/8e7a6f3f6ca18e0807799998b6da8234/ensenando_misiones_a_los_ninos.ppt` |
| `/wp-content/uploads/2025/04/envio_misionero_responsable.pdf` | `https://assets.ctfassets.net/i46buyptg48q/44y014T3UzvUIIG6m8c1Db/24b0ab563bcb80fad61da951ba28cdc1/envio_misionero_responsable.pdf` |
| `/wp-content/uploads/2025/04/evaluacion_de_los_proyectos_locales_de_la_iglesia.docx` | `https://assets.ctfassets.net/i46buyptg48q/5YSTolZflQFRP19bAoni4g/e65c63017f1c3248eb0a19b9d0523882/evaluacion_de_los_proyectos_locales_de_la_iglesia.docx` |
| `/wp-content/uploads/2025/04/evangelizando_a_los_judios_por_apolos_landa.pdf` | `https://assets.ctfassets.net/i46buyptg48q/BkDN3WZtbItXEYXffhNuw/2857d1aba4fb234d5b9c8884ebcb7bd8/evangelizando_a_los_judios_por_apolos_landa.pdf` |
| `/wp-content/uploads/2025/04/experiencia_familiar_de_corto_plazo_1.docx` | `https://assets.ctfassets.net/i46buyptg48q/6UN8cvFnpttNZIPaPfF8Eg/bcc4d6033c7885924fae9b7812f4e6fc/experiencia_familiar_de_corto_plazo_1.docx` |
| `/wp-content/uploads/2025/04/feria_de_misiones.pdf` | `https://assets.ctfassets.net/i46buyptg48q/2DoqTdbq5aHOzQsfcSWbKe/445882c9df0f1c3250968460155cfaa3/feria_de_misiones.pdf` |
| `/wp-content/uploads/2025/04/ficha_de_compromiso_y_cronograma_mensual_1.docx` | `https://assets.ctfassets.net/i46buyptg48q/2zlqmAhliFjYTvNyfswjmr/ff04e56263ec0358bbcc5b893169dbbc/ficha_de_compromiso_y_cronograma_mensual_1.docx` |
| `/wp-content/uploads/2025/04/ficha_de_compromiso_y_cronograma_mensual_2.docx` | `https://assets.ctfassets.net/i46buyptg48q/2zlqmAhliFjYTvNyfswjmr/ff04e56263ec0358bbcc5b893169dbbc/ficha_de_compromiso_y_cronograma_mensual_1.docx` |
| `/wp-content/uploads/2025/04/finanzas_misioneras_omar.docx` | `https://assets.ctfassets.net/i46buyptg48q/25Rw86CglgiNKT1yhSaOcK/37cf659c8dcf726f56cd1ee6b414b71e/finanzas_misioneras_omar.docx` |
| `/wp-content/uploads/2025/04/finanzas_para_las_misiones_mundiales.pdf` | `https://assets.ctfassets.net/i46buyptg48q/6WKxJ3bCb1PT6mkqcqTBjC/95e4a60740b3542486cdc4e40791f4b5/finanzas_para_las_misiones_mundiales.pdf` |
| `/wp-content/uploads/2025/04/folleto_promesa_de_fe.doc` | `https://assets.ctfassets.net/i46buyptg48q/11RJ0twxzZl7IwCDJErsfF/55abe8523a8095531ed99f03662bad65/folleto_promesa_de_fe.doc` |
| `/wp-content/uploads/2025/04/folletosamm.pdf` | `https://assets.ctfassets.net/i46buyptg48q/rMkspyQanuZJowt3c8C4E/5c28e70b00aa6504d3c4c772f78f089e/folletosamm.pdf` |
| `/wp-content/uploads/2025/04/fortalezas_y_debilidades_de_las_misiones_iberoamericanas.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5dKanMGxdm9ieobt0J8Sxr/ef793e1d7d5b6e0a0248c95b7a57bd20/fortalezas_y_debilidades_de_las_misiones_iberoamericanas.pdf` |
| `/wp-content/uploads/2025/04/fundamentos_de_la_capacitacion_misionera_transcultural.doc` | `https://assets.ctfassets.net/i46buyptg48q/6VqWQ9sPXQQLnnY5LKlGWN/3e3b9e33beb5519f079093f96a939200/fundamentos_de_la_capacitacion_misionera_transcultural.doc` |
| `/wp-content/uploads/2025/04/gran_historia.doc` | `https://assets.ctfassets.net/i46buyptg48q/7tyAgbeVdxCMYevQxG4lWp/9a7a7d719a998a5ed57f2d003cf27def/gran_historia.doc` |
| `/wp-content/uploads/2025/04/gran_historia.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7tyAgbeVdxCMYevQxG4lWp/9a7a7d719a998a5ed57f2d003cf27def/gran_historia.doc` |
| `/wp-content/uploads/2025/04/grupos_budistas_no_alcanzados.pdf` | `https://assets.ctfassets.net/i46buyptg48q/53EsLgvqIv6hPh1jruWPji/bf407c782fb9889a9eb197da6598b8eb/grupos_budistas_no_alcanzados.pdf` |
| `/wp-content/uploads/2025/04/guia_para_lideres_-_trabajo_con_personas_con_discapacidad._fundacion_sendas.ppt` | `https://assets.ctfassets.net/i46buyptg48q/3N8Bm0bmjXCPDSe7ENbiSE/be2c21b8a9494c048b5aca4262eb1d9c/guia_para_lideres_-_trabajo_con_personas_con_discapacidad._fundacion_sendas.ppt` |
| `/wp-content/uploads/2025/04/hacer_tiendas_y_el_llamado_apostolico.docx` | `https://assets.ctfassets.net/i46buyptg48q/2V1e1OmrbvefdcajRX70Mu/bb69bd2f9ee54d3bdbfd8da693717c83/hacer_tiendas_y_el_llamado_apostolico.docx` |
| `/wp-content/uploads/2025/04/honor_y_verguenza_en_las_relaciones_transculturales.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7nJCbyIVJ4m1kLx27zNZwn/7a8e2d6bf9771ed9c45eb7e720508d14/honor_y_verguenza_en_las_relaciones_transculturales.pdf` |
| `/wp-content/uploads/2025/04/hora_misionera_de_ninos.doc` | `https://assets.ctfassets.net/i46buyptg48q/2IihGPvFiiR21L58XrZhQI/ff0f8a799c3d1e3f2aa9d41a66b643e4/hora_misionera_de_ninos.doc` |
| `/wp-content/uploads/2025/04/incluyendo_a_las_personas_con_discapacidad_en_la_iglesia_-_ministerio_amistad.docx` | `https://assets.ctfassets.net/i46buyptg48q/3PMY6tevN5XfuUgHDPlH1h/d1cc54e595f88455e119eafd2553bd40/incluyendo_a_las_personas_con_discapacidad_en_la_iglesia_-_ministerio_amistad.docx` |
| `/wp-content/uploads/2025/04/integridad_y_cooperacion_en_la_mision.pdf` | `https://assets.ctfassets.net/i46buyptg48q/J10s1rKi5RYj1LNCt67RM/f5087c93241fef0dac1695aada3ca874/integridad_y_cooperacion_en_la_mision.pdf` |
| `/wp-content/uploads/2025/04/juntos_con_un_mismo_objetivo.docx` | `https://assets.ctfassets.net/i46buyptg48q/4Z866PpIestN7HkNqbMlqO/db68cdbe306b997b1d27be107e536488/juntos_con_un_mismo_objetivo.docx` |
| `/wp-content/uploads/2025/04/la_discapacidad_es_voluntad_de_dios.docx` | `https://assets.ctfassets.net/i46buyptg48q/703pKvtLw268wtsN6u6uT0/b966f81ee54b0cf94cf055c34f837a75/la_discapacidad_es_voluntad_de_dios.docx` |
| `/wp-content/uploads/2025/04/la_historia_del_budismo.doc` | `https://assets.ctfassets.net/i46buyptg48q/opodyOnQmAWjsGxMhgBt8/a0eabe55b932ea6f30656f35d150950a/la_historia_del_budismo.doc` |
| `/wp-content/uploads/2025/04/la_voluntad_de_dios_nunca_te_llevara_poesia.docx` | `https://assets.ctfassets.net/i46buyptg48q/3wJRZTRlIkVngjTsm0yJ8Z/a2ac141ce90662e6ca083e1b8a5147ca/la_voluntad_de_dios_nunca_te_llevara_poesia.docx` |
| `/wp-content/uploads/2025/04/lagranomision.pdf` | `https://assets.ctfassets.net/i46buyptg48q/3LPqHcGqUa1ZOKqer4hMP4/e5fc36624034e325003bfdbae916c8b6/lagranomision.pdf` |
| `/wp-content/uploads/2025/04/las_asociaciones_en_las_misiones.docx` | `https://assets.ctfassets.net/i46buyptg48q/quzq3fLBEVGL3ToVmzCJ3/9bf82685e80260f363c7a26c01130abd/las_asociaciones_en_las_misiones.docx` |
| `/wp-content/uploads/2025/04/lineadetiemposim_0.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1xkbxd8eNEt938KsD4Usus/152098f7c913c1bfb74fe9f51fb7cf81/lineadetiemposim.pdf` |
| `/wp-content/uploads/2025/04/lineadetiemposim.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1xkbxd8eNEt938KsD4Usus/152098f7c913c1bfb74fe9f51fb7cf81/lineadetiemposim.pdf` |
| `/wp-content/uploads/2025/04/lo_que_el_pastor_debe_saber_y_hacer.doc` | `https://assets.ctfassets.net/i46buyptg48q/6mCuLBlMfjyj0Jai2m5YFA/70223bc81eafee1bf380176b9418c3dc/lo_que_el_pastor_debe_saber_y_hacer.doc` |
| `/wp-content/uploads/2025/04/lo_que_ellos_ven_en_los_cristianos_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/7FlhK8QV4QGFh49itKB7dK/995c8912b5dc657445de38c645effc24/lo_que_ellos_ven_en_los_cristianos_0.docx` |
| `/wp-content/uploads/2025/04/los_bebes_en_cristo.docx` | `https://assets.ctfassets.net/i46buyptg48q/yjajPgSuMY1v4PTwYqxIs/373b19fba247fab70c3311837997df86/los_bebes_en_cristo.docx` |
| `/wp-content/uploads/2025/04/los_inicios_de_un_movimiento.pdf` | `https://assets.ctfassets.net/i46buyptg48q/1MxqxuG6AXZ9YSB3jfU1Zc/049edf3a2a27cb077674c49879c531fa/los_inicios_de_un_movimiento.pdf` |
| `/wp-content/uploads/2025/04/los_jovenes_preguntan.docx` | `https://assets.ctfassets.net/i46buyptg48q/5ydxSPdu0vWK1zSrGPSJF3/0ace6a25d7acb826e9cccc8b614e2fc1/los_jovenes_preguntan.docx` |
| `/wp-content/uploads/2025/04/luchando_contra_una_fragmentada.docx` | `https://assets.ctfassets.net/i46buyptg48q/573TopPS3d8irP4FFj8O1z/70b1d1da5fd1c7cf3571b6da70d29390/luchando_contra_una_fragmentada.docx` |
| `/wp-content/uploads/2025/04/maestria_alfarero.pdf` | `https://assets.ctfassets.net/i46buyptg48q/2KTmguRxn9Zo6ZRGab4AG3/f53a79baa815539527169fa8767522bf/maestria_alfarero.pdf` |
| `/wp-content/uploads/2025/04/maneras_de_servir.docx` | `https://assets.ctfassets.net/i46buyptg48q/18QV3ji9zTPuIzbS0cqMd8/0cfcf6db08040def85891aac5f2f0eeb/maneras_de_servir.docx` |
| `/wp-content/uploads/2025/04/manual_del_maestro_gran_historiaesp.doc` | `https://assets.ctfassets.net/i46buyptg48q/5kYB4re66UBvCvTJe3kj5o/e58837fcffd0334bd59282525534abc1/manual_del_maestro_gran_historiaesp.doc` |
| `/wp-content/uploads/2025/04/manualhavamos_0.pdf` | `https://assets.ctfassets.net/i46buyptg48q/2FxknyCZI7HxiqSWxlnOYi/2384d8336c160c05722aa043b986e8c4/manualhavamos_0.pdf` |
| `/wp-content/uploads/2025/04/mapa_de_oracion.doc` | `https://assets.ctfassets.net/i46buyptg48q/5J51xrRnRDwPninMDHsUaS/b8856bf57ec0d1bb9f968b6a9599f9a8/mapa_de_oracion.doc` |
| `/wp-content/uploads/2025/04/mefi-boset_-_ministerio_confines_paraguay.docx` | `https://assets.ctfassets.net/i46buyptg48q/2nxv8ac0cfY81C06zK0tXR/8c4c582216abc2dd76ce987151e2fbe3/mefi-boset_-_ministerio_confines_paraguay.docx` |
| `/wp-content/uploads/2025/04/mejor_en_la_cancha.pdf` | `https://assets.ctfassets.net/i46buyptg48q/6LyUikoTyjSxudbEauraPT/18a8f66640ef33414fe1c88e047971e9/mejor_en_la_cancha.pdf` |
| `/wp-content/uploads/2025/04/metodos_misioneros_0.doc` | `https://assets.ctfassets.net/i46buyptg48q/58o9p77eeft9guMdPZof68/3191938d59f04fba1216b54d349023ae/metodos_misioneros_0.doc` |
| `/wp-content/uploads/2025/04/mi_profesion_para_la_honra_de_dios.doc` | `https://assets.ctfassets.net/i46buyptg48q/3QMSKXqPiYSSljWD9WFIsw/f14780b5bfe7db96126aaa43814e049f/mi_profesion_para_la_honra_de_dios.doc` |
| `/wp-content/uploads/2025/04/misionero_ante_las_culturas-reichel_dolmatoff.pdf` | `https://assets.ctfassets.net/i46buyptg48q/13IYF2QnnGKk8rqyhbgMbQ/c992717a481dde4228e1eb881f588fbc/misionero_ante_las_culturas-reichel_dolmatoff.pdf` |
| `/wp-content/uploads/2025/04/misiones_latinas_siglo_xxi.pdf` | `https://assets.ctfassets.net/i46buyptg48q/6nvvBhEme7SGdvAAlCSbo9/79582c6a30e15614b7a0666c7345d584/misiones_latinas_siglo_xxi.pdf` |
| `/wp-content/uploads/2025/04/moduloesp.doc` | `https://assets.ctfassets.net/i46buyptg48q/6CL34TrPpYMd2AzLPaXsTD/b6cd9d45d2e3eb4056aa1c4fd098ab2c/moduloesp.doc` |
| `/wp-content/uploads/2025/04/my_weekly_language_schedule.pdf` | `https://assets.ctfassets.net/i46buyptg48q/wvbfvj89WAbkASWDN6U3z/aba7660c1858975e16b843a5e220c019/my_weekly_language_schedule.pdf` |
| `/wp-content/uploads/2025/04/nancy_guthrie_-_aferrandose_a_la_esperanza.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5ePYmfGwtYox9TCxygGQcB/2e30bf3d4fca54a4e7b1945bcf3cd40a/nancy_guthrie_-_aferrandose_a_la_esperanza.pdf` |
| `/wp-content/uploads/2025/04/narracion_por_que.docx` | `https://assets.ctfassets.net/i46buyptg48q/2BkZGdNoVuf6MFYxLvoY36/aa1eef555fbffe02502a9acf14b24fa2/narracion_por_que.docx` |
| `/wp-content/uploads/2025/04/nuevo_obrero_v8_.pdf` | `https://downloads.ctfassets.net/i46buyptg48q/5DjyQr5k0eQE4odwY4aTom/1d436a87c089d321b6359a3750697b07/nuevo_obrero_v8_.pdf` |
| `/wp-content/uploads/2025/04/ofrenda_de_promesa_de_fe.doc` | `https://assets.ctfassets.net/i46buyptg48q/4xcUDFx4nav9e5FjbtKgIv/18ad4487e1fe8733ddc0249ed2f5bdba/ofrenda_de_promesa_de_fe.doc` |
| `/wp-content/uploads/2025/04/oralidad_-_estilos_de_aprendizaje.doc` | `https://assets.ctfassets.net/i46buyptg48q/63Ru77ZggZyGblWvGs9Wa9/93936e731bcf866e4523613d41e1a41a/oralidad_-_estilos_de_aprendizaje.doc` |
| `/wp-content/uploads/2025/04/orando_pro_los_budistas.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7GsMaf5Ckz6YBTZy6X7hZI/515bb037836bba768b3f83d9c5b4eb22/orando_pro_los_budistas.pdf` |
| `/wp-content/uploads/2025/04/orientacion_inicial_para_candidatos_a_misioneros.doc` | `https://assets.ctfassets.net/i46buyptg48q/2KknfHLcQm2TLTLMnCnKsz/2bd56ea04a58c62b8401993cf2353cf1/orientacion_inicial_para_candidatos_a_misioneros.doc` |
| `/wp-content/uploads/2025/04/pablo_y_timoteo.docx` | `https://assets.ctfassets.net/i46buyptg48q/4MiUfNQMCVIOAiFiVZouXz/2e8b9ee627043a64441a3d3c6e38c6f9/pablo_y_timoteo.docx` |
| `/wp-content/uploads/2025/04/paraquesirven.doc` | `https://assets.ctfassets.net/i46buyptg48q/2YzRL6ihLjxnD3lXIwZmZN/8a09d7d2fc45ccb1aa2db6c434f3325a/paraquesirven.doc` |
| `/wp-content/uploads/2025/04/partnership_y_el_dinero.doc` | `https://assets.ctfassets.net/i46buyptg48q/TzGIsFUDIcTnAGgmYYIyV/06d89a85a91c3e4ababee1da6c6f4444/partnership_y_el_dinero.doc` |
| `/wp-content/uploads/2025/04/plan_para_feria_de_misiones.pdf` | `https://assets.ctfassets.net/i46buyptg48q/muRPYBgWtq625GAgVTx0v/dd7cc541c7d7d010fc3c3948fd42d001/plan_para_feria_de_misiones.pdf` |
| `/wp-content/uploads/2025/04/planear_un_viaje_misionero_comunidades_0.docx` | `https://assets.ctfassets.net/i46buyptg48q/74mZTCix6wdPegw7WNlG81/02440a6d354cba6fecded6f1ce96f326/planear_un_viaje_misionero_comunidades_0.docx` |
| `/wp-content/uploads/2025/04/planear_un_viaje_misionero_comunidades_1.docx` | `https://assets.ctfassets.net/i46buyptg48q/74mZTCix6wdPegw7WNlG81/02440a6d354cba6fecded6f1ce96f326/planear_un_viaje_misionero_comunidades_0.docx` |
| `/wp-content/uploads/2025/04/predica_2.docx` | `https://assets.ctfassets.net/i46buyptg48q/4tmVLJsGJciQEMC0GXG72U/e8292497c31c4e6a3e1858a47865d782/predica_3.docx` |
| `/wp-content/uploads/2025/04/predica_3.docx` | `https://assets.ctfassets.net/i46buyptg48q/4tmVLJsGJciQEMC0GXG72U/e8292497c31c4e6a3e1858a47865d782/predica_3.docx` |
| `/wp-content/uploads/2025/04/predica_4.docx` | `https://assets.ctfassets.net/i46buyptg48q/4tmVLJsGJciQEMC0GXG72U/e8292497c31c4e6a3e1858a47865d782/predica_3.docx` |
| `/wp-content/uploads/2025/04/preguntas_frecuentes_material_vamos.docx` | `https://assets.ctfassets.net/i46buyptg48q/6oC1CUOwEONYmbnKB5P0yy/f98a9ba2e131991ec3ac035b36eee2ce/preguntas_frecuentes_material_vamos.docx` |
| `/wp-content/uploads/2025/04/preparandose_para_contar_la_historia.docx` | `https://assets.ctfassets.net/i46buyptg48q/1qypbnfIjPaV7sndbQN50I/843bfe15a33164df2b30c360873108ba/preparandose_para_contar_la_historia.docx` |
| `/wp-content/uploads/2025/04/presupuesto_misionero.xls` | `https://assets.ctfassets.net/i46buyptg48q/2rBBWbRxzsHWQwSQPdp1EY/d6e758bdd64ff329fd0b72eef22d9e8d/presupuesto_misionero.xls` |
| `/wp-content/uploads/2025/04/promesa_de_fe.docx` | `https://assets.ctfassets.net/i46buyptg48q/7lmJCtLnquMIcpX4xYwgnm/ee2907b0d62fe015f01cf76b95984743/promesa_de_fe.docx` |
| `/wp-content/uploads/2025/04/promesa_de_fe.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7lmJCtLnquMIcpX4xYwgnm/ee2907b0d62fe015f01cf76b95984743/promesa_de_fe.docx` |
| `/wp-content/uploads/2025/04/quien_dice_mision_dice_capacitacion.docx` | `https://assets.ctfassets.net/i46buyptg48q/1uyDfKd6QRSj3eWkX1UUC6/4afad198575d787a2eabd1b6cef7b472/quien_dice_mision_dice_capacitacion.docx` |
| `/wp-content/uploads/2025/04/realizar_alianzas_estrategicas_para_el_envio_de_misioneros.doc` | `https://assets.ctfassets.net/i46buyptg48q/6RikDreBnMvJRhhhaQicuW/c049c52a0336e8a30110e372176290c9/realizar_alianzas_estrategicas_para_el_envio_de_misioneros.doc` |
| `/wp-content/uploads/2025/04/relaciones_y_alianzas.docx` | `https://assets.ctfassets.net/i46buyptg48q/5rhMqqoP2VFlyAWyjE2BXS/d1884e951f3738bb1ae737d6d01bfc88/relaciones_y_alianzas.docx` |
| `/wp-content/uploads/2025/04/religiones_del_mundo.docx` | `https://assets.ctfassets.net/i46buyptg48q/6irqnkdov6ScUtCd9UcWS2/ce6c9ceed8c644a7b0caa260b3fdf46e/religiones_del_mundo.docx` |
| `/wp-content/uploads/2025/04/repensando_nuestra_capacitacion_misionera.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5yPK03VTrE0FVebGMWzWTe/d036ffd69dfb3a066dd34f5c20bea2a0/repensando_nuestra_capacitacion_misionera.pdf` |
| `/wp-content/uploads/2025/04/seis_llaves_para_abrir_la_puerta_a_las_misiones.docx` | `https://assets.ctfassets.net/i46buyptg48q/1R8YkJtlCS4xbcUf9zLB0c/11ea4e74e6c5e79855f18b6a0244314f/seis_llaves_para_abrir_la_puerta_a_las_misiones.docx` |
| `/wp-content/uploads/2025/04/seminario_de_mov_misio_de_la_igl_local.doc` | `https://assets.ctfassets.net/i46buyptg48q/2afHYXj0KklHBo3sDYzeMA/1d86c70ce35bc89696c08866001175ea/seminario_de_mov_misio_de_la_igl_local.doc` |
| `/wp-content/uploads/2025/04/separacion_entre_lo_sagrado_y_lo_secular.docx` | `https://assets.ctfassets.net/i46buyptg48q/3CatbneMeej5kVmlkmxme6/3389ac5ec7295ddcf0bc30d340ce38ec/separacion_entre_lo_sagrado_y_lo_secular.docx` |
| `/wp-content/uploads/2025/04/sufrimiento_el_costo_del_discipulado.docx` | `https://assets.ctfassets.net/i46buyptg48q/2vzZtP9uEjNzEdFLHXOLNZ/ca91215dd76d3b1be1f1c310bfb09991/sufrimiento_el_costo_del_discipulado.docx` |
| `/wp-content/uploads/2025/04/tallerdemanoschiquitas.doc` | `https://assets.ctfassets.net/i46buyptg48q/2kSTL5vkHuvh47R2ARXSvz/11ff92bcacb10fee7a12e95a8a7c1dda/tallerdemanoschiquitas.doc` |
| `/wp-content/uploads/2025/04/tengo_dones_para_servir_en_1.doc` | `https://assets.ctfassets.net/i46buyptg48q/3PH4BbtBkzQ0VVfyWN4QgI/a7f2f592726fe2e234af74e620463151/tengo_dones_para_servir_en_1.doc` |
| `/wp-content/uploads/2025/04/test_dones_espirituales.pdf` | `https://assets.ctfassets.net/i46buyptg48q/57pEf6pPOvVJF3eAedAEy6/6cebb12953914f5e24d3fd78e0508ca3/test_dones_espirituales.pdf` |
| `/wp-content/uploads/2025/04/testimonios_ministerio_amistad_compatibility_mode.pdf` | `https://assets.ctfassets.net/i46buyptg48q/6bZsUvL7zd9v8Pt08ed72y/c03f27e1b515939b6672d923c0a304dc/testimonios_ministerio_amistad_compatibility_mode.pdf` |
| `/wp-content/uploads/2025/04/tomando_buenas_decisiones.docx` | `https://assets.ctfassets.net/i46buyptg48q/7cqPl6xkyPpldFKNzYRlML/4fb0c962d7fc2f2f121a97eaff8ee304/tomando_buenas_decisiones.docx` |
| `/wp-content/uploads/2025/04/trabajando_tu_llamado_a_las_naciones_-_completo.pdf` | `https://assets.ctfassets.net/i46buyptg48q/66PdYEXSGHuFTBaLSpmPxw/07dcebfc8a5c5b1b54590d3e265eccb1/trabajando_tu_llamado_a_las_naciones_-_completo.pdf` |
| `/wp-content/uploads/2025/04/tripticocomo_me_preparo_0.pdf` | `https://assets.ctfassets.net/i46buyptg48q/3sgCIT51TYl6dO54cBAVe0/694f82bc8280cd81a36ea94898b94d5a/tripticocomo_me_preparo.pdf` |
| `/wp-content/uploads/2025/04/tripticocomo_me_preparo.pdf` | `https://assets.ctfassets.net/i46buyptg48q/3sgCIT51TYl6dO54cBAVe0/694f82bc8280cd81a36ea94898b94d5a/tripticocomo_me_preparo.pdf` |
| `/wp-content/uploads/2025/04/tripticofondos_0.pdf` | `https://assets.ctfassets.net/i46buyptg48q/4fcGxvGkeC3wzw6GeiRb5v/6d17c27aa6010e722c0ce784baef2072/tripticofondos_0.pdf` |
| `/wp-content/uploads/2025/04/tripticooracion.pdf` | `https://assets.ctfassets.net/i46buyptg48q/671D5AMf0awps2EmQ4WdGM/c759718db42f46ddacabdb915f45cf22/tripticooracion.pdf` |
| `/wp-content/uploads/2025/04/un_ano_de_misiones.pdf` | `https://assets.ctfassets.net/i46buyptg48q/2wVydNo021SZwTI6vaR1Th/97e11b59cf308e4dd879b1aab0e6cf02/un_ano_de_misiones.pdf` |
| `/wp-content/uploads/2025/04/un_modelo_de_cooperacion_f.doc` | `https://assets.ctfassets.net/i46buyptg48q/abgdL6ALdRWLrPVjfLdQW/0def415fc900e24740ff574e246994ae/un_modelo_de_cooperacion_f.doc` |
| `/wp-content/uploads/2025/04/un_motivo_para_orar.docx` | `https://assets.ctfassets.net/i46buyptg48q/4Ti0f0ytLnX651s5f8XQHK/48e9c4fce9153255665c426f60615106/un_motivo_para_orar.docx` |
| `/wp-content/uploads/2025/04/una_leccion_en_milagros.docx` | `https://assets.ctfassets.net/i46buyptg48q/49z8pMNba1yaB1q5s4OJgN/e42aac33a8efb7649592ed147f21d76b/una_leccion_en_milagros.docx` |
| `/wp-content/uploads/2025/04/verdaderas_asociaciones_eclesiales_transculturales.docx` | `https://assets.ctfassets.net/i46buyptg48q/2rQjrgVfqlgdrvtCiXTPMF/4ce6300995d6c49de652dcf54526e6c7/verdaderas_asociaciones_eclesiales_transculturales.docx` |
| `/wp-content/uploads/2025/08/GuiadeOracion-ORA1002-SIM_compressed-1.pdf` | `https://assets.ctfassets.net/i46buyptg48q/7rkavmV7Xrc0W9NrMgpFKE/f1ec0007009e8b46d73c715983609e64/GuiadeOracion-ORA1002-SIM_compressed-1.pdf` |
| `/wp-content/uploads/2025/11/SIMLaEnvio25.pdf` | `https://assets.ctfassets.net/i46buyptg48q/2J91cKYz3BstWy2uqxyAPB/2446d2a9a27e3896a3e1e32ebeb377b2/SIMLaEnvio25.pdf` |
| `/wp-content/uploads/2026/05/LlamadoMacedonioJun26.pdf` | `https://assets.ctfassets.net/i46buyptg48q/5sKOm1A4z03ITdsMwTjeQQ/bbc5c010f8066c6f4098a9e1a5c427ee/LlamadoMacedonioJun26.pdf` |

## Junk — no redirect

- `/wp-content/uploads/2024/09/log_file_2024-09-16__15-50-11.txt`
- `/wp-content/uploads/2024/11/DELETE-mujeresenmisionvamosdic19.pdf`
- `/wp-content/uploads/2024/11/DELETE-oracionvamosjunio14.pdf`
- `/wp-content/uploads/2024/11/DELETE-saludmentalvamosfeb21.pdf`
- `/wp-content/uploads/2024/11/DELETE-vamosdic2012.pdf`
