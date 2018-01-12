import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import Twit from 'twit';
import pollyFill from 'babel-polyfill';
import request from 'request';
import cheerio from 'cheerio';


import path from 'path';
import fs  from 'fs';
import csv from 'fast-csv';


const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Twitter Auth, tokens are located in the .env file
const T = new Twit({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token: process.env.M_KEY,
  access_token_secret: process.env.M_SECRET
});

// Set up write stream
let ws = fs.createWriteStream(path.join(__dirname, '../topics.csv'));

// get SF woeID
const sf_woeid = 2487956;
// Find trends, this function finds trends for sf_woeid
const getTrendsByPlace = (woeid) => {
  return new Promise((res) => {    
    T.get('trends/place', { id: sf_woeid }, (err, data, response) => {
      let sortedData = data[0].trends.sort((a, b) => b.tweet_volume - a.tweet_volume);
      res(sortedData);
      // res(data);
    });
  });
};

/*
Reuseable function for scraping Reddit subredits, returns an array with elements structured:
[rank, popularity, topic, url];
*/
const scrape = ($) => {
  const csvArr = [];
  let count = 1;
  $('.thing', '#siteTable').each(function () {
    
    let tableEle = this.attribs;
    let fullName = tableEle['data-fullname'].substr(3);
    let idx = tableEle['data-permalink'].lastIndexOf(fullName) + 7;
    let title = tableEle['data-permalink'].substr(idx);

    title = title.replace(/_/g, ' ');
    title = title.substr(0, title.length - 1);

    const url = tableEle['data-url'][0] === 'h' ? tableEle['data-url'] : 'No Url';

    csvArr.push([0, tableEle['data-score'], title, url]);
  });

  csvArr.sort((a, b) => b[1] - a[1]);
  csvArr.forEach(ele => {
    ele[0] = count;
    count++;
  });
  return csvArr;
};

// scrapes the Reddit Technology page
const scrapeSubReddit = (topic) => {
  return new Promise ((res) => {
    request(`https://www.reddit.com/r/${topic}/`, (err, resp, body) => {
      let data;
      if (!err && resp.statusCode === 200) {
        let $ = cheerio.load(body);
        data = scrape($);
      }
      res(data);
    });
  });
}



// Get today's date for searching tweets
const getToday = () => {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  
  if (dd < 10) {
    dd = '0' + dd
  }
  
  if (mm < 10) {
    mm = '0' + mm
  }
  
  today = `${yyyy}-${mm}-${dd}`;
  return today;
};

const searchTweets = (topic) => {
  const topicObj = {};
  return new Promise((res) => {
    T.get('search/tweets', { q: `${topic} since:${getToday()}`, count: 5 }, (err, data, response) => {
      data.statuses = data.statuses.sort((a, b) => b.retweet_count - a.retweet_count);
      console.log(data.statuses);
      // console.log(data.statuses[0].entities);
      // let url = `https://twitter.com/${}/status/${}`
    })

  });
}


/*
Get trends from Twitter, scrapes Reddit Tech and Business page
pipes to the csv file separating the by "- Source"
*/
const pipeToCSV = async () => {
  let data = [];
  let count = 1;
  let trends = await getTrendsByPlace(sf_woeid);
  let tech = await scrapeSubReddit('technology');
  let business = await scrapeSubReddit('business');
  data.push(['Rank', 'Popularity', 'Topic', 'Link']);
  data.push(['-', 'TWITTER TRENDS']);
  for (let ele of trends) {
    data.push([count, ele.tweet_volume === null ? 0 : ele.tweet_volume, ele.name, ele.url]);
    count++;
  }
  data.push(['-', 'REDDIT TECH']);
  for (let ele of tech) {
    data.push(ele);
  }
  data.push(['-', 'REDDIT BUSINESS']);
  for (let ele of business) {
    data.push(ele);
  }
  csv.write(data, { headers: true }).pipe(ws);
}



// pipeToCSV();





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));