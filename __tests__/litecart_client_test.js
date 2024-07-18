const { Builder, Browser, By } = require('selenium-webdriver')
const { describe, expect, test } = require('@jest/globals')

describe('Litecart Client', function() {
	let driver
	const baseUrl = 'http://localhost:8080/litecart/';

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
		await driver.manage().setTimeouts({ implicit: 2000 });
	}, 60000)

	test('Only one sticker on product', async function() {
		driver.get(baseUrl);
		const products = await driver.findElements(By.css('.product'));
		expect(products.length).toBeGreaterThanOrEqual(1);

		const locator = '.sticker';
		for (const product of products) {
			const stickers = await product.findElements(By.css(locator));
			expect(stickers.length).toBe(1);
		}
	})

	afterEach(() => driver && driver.quit())
})
