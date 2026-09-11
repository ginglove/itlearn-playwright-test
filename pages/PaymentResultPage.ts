import {Locator, Page} from '@playwright/test';

export class PaymentResultPage {
    readonly page: Page;
    readonly resultTitle: Locator;
    readonly resultStatus: Locator;

    constructor (page: Page) {
        this.page = page;
        this.resultTitle = page.locator('h3.tracking-tight.font-bold');
        this.resultStatus = page.locator('div.rounded-full.font-semibold.text-xs');
    }
}