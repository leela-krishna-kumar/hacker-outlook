const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mysql = require("mysql2");
const axios = require("axios");
const cheerio = require("cheerio");


// Configure MySQL connection
const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "Krishna@18",
	database: "hacker_outlook",
});

// Connect to MySQL
db.connect((err) => {
	if (err) throw err;
	console.log("Connected to MySQL");
});


// const urlsToCheck = ["https://feeds.feedburner.com/ndtvnews-top-stories"];
// const elementsToSearchFor = ["disaster", "incident"];

const urlsToCheck = {
    top_stories: [
        "https://feeds.feedburner.com/ndtvnews-top-stories",
        "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    ],
    tech: [
        "https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en",
    ],
    AI: [
        "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en",
    ],
    recent_stories: [
        "https://timesofindia.indiatimes.com/rssfeedmostrecent.cms",
        "https://feeds.feedburner.com/ndtvnews-latest",
        "https://feeds.feedburner.com/ndtvnews-trending-news",
    ],
};

// Iterate over each category and its URLs
Object.entries(urlsToCheck).forEach(([category, urls]) => {
    urls.forEach((url) => {
        axios
            .get(url)
            .then((response) => {
                let html = response.data;
                saveData(html, category); // Pass category to saveData for reference
            })
            .catch((error) => {
                console.log(`Request Error for ${category} - ${error}`);
            });
    });

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
                // index + 1,
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
                    // Continue to the next item without stopping execution
                    return;
                }
                console.log(`Data inserted for SN ${index + 1}`);
            });
        });
    };
});

// Close MySQL connection when done (or handle gracefully in a larger application)
process.on("exit", () => db.end());
