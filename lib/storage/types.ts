export type StoredFile = {
  /** Публичный URL загруженного файла */
  url: string;
  /** Путь внутри хранилища — нужен, чтобы потом удалить файл */
  pathname: string;
};

export interface StorageAdapter {
  kind: "local" | "blob";
  /** Читает текстовый объект. null — если объекта ещё нет. */
  readText(pathname: string): Promise<string | null>;
  /** Читает бинарный объект. null — если объекта ещё нет. */
  readBytes(pathname: string): Promise<Buffer | null>;
  writeText(pathname: string, value: string, contentType?: string): Promise<void>;
  writeBytes(pathname: string, value: Buffer, contentType: string): Promise<void>;
  putFile(pathname: string, data: Buffer, contentType: string): Promise<StoredFile>;
  /** Удаляет файлы по их публичным URL — именно они хранятся в данных. */
  deleteFiles(urls: string[]): Promise<void>;
}
