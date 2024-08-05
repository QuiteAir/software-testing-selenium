const { Builder, Browser, By, until, Key } = require('selenium-webdriver');
const { describe, expect, test } = require('@jest/globals');

describe('Litecart Client Cart', function() {
	let driver;
	const baseUrl = 'http://localhost:8080/litecart/';
	const itemsNumber = 3;
	const implicitWaitTime = 1000;

	const isElementPresent = async (selector) => {
		await driver.manage().setTimeouts({ implicit: 0 });
		const els = await driver.findElements(selector);
		await driver.manage().setTimeouts({ implicit: implicitWaitTime });

		return els.length > 0 ? true : false
	}

	const getQuantitySum = async (tds) => {
		const tdsAsText = await Promise.all(tds.map(td => td.getText()));
		const onlyNums = tdsAsText.filter(td => Number.isInteger(Number(td)));
		const res = onlyNums.reduce((acc, cur) => acc + Number(cur), 0);
		return res;
	}

	beforeAll(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build();
		await driver.manage().setTimeouts({ implicit: implicitWaitTime });
	}, 60000);

	beforeEach(async function() {
		await driver.get(baseUrl);
	});


	test.each(Array(itemsNumber).fill(null))('Add item to cart', async function() {
		const quantitySelector = By.className('quantity');
		let quantityEl = await driver.findElement(quantitySelector);
		const initialQuantity = Number(await quantityEl.getText());

		await driver.findElement(By.css('.products .link')).then(el => el.click());
		//Choose size if possible
		const sizeSelector = By.xpath('//select[@name="options[Size]"]');
		if (await isElementPresent(sizeSelector)) {
			await driver.findElement(sizeSelector)
				.then(async el => {
					await el.click();
					await el.sendKeys(Key.ARROW_DOWN + Key.ENTER);
				});
		}
		//Add item to cart
		await driver.findElement(By.xpath('//button[@value="Add To Cart"]')).then(el => el.click());

		//Check that cart items changed
		await driver.wait(until.stalenessOf(quantityEl), 1000);
		quantityEl = await driver.findElement(quantitySelector);
		await driver.wait(until.elementTextIs(quantityEl, String(initialQuantity + 1)), 4000);
		expect(initialQuantity).toBeLessThan(Number(await quantityEl.getText()))
	}, 15000);

	test('Delete items from cart', async function() {
		await driver.findElement(By.xpath('//a[contains(@href, "checkout")][2]')).then(el => el.click());
		const tdsSelector = By.css('#order_confirmation-wrapper tr:nth-child(n+2):not(tr:last-child) td:first-child');
		let orderQuantaties = await driver.findElements(tdsSelector);
		let quatitySum = await getQuantitySum(orderQuantaties);

		//Delete items while possible
		const delButtonSelector = By.name('remove_cart_item');
		let delButton;
		while (quatitySum > 0) {
			delButton = await driver.findElement(delButtonSelector);
			await delButton.click();
			await driver.wait(until.stalenessOf(delButton), 3000);
			//await driver.wait(until.stalenessOf(orderQuantaties), 3000);
			orderQuantaties = await driver.findElements(tdsSelector);
			quatitySum = await getQuantitySum(orderQuantaties);
		}

		expect(quatitySum).toBe(0);
	});

	//await new Promise(r => setTimeout(r, 2000));
	afterAll(() => driver && driver.quit());
});
//await new Promise(r => setTimeout(r, 2000));
