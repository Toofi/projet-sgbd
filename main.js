const express = require('express');
const bodyParser = require('body-parser');

const puppeteer = require('puppeteer');

const products = require('./controllers/products');

const databaseConnexion = require('./database/connexion');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  console.log('coucou');
  // const db = await databaseConnexion();

  // products(app, db);

  (async () => {
    let urlToScrap5 = "https://www.amazon.com/Acer-Display-Graphics-Keyboard-A515-43-R19L/dp/B07RF1XD36/ref=lp_16225007011_1_2";
    let urlToScrap4 = "https://www.amazon.de/Bluetooth-Freisprecheinrichtung-Konferenztelefon-Spracherkennung-Telekonferenz-Schwarz/dp/B07FPFTHR7/?_encoding=UTF8&smid=A3ECWO480W6PQZ&pd_rd_w=HnwBi&pf_rd_p=d051a36d-9331-41c8-9203-e7d634b1ee23&pf_rd_r=AXSGGKBJ6XFFN3SBWQD1&pd_rd_r=a16cbbc7-4ac5-4de8-b744-0f89fa7b14e0&pd_rd_wg=TvvyK&ref_=pd_gw_unk";
    let urlToScrap3 = "https://www.amazon.fr/Artemide-Dalu-Lampe-bureau-noir/dp/B00T83OT5W/?_encoding=UTF8&pd_rd_w=6ZZVo&pf_rd_p=2da83227-e0bb-4cdf-a7ba-cfe44e4938c5&pf_rd_r=T13NQW57PGQ90Z10WARC&pd_rd_r=29f94028-65e0-4394-9139-2b70874f7be5&pd_rd_wg=5YOMw&ref_=pd_gw_unk";
    let urlToScrap2 = "https://www.amazon.fr/Leuchtturm1917-329398-Carnet-num%C3%A9rot%C3%A9es-pointill%C3%A9s/dp/B002TSIMW4/ref=sr_1_2?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1UI3A4ZKEOBLR&dchild=1&keywords=leuchtturm1917&qid=1618520327&sprefix=leucht%2Caps%2C186&sr=8-2&th=1";
    let urlToScrap = "https://www.amazon.fr/GHD-Platinum-Professionnel-Cheveux-Sensibilis%C3%A9s/dp/B07GGFXKJ2?ref_=Oct_DLandingS_D_1932fc05_60&smid=A1X6FK5RDHNB96";
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(urlToScrap4);
    const scrap = await page.evaluate(() => {
      const scrappedProduct = document.querySelector('#ppd');
      const scrappedImage = scrappedProduct.querySelector('#landingImage').src;
      const scrappedName = scrappedProduct.querySelector('#productTitle').textContent.trim();
      const scrappedPrice = (() => {
        let price;
        let isPromo = false;
        if(document.querySelector('#priceblock_dealprice')){
          price = scrappedProduct.querySelector('#priceblock_dealprice').textContent;      
          isPromo = true;
        } else if (document.querySelector('#priceblock_ourprice')){
          price = scrappedProduct.querySelector('#priceblock_ourprice').textContent;
        } else {
          price = scrappedProduct.querySelector('#priceblock_saleprice').textContent; 
        }
        return { price, isPromo };
      })();
      console.log(scrappedPrice);

      return { scrappedImage, scrappedName, scrappedPrice };
    });
    console.log(scrap);
  })();

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
