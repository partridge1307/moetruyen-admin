import { db } from './db';

export type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};

export const tagGroupByCategory = () =>
  db.$queryRaw`SELECT "category", array_agg(json_build_object('id', "id", 'name', "name", 'description', "description")) AS data FROM "Tag" GROUP BY "category"` as Promise<
    Tags[]
  >;
