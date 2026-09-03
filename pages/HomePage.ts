import {Locator, Page} from '@playwright/test';

export class HomePage {
    readonly page: Page;

    // Car count
    readonly carCards: Locator;

    // Car filter
    readonly priceFilter: Locator;
    readonly priceRange: Locator;
    readonly carType: Locator;
    readonly carList: Locator;
    readonly carsAfterFilter: Locator;
    readonly firstCar: Locator;


    constructor (page: Page) {
        this.page = page;
        this.carCards = page.locator('span.text-primary.font-bold');

        // Car filter
        this.priceFilter = page.locator('input[type="range"]');
        this.priceRange = page.locator('span').filter({
            hasText: '0.5'
        });
        this.carType = page.getByLabel('Sedan');
        this.carList = page.locator('div.grid.grid-cols-1.gap-5');
        this.carsAfterFilter= this.carList;
        this.firstCar = this.carsAfterFilter.locator(':scope > div').nth(1);
    }

    async filterPrice(price: string) {
        await this.priceFilter.fill(price);
    }

    async selectCarType() {
        await this.carType.check();
    }

    async selectFirstCar() {
        await this.firstCar.click();
    }
}