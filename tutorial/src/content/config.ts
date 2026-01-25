import { contentSchema } from '@tutorialkit/types';
import { defineCollection } from 'astro:content';

const tutorial = defineCollection({
  type: 'content',
  schema: contentSchema,
});

export const collections = { tutorial };
