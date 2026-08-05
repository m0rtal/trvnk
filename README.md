# trvnk — каталог полезных растений

Русскоязычный статический каталог полезных растений.

- **Стек:** [Astro](https://astro.build) (статика), без бэкенда и БД.
- **Источник данных:** открытые ботанические данные (парсинг → markdown).
- **Перевод:** поэтапный, ручной + LLM.
- **Поиск:** планируется [Pagefind](https://pagefind.app).
- **Хостинг:** nginx на VDS, деплой через `rsync dist/`.

## Разработка

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → ./dist
npm run preview  # локальный просмотр собранного
```

## Структура

```
src/
  content/
    config.ts          # Zod-схема для frontmatter растения
    plants/*.md        # markdown с frontmatter (по одному файлу на растение)
  layouts/
    Base.astro         # общий каркас (topbar, footer, <head>)
  pages/
    index.astro        # главная (каталог)
    about.astro        # описание проекта
    plants/[slug].astro  # страница одного растения
  styles/
    global.css         # дизайн (Linear-like, монохромный)
public/
  plants/<slug>/*.jpg  # изображения
```

## Добавление нового растения

Создать `src/content/plants/<slug>.md`. Slug — латиницей, в нижнем регистре, через дефис (например, `rosa-canina.md`). Frontmatter должен соответствовать схеме в `src/content/config.ts`.

## Лицензия

Код — MIT. Данные и изображения — открытые источники, см. страницы отдельных растений для атрибуции.