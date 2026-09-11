import {Locator, Page} from '@playwright/test';

export class OrderReviewPage {
    readonly page: Page;

    // Car's basic information
    readonly carName: Locator;
    readonly carColor: Locator;
    readonly carInteriorOpt: Locator;

    // Deposit confirm
    readonly confirmDeposit: Locator;

    // Deposit status
    readonly paymentStatusopt: Locator;
    readonly successBtn: Locator;
    readonly failBtn: Locator;
    readonly expiredBtn: Locator;
    readonly cancelledBtn: Locator;

    constructor (page: Page) {
        this.page = page;
        this.carName = page.locator('p.font-semibold.text-base');
        this.carColor = page.locator('p.text-sm.text-muted-foreground>span');
        this.carInteriorOpt = page.locator('label.flex.items-center.justify-between');
        this.confirmDeposit = page.getByRole('button', {name: 'Xác nhận giữ xe & Đặt cọc 20.000.000 ₫'});

        // Deposit status
        this.paymentStatusopt = page.locator('div.grid-cols-2.gap-3');
        this.successBtn = page.locator('button.bg-emerald-600.font-semibold');
        this.failBtn = page.locator('button.bg-destructive');
        this.expiredBtn = page.locator('button.bg-secondary');
        this.cancelledBtn = page.locator('button.border.border-input.bg-background').nth(1);
    }

    async getCarName() {
        return (await this.carName.textContent())?.trim();
    }

    async getCarColor() {
        return (await this.carColor.textContent())?.trim();
    }
    
    getCarRow(interiorName: string) {
        return this.carInteriorOpt.filter({
            hasText: interiorName
        })
    }

    async clickConfirmBtn() {
        await this.confirmDeposit.click();
    }

    async clickPaymentBtn(buttonName: string) {
        const button = this.page.getByRole('button', {
            name: buttonName
        });

        await button.click();
    }
}