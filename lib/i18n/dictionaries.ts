import { ru } from "./ru";
import { kk } from "./kk";
import type { Locale } from "./config";

export type { Dict } from "./ru";

export const dictionaries = { ru, kk } satisfies Record<Locale, typeof ru>;
