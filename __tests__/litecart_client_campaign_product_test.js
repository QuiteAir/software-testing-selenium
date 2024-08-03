const { Builder, Browser, By } = require('selenium-webdriver')
const { describe, expect, test } = require('@jest/globals')

describe('Litecart Client Campaign Product', function() {
	let driver
	let product
	let productSelector = By.css('#box-campaigns .product')

	const regularPriceLocator = By.css('.regular-price')
	const campaignPriceLocator = By.css('.campaign-price')
	const baseUrl = 'http://localhost:8080/litecart/'

	async function getColor(element) {
		const rgba = await element.getCssValue('color')

		let rgb = rgba
			.slice(5, -1)
			.split(',')
			.slice(0, -1)
			.map(color => color.trim())

		let color;
		if (rgb[0] === rgb[1] && rgb[0] === rgb[2]) {
			color = 'grey'
		} else if (rgb[0] !== 0 && rgb[1] == 0 && rgb[2] == 0) {
			color = 'red'
		}

		return color
	}

	beforeAll(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
		await driver.manage().setTimeouts({ implicit: 2000 })
	}, 60000)

	beforeEach(async function() {
		driver.get(baseUrl)
		product = await driver.findElement(productSelector)
	})

	test('Only one sticker on product', async function() {
		const products = await driver.findElements(By.css('.product'));
		expect(products.length).toBeGreaterThanOrEqual(1);

		const locator = '.sticker';
		for (const product of products) {
			const stickers = await product.findElements(By.css(locator));
			expect(stickers.length).toBe(1);
		}
	})

	test('Product name is same in every view', async function() {
		const productName = await product.findElement(By.css('.name'))
			.then(name => name.getText())

		await product.click()

		const aboutName = await driver.findElement(By.css('h1'))
			.then(h1 => h1.getText())

		expect(productName).toBe(aboutName)
	})

	test('Product price is same in every view', async function() {
		const campaignPrice = await product.findElement(campaignPriceLocator)
			.then(price => price.getText())
		const regularPrice = await product.findElement(regularPriceLocator)
			.then(price => price.getText())

		await product.click()

		const aboutCampaingPrice = await driver.findElement(By.css('.campaign-price'))
			.then(price => price.getText())
		const aboutRegularPrice = await driver.findElement(By.css('.regular-price'))
			.then(price => price.getText())

		expect([campaignPrice, regularPrice]).toEqual([aboutCampaingPrice, aboutRegularPrice])
	})

	test('Product prices have expected styles', async function() {
		let regularPrice = await product.findElement(regularPriceLocator)
		let campaignPrice = await product.findElement(campaignPriceLocator)
		const rpStyle = {
			'tag': await regularPrice.getTagName(),
			'class': await regularPrice.getAttribute('class'),
			'color': await getColor(regularPrice),
			'dimensions': await regularPrice.getRect(),
		}
		rpStyle.size = rpStyle.dimensions.height * rpStyle.dimensions.width;

		const cpStyle = {
			'tag': await campaignPrice.getTagName(),
			'class': await campaignPrice.getAttribute('class'),
			'color': await getColor(campaignPrice),
			'dimensions': await campaignPrice.getRect(),
		}
		cpStyle.size = cpStyle.dimensions.height * cpStyle.dimensions.width;

		await regularPrice.click();
		product = await driver.findElement(By.css('#box-product'))

		regularPrice = await product.findElement(regularPriceLocator)
		campaignPrice = await product.findElement(campaignPriceLocator)

		const detailedRpStyle = {
			'tag': await regularPrice.getTagName(),
			'class': await regularPrice.getAttribute('class'),
			'color': await getColor(regularPrice),
			'dimensions': await regularPrice.getRect(),
		}
		detailedRpStyle.size = detailedRpStyle.dimensions.height * detailedRpStyle.dimensions.width;

		const detailedCpStyle = {
			'tag': await campaignPrice.getTagName(),
			'class': await campaignPrice.getAttribute('class'),
			'color': await getColor(campaignPrice),
			'dimensions': await campaignPrice.getRect(),
		}
		detailedCpStyle.size = detailedCpStyle.dimensions.height * detailedCpStyle.dimensions.width

		expect([rpStyle.tag, detailedRpStyle.tag]).toEqual(['s', 's'])

		expect([rpStyle.class, cpStyle.class]).toEqual(['regular-price', 'campaign-price'])
		expect([detailedRpStyle.class, detailedCpStyle.class]).toEqual(['regular-price', 'campaign-price'])

		expect(rpStyle.size < cpStyle.size).toBeTruthy()
		expect(rpStyle.size < cpStyle.size).toBeTruthy()
		expect(detailedRpStyle.size < detailedCpStyle.size).toBeTruthy()

		expect(rpStyle.color === 'grey' && detailedRpStyle.color === 'grey').toBeTruthy()
		expect(cpStyle.color === 'red' && detailedCpStyle.color === 'red').toBeTruthy()
	})

	afterAll(() => driver && driver.quit())
})
