import type { Page } from '@playwright/test';

export interface CatalogVehicle {
  id: string;
  variantName: string;
  listedPrice: string;
  modelName: string;
  brandName: string;
  bodyType: string;
  thumbnailUrl: string;
  availableQuota: string;
}

export interface CatalogQuery {
  bodyType?: string;
  sort?: 'price-asc';
}

export interface CatalogFilter {
  minPrice: number;
  maxPrice: number;
  bodyType?: string;
}

interface CatalogPayload {
  success: true;
  data: CatalogVehicle[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(
  record: Record<string, unknown>,
  field: keyof CatalogVehicle,
): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Catalog field ${field} must be a non-empty string.`);
  }
  return value;
}

function parseVehicle(value: unknown, index: number): CatalogVehicle {
  if (!isRecord(value)) {
    throw new Error(`Catalog item ${index} must be an object.`);
  }

  const vehicle: CatalogVehicle = {
    id: requireString(value, 'id'),
    variantName: requireString(value, 'variantName'),
    listedPrice: requireString(value, 'listedPrice'),
    modelName: requireString(value, 'modelName'),
    brandName: requireString(value, 'brandName'),
    bodyType: requireString(value, 'bodyType'),
    thumbnailUrl: requireString(value, 'thumbnailUrl'),
    availableQuota: requireString(value, 'availableQuota'),
  };

  vehiclePrice(vehicle);
  const quota = Number(vehicle.availableQuota);
  if (!Number.isInteger(quota) || quota < 0) {
    throw new Error(`Catalog item ${index} has invalid availableQuota.`);
  }

  return vehicle;
}

export function vehiclePrice(vehicle: CatalogVehicle): number {
  const price = Number(vehicle.listedPrice);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Vehicle ${vehicle.id} has invalid listedPrice.`);
  }
  return price;
}

export async function fetchCatalog(
  page: Page,
  query: CatalogQuery = {},
): Promise<CatalogVehicle[]> {
  const searchParams = new URLSearchParams({
    sort: query.sort ?? 'price-asc',
  });
  if (query.bodyType) {
    searchParams.set('bodyType', query.bodyType);
  }

  const result = await page.evaluate(async (path) => {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // Payload validation below emits the deterministic contract error.
    }
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      payload,
    };
  }, `/api/v1/catalog/models?${searchParams.toString()}`);

  if (!result.ok) {
    throw new Error(
      `Catalog API failed with HTTP ${result.status} ${result.statusText}.`,
    );
  }

  const payload: unknown = result.payload;
  if (
    !isRecord(payload)
    || payload.success !== true
    || !Array.isArray(payload.data)
  ) {
    throw new Error('Catalog API returned an unexpected payload shape.');
  }

  const parsed: CatalogPayload = {
    success: true,
    data: payload.data.map(parseVehicle),
  };
  return parsed.data;
}

export function filterCatalog(
  vehicles: readonly CatalogVehicle[],
  filter: CatalogFilter,
): CatalogVehicle[] {
  if (
    !Number.isFinite(filter.minPrice)
    || !Number.isFinite(filter.maxPrice)
    || filter.minPrice < 0
    || filter.maxPrice < filter.minPrice
  ) {
    throw new Error('Catalog price filter is invalid.');
  }

  const normalizedBodyType = filter.bodyType?.trim().toLocaleLowerCase('en-US');

  return vehicles
    .filter((vehicle) => {
      const price = vehiclePrice(vehicle);
      const matchesBodyType = !normalizedBodyType
        || vehicle.bodyType.toLocaleLowerCase('en-US') === normalizedBodyType;
      return matchesBodyType && price >= filter.minPrice && price <= filter.maxPrice;
    })
    .sort((left, right) => vehiclePrice(left) - vehiclePrice(right));
}
