const path = require('node:path');
const { faker } = require('@faker-js/faker')
const { Builder, Browser, By, Key, until, error } = require('selenium-webdriver')
/* const { test, expect, beforeEach, afterEach } = require('jest') */

describe('Litecart Admin', function() {
	let driver
	const baseUrl = 'http://localhost:8080/litecart/admin'

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build()
		await driver.manage().setTimeouts({ implicit: 2000 })

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
		const baseLocator = '#box-apps-menu > li'
		const navList = await driver.findElements(By.css(baseLocator))
		expect(navList).toBeDefined()

		for (let i = 1; i <= navList.length; i += 1) {
			const mainNavLocator = baseLocator + `:nth-child(${i})`
			const mainNavItem = await driver
				.findElement(By.css(mainNavLocator))
				.click()
			await expect(
				async () => await driver.findElement(By.css('h1'))
			).not.toThrow()

			// await driver.wait(until.elementsLocated(By.css(mainNavLocator + ' li')), 2000)
			const subNavCount = await driver.findElements(By.css(mainNavLocator + ' li'))
			if (!subNavCount.length) {
				continue
			}

			for (let j = 1; j <= subNavCount.length; j += 1) {
				await driver.findElement(By.css(mainNavLocator + ` li:nth-child(${j})`))
					.click()
				await expect(
					async () => await driver.findElement(By.css('h1'))
				).not.toThrow()
			}
		}
	}, 60000)

	test('Countries are in alphabetical order', async function() {
		await driver.get(baseUrl + '/?app=countries&doc=countries')

		let countriesLocator = 'td > a[href *= "edit_country"]:not([title])'
		const names = await Promise.all(
			(await driver.findElements(By.css(countriesLocator)))
				.map((el) => el.getText())
		)

		expect(names).toEqual(names.slice().sort())
	})

	test('Zones are in alphabetical order', async function() {
		driver.get(baseUrl + '/?app=countries&doc=countries')

		const countriesLocator = `//tr[@class='row']/td[6][not(text()=0)]/../td[5]`
		const withZones = await driver.findElements(By.xpath(countriesLocator))
		const countries = await Promise.all(withZones.map((el) => el.getText()))


		for (countryName of countries) {
			const country = await driver.findElement(By.xpath(`//a[text() = '${countryName}']`))
			await country.click();

			const zonesLocator = `//table[@id='table-zones']//td[3][not(@class)]`
			const zones = (
				await Promise.all(
					(await driver.findElements(By.xpath(zonesLocator)))
						.map((el) => el.getText())
				)
			).filter(txt => txt != '')

			expect(zones).toEqual(zones.slice().sort())

			driver.get(baseUrl + '/?app=countries&doc=countries')
		}
	})

	test('Geo zones are in alphbetical order', async function() {
		driver.get(baseUrl + '/?app=geo_zones&doc=geo_zones')

		const countries = await Promise.all(
			(await driver.findElements(By.css('tr.row td:nth-child(3)')))
				.map(el => el.getText())
		)

		for (countryName of countries) {
			const country = await driver.findElement(By.xpath(`//a[text() = '${countryName}']`))
			await country.click();

			const zonesLocator = `//table[@id='table-zones']//tr[not(@class)]//td[3]//select//option[@selected]`
			const zones = await Promise.all(
				(await driver.findElements(By.xpath(zonesLocator)))
					.map(el => el.getText())
			)

			expect(zones).toEqual(zones.slice().sort())

			driver.get(baseUrl + '/?app=geo_zones&doc=geo_zones')
		}
	})

	test('Add new product', async function() {
		const productName = faker.commerce.productName();
		driver.get(baseUrl + '/?app=catalog&doc=catalog');
		await driver.findElement(By.css('.button:last-child')).then(el => el.click());

		//Fill General
		await driver.findElement(By.name('status')).then(el => el.click());
		await driver.findElement(By.name('name[en]')).then(el => el.sendKeys(productName));
		await driver.findElement(By.name('code')).then(el => el.sendKeys(faker.helpers.fromRegExp('[a-z]{2}[0-9]{4}')));
		await driver.findElement(By.name('quantity')).then(async el => {
			await el.clear();
			return el.sendKeys(faker.number.int({ min: 1, max: 30 }));
		});
		//Load file
		const imagePath = path.normalize(__dirname + '/../assets/duck.jpg');
		await driver.findElement(By.name('new_images[]')).then(el => el.sendKeys(imagePath));
		//Set dates
		await driver.findElement(By.name('date_valid_from')).then(async el => {
			await el.click();
			await el.sendKeys(Key.ARROW_UP + Key.TAB + Key.ARROW_UP + Key.TAB + Key.ARROW_UP);
		});

		//Fill Information
		await driver.findElement(By.xpath(`//a[contains(@href, 'information')]`)).then(el => el.click());
		await driver.findElement(By.name('manufacturer_id')).then(el => el.sendKeys(Key.ARROW_DOWN + Key.ENTER));
		await driver.findElement(By.name('short_description[en]')).then(el => el.sendKeys(faker.commerce.productMaterial() + ' ' + faker.commerce.productAdjective() + ' ' + faker.commerce.productName()));
		await driver.findElement(By.className('trumbowyg-editor')).then(el => el.sendKeys(faker.commerce.productDescription()));

		//Fill Prices and save product
		await driver.findElement(By.xpath(`//a[contains(@href, 'prices')]`)).then(el => el.click());
		await driver.findElement(By.name('purchase_price')).then(el => el.sendKeys('15' + Key.TAB + Key.ARROW_DOWN + Key.ENTER))
		await driver.findElement(By.name('prices[USD]')).then(el => el.sendKeys('30'));
		//Save product
		await driver.findElement(By.name('save')).then(el => el.click());

		const product = await driver.findElement(By.xpath(`//a[contains(., \'${productName}\')]`)).then(el => el.getText());
		expect(product).toBe(productName);
	}, 15000);

	test('Links open in new window', async function() {
		await driver.get(baseUrl + '/?app=countries&doc=countries');
		await driver.findElements(By.css('a[href *= "country_code"]')).then(el => el[0].click());

		const originalTab = await driver.getWindowHandle();
		const originalTabsCount = (await driver.getAllWindowHandles()).length;
		const links = await driver.findElements(By.className('fa-external-link'));

		for (const link of links) {
			await link.click();
			await driver.wait(function(driver) {
				return driver.getAllWindowHandles().then((handles) => handles.length > originalTabsCount);
			}, 1000);

			const newTabs = await driver.getAllWindowHandles();
			expect(newTabs.length).toBeGreaterThan(originalTabsCount);
			const newTab = newTabs[originalTabsCount];
			await driver.switchTo().window(newTab);
			await driver.close();
			await driver.switchTo().window(originalTab);
		}
	}, 15000);

	afterEach(() => driver && driver.quit())
})
//await new Promise(r => setTimeout(r, 4000));
