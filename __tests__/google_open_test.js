const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
/* const { test, beforeEach, afterEach } = require('jest') */

describe('Google Open', function() {
	let driver

	beforeEach(async function() {
		chromeDriver = await new Builder().forBrowser(Browser.CHROME).build()
		firefoxDriver = await new Builder().forBrowser(Browser.FIREFOX).build()
	})

	test('Title is Google', async function() {
		await chromeDriver.get('https://www.google.com/ncr')
		const chromeTitle = await chromeDriver.wait(until.titleIs('Google'), 1000)
		expect(chromeTitle).toBeTruthy()

		await firefoxDriver.get('https://www.google.com/ncr')
		const firefoxTitle = await firefoxDriver.wait(until.titleIs('Google'), 1000)
		expect(firefoxTitle).toBeTruthy()

		// await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
		// await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
	})

	afterEach(() => {
		chromeDriver && chromeDriver.quit()
		firefoxDriver && firefoxDriver.quit()
	}
	)
})
