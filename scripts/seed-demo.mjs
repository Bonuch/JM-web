import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { encodePng } from "./generate-png.mjs";
import { createScene } from "./demo-scene.mjs";
// Node 24 понимает TypeScript напрямую, поэтому настройки берутся из того же
// модуля, что использует само приложение — без второго источника правды.
import { defaultSettings } from "../lib/defaults.ts";

/**
 * Наполняет сайт демо-проектами, чтобы можно было посмотреть, как он живёт с
 * контентом. Изображения генерируются процедурно — никаких чужих фотографий.
 *
 * Запуск: npm run seed
 * Удалить демо: npm run seed -- --clean (или удалить проекты в админке).
 */
const ROOT = process.cwd();
const UPLOAD_DIR = path.join(ROOT, "public", "uploads", "demo");
const DATA_DIR = path.join(ROOT, ".data");
const DATA_FILE = path.join(DATA_DIR, "content__site.json");

const SIZES = {
  full: 1600,
  medium: 1000,
  thumb: 560,
};

const PROJECTS = [
  {
    slug: "hamovniki-apartment",
    palette: "warmClay",
    ratio: 3 / 2,
    category: "apartment",
    title: { ru: "Квартира в Хамовниках", en: "Apartment in Khamovniki" },
    location: { ru: "Москва", en: "Moscow" },
    area: "96 м²",
    year: "2026",
    style: { ru: "Современная классика", en: "Contemporary classic" },
    excerpt: {
      ru: "Светлая квартира для семьи из трёх человек: спокойная палитра, много дерева и мягкого света.",
      en: "A bright apartment for a family of three: a calm palette, plenty of wood and soft light.",
    },
    description: {
      ru: "Заказчик пришёл с готовой планировкой и просьбой показать, как квартира будет жить при вечернем свете.\n\nОсновная задача была в балансе: сохранить светлую базу, но не сделать интерьер стерильным. Мы добавили тёплое дерево в отделке и латунные детали, которые собирают на себя блики.\n\nВизуализация помогла заказчику согласовать проект с семьёй за одну встречу — без правок по расстановке.",
      en: "The client arrived with a finished layout and asked to see how the apartment would live in evening light.\n\nThe main task was balance: keep the light base without making the interior sterile. We added warm wood finishes and brass details that catch the highlights.\n\nThe visualization helped the client sign off the project with their family in a single meeting, with no layout revisions.",
    },
  },
  {
    slug: "pine-house-terrace",
    palette: "deepGreen",
    ratio: 3 / 2,
    category: "house",
    title: { ru: "Дом с сосновой террасой", en: "House with a pine terrace" },
    location: { ru: "Ленинградская область", en: "Leningrad Oblast" },
    area: "180 м²",
    year: "2025",
    style: { ru: "Скандинавский", en: "Scandinavian" },
    excerpt: {
      ru: "Загородный дом, где гостиная выходит панорамным остеклением прямо в лес.",
      en: "A country house where the living room opens onto the forest through panoramic glazing.",
    },
    description: {
      ru: "Главный герой проекта — свет, который меняется в течение дня и приносит в дом цвет леса.\n\nМы собрали три времени суток, чтобы показать, как работает панорамное остекление. Тёмная столярка не спорит с зеленью за окном, а обрамляет её.\n\nПо этим кадрам заказчик утверждал бюджет на остекление — самую дорогую часть проекта.",
      en: "The lead character here is light: it changes through the day and brings the colour of the forest inside.\n\nWe rendered three times of day to show how the panoramic glazing works. The dark joinery does not compete with the greenery outside — it frames it.\n\nThe client used these frames to approve the glazing budget, the most expensive part of the project.",
    },
  },
  {
    slug: "coffee-bar-mira",
    palette: "nightBrass",
    ratio: 4 / 5,
    category: "commercial",
    title: { ru: "Кофейня на проспекте Мира", en: "Coffee bar on Mira Avenue" },
    location: { ru: "Москва", en: "Moscow" },
    area: "68 м²",
    year: "2025",
    style: { ru: "Тёплый минимализм", en: "Warm minimalism" },
    excerpt: {
      ru: "Небольшое пространство с барной стойкой на всю длину зала и вечерним светом.",
      en: "A compact space with a bar counter running the full length of the room and evening light.",
    },
    description: {
      ru: "Для кофейни важно было показать, как место выглядит вечером — именно тогда приходит основная выручка.\n\nСвет собран из трёх сценариев: витрина, подсветка стойки и точечные светильники над столами. Латунь и тёмное дерево дают тот самый «дорогой» блик.\n\nКадры ушли в презентацию для арендодателя и в рекламные материалы перед открытием.",
      en: "For a coffee bar it was important to show how the space looks in the evening — that is when most of the revenue comes in.\n\nThe lighting is built from three scenarios: the shopfront, the counter strip and spots above the tables. Brass and dark wood deliver that expensive highlight.\n\nThe frames went into the landlord presentation and into pre-opening marketing.",
    },
  },
  {
    slug: "studio-loft-sever",
    palette: "coolStone",
    ratio: 3 / 2,
    category: "apartment",
    title: { ru: "Студия в лофте «Север»", en: "Studio in the Sever loft" },
    location: { ru: "Санкт-Петербург", en: "Saint Petersburg" },
    area: "42 м²",
    year: "2026",
    style: { ru: "Индустриальный", en: "Industrial" },
    excerpt: {
      ru: "Компактная студия, где кухня, спальня и рабочее место живут в одном объёме.",
      en: "A compact studio where the kitchen, bedroom and workspace share one volume.",
    },
    description: {
      ru: "Сложность маленьких студий в том, что все зоны видно одновременно. Любая ошибка в расстановке сразу читается.\n\nМы проверили три варианта зонирования и выбрали тот, где кровать не попадает в кадр от входа. Бетон уравновешен тёплым текстилем.\n\nЗастройщик использовал кадры в продаже похожих планировок в том же корпусе.",
      en: "Small studios are hard because every zone is visible at once. Any mistake in the layout reads immediately.\n\nWe tested three zoning options and chose the one where the bed stays out of frame from the entrance. Concrete is balanced with warm textiles.\n\nThe developer used the frames to sell similar layouts in the same building.",
    },
  },
  {
    slug: "linen-sofa-collection",
    palette: "paleLinen",
    ratio: 4 / 5,
    category: "furniture",
    title: { ru: "Коллекция диванов Linen", en: "Linen sofa collection" },
    location: { ru: "Каталог бренда", en: "Brand catalogue" },
    area: "8 моделей",
    year: "2025",
    style: { ru: "Предметная съёмка", en: "Product photography" },
    excerpt: {
      ru: "Каталожные кадры мебельной линейки: одинаковый ракурс, разные ткани и цвета.",
      en: "Catalogue frames for a furniture line: identical angle, different fabrics and colours.",
    },
    description: {
      ru: "Производителю нужны были карточки товара с одинаковой геометрией кадра, чтобы линейка смотрелась как система.\n\nМы собрали одну сцену и меняли только материал обивки — так фотосъёмка восьми моделей превратилась в один просчёт с вариантами.\n\nПри добавлении новых тканей кадры пересчитываются за день, без повторной студийной съёмки.",
      en: "The manufacturer needed product cards with identical frame geometry so the line would read as a system.\n\nWe built one scene and changed only the upholstery material, turning a shoot of eight models into a single render with variants.\n\nWhen new fabrics arrive, the frames are recalculated in a day, with no repeat studio session.",
    },
  },
  {
    slug: "lobby-riverside",
    palette: "softSand",
    ratio: 3 / 2,
    category: "commercial",
    title: { ru: "Лобби клубного дома Riverside", en: "Riverside clubhouse lobby" },
    location: { ru: "Казань", en: "Kazan" },
    area: "140 м²",
    year: "2026",
    style: { ru: "Неоклассика", en: "Neoclassical" },
    excerpt: {
      ru: "Входная группа с двойным светом, консьерж-зоной и зоной ожидания.",
      en: "An entrance hall with double-height light, a concierge desk and a waiting area.",
    },
    description: {
      ru: "Лобби продаёт дом раньше квартир: это первое, что видит покупатель на показе.\n\nЗадача была показать высоту пространства и качество материалов — камень, шпон, мягкий рассеянный свет. Мы добавили фигуры людей, чтобы читался масштаб.\n\nКадры вошли в буклет и в наружную рекламу жилого комплекса.",
      en: "The lobby sells the building before the apartments do: it is the first thing a buyer sees at a viewing.\n\nThe task was to convey the height of the space and the quality of materials — stone, veneer, soft diffused light. We added figures so the scale reads correctly.\n\nThe frames went into the brochure and the outdoor advertising for the development.",
    },
  },
];

