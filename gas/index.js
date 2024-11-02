const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mysql = require("mysql2");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config(); // Load environment variables from .env file

// Configure MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

const urlsToCheck = {
    top_stories: [
        "NDTV|https://feeds.feedburner.com/ndtvnews-top-stories",
        "Times of India|https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "Newyork Times|https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "Google News|https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN",
        "The Hindu|https://frontline.thehindu.com/feeder/default.rss",
    ],
    tech: [
        "Google News|https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en",
        "Times of India|https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
        "Live Mint|https://www.livemint.com/rss/technology",
    ],
    AI: [
        "Google News|https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en",
        "Live Mint|https://www.livemint.com/rss/AI",
    ],
    science_and_technology: [
        "The Hindu|https://frontline.thehindu.com/science-and-technology/feeder/default.rss",
        "Times of India|https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms",
        "Live Mint|https://www.livemint.com/rss/science",
        "Google News|https://news.google.com/rss/search?q=science+and+technology&hl=en-IN&gl=IN&ceid=IN",
    ],
    travel: [
        "The Hindu|https://frontline.thehindu.com/other/travel/feeder/default.rss",
        "Google News|https://news.google.com/rss/search?q=travel&hl=en-IN&gl=IN&ceid=IN",
    ],
    world_affairs: [
        "The Hindu|https://frontline.thehindu.com/world-affairs/feeder/default.rss",
        "Google News|https://news.google.com/rss/search?q=world+affairs&hl=en-IN&gl=IN&ceid=IN",
        "Times of India|https://news.google.com/rss/search?q=world+affairs&hl=en-IN&gl=IN&ceid=IN",
    ],
    economy: [
        "The Hindu|https://frontline.thehindu.com/economy/feeder/default.rss",
        "Google News|https://news.google.com/rss/search?q=economy&hl=en-IN&gl=IN&ceid=IN",
    ],
    story_analysis: [
        "The Hindu|https://frontline.thehindu.com/other/data-card/feeder/default.rss",
        "Google News|https://news.google.com/rss/search?q=story+analysis&hl=en-IN&gl=IN&ceid=IN",
    ],
    recent_stories: [
        "Times of India|https://timesofindia.indiatimes.com/rssfeedmostrecent.cms",
        "NDTV|https://feeds.feedburner.com/ndtvnews-latest",
        "NDTV|https://feeds.feedburner.com/ndtvnews-trending-news",
        "Google News|https://news.google.com/news/rss/headlines/section/q/recent%20stories",
    ],
};


Object.entries(urlsToCheck).forEach(([category, entries]) => {
    entries.forEach((entry) => {
        const [source, url] = entry.split("|"); // Separate source and URL

        axios
            .get(url)
            .then((response) => {
                let html = response.data;
                saveData(html, category, source); // Pass category and source to saveData
            })
            .catch((error) => {
                console.log(
                    `Request Error for ${category} (${source}) - ${error}`
                );
            });
    });
<<<<<<< HEAD
});

const saveData = (html, category, source) => {
    // Add source parameter to saveData
    const data = [];
    const $ = cheerio.load(html, { xmlMode: true });

    $("item").each((i, elem) => {
        data.push({
            title: $(elem).find("title").text(),
            link: $(elem).find("link").text(),
            source: source, // Set the source explicitly
            published: $(elem).find("pubDate").text(),
            content: $(elem).find("description").text(),
            image:
                $(elem).find("media\\:content").attr("url") ||
                $(elem).find("enclosure").attr("url") ||
                $(elem).find("media\\:thumbnail").attr("url"),
        });
    });

    // Sort the data array by published date (descending order for latest first)
    // data.sort((a, b) => new Date(b.published) - new Date(a.published));

    data.forEach((item, index) => {
        const query = `
            INSERT INTO posts (category, type, image, title, link, published, content, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                category = VALUES(category),
                type = VALUES(type),
                image = VALUES(image),
                title = VALUES(title),
                published = VALUES(published),
                content = VALUES(content),
                source = VALUES(source)
        `;

        const dateObj = new Date(item.published);
        const mysqlDateTime = dateObj
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        const params = [
            category,
            "carousel",
            item.image,
            item.title,
            item.link,
            mysqlDateTime,
            item.content,
            source, // Add source to params
        ];

        db.query(query, params, (err) => {
            if (err) {
                console.error(
                    `Error inserting data for SN ${index + 1}:`,
                    err.message
                );
                return;
            }
            console.log(`Data inserted for SN ${index + 1}`);
        });
    });
};

// Close MySQL connection when done (or handle gracefully in a larger application)
=======

    const saveData = (html) => {
        const data = [];
        const $ = cheerio.load(html, { xmlMode: true });

        $("item").each((i, elem) => {
            data.push({
                title: $(elem).find("title").text(),
                link: $(elem).find("link").text(),
                published: $(elem).find("pubDate").text(),
                content: $(elem).find("description").text(),
                image:
                    $(elem).find("media\\:content").attr("url") ||
                    $(elem).find("enclosure").attr("url"), // Use media:content URL if it exists
            });
        });

        data.forEach((item, index) => {
            const query = `
                INSERT INTO posts (category, type, image, title, link, published, content)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    category = VALUES(category),
                    type = VALUES(type),
                    image = VALUES(image),
                    title = VALUES(title),
                    published = VALUES(published),
                    content = VALUES(content)
            `;
            const dateObj = new Date(item.published);

            // Format to MySQL DATETIME format
            const mysqlDateTime = dateObj
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

            const params = [
                category,
                "carousel",
                item.image,
                item.title,
                item.link,
                mysqlDateTime,
                item.content,
            ];

            db.query(query, params, (err) => {
                if (err) {
                    console.error(
                        `Error inserting data for SN ${index + 1}:`,
                        err.message
                    );
                    return;
                }
                console.log(`Data inserted for SN ${index + 1}`);
            });
        });
    };
});

// Close MySQL connection when done
>>>>>>> 42d3897 (push 3)
process.on("exit", () => db.end());
