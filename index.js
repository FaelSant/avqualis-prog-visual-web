const express = require('express');
const axios = require('axios');
const server = express()
const Sequelize = require('sequelize');
const handleBars = require('express-handlebars');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.engine('handlebars', handleBars({ defaultLayout: 'main' }))
server.set('view engine', 'handlebars');
const fetchData = async (url) => {
    const result = await axios.get(url)
    return result.data
}
//Model noticia


function createNoticiaDb(data) {
    const sequelize = new Sequelize('sistemafakenews', 'root', 'root', {
        host: "localhost",
        dialect: "mysql"
    })
    const noticia = sequelize.define('noticias_new', {
        conteudoNoticia: {
            type: Sequelize.TEXT   
        },
        tituloNoticia: {
            type: Sequelize.STRING
        },
        dataNoticia: {
            type: Sequelize.STRING
        }
    })
    sequelize.sync().then( async function () {
        await noticia.create({
            conteudoNoticia:data.conteudoNoticia,
            tituloNoticia:data.tituloNoticia,
            dataNoticia:data.dataNoticia
        })
    })
}
const pegaUrlFromFormulario = async (req, res) => {
    try {
        const url = req.body.inputURL
        console.log(url)
        let navegador = await puppeteer.launch();
        let page = await navegador.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })
        let data = await page.evaluate(() => {
            const conteudoNoticia = document.querySelector('article').innerText
            const tituloNoticia = document.querySelector('title').innerText
            const dataNoticia = document.querySelector('time').innerText
            return {
                conteudoNoticia,
                tituloNoticia,
                dataNoticia
            }
           
        })

       
        res.render('telaResultado',data)
       // res.json(data)
       await createNoticiaDb(data)
    } catch (e) {
        console.log(e)
    }

}
server.get('/', (req, res) => {
    res.render('formFakeNews')
})
server.post('/buscar', (req, res) => 
pegaUrlFromFormulario(req, res)
)

//server.get('/', main )
server.listen(3000);