/** Три вариации ракурса внутри одного проекта. */
const VIEWS = [
  { windowX: 0.58, horizon: 0.68, variant: 0 },
  { windowX: 0.3, horizon: 0.72, variant: 1 },
  { windowX: 0.74, horizon: 0.64, variant: 2 },
];

async function renderVariant(scene, width, height) {
  return encodePng(width, height, (x, y) => scene(x, y, width, height));
}

async function buildImage(project, view, index) {
  const scene = createScene({ palette: project.palette, ...view });
  const id = randomUUID();

  const fullWidth = SIZES.full;
  const fullHeight = Math.round(fullWidth / project.ratio);

  const variants = await Promise.all(
    (["full", "medium", "thumb"]).map(async (key) => {
      const width = SIZES[key];
      const height = Math.round(width / project.ratio);
      const buffer = await renderVariant(scene, width, height);
      const filename = `${project.slug}-${index + 1}-${key}.png`;
      await writeFile(path.join(UPLOAD_DIR, filename), buffer);
      return [key, `/uploads/demo/${filename}`];
    }),
  );

  const urls = Object.fromEntries(variants);

  // крошечная версия в base64 — заглушка на время загрузки
  const blurWidth = 12;
  const blurHeight = Math.max(1, Math.round(blurWidth / project.ratio));
  const blurBuffer = await renderVariant(scene, blurWidth, blurHeight);

  const { size } = await stat(path.join(UPLOAD_DIR, `${project.slug}-${index + 1}-full.png`));

  return {
    id,
    url: urls.full,
    mediumUrl: urls.medium,
    thumbUrl: urls.thumb,
    width: fullWidth,
    height: fullHeight,
    blurDataURL: `data:image/png;base64,${blurBuffer.toString("base64")}`,
    bytes: size,
    format: "image/png",
    alt: { ru: "", en: "" },
  };
}

