const puppeteer = require('puppeteer');

class Puppeteer {

  scrapPrice = async (url) => {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);
      let price = await page.evaluate(() => {
        const scrappedProduct = document.querySelector('#ppd');
        const scrappedPrice = (() => {
          let price;
          let isPromo = false;
          if (document.querySelector('#priceblock_dealprice')) {
            price = scrappedProduct.querySelector('#priceblock_dealprice').textContent;
            isPromo = true;
          } else if (document.querySelector('#priceblock_ourprice')) {
            price = scrappedProduct.querySelector('#priceblock_ourprice').textContent;
          } else if (document.querySelector('#priceblock_saleprice')) {
            price = scrappedProduct.querySelector('#priceblock_saleprice').textContent;
          } else {
            throw 'There is no price for the product';
          }
          return { price, isPromo };
        })();
        return scrappedPrice;
      });
      return price;
    } catch (e) {
      console.log('Impossible to scrap the price ...');
      console.log(e);
      return null;
    }
  };

  scrapImage = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const image = await page.evaluate(() => {
      const scrappedProduct = document.querySelector('#ppd');
      const scrappedImage = scrappedProduct.querySelector('#landingImage').src;
      return scrappedImage;
    });
    return image;
  };

  scrapName = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const name = await page.evaluate(() => {
      const scrappedProduct = document.querySelector('#ppd');
      const scrappedName = scrappedProduct.querySelector('#productTitle').textContent.trim();
      return scrappedName;
    });
    return name;
  };

  scrapNameAndImage = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const nameAndImage = await page.evaluate(() => {
      const scrappedProduct = document.querySelector('#ppd');
      const scrappedName = scrappedProduct.querySelector('#productTitle').textContent.trim();
      const scrappedImage = scrappedProduct.querySelector('#landingImage').src;
      return { scrappedName, scrappedImage };
    });
    return nameAndImage;
  };

  scrapAll = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const all = await page.evaluate(() => {
      const scrappedProduct = document.querySelector('#ppd');
      const scrappedPrice = (() => {
        let price;
        let isPromo = false;
        if (document.querySelector('#priceblock_dealprice')) {
          price = scrappedProduct.querySelector('#priceblock_dealprice').textContent;
          isPromo = true;
        } else if (document.querySelector('#priceblock_ourprice')) {
          price = scrappedProduct.querySelector('#priceblock_ourprice').textContent;
        } else {
          price = scrappedProduct.querySelector('#priceblock_saleprice').textContent;
        }
        return { price, isPromo };
      })();
      const scrappedName = scrappedProduct.querySelector('#productTitle').textContent.trim();
      const scrappedImage = scrappedProduct.querySelector('#landingImage').src;
      return { scrappedPrice, scrappedName, scrappedImage };
    });
    return all;
  };

};

module.exports = Puppeteer;
