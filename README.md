# Scrape Twitter and Reddit

Scrapes Twitter's trends and tweets and Reddit's subreddits and pipe the data to a csv file.

by Peter X. Tan

## Getting Started

What software you need to install and how to install them

- [Node 8.x.x.](https://nodejs.org/en/)

## Setup

```
$ git clone https://github.com/TannaciousXP/scrapper.git
$ cd scrapper
$ yarn install
```

## Create .env file

There is a file .envExample, you will need to make a .env file with your own tokens in order for Twit module to work.

## Uncomment function in server/index.js

Line 208 - 214 are the functions to be invoked:

- Uncomment line 209 to see the piping immediately.
- Uncomment line 213 - 214 for the setTimeOut functions to invoke at 7 AM and 6 PM.