async function main() {
  const clean = process.argv.includes("--clean");
  await mkdir(DATA_DIR, { recursive: true });

  if (clean) {
    await writeFile(
      DATA_FILE,
      JSON.stringify({ version: 1, projects: [], settings: defaultSettings() }, null, 2),
      "utf8",
    );
    console.log("Демо-контент удалён. Проекты очищены, настройки сброшены.");
    return;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const now = new Date().toISOString();
  const projects = [];

  for (const [index, project] of PROJECTS.entries()) {
    process.stdout.write(`Рисуем «${project.title.ru}»… `);
    const images = [];
    for (const [viewIndex, view] of VIEWS.entries()) {
      images.push(await buildImage(project, view, viewIndex));
    }
    console.log("готово");

    projects.push({
      id: randomUUID(),
      slug: project.slug,
      title: project.title,
      category: project.category,
      location: project.location,
      area: project.area,
      year: project.year,
      style: project.style,
      excerpt: project.excerpt,
      description: project.description,
      cover: images[0],
      images,
      featured: index < 4,
      published: true,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeFile(
    DATA_FILE,
    JSON.stringify({ version: 1, projects, settings: defaultSettings() }, null, 2),
    "utf8",
  );

  console.log(`\nГотово: ${projects.length} демо-проектов, ${projects.length * VIEWS.length} изображений.`);
  console.log("Откройте http://localhost:3000 — сайт наполнен.");
  console.log("Удалить демо: npm run seed -- --clean");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
