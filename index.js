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
  await page.goto(url, { waitUntil: 'networkidle0' });
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
  await page.waitFor(2000);
  await page.keyboard.press('Enter');
  await console.log("GEO設定が成功");

  //フォーマット
  await page.mouse.click(1278, 532, {
    button: 'left',
    clickCount: 1,
    delay: 0,
});
  await console.log("フォーマット設定が成功");

  //環境
  await page.focus('input[aria-label="環境"]');
  await console.log("環境設定にフォーカス成功");
  await page.type('input[aria-label="環境"]', "web");
  await console.log("GEO設定にJapan記入成功");
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
  
  //ドメイン検索（ループ開始地点）
  //ドメイン検索フォーカス
  await page.focus('domain-filter > material-input');
  await console.log("ドメイン検索フォーカス成功");
  await page.waitForSelector('textarea', {visible: true});
  //ドメイン検索ポップアップ
  await page.focus('textarea[aria-label="example.com, google.com, youtube.com"]');
  await console.log("ドメイン検索ポップアップフォーカス成功");
  await page.keyboard.type('cosme.net'); //検索ドメイン入力
  await console.log("ドメイン検索入力完了");
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await console.log("検索スタート");
  await page.waitFor(6000);
  //検索対象のリンククリック
  let selector = 'a';
    await page.$$eval(selector, anchors => {
        anchors.map(anchor => {
            if(anchor.textContent == 'cosme.net') {
                anchor.click();
                return
            }
        })
    });



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

