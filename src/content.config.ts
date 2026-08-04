import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Коллекция растений. Каждый .md файл в src/content/plants/ = одно растение.
const plants = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/plants" }),
  schema: z.object({
    latin: z.string(),
    title: z.string(),
    family: z.string().optional(),
    common: z.string().optional(),
    range: z.string().optional(),
    hardiness: z.string().optional(),
    height_m: z.number().optional(),
    habit: z.string().optional(),
    edibility: z.number().min(0).max(5).optional(),
    medicinal: z.number().min(0).max(5).optional(),
    other_uses: z.number().min(0).max(5).optional(),
    images: z.array(z.string()).default([]),
    published: z.date().default(() => new Date()),
  }),
});

export const collections = { plants };
