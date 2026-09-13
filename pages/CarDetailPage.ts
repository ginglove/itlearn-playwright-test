import {Locator, Page} from '@playwright/test';

export class CarDetailPage {
    readonly page: Page;

    // Car's basic information
    readonly carBrand: Locator;
    readonly carName: Locator;

    // Car detail page
    readonly webGl3D: Locator;
    readonly car3D: Locator;
    readonly carColor: Locator;
    readonly carInteriorList: Locator;
    readonly carInteriorOpt: Locator;

    // Deposit
    readonly loanSlider: Locator;
    readonly loanTerm: Locator;
    readonly depositBtn: Locator;

    constructor (page: Page) {
        this.page = page;
        
        this.carBrand = page.locator('p.text-sm.tracking-wider');
        this.carName = page.locator('h1.text-3xl.font-bold');
        this.webGl3D = page.getByRole('button', {name: 'Mô hình 3D WebGL 360° Real-time'});
        this.car3D = page.locator('canvas[data-engine="three.js r185"]');
        this.carColor = page.locator('button.rounded-lg.text-sm>span');
        this.carInteriorList = page.locator('div[class="p-6 pt-0 space-y-3"]');
        this.carInteriorOpt = this.carInteriorList.locator(':scope > div.flex.items-center.justify-between');

        // Deposit
        this.loanSlider = page.locator('input.flex.h-10.w-full');
        this.loanTerm = page.getByRole('combobox').nth(1);
        this.depositBtn = page.getByRole('button', {name: '💳 Đặt cọc giữ xe'});
    }

    async getCarName() {
        const brand = (await this.carBrand.textContent())?.trim();
        const name = (await this.carName.textContent())?.trim();

        const formarttedBrand = brand!.charAt(0).toUpperCase() + brand!.slice(1).toLowerCase();
        return `${formarttedBrand} ${name}`;
    }

    async click3DOption() {
        await this.webGl3D.click();
    }

    async zoomInteraction() {
        await this.car3D.hover();
        await this.page.mouse.wheel(0, -500);
        await this.page.mouse.wheel(0, 500);
    }

    async rotateCar(x: number, y: number) {
        // await this.car3D.hover();
        const box = await this.car3D.boundingBox();

        if (!box) {
            throw new Error('3D car viewer not found');
        } 

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        const endX = startX + x;
        const endY = startY +y

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(endX, endY);
        await this.page.mouse.up();
    }

    async selectCarColor() {
        const selectedColor = this.carColor.filter({
            hasText: 'Đen Huyền Bí'
        });
        await selectedColor.click();
    }

    async getCarColor() {
        const selectedColor = this.carColor.filter({
            hasText: 'Đen Huyền Bí'
        });
         return (await selectedColor.textContent())?.trim();
    }

    async selectCarInterior(): Promise<string> {
        const count = await this.carInteriorOpt.count();

        const randomIndex = Math.floor(Math.random() * count);

        const selectedRow =
            this.carInteriorOpt.nth(randomIndex);

        const interiorName =
            (await selectedRow.locator('p').first().textContent())?.trim();

        if (!interiorName) {
            throw new Error('Selected interior has no text');
        }

        await selectedRow.click();

        return interiorName;
    }

    async selectLoanType(range: string) {
        await this.loanSlider.fill(range);
    }

    async selectLoanTerm(term: string) {
        await this.loanTerm.click();
        await this.page.getByText(term, {exact: true}).click();
    }

    async clickDepositBtn() {
        await this.depositBtn.click();
    }
}