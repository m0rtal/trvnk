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
    habitats: z.string().optional(),
    hardiness: z.string().optional(),
    hardiness_zone: z
      .enum(["H1", "H2", "H3", "H4", "H5"])
      .optional()
      .describe("PFAF hardiness icon: H1=tender/10°C, H2=half hardy/0°C, H3=frost hardy/-5°C, H4=fully hardy/-15°C, H5=very hardy"),
    height_m: z.number().optional(),
    habit: z.string().optional(),
    edibility: z.number().min(0).max(5).optional(),
    medicinal: z.number().min(0).max(5).optional(),
    other_uses: z.number().min(0).max(5).optional(),
    weed_potential: z.string().optional(),
    hazards: z.string().optional(),
    soil: z
      .object({
        well_drained: z.boolean().default(false),
        moist: z.boolean().default(false),
        wet: z.boolean().default(false),
        water: z.boolean().default(false),
      })
      .default({}),
    light: z
      .object({
        full_sun: z.boolean().default(false),
        part_shade: z.boolean().default(false),
        full_shade: z.boolean().default(false),
      })
      .default({}),
    images: z.array(z.string()).default([]),
    published: z.date().default(() => new Date()),
  }),
});

export const collections = { plants };
