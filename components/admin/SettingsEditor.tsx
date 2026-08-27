"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import {
  checkStorageAction,
  refreshSiteAction,
  saveSettingsAction,
  sendTestNotificationAction,
  type StorageCheck,
} from "@/lib/actions/admin";
import type { FaqItem, ImageAsset, Localized, ServiceItem, Settings, StatItem } from "@/lib/types";
import type { StorageKind } from "@/lib/image-processing";
import { ImageUploader } from "./ImageUploader";
import { LogoUploader } from "./LogoUploader";
import { Label, LocalizedField, TextField, Toggle } from "./Fields";

type TabId = "main" | "contacts" | "services" | "faq" | "stats" | "notifications";

const TABS: { id: TabId; label: string }[] = [
  { id: "main", label: "Главная" },
  { id: "contacts", label: "Контакты" },
  { id: "services", label: "Услуги и цены" },
  { id: "faq", label: "Вопросы" },
  { id: "stats", label: "Цифры" },
  { id: "notifications", label: "Служебное" },
];

const emptyLocalized = (): Localized => ({ ru: "", en: "" });

export function SettingsEditor({
  settings: initial,
  telegramConfigured,
  storageKind,
}: {
  settings: Settings;
  telegramConfigured: boolean;
  storageKind: StorageKind;
}) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [tab, setTab] = useState<TabId>("main");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [storageCheck, setStorageCheck] = useState<StorageCheck | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  const patch = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    startTransition(async () => {
      setSaveError(null);
      const result = await saveSettingsAction(settings);
      if (result.ok) setSaved(true);
      else setSaveError(result.error);
    });
  };

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl text-sand">Настройки сайта</h1>
          <p className="mt-2 text-sm text-muted">
            Тексты, контакты и прайс. Изменения появляются на сайте сразу после сохранения.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {saved && !pending && !saveError && <span className="text-xs text-accent">Сохранено</span>}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-sand px-6 py-3 text-xs font-medium tracking-[0.1em] text-ink uppercase transition-colors hover:bg-accent disabled:opacity-50"
          >
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </div>

      {saveError && (
        <p className="mt-6 border border-accent/30 bg-accent/10 p-4 text-xs leading-relaxed text-sand">
          {saveError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "text-[11px] tracking-[0.16em] uppercase transition-colors",
              tab === item.id ? "text-accent" : "text-muted hover:text-sand",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-10 max-w-3xl space-y-8">
        {tab === "main" && (
          <>
            <TextField
              label="Название сайта"
              value={settings.siteName}
              onChange={(value) => patch("siteName", value)}
              hint="в шапке и подвале, если не загружен логотип"
            />

            <LogoUploader
              logo={settings.logo}
              siteName={settings.siteName}
              onChange={(logo) => patch("logo", logo)}
              storageKind={storageKind}
            />
            <p className="text-xs leading-relaxed text-muted">
              Нужен именно знак, а не картинка со знаком. Логотип встаёт на место названия высотой
              24–28 px, ширину берёт по пропорциям файла — поэтому обрежьте поля по краям вплотную
              к буквам и уберите фон. Баннер с залитым фоном ужмётся целиком, и надпись внутри него
              станет высотой в пару пикселей. Растровый готовьте с запасом втрое, около 90 px
              в высоту: экраны бывают плотные. Как всё это выглядит на сайте — видно в рамке выше.
              Название при этом никуда не девается: оно остаётся подписью к ссылке для читалок
              и поисковиков.
            </p>

            <LocalizedField
              label="Специализация"
              value={settings.role}
              onChange={(value) => patch("role", value)}
              placeholder="3D-визуализация интерьеров"
            />
            <LocalizedField
              label="Город"
              value={settings.city}
              onChange={(value) => patch("city", value)}
            />
            <LocalizedField
              label="Заголовок на первом экране"
              value={settings.heroTitle}
              onChange={(value) => patch("heroTitle", value)}
              multiline
              rows={3}
              hint="Каждая строка появляется отдельной анимацией — разбивайте текст переносами."
            />
            <LocalizedField
              label="Подзаголовок"
              value={settings.heroSubtitle}
              onChange={(value) => patch("heroSubtitle", value)}
              multiline
              rows={3}
            />

            <ImageUploader
              label="Фон первого экрана"
              storageKind={storageKind}
              multiple={false}
              images={settings.heroImage ? [settings.heroImage] : []}
              onChange={(images: ImageAsset[]) => patch("heroImage", images[0] ?? null)}
            />
            <p className="text-xs leading-relaxed text-muted">
              Если фон не загружен, сайт берёт обложку первого избранного проекта.
            </p>

            <Toggle
              label="Показывать изображения в исходном качестве"
              description="Крупные кадры отдаются оригинальными файлами без сжатия. Качество максимальное, страницы тяжелее. Если выключить, крупные планы будут проходить через оптимизацию с качеством 95, а оригинал останется в полноэкранном просмотре."
              checked={settings.originalQuality}
              onChange={(checked) => patch("originalQuality", checked)}
            />
          </>
        )}

        {tab === "contacts" && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Почта"
                value={settings.email}
                onChange={(value) => patch("email", value)}
                placeholder="hello@example.com"
              />
              <TextField
                label="Телефон"
                value={settings.phone}
                onChange={(value) => patch("phone", value)}
                placeholder="+7 900 000-00-00"
              />
            </div>

            <p className="text-xs leading-relaxed text-muted">
              Ссылки на соцсети указывайте полностью, вместе с https://. Пустые поля на сайте
              не показываются.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Telegram"
                value={settings.telegram}
                onChange={(value) => patch("telegram", value)}
                placeholder="https://t.me/username"
              />
              <TextField
                label="WhatsApp"
                value={settings.whatsapp}
                onChange={(value) => patch("whatsapp", value)}
                placeholder="https://wa.me/79000000000"
              />
              <TextField
                label="Behance"
                value={settings.behance}
                onChange={(value) => patch("behance", value)}
                placeholder="https://www.behance.net/username"
              />
              <TextField
                label="Instagram"
                value={settings.instagram}
                onChange={(value) => patch("instagram", value)}
              />
              <TextField
                label="Pinterest"
                value={settings.pinterest}
                onChange={(value) => patch("pinterest", value)}
              />
            </div>
          </>
        )}

        {tab === "services" && (
          <ServicesEditor
            services={settings.services}
            onChange={(services) => patch("services", services)}
          />
        )}

        {tab === "faq" && (
          <FaqEditor faq={settings.faq} onChange={(faq) => patch("faq", faq)} />
        )}

        {tab === "stats" && (
          <StatsEditor stats={settings.stats} onChange={(stats) => patch("stats", stats)} />
        )}

        {tab === "notifications" && (
          <div className="space-y-6">
            <div className="border border-line bg-surface/30 p-6">
              <p className="text-sm text-sand">Обновление сайта</p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Страницы сайта отдаются из кэша, чтобы открываться мгновенно. После сохранения
                кэш сбрасывается сам, но если правка почему-то не появилась — сбросьте вручную и
                обновите страницу сайта.
              </p>

              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await refreshSiteAction();
                    setRefreshResult(
                      result.ok
                        ? "Кэш сброшен — обновите страницу сайта."
                        : result.error,
                    );
                  })
                }
                className="mt-6 rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Обновить сайт
              </button>

              {refreshResult && <p className="mt-4 text-xs text-accent">{refreshResult}</p>}
            </div>

            <div className="border border-line bg-surface/30 p-6">
              <p className="text-sm text-sand">Хранилище изображений</p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Проверка записывает в хранилище небольшой служебный файл и читает его обратно.
                Так сразу видно, подключено ли хранилище к этому проекту, — вместо того чтобы
                выяснять это на середине загрузки рендера.
              </p>

              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setStorageCheck(await checkStorageAction());
                  })
                }
                className="mt-6 rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Проверить хранилище
              </button>

              {storageCheck && (
                <div className="mt-5 space-y-2 border-t border-line pt-5 text-xs leading-relaxed">
                  <p className={storageCheck.ok ? "text-accent" : "text-sand"}>
                    {storageCheck.message}
                  </p>
                  <p className="text-muted">
                    Активное хранилище:{" "}
                    <span className="text-sand-dim">
                      {storageCheck.kind === "blob" ? "Vercel Blob" : "папка проекта"}
                    </span>
                    {" · "}
                    токен:{" "}
                    <span className="text-sand-dim">
                      {storageCheck.tokenPresent ? "виден" : "отсутствует"}
                    </span>
                    {" · "}
                    среда:{" "}
                    <span className="text-sand-dim">
                      {storageCheck.onVercel ? "Vercel" : "локальная"}
                    </span>
                  </p>
                  <p className="text-muted">
                    Переменные с токеном:{" "}
                    <span className="text-sand-dim">
                      {storageCheck.tokenVariables.length > 0
                        ? storageCheck.tokenVariables.join(", ")
                        : "не найдены"}
                    </span>
                    {storageCheck.tokenVariables.length > 1 && (
                      <>
                        {" · используется "}
                        <span className="text-sand">{storageCheck.tokenVariables[0]}</span>
                      </>
                    )}
                  </p>
                  <p className="text-muted">
                    Все переменные хранилища:{" "}
                    <span className="text-sand-dim">
                      {storageCheck.storageVariables.length > 0
                        ? storageCheck.storageVariables.join(", ")
                        : "не найдены"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="border border-line bg-surface/30 p-6">
              <p className="text-sm text-sand">
                Уведомления в Telegram:{" "}
                <span className={telegramConfigured ? "text-accent" : "text-muted"}>
                  {telegramConfigured ? "настроены" : "не настроены"}
                </span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Каждая заявка сохраняется в админке в зашифрованном виде. Чтобы получать их ещё и
                в Telegram, создайте бота через @BotFather и добавьте переменные окружения{" "}
                <code className="text-sand-dim">TELEGRAM_BOT_TOKEN</code> и{" "}
                <code className="text-sand-dim">TELEGRAM_CHAT_ID</code>. Подробная инструкция — в
                файле README проекта.
              </p>

              <button
                type="button"
                disabled={!telegramConfigured || pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await sendTestNotificationAction();
                    setTestResult(
                      result.ok
                        ? "Тестовое сообщение отправлено — проверьте Telegram."
                        : "Отправить не удалось. Проверьте токен и идентификатор чата.",
                    );
                  })
                }
                className="mt-6 rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Отправить тестовое сообщение
              </button>

              {testResult && <p className="mt-4 text-xs text-accent">{testResult}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Услуги ------------------------------ */

function ServicesEditor({
  services,
  onChange,
}: {
  services: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
}) {
  const ordered = [...services].sort((a, b) => a.order - b.order);

  const update = (id: string, patch: Partial<ServiceItem>) =>
    onChange(services.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () =>
    onChange([
      ...services,
      {
        id: crypto.randomUUID(),
        title: emptyLocalized(),
        description: emptyLocalized(),
        price: emptyLocalized(),
        duration: emptyLocalized(),
        includes: [emptyLocalized()],
        highlighted: false,
        order: services.length,
      },
    ]);

  return (
    <div className="space-y-6">
      {ordered.map((service, index) => (
        <details
          key={service.id}
          open={index === 0}
          className="border border-line bg-surface/20 p-6"
        >
          <summary className="cursor-pointer text-sm text-sand">
            {service.title.ru || service.title.en || "Новая услуга"}
            <span className="ml-3 text-xs text-muted">{service.price.ru}</span>
          </summary>

          <div className="mt-6 space-y-6">
            <LocalizedField
              label="Название"
              value={service.title}
              onChange={(value) => update(service.id, { title: value })}
            />
            <LocalizedField
              label="Описание"
              value={service.description}
              onChange={(value) => update(service.id, { description: value })}
              multiline
              rows={3}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <LocalizedField
                label="Цена"
                value={service.price}
                onChange={(value) => update(service.id, { price: value })}
                placeholder="от 4 500 ₽ / ракурс"
              />
              <LocalizedField
                label="Срок"
                value={service.duration}
                onChange={(value) => update(service.id, { duration: value })}
                placeholder="2–3 дня"
              />
            </div>

            <div>
              <Label>Что входит</Label>
              <div className="space-y-3">
                {service.includes.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <div className="flex-1">
                      <LocalizedField
                        label={`Пункт ${itemIndex + 1}`}
                        value={item}
                        onChange={(value) =>
                          update(service.id, {
                            includes: service.includes.map((existing, position) =>
                              position === itemIndex ? value : existing,
                            ),
                          })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update(service.id, {
                          includes: service.includes.filter((_, position) => position !== itemIndex),
                        })
                      }
                      className="mt-7 text-[10px] tracking-[0.12em] text-muted uppercase hover:text-accent"
                    >
                      убрать
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  update(service.id, { includes: [...service.includes, emptyLocalized()] })
                }
                className="mt-4 rounded-full border border-line px-4 py-2 text-[10px] tracking-[0.12em] text-muted uppercase hover:border-accent hover:text-accent"
              >
                добавить пункт
              </button>
            </div>

            <Toggle
              label="Выделить как основной тариф"
              description="Рядом с названием появится отметка «чаще всего»"
              checked={service.highlighted}
              onChange={(checked) => update(service.id, { highlighted: checked })}
            />

            <div className="flex items-center gap-3 border-t border-line pt-5">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const next = [...ordered];
                  [next[index], next[index - 1]] = [next[index - 1], next[index]];
                  onChange(next.map((item, position) => ({ ...item, order: position })));
                }}
                className="rounded-full border border-line px-3 py-1.5 text-[10px] text-muted hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === ordered.length - 1}
                onClick={() => {
                  const next = [...ordered];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  onChange(next.map((item, position) => ({ ...item, order: position })));
                }}
                className="rounded-full border border-line px-3 py-1.5 text-[10px] text-muted hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(services.filter((item) => item.id !== service.id))}
                className="ml-auto text-[10px] tracking-[0.12em] text-muted uppercase hover:text-accent"
              >
                удалить услугу
              </button>
            </div>
          </div>
        </details>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase hover:border-accent hover:text-accent"
      >
        Добавить услугу
      </button>
    </div>
  );
}

/* ------------------------------ Вопросы ------------------------------ */

function FaqEditor({ faq, onChange }: { faq: FaqItem[]; onChange: (faq: FaqItem[]) => void }) {
  const ordered = [...faq].sort((a, b) => a.order - b.order);

  const update = (id: string, patch: Partial<FaqItem>) =>
    onChange(faq.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-5">
      {ordered.map((item) => (
        <div key={item.id} className="space-y-5 border border-line bg-surface/20 p-6">
          <LocalizedField
            label="Вопрос"
            value={item.question}
            onChange={(value) => update(item.id, { question: value })}
          />
          <LocalizedField
            label="Ответ"
            value={item.answer}
            onChange={(value) => update(item.id, { answer: value })}
            multiline
            rows={4}
          />
          <button
            type="button"
            onClick={() => onChange(faq.filter((existing) => existing.id !== item.id))}
            className="text-[10px] tracking-[0.12em] text-muted uppercase hover:text-accent"
          >
            удалить вопрос
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...faq,
            {
              id: crypto.randomUUID(),
              question: emptyLocalized(),
              answer: emptyLocalized(),
              order: faq.length,
            },
          ])
        }
        className="rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase hover:border-accent hover:text-accent"
      >
        Добавить вопрос
      </button>
    </div>
  );
}

/* ------------------------------ Цифры ------------------------------ */

function StatsEditor({
  stats,
  onChange,
}: {
  stats: StatItem[];
  onChange: (stats: StatItem[]) => void;
}) {
  const update = (id: string, patch: Partial<StatItem>) =>
    onChange(stats.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-muted">
        Числа с плюсом и единицами тоже работают: «120+», «48 ч». Число в начале строки на сайте
        анимируется — считается от нуля до нужного значения.
      </p>

      {stats.map((stat) => (
        <div key={stat.id} className="grid gap-4 border border-line bg-surface/20 p-5 sm:grid-cols-[8rem_1fr_auto]">
          <TextField
            label="Значение"
            value={stat.value}
            onChange={(value) => update(stat.id, { value })}
          />
          <LocalizedField
            label="Подпись"
            value={stat.label}
            onChange={(value) => update(stat.id, { label: value })}
          />
          <button
            type="button"
            onClick={() => onChange(stats.filter((item) => item.id !== stat.id))}
            className="mt-7 text-[10px] tracking-[0.12em] text-muted uppercase hover:text-accent"
          >
            убрать
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([...stats, { id: crypto.randomUUID(), value: "", label: emptyLocalized() }])
        }
        className="rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase hover:border-accent hover:text-accent"
      >
        Добавить цифру
      </button>
    </div>
  );
}
