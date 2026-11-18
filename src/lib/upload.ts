/**
 * Валидация загружаемых файлов.
 * Фото — только PNG, до 2 МБ.
 * Таблицы расписания — только Excel (.xlsx), до 5 МБ.
 */
export const FILE_LIMITS = {
  photo: { mime: ["image/png"], maxBytes: 2 * 1024 * 1024, ext: [".png"] },
  schedule: {
    mime: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    maxBytes: 5 * 1024 * 1024,
    ext: [".xlsx"],
  },
} as const;

export function validateUpload(
  file: { type: string; size: number; name: string },
  kind: keyof typeof FILE_LIMITS
): { ok: true } | { ok: false; error: string } {
  const rule = FILE_LIMITS[kind];
  if (!rule.mime.includes(file.type as any)) {
    return { ok: false, error: "Недопустимый тип файла" };
  }
  if (file.size > rule.maxBytes) {
    return { ok: false, error: "Файл слишком большой" };
  }
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!rule.ext.includes(ext as any)) {
    return { ok: false, error: "Недопустимое расширение" };
  }
  return { ok: true };
}
