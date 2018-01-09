// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const dotenv = require('dotenv').config();

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


console.log(`.env: TEST:${process.env.TEST}`)


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));