'use strict';
const TARGET_INDEX = 0;
const puppeteer = require('puppeteer');
const prompts = require("prompts");
const fs = require('fs');
const csv = require('csv');
const csvSync = require('csv-parse/lib/sync'); // requiring sync module

const file = 'input.csv';
let data = fs.readFileSync(file);

let res = csvSync(data);
let urlArray = res.map(x => x[TARGET_INDEX])

const googlePasswd = process.env.GOOGLE_PASSWD

const getInfo = async (browser, url) => {
  let page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    }
    else {
      req.continue();
    }
  });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.focus('input[type="email"]');
  await page.type("#identifierId", "****"); //取扱い注意
  await page.click('#identifierNext');
  await page.waitFor(3000);
  await page.focus('input[type="password"]');
  await page.type('input[type="password"]', "****"); //取扱い注意
  await page.click('#passwordNext');
  let questions = {
    type: "text", // インプットタイプ
    name: "myValue", // 変数名
    message: "Input PIN"
  };
  let response =  await prompts(questions);
  console.log(response.myValue);
  await page.focus('input[type="tel"]');
  await page.type("#idvPin", response.myValue);
  await page.click('#idvPreregisteredPhoneNext');

  const title = await page.title()
  console.error(`url: ${url}`)
  console.error(`title: ${title}`)
  console.error('-------------------------')
  }


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process'
    ]
  });
  for (const url of urlArray) {
    await getInfo(browser, url)
  }
  //browser.close();
})();

