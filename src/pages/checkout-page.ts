import { expect, type Page, type Response } from '@playwright/test';

import type { CatalogVehicle } from '../api/catalog-api';

interface CheckoutExpectation {
  vehicle: CatalogVehicle;
  color: string;
}

interface DepositResult {
  orderId: string;
  orderResponseStatus: number;
  webhookResponseStatus: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function requireSuccessfulJson(response: Response, operation: string): Promise<unknown> {
  if (!response.ok()) {
    throw new Error(`${operation} failed with HTTP ${response.status()}.`);
  }
  return response.json();
}

function extractOrderId(payload: unknown): string {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
    throw new Error('Deposit API returned an unexpected payload shape.');
  }

  const orderId = payload.data.orderId ?? payload.data.id;
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('Deposit API response does not contain an order ID.');
  }
  return orderId;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async assertReady(expectation: CheckoutExpectation): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: 'Thanh toán đặt cọc giữ chỗ xe trực tuyến (SCR-04)',
      }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        `${expectation.vehicle.brandName} ${expectation.vehicle.modelName} - ${expectation.vehicle.variantName}`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      this.page.getByText(`Ngoại thất chọn: ${expectation.color}`, { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText('Tiền cọc giữ xe (15 phút)', { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText('20.000.000 ₫', { exact: true }).first(),
    ).toBeVisible();

    const vietQr = this.page.getByRole('radio', {
      name: /Quét mã VietQR Chuyển khoản \(Mock Sandbox\)/u,
    });
    await vietQr.check();
    await expect(vietQr).toBeChecked();
    await expect(
      this.page.getByRole('button', {
        name: 'Xác nhận giữ xe & Đặt cọc 20.000.000 ₫',
      }),
    ).toBeEnabled();
  }

  async submitAndConfirmSuccess(expectation: CheckoutExpectation): Promise<DepositResult> {
    const orderResponsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST'
        && new URL(response.url()).pathname === '/api/v1/orders/deposit',
      { timeout: 30_000 },
    );

    await this.page
      .getByRole('button', {
        name: 'Xác nhận giữ xe & Đặt cọc 20.000.000 ₫',
      })
      .click();

    const orderResponse = await orderResponsePromise;
    const orderPayload = await requireSuccessfulJson(orderResponse, 'Deposit order creation');
    const orderId = extractOrderId(orderPayload);

    await expect(this.page.getByText(orderId, { exact: true })).toBeVisible();
    const successButton = this.page.getByRole('button', {
      name: 'Mock Thanh Cong (SUCCESS)',
      exact: true,
    });
    await expect(successButton).toBeEnabled();

    const webhookResponsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST'
        && new URL(response.url()).pathname === '/api/v1/payments/mock-webhook',
      { timeout: 30_000 },
    );
    await successButton.click();

    const webhookResponse = await webhookResponsePromise;
    const webhookPayload = await requireSuccessfulJson(
      webhookResponse,
      'Mock payment confirmation',
    );
    if (!isRecord(webhookPayload) || webhookPayload.success !== true) {
      throw new Error('Mock payment webhook returned an unexpected payload shape.');
    }

    await expect(this.page).toHaveURL(
      (url) =>
        url.pathname === '/checkout/result'
        && url.searchParams.get('orderId') === orderId
        && url.searchParams.get('status') === 'SUCCESS',
      { timeout: 30_000 },
    );
    await expect(
      this.page.getByRole('heading', { name: 'Đặt cọc xe thành công!' }),
    ).toBeVisible();
    await expect(this.page.getByText(orderId, { exact: true })).toBeVisible();

    await this.page.goto('/orders');
    await expect(
      this.page.getByRole('heading', { name: 'Đơn hàng của tôi' }),
    ).toBeVisible();
    const orderLink = this.page
      .getByRole('link')
      .filter({ hasText: expectation.vehicle.variantName })
      .filter({ hasText: `Màu sơn: ${expectation.color}` })
      .filter({ hasText: 'Đã đặt cọc' });
    await expect(orderLink).toHaveCount(1);
    await expect(orderLink).toHaveAttribute('href', `/orders/${orderId}`);
    await expect(orderLink).toContainText('Đã cọc: 20.000.000 ₫');

    return {
      orderId,
      orderResponseStatus: orderResponse.status(),
      webhookResponseStatus: webhookResponse.status(),
    };
  }
}
