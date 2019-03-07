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
  await page.goto('https://www.google.com/adx/buyer/Main.html', { waitUntil: 'networkidle0' });
  await page.setViewport({width: 1440, height: 900});
  await page.focus('input[type="email"]');
  await page.type("#identifierId", "****"); //取扱い注意
  await page.click('#identifierNext');
  await page.waitFor(2000);
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
  await page.waitForSelector('section', {visible: true});
  await console.log("Wait成功");
  await page.click('tab-button[tabindex="-1"]');
  //ユーザーの場所
  await page.focus('input[aria-label="ユーザーの場所"]');
  await console.log("GEO設定にフォーカス成功");
  await page.type('input[aria-label="ユーザーの場所"]', "japan");
  await console.log("GEO設定にJapan記入成功");
  await page.waitFor(3000);
  await page.keyboard.press('Enter');
  await console.log("GEO設定が成功");

  //フォーマット
  await page.mouse.click(1278, 575, {
    button: 'left',
    clickCount: 1,
    delay: 0,
});
  await console.log("フォーマット設定が成功");

  //環境
  await page.focus('input[aria-label="環境"]');
  await console.log("環境設定にフォーカス成功");
  await page.type('input[aria-label="環境"]', "web");
  await console.log("環境設定にweb記入成功");
  await page.waitFor(1000);
  await page.keyboard.press('Enter');

  //デバイス
  await page.focus('input[aria-label="デバイス"]');
  await console.log("デバイス設定にフォーカス成功");
  await page.type('input[aria-label="デバイス"]', "Mobile");
  await console.log("デバイス設定にMobile記入成功");
  await page.waitFor(1000);
  await page.keyboard.press('Enter');

  //リワード
  await page.focus('input[aria-label="リワードあり"]');
  await console.log("リワード設定にフォーカス成功");
  await page.type('input[aria-label="リワードあり"]', "Non-rewarded");
  await console.log("リワード設定にMobile記入成功");
  await page.waitFor(1000);
  await page.keyboard.press('Enter');

  //広告枠のサイズ
  await page.focus('input[aria-label="広告枠のサイズ"]');
  await console.log("広告枠のサイズ設定にフォーカス成功");
  await page.type('input[aria-label="広告枠のサイズ"]', "300x250");
  await console.log("広告枠のサイズ設定に300x250記入成功");
  await page.waitFor(1000);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  
  //ループ開始地点
  //ドメイン検索フォーカス
  await page.focus('domain-filter > material-input');
  await console.log("ドメイン検索フォーカス成功");
  await page.waitForSelector('textarea', {visible: true});
  //ドメイン検索ポップアップ
  await page.focus('textarea[aria-label="example.com, google.com, youtube.com"]');
  await console.log("ドメイン検索ポップアップフォーカス成功");
  await page.keyboard.type(url); //検索ドメイン入力
  await console.log("ドメイン検索入力完了");
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await console.log("検索スタート");
  await page.waitFor(6000);
  //await page.waitForSelector('ess-cell[essfield="name"]', {visible: true});
  //検索対象のリンククリック
  
  let selector = 'a';
    await page.$$eval(selector, (anchors, url) => {
        anchors.map(anchor => {
            if(anchor.textContent == url) {
                anchor.click();
                return
            }
        })
    }, url);
  
  //Summaryページの情報収集
  //Inpressions取得
  await page.waitForSelector('div.slidealog-header', {visible: true});
  const summaryImpressions = await page.evaluate(() => {
    return document.querySelector('div.impression-value').textContent;
    });
    var imp = summaryImpressions;
  await console.error(`url: ${url}`)
  await console.error(`imp: ${imp}`)
  //UU取得
  await page.waitForSelector('div[debugid="summary-uniques"]', {visible: true});
  const summaryUu = await page.evaluate(() => {
    return document.querySelector('div[debugid="summary-uniques"]').textContent;
    });
    var UU = summaryUu;
  await console.error(`UU: ${UU}`)
  //年齢別取得
  //18-24
  const checkAge1824 = await page.$('label[title="18-24"]');
  if(checkAge1824 == undefined){
    var age1824Result = "none";
  } else {
  const age1824 = await page.evaluate(() => {
    return document.querySelector('label[title="18-24"]').nextElementSibling.textContent;
    });
    var age1824Result = age1824;
  }
  await console.error(`age1824: ${age1824Result}`)
  //25-34
  const checkAge2534 = await page.$('label[title="25-34"]');
  if(checkAge2534 == undefined){
    var age2534Result = "none";
  } else {
  const age2534 = await page.evaluate(() => {
    return document.querySelector('label[title="25-34"]').nextElementSibling.textContent;
    });
    var age2534Result = age2534;
  }
  await console.error(`age2534: ${age2534Result}`)
  //35-44
  const checkAge3544 = await page.$('label[title="35-44"]');
  if(checkAge3544 == undefined){
    var age3544Result = "none";
  } else {
  const age3544 = await page.evaluate(() => {
    return document.querySelector('label[title="35-44"]').nextElementSibling.textContent;
    });
    var age3544Result = age3544;
  }
  await console.error(`age3544: ${age3544Result}`)
  //45-54
  const checkAge4554 = await page.$('label[title="45-54"]');
  if(checkAge4554 == undefined){
    var age4554Result = "none";
  } else {
  const age4554 = await page.evaluate(() => {
    return document.querySelector('label[title="45-54"]').nextElementSibling.textContent;
    });
    var age4554Result = age4554;
  }
  await console.error(`age4554: ${age4554Result}`)
  //55-64
  const checkAge5564 = await page.$('label[title="55-64"]');
  if(checkAge5564 == undefined){
    var age5564Result = "none";
  } else {
  const age5564 = await page.evaluate(() => {
    return document.querySelector('label[title="55-64"]').nextElementSibling.textContent;
    });
    var age5564Result = age5564;
  }
  await console.error(`age5564: ${age5564Result}`)
  //65+
  const checkAge65 = await page.$('label[title="65+"]');
  if(checkAge65 == undefined){
    var age65Result = "none";
  } else {
  const age65 = await page.evaluate(() => {
    return document.querySelector('label[title="65+"]').nextElementSibling.textContent;
    });
    var age65Result = age65;
  }
  await console.error(`age65: ${age65Result}`)

  //Summaryページ閉じる
  await page.click('material-button.slidealog-close');
  await page.waitForSelector('domain-filter > material-input', {visible: true});
  await page.focus('domain-filter > material-input');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  console.error('-------------------------')
  //ループ終了
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
      '--window-size=1440,900',
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

