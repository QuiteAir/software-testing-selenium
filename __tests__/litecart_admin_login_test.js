const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
/* const { test, beforeEach, afterEach } = require('jest') */

describe('Litecart Admin', function() {
	let driver

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
	}, 15000)

	test('Login works', async function() {
		await driver.get('http://localhost/litecart/admin/login.php')
		await driver.findElement(By.name('username')).sendKeys('admin')
		await driver.findElement(By.name('password')).sendKeys('admin')
		await driver.findElement(By.name('login')).click()
		await driver.findElement(By.linkText('Catalog')).click()

		expect(await driver.getTitle()).toMatch(/Catalog/)
	})

	afterEach(() => driver && driver.quit())
})
