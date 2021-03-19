const Puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { clickButton, delay } = require("./utils/action");
const { autoScroll } = require("./utils/scroll");

// Use stealth plugin to improve ability to circumvent detection
puppeteer.use(StealthPlugin());

/**
 * Setup bot dependant constants
 * These elements could ideally be given by a database
 * See the example folder for how this might be done in cloud functions
 */
const username = "YOUR_USERNAME";
const password = "YOUR_PASSWORD";
const filepath = "./images/example.png";
const description = `
  Test
  .
  .
  .
  #test
`;

const init = async (username, password, filepath, description) => {
  // Initialize puppeteer browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Setup puppeteer to simulate an iphone
  // Upload through the Instagram website is only available through a phone view
  const iPhonex = Puppeteer.devices["iPhone X"];
  await page.emulate(iPhonex);

  // Visit the Instagram login page
  await page.goto("https://www.instagram.com/accounts/login/");

  // Accept cookie policy
  await clickButton("Accept", page);

  // Wait for the page and login form to be loaded
  await page.waitForSelector("input[name=username]");

  // Simulate typing with delay to further circumvent detection,
  // while filling out the login form
  await page.type("input[name=username]", username, {
    delay: delay(),
  });
  await page.type("input[name=password]", password, {
    delay: delay(),
  });

  // Click the form submit button
  await clickButton("Log In", page);

  // Wait for page to navigate
  await page.waitForNavigation();

  // Dismiss Instagram app download
  await clickButton("Not Now", page);

  // Wait until everything is loaded, most importantly the file input field
  await page.waitForSelector("input[type='file']");

  // Simulate user behaviour
  await autoScroll(page);
  await page.waitForTimeout(1000);

  // Set the value for the correct file input (last on the page is new post)
  let fileInputs = await page.$$('input[type="file"]');
  let input = fileInputs[fileInputs.length - 1];

  // Upload the file
  // Note: Instagram has a check in place to make sure you've viewed the file upload dialog before continuing the upload
  await page.evaluate(function () {
    document.querySelector("[aria-label='New Post']").parentElement.click();
  });

  // Simulate the browsing of the image dialog
  await page.waitForTimeout(250);

  // Upload image from path
  await input.uploadFile(filepath);
  await page.waitForTimeout(250);

  // Wait for the next button and click
  await clickButton("Next", page);

  // Wait for the next button and click
  // Has to be twice to go through redundant upload steps
  await clickButton("Next", page);

  // Wait for textarea to appear
  await page.waitForSelector("textarea[aria-label='Write a caption…']");
  await page.waitForTimeout(250);

  // Click the caption option
  await page.click("textarea[aria-label='Write a caption…']");

  // Type description with delay
  await page.keyboard.type(description, {
    delay: delay(),
  });

  // Post image
  await page.waitForTimeout(250);
  await clickButton("Share", page);

  // Wait before finishing
  await page.waitForTimeout(5000);

  // Close
  await browser.close();
};

init(username, password, filepath, description);
