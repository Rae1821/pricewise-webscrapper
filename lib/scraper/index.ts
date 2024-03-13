import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {

if(!url) return;

// curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_9524ae45-zone-pricewise:tjh3rbjd9cqr -k https://lumtest.com/myip.json

//BrightData proxy configuration
const username = String(process.env.BRIGHT_DATA_USERNAME)
const password = String(process.env.BRIGHT_DATA_PASSWORD)
const port = 2225;
const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //fetch the product page
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data);

        //Extract the product title
        //Can find the title and price values by inspecting the product website and seeing what classes and ids are linked to the price and title then adding them here.
        const title = $(`#productTitle`).text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = extractPrice(
            $(`#priceblock_ourprice`),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('a.size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable'

        const images =
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

            const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,"")

        console.log(title, currentPrice, originalPrice, outOfStock, imageUrls, currency, discountRate);
    } catch (error: any) {
        throw new Error(`Failed to scapre product: ${error.message}`);
    }
}