'use strict';


const PORT = 3000;
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
require('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL);

function Book(obj) {
    this.img = obj.imageLinks ? obj.imageLinks.thumbnail.replace('http', 'https') : 'https://i.imgur.com/J5LVHEL.jpg',
        this.title = obj.title,
        this.author = obj.authors,
        this.description = obj.description || 'N/A'
        this.isbn = obj.industryIdentifiers ? obj.industryIdentifiers[0].identifier: 'No isbn'
}


app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


app.get('/', (request, response) => {
    let sql = 'SELECT * FROM books';
    client.query(sql).then((result)=>{
        response.render('pages/index',{result:result.rows,count:result.rowCount});
    })
});
app.get('/search/new', (request, response) => response.render('pages/searches/new'));
app.post('/searches', createSearch);

app.get('/books/:id',(request,response)=>{
    let sql = `SELECT * FROM books WHERE id=$1`
    client.query(sql,[request.params.id]).then(result=>{
        response.render('pages/books/deatils',{data:result.rows[0]});
    }).catch(err=>console.log('Error While Retriving the book',err))
});

app.post('/addFav', (req, res) => {
    let sql = `INSERT INTO books (author,title,isbn,imge_url,description) VALUES ($1,$2,$3,$4,$5) RETURNING * `;
    let values = [req.body.author, req.body.title, req.body.isbn, req.body.imge_url, req.body.description];
    
    client.query(sql, values).then((result) => {
    }).catch(err=>console.log('error at addfav'));
    res.redirect('/');
})


function createSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    request.body.search[1] === 'title' ? url += `+intitle:${request.body.search[0]}` : url += `+inauthor:${request.body.search[0]}`;


    superagent.get(url).then(api => {
        return api.body.items.map(value => new Book(value.volumeInfo))
    }).then(results => response.render('pages/searches/show', { searchResults: results }));
}
client.connect().then(() => {
    console.log('connected');
    app.listen(process.env.PORT || PORT, () => console.log(`Server running on port ${PORT}`))
});
