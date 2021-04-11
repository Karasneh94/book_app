'use strict';


const PORT = 3000;
const express = require('express');
const superagent = require('superagent');
const app = express();
require('dotenv').config();

function Book(obj) {
    this.img = 'https://i.imgur.com/J5LVHEL.jpg' || obj.imageLinks.smallThumbnail,
        this.title = obj.title,
        this.author = obj.authors,
        this.description = obj.description || 'N/A'
}


app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


app.get('/', (request, response) => {
    response.render('pages/index');
});
app.get('/search/new', (request, response) => response.render('pages/searches/new'));
app.post('/searches', createSearch);


function createSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    request.body.search[1] === 'title' ? url += `+intitle:${request.body.search[0]}` : url += `+inauthor:${request.body.search[0]}`;


    superagent.get(url).then(api => {
        return api.body.items.map(value => new Book(value.volumeInfo))
    }).then(results => response.render('pages/searches/show', { searchResults: results }));
}

app.listen(process.env.PORT || PORT, () => console.log(`Server running on port ${PORT}`))