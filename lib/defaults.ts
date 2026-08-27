import type { Settings } from "./types";

/**
 * Стартовое наполнение сайта. Всё, что здесь описано, редактируется в
 * админке — эти значения нужны только для первого запуска.
 */
export function defaultSettings(): Settings {
  return {
    siteName: "IK Visual",
    logo: null,
    originalQuality: true,
    role: {
      ru: "3D-визуализация интерьеров",
      en: "Interior 3D visualization",
    },
    heroTitle: {
      ru: "Интерьер, который\nможно почувствовать\nдо ремонта",
      en: "Interiors you can feel\nbefore the first\nwall goes up",
    },
    heroSubtitle: {
      ru: "Фотореалистичные визуализации, которые помогают дизайнерам согласовывать проект с первого показа, а застройщикам — продавать площади до сдачи объекта.",
      en: "Photorealistic renders that help designers get approvals on the first presentation and developers sell space before handover.",
    },
    heroImage: null,
    email: "hello@example.com",
    phone: "+7 900 000-00-00",
    telegram: "https://t.me/username",
    whatsapp: "https://wa.me/79000000000",
    instagram: "",
    behance: "https://www.behance.net/username",
    pinterest: "",
    city: { ru: "Москва", en: "Moscow" },
    stats: [
      { id: "stat-1", value: "120+", label: { ru: "готовых проектов", en: "projects delivered" } },
      { id: "stat-2", value: "7", label: { ru: "лет в визуализации", en: "years in visualization" } },
      { id: "stat-3", value: "48 ч", label: { ru: "до первого чернового кадра", en: "to the first draft frame" } },
      { id: "stat-4", value: "3", label: { ru: "правки включены в стоимость", en: "revisions included" } },
    ],
    services: [
      {
        id: "service-express",
        title: { ru: "Экспресс-кадр", en: "Express frame" },
        description: {
          ru: "Один-два ракурса, когда нужно быстро показать идею заказчику или проверить гипотезу по планировке.",
          en: "One or two camera angles when you need to show the idea quickly or sanity-check a layout.",
        },
        price: { ru: "от 4 500 ₽ / ракурс", en: "from $60 / frame" },
        duration: { ru: "2–3 дня", en: "2–3 days" },
        includes: [
          { ru: "Моделирование по планировке", en: "Modelling from the floor plan" },
          { ru: "Подбор света и материалов", en: "Lighting and materials setup" },
          { ru: "Финал в 4K, JPG + PNG", en: "4K final, JPG + PNG" },
          { ru: "1 круг правок", en: "1 revision round" },
        ],
        highlighted: false,
        order: 0,
      },
      {
        id: "service-project",
        title: { ru: "Проект целиком", en: "Full project" },
        description: {
          ru: "Комплект кадров на всю квартиру или дом: каждая зона в своём характере, но в едином свете и цветовой логике.",
          en: "A full set of frames for an apartment or a house: every zone with its own character, unified light and colour logic.",
        },
        price: { ru: "от 3 500 ₽ / ракурс при заказе от 6", en: "from $45 / frame for 6+ frames" },
        duration: { ru: "5–10 дней", en: "5–10 days" },
        includes: [
          { ru: "Согласование ракурсов по плану", en: "Camera angles agreed on the plan" },
          { ru: "Полная детализация мебели и декора", en: "Full furniture and decor detailing" },
          { ru: "Единая цветокоррекция серии", en: "Consistent colour grading across the set" },
          { ru: "3 круга правок", en: "3 revision rounds" },
          { ru: "Исходники в 4K и версии для соцсетей", en: "4K masters plus social-ready crops" },
        ],
        highlighted: true,
        order: 1,
      },
      {
        id: "service-commercial",
        title: { ru: "Коммерческие пространства", en: "Commercial spaces" },
        description: {
          ru: "Рестораны, шоурумы, офисы и лобби: сложный свет, брендинг в интерьере, кадры для презентаций инвесторам.",
          en: "Restaurants, showrooms, offices and lobbies: complex lighting, in-space branding, frames for investor decks.",
        },
        price: { ru: "от 6 000 ₽ / ракурс", en: "from $80 / frame" },
        duration: { ru: "от 7 дней", en: "from 7 days" },
        includes: [
          { ru: "Вечерний и дневной свет", en: "Day and evening lighting" },
          { ru: "Брендинг и навигация в кадре", en: "Branding and wayfinding in frame" },
          { ru: "Люди и предметы для масштаба", en: "People and props for scale" },
          { ru: "Панорамы 360° по запросу", en: "360° panoramas on request" },
        ],
        highlighted: false,
        order: 2,
      },
      {
        id: "service-product",
        title: { ru: "Предметная визуализация", en: "Product visualization" },
        description: {
          ru: "Мебель и свет для каталогов и маркетплейсов: чистый фон, повторяемый ракурс, любые комбинации отделок.",
          en: "Furniture and lighting for catalogues and marketplaces: clean background, repeatable angle, any finish combination.",
        },
        price: { ru: "от 2 500 ₽ / кадр", en: "from $35 / shot" },
        duration: { ru: "2–5 дней", en: "2–5 days" },
        includes: [
          { ru: "Модель по чертежам производителя", en: "Model built from manufacturer drawings" },
          { ru: "Варианты отделок одним комплектом", en: "Finish variants in a single batch" },
          { ru: "Прозрачный фон PNG", en: "Transparent PNG background" },
          { ru: "Ракурс для карточки товара", en: "Marketplace-ready angle" },
        ],
        highlighted: false,
        order: 3,
      },
    ],
    faq: [
      {
        id: "faq-1",
        question: { ru: "Что нужно, чтобы начать?", en: "What do you need to start?" },
        answer: {
          ru: "Планировка с размерами и любые референсы: доски в Pinterest, фото из интернета, ссылки на мебель. Если есть готовый дизайн-проект — идеально, работа пойдёт быстрее. Если проекта нет, помогу собрать сцену по планировке и вашим пожеланиям.",
          en: "A dimensioned floor plan and any references: Pinterest boards, photos, furniture links. A finished design project speeds things up, but without one I can build the scene from the plan and your brief.",
        },
        order: 0,
      },
      {
        id: "faq-2",
        question: { ru: "Сколько правок входит в стоимость?", en: "How many revisions are included?" },
        answer: {
          ru: "До трёх кругов правок на этапе чернового рендера — меняем ракурс, свет, материалы, расстановку. Правки после финального просчёта тоже возможны, но уже отдельно, по объёму работы.",
          en: "Up to three revision rounds at the draft stage — camera, light, materials and layout. Changes after the final render are possible too, billed separately by scope.",
        },
        order: 1,
      },
      {
        id: "faq-3",
        question: { ru: "Как проходит оплата?", en: "How does payment work?" },
        answer: {
          ru: "50% предоплата после согласования сметы, остальное — перед выдачей финальных файлов. Работаю по договору, для юрлиц — с закрывающими документами.",
          en: "50% upfront once the quote is approved, the rest before the final files are handed over. I work under a contract and can issue invoices for companies.",
        },
        order: 2,
      },
      {
        id: "faq-4",
        question: { ru: "В каком качестве отдаёте файлы?", en: "In what quality are files delivered?" },
        answer: {
          ru: "Финальные кадры в 4K (3840 px по длинной стороне), JPG и PNG. По запросу — версии под соцсети, печать и панорамы 360°.",
          en: "Final frames in 4K (3840 px on the long side), JPG and PNG. On request: social crops, print-ready files and 360° panoramas.",
        },
        order: 3,
      },
      {
        id: "faq-5",
        question: { ru: "Работаете с другими городами?", en: "Do you work with other cities?" },
        answer: {
          ru: "Да, вся работа идёт удалённо: планировка, референсы и созвоны. География не влияет ни на сроки, ни на стоимость.",
          en: "Yes — everything happens remotely: plans, references and calls. Location affects neither the timeline nor the price.",
        },
        order: 4,
      },
    ],
  };
}
