-- PROPUESTA, NO APLICADA. Ejecutar a mano en el editor SQL de Supabase.
-- Añade la especialidad Biología y Geología (Secundaria) con su temario
-- oficial de 75 temas. Se puede ejecutar más de una vez sin duplicar nada.
-- Revisa antes que el temario coincide con la convocatoria vigente.

begin;

insert into public.specialties (education_stage_id, name, slug, description, is_active)
select s.education_stage_id, 'Biología y Geología', 'biologia-y-geologia',
       'Profesores de Enseñanza Secundaria', true
from (select education_stage_id from public.specialties order by created_at limit 1) s
where not exists (
  select 1 from public.specialties where slug = 'biologia-y-geologia'
);

insert into public.base_topics (specialty_id, topic_number, title, is_active)
select sp.id, t.topic_number, t.title, true
from public.specialties sp
cross join (values
  (1, 'La Tierra en el universo. Geología de los planetas. Origen de la Tierra y del Sistema Solar.'),
  (2, 'Estructura y composición de la Tierra. Los métodos de estudio.'),
  (3, 'La materia mineral y la cristalina. Propiedades y métodos de estudio.'),
  (4, 'Magmatismo. Las rocas ígneas más importantes.'),
  (5, 'Metamorfismo. Las rocas metamórficas más importantes.'),
  (6, 'Los ambientes sedimentarios. Litogénesis. Las rocas sedimentarias más importantes.'),
  (7, 'Minerales petrogenéticos. Minerales y rocas de interés económico.'),
  (8, 'Los impactos ambientales del aprovechamiento de los recursos geológicos.'),
  (9, 'Las teorías orogénicas. Deriva continental y tectónica de placas.'),
  (10, 'Interpretación global de los fenómenos geológicos en el marco de la teoría de la tectónica de placas.'),
  (11, 'La atmósfera: estructura, composición y dinámica. La contaminación atmosférica. Métodos de determinación y de corrección.'),
  (12, 'La hidrosfera. El ciclo del agua. La contaminación del agua. Métodos de análisis y depuración. El problema de la escasez de agua.'),
  (13, 'El equilibrio térmico del planeta. El clima y su distribución. Los sistemas morfoclimáticos. Grandes cambios climáticos históricos.'),
  (14, 'Geomorfología. Los factores condicionantes del modelado del relieve. La importancia de la litología y las estructuras geológicas.'),
  (15, 'El modelado de las zonas áridas. El problema de la desertización. Medidas de prevención y corrección.'),
  (16, 'El modelado fluvial, costero y glacial. Las aguas subterráneas. Los impactos en las costas.'),
  (17, 'El suelo: origen, estructura y composición. La utilización del suelo. La contaminación del suelo. Métodos de análisis del suelo.'),
  (18, 'La Tierra, un planeta en continuo cambio. Los fósiles como indicadores. El tiempo geológico. Explicaciones históricas al problema de los cambios.'),
  (19, 'La historia geológica de la Tierra. Fauna y flora fósiles.'),
  (20, 'La investigación geológica de España. Fundamentos y utilidad de la fotografía aérea, el mapa topográfico y el mapa geológico. Importancia de la geología en la búsqueda de recursos y en las obras públicas.'),
  (21, 'La constitución geológica de España. Repercusiones de la geología en la variedad de paisajes, distribución de recursos, las comunicaciones y la industria. El problema de los riesgos. La ordenación del territorio.'),
  (22, 'El origen de la vida y su interpretación histórica. Evolución precelular. La teoría celular y la organización de los seres vivos.'),
  (23, 'La base química de la vida: componentes inorgánicos y orgánicos. El agua y las sales minerales. Los glúcidos y los lípidos. Su biosíntesis.'),
  (24, 'Aminoácidos y proteínas. Biosíntesis proteica. Enzimas y coenzimas. Las vitaminas.'),
  (25, 'Los ácidos nucleicos. Replicación y transcripción.'),
  (26, 'Métodos de estudio de la célula. Células procariontas y eucariontas. La célula animal y vegetal. Formas acelulares.'),
  (27, 'La membrana plasmática y la pared celular. Citosol, citoesqueleto. Sistemas de membranas y orgánulos. Motilidad celular.'),
  (28, 'Necesidades energéticas de la célula. La respiración celular aerobia y anaerobia. La fotosíntesis. La quimiosíntesis.'),
  (29, 'El núcleo interfásico y el núcleo en división. El ciclo celular y la división celular. Mitosis y meiosis.'),
  (30, 'Niveles de organización de los seres vivos. La diferenciación celular. Tejidos animales y vegetales.'),
  (31, 'La reproducción asexual y la reproducción sexual. Genética del sexo. Gametogénesis. Fecundación y desarrollo embrionario en metazoos. Ciclos biológicos.'),
  (32, 'La clasificación de los seres vivos. Taxonomía y nomenclatura. Los cinco reinos, relaciones evolutivas. Los virus y su patología. Otras formas acelulares.'),
  (33, 'Reino moneras. Las cianofitas. Las bacterias y su importancia en la sanidad, la industria y la investigación básica.'),
  (34, 'Reino protoctistas. Géneros más comunes en charcas, ríos y mares. El papel ecológico y su importancia económica y sanitaria.'),
  (35, 'Reino hongos. Hongos comunes en nuestros campos y bosques. Importancia en los ecosistemas. Aplicaciones y utilidad. Los líquenes. Su papel como indicadores.'),
  (36, 'Las plantas I. Briofitas. Géneros comunes e importancia ecológica. El paso a la vascularidad: licopodios, equisetos y helechos. La adquisición de semillas: cicadófitos y ginkófitos.'),
  (37, 'Las plantas II. Coniferófitos y angiospermatófitos. Caracteres generales, origen, clasificación y ecología. Familias y especies de árboles y arbustos españoles más representativos. La destrucción de los bosques. La repoblación y las medidas preventivas.'),
  (38, 'Morfología y fisiología de las estructuras vegetativas y reproductoras de las cormófitas.'),
  (39, 'La agricultura en España. El impacto ambiental de la sobreexplotación. Nuevas alternativas para la obtención de recursos alimentarios.'),
  (40, 'Invertebrados no artrópodos: fila poríferos, cnidarios, ctenóforos, platelmintos, nematodos, anélidos, moluscos y equinodermos. Especies representativas de nuestra fauna. Importancia económica, sanitaria y alimentaria.'),
  (41, 'Invertebrados artrópodos. Insectos, crustáceos, arácnidos y miriápodos. Especies representativas de nuestra fauna. Importancia económica, sanitaria y alimentaria.'),
  (42, 'Filum cordados. Caracteres generales y clasificación. Los vertebrados: características generales y clasificación. Agnatos y condrictios.'),
  (43, 'Órganos y funciones de nutrición en los vertebrados.'),
  (44, 'Órganos y funciones de relación en los vertebrados.'),
  (45, 'Órganos y funciones de reproducción en los vertebrados.'),
  (46, 'Otros recursos bióticos. Aprovechamiento medicinal, ornamental, agropecuario, avícola, pesquero. La biotecnología.'),
  (47, 'Ecología. Poblaciones, comunidades y ecosistemas. Dinámica de las poblaciones. Interacciones en el ecosistema. Relaciones intra e interespecíficas.'),
  (48, 'El ecosistema en acción. Estructura, funcionamiento y autorregulación del ecosistema.'),
  (49, 'El paisaje: componentes e interpretación. Paisajes españoles característicos. El paisaje como recurso estético. Impactos en el paisaje. Espacios protegidos.'),
  (50, 'Los impactos ambientales de las actividades humanas. Los grandes impactos globales.'),
  (51, 'Los problemas ambientales y sus repercusiones políticas, económicas y sociales. Salud ambiental y calidad de vida. La educación ambiental.'),
  (52, 'Anatomía y fisiología de los aparatos digestivo y urinario humanos. Hábitos saludables. Principales enfermedades.'),
  (53, 'Anatomía y fisiología de los sistemas circulatorio y respiratorio humanos. Hábitos saludables. Principales enfermedades.'),
  (54, 'Nutrición y alimentación. Hábitos saludables. Principales enfermedades. Las personas como consumidores.'),
  (55, 'El medio interno: sangre, linfa, líquidos intersticiales. Hábitos saludables. Principales enfermedades.'),
  (56, 'Anatomía y fisiología del sistema nervioso humano. Alteraciones del sistema nervioso en la sociedad actual. Hábitos saludables. La salud mental.'),
  (57, 'Anatomía y fisiología de los órganos de los sentidos en el ser humano. Hábitos saludables y principales enfermedades.'),
  (58, 'Anatomía y fisiología del sistema endocrino. Regulación neuroendocrina. Principales alteraciones.'),
  (59, 'Anatomía y fisiología del aparato locomotor. Hábitos posturales adecuados y principales enfermedades.'),
  (60, 'Los cambios corporales a lo largo de la vida. La sexualidad y la reproducción. Anatomía y fisiología de los aparatos reproductores. Hábitos saludables y principales enfermedades.'),
  (61, 'La salud y la enfermedad. Evolución del concepto de salud. Las enfermedades de nuestro tiempo. Las drogodependencias. Estilos de vida saludables.'),
  (62, 'El sistema inmunológico. La inmunodeficiencia. Los sueros y las vacunas: descubrimiento histórico e importancia sanitaria y económica.'),
  (63, 'La genética mendeliana. La teoría cromosómica de la herencia. Las mutaciones.'),
  (64, 'La genética molecular. La ingeniería genética y sus aplicaciones. Su dimensión ética.'),
  (65, 'La naturaleza de la evolución. Mecanismos y pruebas. Principales teorías.'),
  (66, 'Evolución de la concepción de Ciencia. Las revoluciones científicas y los cambios de paradigmas en la Biología y la Geología. La ciencia como proceso en construcción. Los científicos y sus condicionamientos sociales. Las actitudes científicas en la vida cotidiana.'),
  (67, 'Momentos claves en la historia de la Biología y la Geología. La Biología y la Geología españolas en el contexto mundial. Principales áreas de investigación actual. Las relaciones Ciencia/Tecnología/Sociedad en la Biología y la Geología.'),
  (68, 'Sistemas materiales. Propiedades generales y específicas. Aplicaciones. Comportamiento de los gases. Estructura de la materia. Teoría cinética y teoría atómico-molecular. Papel de los modelos y de las teorías.'),
  (69, 'Clasificación de los elementos químicos. Sistema periódico. Enlace químico. Justificación de las propiedades de las sustancias en función de su enlace. Reconocimiento de sustancias de uso común como ácidos, bases, metales, etc.'),
  (70, 'Cambios en la materia. Reacciones químicas. Intercambios energéticos. Estequiometría. Factores que afectan al desarrollo de las reacciones. Su importancia en la evolución de la sociedad.'),
  (71, 'Estudio del movimiento. Fuerzas, efectos sobre los cuerpos. Leyes de Newton. Estática de los cuerpos rígidos. Condiciones de equilibrio. Estática de fluidos.'),
  (72, 'El problema de la posición de la Tierra en el universo. Sistemas geocéntrico y heliocéntrico. Gravitación universal. Peso de los cuerpos. Importancia histórica de la unificación de la gravedad terrestre y celeste.'),
  (73, 'La energía. Transformación, conservación y degradación. Trabajo y calor, procesos de transferencia de energía. Efectos y propagación del calor. Propagación de energía sin transporte de masa: movimiento ondulatorio. Luz y sonido.'),
  (74, 'Naturaleza eléctrica de la materia. Corriente eléctrica. Electromagnetismo. Inducción electromagnética. La energía eléctrica: una forma privilegiada de energía. Evolución en las necesidades energéticas de la sociedad. Energías alternativas.'),
  (75, 'El trabajo experimental en el área de ciencias. Utilización del laboratorio escolar. Normas de seguridad.')
) as t(topic_number, title)
where sp.slug = 'biologia-y-geologia'
  and not exists (
    select 1 from public.base_topics b
    where b.specialty_id = sp.id and b.topic_number = t.topic_number
  );

commit;
