const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { DB_PROJECT, DB_PASS, DB_CONFIG } = process.env

const uri = `mongodb+srv://${DB_PROJECT}:${DB_PASS}@${DB_CONFIG}`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('DB Connected to Cluster!'))
.catch(err => { console.log('Error connecting to Cluster', err) }); 
  
module.exports = mongoose