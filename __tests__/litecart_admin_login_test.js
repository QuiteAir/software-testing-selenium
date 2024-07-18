const { Builder, Browser, By, Key, until, error } = require('selenium-webdriver')
/* const { test, beforeEach, afterEach } = require('jest') */

describe('Litecart Admin', function() {
	let driver
	const baseUrl = 'http://localhost:8080/litecart/admin';

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
		await driver.manage().setTimeouts({ implicit: 2000 });

		await driver.get(baseUrl + '/login.php')
		await driver.findElement(By.name('username')).sendKeys('admin')
		await driver.findElement(By.name('password')).sendKeys('admin')
		await driver.findElement(By.name('login')).click()
	}, 60000)

	test('Login works', async function() {
		await driver.findElement(By.linkText('Catalog')).click()
		expect(await driver.getTitle()).toMatch(/Catalog/)
	})

	test('Navbar works', async function() {
		const baseLocator = '#box-apps-menu > li';
		const navList = await driver.findElements(By.css(baseLocator));
		expect(navList).toBeDefined();

		for (let i = 1; i <= navList.length; i += 1) {
			const mainNavLocator = baseLocator + `:nth-child(${i})`;
			const mainNavItem = await driver
				.findElement(By.css(mainNavLocator))
				.click();
			await expect(
				async () => await driver.findElement(By.css('h1'))
			).not.toThrow();

			// await driver.wait(until.elementsLocated(By.css(mainNavLocator + ' li')), 2000);
			const subNavCount = await driver.findElements(By.css(mainNavLocator + ' li'));
			if (!subNavCount.length) {
				continue;
			}

			for (let j = 1; j <= subNavCount.length; j += 1) {
				await driver.findElement(By.css(mainNavLocator + ` li:nth-child(${j})`))
					.click();
				await expect(
					async () => await driver.findElement(By.css('h1'))
				).not.toThrow();
			}
		}
	}, 60000)

	afterEach(() => driver && driver.quit())
})
