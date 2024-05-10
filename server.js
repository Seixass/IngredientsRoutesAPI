// import http from 'node:http';
// import fs from 'node:fs';
// import { URLSearchParams } from 'node:url';

// const PORT = 3333

// const server = http.createServer((request, response) => {
//     const { method, url } = request;

//     response.setHeader('Access-Control-Allow-Origin', "*");
//     response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     response.setHeader('Access-Control-Allow-Headers', 'Content-Type');



//     fs.readFile("receitas.json", 'utf8', (err, data) => {
//         if (err) {
//             response.writeHead(500, { 'Content-Type': 'application/json' })
//             response.end(JSON.stringify({ message: 'Erro ao buscar os dados' }))
//             return;
//         }
//         let jsonData = [];
//         try {
//             jsonData = JSON.parse(data)
//         } catch (error) {
//             console.error('Erro ao ler o arquivo jsonData' + error)
//         }

//         if (url === '/receitas' && method === "GET") { // listar todos os ingredientes

//             fs.readFile('receitas.json', 'utf8', (err, data) => {
//                 if (err) {
//                     response.writeHead(500, { 'Content-Type': 'application/json' })
//                     response.end(JSON.stringify({ message: 'Erro ao buscar os dados' }))
//                     return;
//                 }
//                 const jsonData = JSON.parse(data)
//                 response.writeHead(200, { 'Content-Type': 'application/json' })
//                 response.end(JSON.stringify(jsonData))
//             })
//         };
//     });
// })
// server.listen(PORT, () => {
//     console.log(`Servidor on PORT: ${PORT}`)
// }) minha atividade

import { createServer } from 'node:http';
import fs, { read } from 'node:fs';
import { URLSearchParams } from 'node:url';
import { callbackify } from 'node:util';


import lerDadosReceitas from './funcoes/lerReceitas.js';
const PORT = 3333;

const server = createServer((request,response)=>{
 const {method, url} = request

 if(method === 'GET' && url === '/receitas'){
    lerDadosReceitas((err, receitas) =>{
        if(err){
            response.writeHead(500, {'Content-Type':'application.json'})
            response.end(JSON.stringify, {message: 'Erro ao ler os dados'})
            return;  
        }
            response.writeHead(200, {'Content-Type':'application.json'})
            response.end(JSON.stringify, (receitas))
    });
    fs.readFile('receitas.json', 'utf8', (err, data) => {
        if(err){
        response.writeHead(500, {'Content-Type':'application.json'})
        response.end(JSON.stringify, {message: 'Erro ao ler os dados'})
        return;
    }
    response.writeHead(200, {'Content-Type':'application.json'})
    response.end(data)
    })
}else if(method === 'POST' && url === '/receitas'){
   
    let body = ''
    request.on("data", (chunk) => {
        body += chunk;      
    })
    request.on("end", () => {
        if(!body){
            response.writeHead(400,{'Content-Type':"application/json"})
            response.end(JSON.stringify({message:'Corpo da soliticação vazio'}))
            return
        }

        const novaReceita = JSON.parse(body)

        console.log('AQUI')
        lerDadosReceitas((err, receitas) => {
            if(err){
                response.writeHead(500,{'Content-Type':"application/json"})
                response.end(JSON.stringify({message:'Erro ao cadastrar a receita'}))
                return
            }
            novaReceita.id = receitas.length + 1
            receitas.push(novaReceita)
            console.log(receitas)

            fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err) =>  {
                if(err){
                    response.writeHead(500,{'Content-Type':"application/json"})
                    response.end(JSON.stringify({message:'Erro ao cadastrar a receita no arquivo'}))
                    return
                }
            })
            
            response.writeHead(201,{'Content-Type':"application/json"})
            response.end(JSON.stringify(novaReceita))
            
        })
    })
}else if(method === 'PUT' && url.startsWith ('/receitas/')){    
    const id = parseInst(url.split('/') [2])
    let body = ''
    request.on('data', (chunk)=>{
        body += chunk
    })
    request.on('end', () =>{
        if(!body){
            response.writeHead(400, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'Corpo da solicitação vazio'}))
            return
        }
        lerDadosReceitas((err, receitas)=>{
            if(err){
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Erro ao ler dados da receita'}))
                return
            }

            const indexReceita = receitas.findIndex((receita)=> receita.id === id)

            if(indexReceita === -1){
                response.writeHead(404, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'receita não encontrada'}))
            }

            const receitaAtualizada = JSON.parse(body)
            receitaAtualizada.id = id
            receitas[indexReceita] = receitaAtualizada

            fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err)=>{
                if(err){
                    response.writeHead(500, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({message:'Não é possivel atualizar a receita'}))
                    return
                }
                response.writeHead(201, {'Content-Type':'application/json'})
                response.end(JSON.stringify(receitaAtualizada))
            })
        })
    })
}else if(method === 'DELETE' && url.startsWith ('/receitas/')){
    response.end(method)
}else if(method === 'GET' && url.startsWith ('/receitas/')){
    response.end(method)
}else if(method === 'GET' && url.startsWith ('/categorias')){
    //localhost:3333/categorias
    response.end(method)
}else if(method === 'GET' && url.startsWith ('/busca')){
    //localhost:3333/busca?termo=Pratos%20Principais
    response.end(method)
}else if(method === 'GET' && url.startsWith ('/ingredientes')){
    //localhost:3333/ingredientes
    response.end(method)
}else{
    response.writeHead(404, {'Content-Type':'application/json'})
    response.end(JSON.stringify({message:'Rota não encontrada'}))
}


})

server.listen(PORT, ()=>{
    console.log(`Servidor on PORT: ${PORT}`)
})