const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
/* const { test, beforeEach, afterEach } = require('jest') */

describe('Google Open', function() {
	let driver

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
	})

	test('Title is Google', async function() {
		await driver.get('https://www.google.com/ncr')
		const title = await driver.wait(until.titleIs('Google'), 1000)
		expect(title).toBeTruthy()

		// await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
		// await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
	})

	afterEach(() => driver && driver.quit())
})
