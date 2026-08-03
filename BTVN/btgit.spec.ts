import {test, expect} from "@playwright/test";

test('bai1', async ({page}) => {
    await page.goto("https://todomvc.com/examples/react/dist/");

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Learn Playwright');
    await page.keyboard.press('Enter');

    await input.fill('Practice Dynamic Table');
    await page.keyboard.press('Enter');

    await input.fill('Master Smart Wait');
    await page.keyboard.press('Enter');

    const row = page.locator('li').filter({ hasText: 'Practice Dynamic Table' });
    await row.hover();
    await row.locator('button.destroy').click();

    await expect(page.locator('//label[@data-testid="todo-item-label"]')).toHaveCount(2);
    await expect(page.locator('//span[@class="todo-count"]')).toHaveText('2 items left!');

});

test('bai2', async ({page}) => {
    await page.goto("https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population");

    const table = page.locator("table").first();

    const thead = table.locator("thead tr th").filter({ hasText: 'Population' });
    await thead.click();

    const rows = table.locator("tbody tr");

    const text1 = await rows.nth(1).locator("td").nth(0).innerText();
    console.log(`Quoc gia co dan so nho nhat: ${text1}`);
});

test('bai3', async ({page}) => {
    await page.goto("https://en.wikipedia.org/wiki/List_of_highest_mountains_on_Earth");

    const table = page.locator("table").nth(1);

    const cells = table.locator("thead th");
    const cellCount = await cells.count();
    let cotHeight = -1;

    for (let i = 0; i < cellCount; i++) {
        const cellText = await cells.nth(i).innerText();
        if (cellText.includes("Height")) {
            cotHeight = i;
            break;
        }
    }
    const text1 = await table.locator("tbody tr").filter({ hasText: 'Mount Everest' }).locator("td").nth(cotHeight).innerText();
    await expect(text1).toContain("8,849");
});

test('bai4', async ({page}) => {
    await page.goto("https://handsontable.com/docs/javascript-data-grid/demo/");

    const table = page.locator("table");

    const cotClick =  table.locator("tbody tr").nth(0).locator("td").nth(2);
    const text1 = await cotClick.innerText();

    await cotClick.dblclick();

    const input = page.locator('textarea.handsontableInput');
    await page.keyboard.type('04/05/2025');
    await page.keyboard.press('Enter');

    const text2 = await cotClick.innerText();
    await expect(text2).not.toContain('text1');
});

test('bai5', async ({page}) => {
    await page.goto("https://www.chess.com/leaderboard/live");

    const table = page.locator("table").first();

    const rows = table.locator("tbody tr");

    const ten = await rows.nth(0).locator("td").nth(2).innerText();
    const rating = await rows.nth(0).locator("td").nth(3).innerText();
    const tencut = ten.replace(/\s+/g, ' ').trim();
    //console.log(tencut);
    console.log(`Tên người chơi xếp hạng 1: ${tencut} với rating: ${rating}`);
    const ratingNumber = Number(rating);
    await expect(ratingNumber).toBeGreaterThanOrEqual(2000);

});
