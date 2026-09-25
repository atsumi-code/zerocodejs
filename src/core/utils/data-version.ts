import type { ZeroCodeData } from '../../types';
import { logger } from './logger';

export const ZERO_CODE_DATA_VERSION = 1;

type Migration = (data: Partial<ZeroCodeData>) => Partial<ZeroCodeData>;

/**
 * データ形式の移行処理。キーは移行元のバージョンで、MIGRATIONS[n] は version n のデータを n + 1 に変換する。
 * データ形式を変更するときは ZERO_CODE_DATA_VERSION を上げ、ここに移行処理を追加する。
 */
const MIGRATIONS: Record<number, Migration> = {};

/**
 * ZeroCodeData を現在のデータ形式に移行する。
 * version が無いデータは version 1 とみなす。ライブラリより新しい version のデータは警告を出してそのまま返す。
 */
export function migrateZeroCodeData<T extends Partial<ZeroCodeData>>(data: T): T {
  let version = typeof data.version === 'number' ? data.version : 1;

  if (version > ZERO_CODE_DATA_VERSION) {
    logger.warn(
      `Data version ${version} is newer than supported version ${ZERO_CODE_DATA_VERSION}. Update zerocodejs.`
    );
    return data;
  }

  let migrated: Partial<ZeroCodeData> = data;
  while (version < ZERO_CODE_DATA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      throw new Error(`No migration defined for data version ${version}`);
    }
    migrated = migrate(migrated);
    version++;
  }

  return { ...migrated, version: ZERO_CODE_DATA_VERSION } as unknown as T;
}
