(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  window.setTimeout(() => $(".loader")?.classList.add("loader-done"), 1300);

  const menu = $(".site-nav");
  $(".site-header > button")?.addEventListener("click", () => {
    menu?.classList.add("open");
    document.body.classList.add("nav-open");
  });
  $(".site-nav > button")?.addEventListener("click", () => {
    menu?.classList.remove("open");
    document.body.classList.remove("nav-open");
  });
  $$(".site-nav nav a").forEach((link) => link.addEventListener("click", () => {
    menu?.classList.remove("open");
    document.body.classList.remove("nav-open");
  }));

  const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("revealed");
  }), { threshold: 0.08 });
  $$('[data-reveal]').forEach((node) => reveal.observe(node));

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty("--progress", max > 0 ? scrollY / max : 0);
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const grammar = {
    Habitar: ["Una unidad clara ordena estructura, envolvente y espacio sin imponer una única escena doméstica.", "Medida común", "Habitar", "Espacio no cerrado"],
    Extender: ["La misma medida prepara encuentros compatibles para añadir programa en una o dos direcciones.", "Medida común", "Extender", "Espacio no cerrado"],
    Abrir: ["Vacío, patio y umbral entran en la gramática: crecer también puede significar quitar materia.", "Medida común", "Abrir", "Espacio no cerrado"],
  };
  const theatre = $(".grammar-theatre");
  $$(".grammar-theatre nav button").forEach((button, index) => button.addEventListener("click", () => {
    const title = $("b", button)?.textContent?.trim();
    if (!title || !grammar[title] || !theatre) return;
    theatre.className = `grammar-theatre grammar-${["habitar", "extender", "abrir"][index]}`;
    $$(".grammar-theatre nav button").forEach((item) => item.classList.toggle("active", item === button));
    const aside = $("aside", theatre);
    $("aside > span", theatre).textContent = `0${index + 1} / operación`;
    $("aside h3", theatre).textContent = title;
    $("aside > p", theatre).textContent = grammar[title][0];
    const values = $$("aside dd", theatre);
    values[0].textContent = grammar[title][1]; values[1].textContent = grammar[title][2]; values[2].textContent = grammar[title][3];
  }));

  const tech = [
    ["Documentar", "La obra empieza antes de la obra.", "Arquitectura, estructura, encuentros y secuencia se coordinan en un modelo legible antes de fabricar.", "Despiece · tolerancia · secuencia", "assets/v8/process-02-despiece-y-documentacion.webp"],
    ["Fabricar", "Control donde importa.", "Piezas y subconjuntos avanzan en un entorno preparado, con geometría, lote y calidad vinculados al proyecto.", "Pieza · lote · control", "assets/v8/tech-img_0238.webp"],
    ["Expedir", "La logística también se diseña.", "Orden de carga, posición y llegada forman parte del sistema porque condicionan el montaje desde el inicio.", "Carga · transporte · posición", "assets/v8/process-04-logistica-y-expedicion.webp"],
    ["Montar", "El sistema aparece a escala real.", "Recepción, izado, enlace mecánico y verificación convierten el documento en una secuencia visible sobre el territorio.", "Izado · junta seca · verificación", "assets/v8/process-piedrahita_lift.webp"],
    ["Recordar", "Cada pieza puede tener biografía.", "La identidad del componente puede conectar fabricación, instalación, mantenimiento, desmontaje y siguiente uso.", "Identidad · evidencia · memoria", "assets/v8/tech-img_7522.webp"],
  ];
  $$(".tech-flow > nav button").forEach((button, index) => button.addEventListener("click", () => {
    const stage = tech[index];
    $$(".tech-flow > nav button").forEach((item) => item.classList.toggle("active", item === button));
    $(".process-screen figure > img").src = stage[4];
    $(".process-screen figcaption").textContent = `Proceso / ${stage[0]}`;
    $(".process-screen article > span").textContent = `0${index + 1} / ${stage[0]}`;
    $(".process-screen article h3").textContent = stage[1];
    $(".process-screen article p").textContent = stage[2];
    $(".process-screen article strong").textContent = stage[3];
  }));

  const materialData = [
    ["Hormigón", "Masa / inercia / textura", "Lectura mineral y capacidad estructural, definida según proyecto, exposición y sistema de unión."],
    ["Acero", "Precisión / luz / desmontaje", "Sección controlada y uniones mecánicas para piezas que necesitan exactitud, esbeltez y trazabilidad."],
    ["Madera", "Calidez / ligereza / tacto", "Materia renovable cuando su origen y especificación se verifican; útil en estructura, envolvente e interior."],
    ["Plástico reciclado", "Recuperación / color / resistencia", "Compuesto a evaluar para elementos compatibles con su desempeño, mantenimiento y siguiente ciclo."],
  ];
  $$(".material-drawer nav button").forEach((button, index) => button.addEventListener("click", () => {
    const material = materialData[index];
    $$(".material-drawer nav button").forEach((item) => item.classList.toggle("active", item === button));
    $(".material-drawer article > span").textContent = `0${index + 1} / material`;
    $(".material-drawer article h3").textContent = material[0];
    $(".material-drawer article strong").textContent = material[1];
    $(".material-drawer article p").textContent = material[2];
  }));

  const states = { place: "paisaje", expression: "calma" };
  const recommendation = () => states.expression === "libre" ? "Imago" : states.expression === "materia" ? "Line" : states.place === "urbano" ? "Basic" : "Natura";
  const statements = { Basic: "Lo esencial, muy bien medido.", Line: "Una línea que ordena el paisaje.", Natura: "Habitar sin separarse del lugar.", Imago: "El sistema también admite excepción." };
  $$(".brief-controls fieldset").forEach((fieldset, group) => $$("button", fieldset).forEach((button, index) => button.addEventListener("click", () => {
    $$("button", fieldset).forEach((item) => item.classList.toggle("selected", item === button));
    if (group === 0) states.place = ["paisaje", "bosque", "urbano"][index];
    else states.expression = ["calma", "materia", "libre"][index];
    const name = recommendation();
    $(".brief-result > strong").textContent = name;
    $(".brief-result > p").textContent = statements[name];
    $(".brief-result a").href = `mailto:viviendas@nancananca.com?subject=Proyecto%20Nanca%20${name}`;
  })));

  const video = $(".tech-film video");
  if (video && location.hostname.endsWith(".github.io")) {
    const owner = location.hostname.split(".")[0];
    const firstPath = location.pathname.split("/").filter(Boolean)[0];
    const repository = firstPath || `${owner}.github.io`;
    const source = document.createElement("source");
    source.type = "video/mp4";
    video.append(source);
    const expectedAsset = `https://github.com/${owner}/${repository}/releases/download/Llar/nanca-v1-system-film.mp4`;
    fetch(`https://api.github.com/repos/${owner}/${repository}/releases/tags/Llar`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((release) => release.assets.find((asset) => asset.name.toLowerCase().endsWith(".mp4"))?.browser_download_url)
      .catch(() => expectedAsset)
      .then((filmUrl) => {
        source.src = filmUrl || expectedAsset;
        video.load();
        video.play().catch(() => {});
      });
  }
})();
