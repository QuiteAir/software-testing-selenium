const { Builder, Browser, By, until, Key } = require('selenium-webdriver');
const { describe, expect, test } = require('@jest/globals');
const { fakerEN_US: faker } = require('@faker-js/faker');

describe('Litecart Client', function() {
	let driver;
	const baseUrl = 'http://localhost:8080/litecart/';
	const noticeSelector = By.css('.notice.success');
	const implicitWaitTime = 2000;

	const Person = {
		fName: faker.person.firstName(),
		lName: faker.person.lastName(),
		address: faker.location.streetAddress(true),
		postcode: faker.location.zipCode({ state: 'AL' }),
		city: faker.location.city(),
		phone: faker.string.numeric('### ###-####'),
		email: faker.internet.email(),
		password: faker.internet.password(),
	}

	beforeEach(async function() {
		driver = await new Builder().forBrowser(Browser.CHROME).build();
		await driver.manage().setTimeouts({ implicit: implicitWaitTime });
	}, 60000);

	test('Sign up new user', async function() {
		await driver.get(baseUrl + 'en/create_account');

		//Fill general info
		await driver.findElement(By.name('firstname')).then(el => el.sendKeys(Person.fName));
		await driver.findElement(By.name('lastname')).then(el => el.sendKeys(Person.lName));
		await driver.findElement(By.name('address1')).then(el => el.sendKeys(Person.address));
		await driver.findElement(By.name('postcode')).then(el => el.sendKeys(Person.postcode));
		await driver.findElement(By.name('city')).then(el => el.sendKeys(Person.city));
		await driver.findElement(By.name('phone')).then(el => el.sendKeys(Person.phone));

		//Fill credetials
		await driver.findElement(By.name('email')).then(el => el.sendKeys(Person.email));
		await driver.findElement(By.name('password')).then(el => el.sendKeys(Person.password));
		await driver.findElement(By.name('confirmed_password')).then(el => el.sendKeys(Person.password));

		//Open countries list
		const countrySelectLocator = By.className('select2-selection__arrow');
		await driver.findElement(countrySelectLocator)
			.then(el => el.click());
		await driver.findElement(By.className('select2-search__field'))
			.then(el => el.sendKeys('United States'));
		//Choose country
		await driver.findElements(By.className('select2-results__option'))
			.then(countries => countries[0])
			.then(el => el.click());

		//This code is needed in case state isn't prechoosed
		//Choose state if there is one
		// const stateSelectLocator = By.name('zone_code');
		// const hasStates = await driver.findElement(stateSelectLocator)
		// 	.then(el => el.isDisplayed());

		//Sign up
		await driver.findElement(By.name('create_account'))
			.then(el => el.click());


		let noticeMessage = await driver.findElement(noticeSelector)
			.then(el => el.getText());

		expect(noticeMessage).toBe('Your customer account has been created.');

		await driver.findElement(By.xpath(`//a[contains(@href, 'logout')]`))
			.then(el => el.click());

		noticeMessage = await driver.findElement(noticeSelector)
			.then(el => el.getText());

		expect(noticeMessage).toBe('You are now logged out.');
	}, 60000);

	test('login with existing user', async function() {
		await driver.get(baseUrl);
		await driver.findElement(By.name('email'))
			.then(el => el.sendKeys(Person.email.toLowerCase()));
		await driver.findElement(By.name('password'))
			.then(el => el.sendKeys(Person.password));
		await driver.findElement(By.name('login'))
			.then(el => el.click());

		let noticeMessage = await driver.findElement(noticeSelector)
			.then(el => el.getText());
		expect(noticeMessage).toMatch(`You are now logged in as ${Person.fName} ${Person.lName}`);

		await driver.findElement(By.xpath(`//a[contains(@href, 'logout')]`))
			.then(el => el.click());

		noticeMessage = await driver.findElement(noticeSelector)
			.then(el => el.getText());

		expect(noticeMessage).toBe('You are now logged out.');
	}, 15000);

	afterEach(() => driver && driver.quit());
})
