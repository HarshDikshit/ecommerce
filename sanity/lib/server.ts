import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from '../env'

export const server = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: process.env.SANITY_API_EDITOR_TOKEN!,
});