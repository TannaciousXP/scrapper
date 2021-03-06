import express from 'express';
import bodyParser from 'body-parser';
import Twit from 'twit';
import pollyFill from 'babel-polyfill';
import request from 'request';
import cheerio from 'cheerio';
import csv from 'fast-csv';
import path from 'path';
import fs  from 'fs';
import dotenv from 'dotenv';
dotenv.config();


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

// Make a twitter URL
const makeURL = (name, tweetId) => {
  return `https:twitter.com/${name}/status/${tweetId}`;
}

// Search tweets for a certain topic, makes sure there's no duplicate, and sorted by retweets
const searchTweets = (topic) => {
  const topics = [];
  const haveTweet = {};
  let canPush = false;
  return new Promise((res) => {
    T.get('search/tweets', { q: `${topic} since:${getToday()}`, count: 100 }, (err, data, response) => {
      
      let sortedTweets = data.statuses.sort((a, b) => b.retweet_count - a.retweet_count);
      let count = 1;

      for (let tweet of sortedTweets) {
        let csv = [count, tweet.retweet_count];
        if (tweet.text.substr(0, 4) === 'RT @') {
          let retweet = tweet.retweeted_status;
          if (!haveTweet.hasOwnProperty(retweet.id_str)){
            canPush = true;
            haveTweet[retweet.id_str] = true;
            csv[2] = retweet.text;
            csv[3] = makeURL(retweet.user.screen_name, retweet.id_str);
          }
        } else {
          if (!haveTweet.hasOwnProperty(tweet.id_str)){
            canPush = true;
            haveTweet[tweet.id_str] = true;
            csv[2] = tweet.text;
            csv[3] = makeURL(tweet.user.screen_name, tweet.id_str);
          }
        }        
        if (canPush) {
          topics.push(csv);
          count++;
          canPush = false;
        }
      }

      res(topics);

    });
  });
}


/*
Get trends, and tweets from Twitter, scrapes Reddit Tech and Business page
pipes to the csv file separating the by "- Source"
*/
const pipeToCSV = async () => {
  let data = [];
  let count = 1;

  let trends = await getTrendsByPlace(sf_woeid);
  let techTweets = await searchTweets('tech');
  let businessTweets = await searchTweets('business');
  let tech = await scrapeSubReddit('technology');
  let business = await scrapeSubReddit('business');

  data.push(['Rank', 'Popularity', 'Topic', 'Link']);
  data.push(['-', 'TWITTER TRENDS']);
  for (let ele of trends) {
    data.push([count, ele.tweet_volume === null ? 0 : ele.tweet_volume, ele.name, ele.url]);
    count++;
  }
  data.push(['-', 'TECH TWEETS']);
  for (let ele of techTweets) {
    data.push(ele);
  }
  data.push(['-', 'BUSINESS TWEETS']);
  for (let ele of businessTweets) {
    data.push(ele);
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

let now = new Date();
let millisTill7AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0) - now;
if (millisTill7AM < 0) {
  millisTill7AM += 86400000; // it's after 10am, try 10am tomorrow.
}

let millisTill6PM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0) - now;
if (millisTill6PM < 0) {
  millisTill6PM += 86400000; // it's after 10am, try 10am tomorrow.
}

// Uncomment to test out the pipeToCSV()
// pipeToCSV();


// Invoke the function at 7AM and 6PM;
// setTimeout(() => { pipeToCSV() }, millisTill7AM);
// setTimeout(() => { pipeToCSV() }, millisTill6PM);




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));