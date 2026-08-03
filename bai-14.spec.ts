// Slide 21
import {test, expect} from '@playwright/test';
test("iFrame bảo mật và chống spam", async ({page}) => {
    await page.goto('https://www.google.com/recaptcha/api2/demo');
    const iFrameCaptcha = page.frameLocator('iframe[title="reCAPTCHA"]');
    const captchaCheckbox = iFrameCaptcha.locator('#recaptcha-anchor');
    await captchaCheckbox.click();
})

// Slide 22
import {test, expect} from '@playwright/test';
test("Nested iFrames", async ({page}) => {
    await page.goto('https://play1.automationcamp.ir/frames.html');
    const iFrameLevel3 = page
    .frameLocator('#frame1')
    .frameLocator('#frame3')
    .frameLocator('#frame4');
    await iFrameLevel3.getByRole('button', {name: 'Click Me 4'}).click();
    await expect(iFrameLevel3.locator('#click_me_4')).toHaveText('Clicked');
})

// Slide 30
import {test, expect} from '@playwright/test';
test("Alert practice", async ({page}) => {
    await page.goto('https://practice-automation.com/popups/');

    //Pop-up
    page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toBe('Hi there, pal!');
        await dialog.accept();
    });
    await page.getByRole('button', {name: 'Alert Popup'}).click();

    //Confirm_Case 1
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('OK or Cancel, which will it be?');
        await dialog.accept();
    });
    await page.getByRole('button', {name: 'Confirm Popup'}).click();
    await expect(page.locator('#confirmResult')).toHaveText('OK it is!');

    //Confirm_Case 2
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('OK or Cancel, which will it be?');
        await dialog.dismiss();
    });
    await page.getByRole('button', {name: 'Confirm Popup'}).click();
    await expect(page.locator('#confirmResult')).toHaveText('Cancel it is!');
});

// Slide 31
import {test, expect} from '@playwright/test';
test("Confirm test", async ({page}) => {
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Confirm_Case 1
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('I am a JS Confirm');
        await dialog.accept();
    });
    await page.getByRole('button', {name: 'Click for JS Confirm'}).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Ok');

    // Confirm_Case 2
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('I am a JS Confirm');
        await dialog.dismiss();
    });
    await page.getByRole('button', {name: 'Click for JS Confirm'}).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
});

// Slide 32
import {test, expect} from '@playwright/test';
test("Nhập liệu vào Prompt dialog", async ({page}) => {
    await page.goto('https://demoqa.com/alerts');

    // Case 1_OK
    page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('prompt');
        await dialog.accept('Nguyen Van A');
    })
    await page.locator('button[class="btn btn-primary"]').nth(3).click();
    await expect(page.locator('#promptResult')).toHaveText('You entered Nguyen Van A');
})

// Slide 41
import {test, expect} from '@playwright/test';
test("Bắt và thao tác trên Tab mới bật ra", async ({page}) => {
    await page.goto('https://the-internet.herokuapp.com/windows');

    const [newTab] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', {name: "Click Here"}).click()
    ]);

    await expect(newTab.locator('h3')).toHaveText('New Window');
    await page.bringToFront();
    await expect(page.locator('h3')).toHaveText('Opening a new window');
    await newTab.close();
});

// Slide 42
import {test, expect} from '@playwright/test';
test("Quản lý nhiều tab cùng lúc", async ({context, page}) => {
    await page.goto('https://demoqa.com/browser-windows');

    for(let i = 0; i < 2; i++) {
        await Promise.all([
            context.waitForEvent('page'),
            page.getByRole('button', {name: 'New Tab'}).click()
        ])
    };

    const allTabs = context.pages();
    console.log(`Đang có tổng số ${allTabs.length} tabs mở`);

    const tab3 = allTabs[2];
    const tab2 = allTabs[1];
    await expect(tab3.locator('#sampleHeading')).toHaveText('This is a sample page');

    await tab2.bringToFront();
    await expect(tab2.locator('#sampleHeading')).toHaveText('This is a sample page');
})