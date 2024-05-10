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

 if(method === 'GET' && url === '/receitas'){//listar as receitas url: localhost:3333/receitas
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
}else if(method === 'POST' && url === '/receitas'){//cadastar receitas url: localhost:3333/receitas
   
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
}else if(method === 'PUT' && url.startsWith ('/receitas/')){//atualizar receitas url: localhost:3333/receitas/n da receita    
    const id = parseInt(url.split('/') [2])
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
}else if(url.startsWith ('/receitas/') && method === 'DELETE'){ // deletar uma receita url: localhost:3333/receitas/n da receita
    const id = parseInt(url.split('/')[2])
    lerDadosReceitas((err, receitas) => {
        if(err){
            response.writeHead(500, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'Erro interno no servidor'}))
            return; // função => parar a execução
        }
        const indexReceita = receitas.findIndex((receita) => receitas.id === id)
        if(indexReceita === 1){
            response.writeHead(404, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'receita não encontrada'}))
            return;
        }
        receitas.splice(indexReceita, 1)
        fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err) => {
            if(err){
                response.writeHead(500, {'Content-Type':'application/json'})
                response.end(JSON.stringify({message: 'Erro ao salvar os dados'}))
                return
            }
            response.writeHead(201, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'receita deletada'}))
        })
    })
}else if(url.startsWith('/receitas/') && method === 'GET'){ // DETALHES DE UMA RECEITA PELO ID url: localhost:3333/receitas/n da receita
    const id = parseInt(url.split('/')[2])
    lerDadosReceitas((err, receitas) => {
        if(err){
            response.writeHead(500, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'Erro interno no servidor'}))
            return; // função => parar a execução
        }
        const indexReceita = receitas.findIndex((receita) => receita.id === id)
        if(indexReceita === -1){
            response.writeHead(404, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'receita não encontrada'}))
            return;
        }
        const receitaEncontrada = receitas[indexReceita]
        response.writeHead(200, {'Content-Type':'application/json'})
        response.end(JSON.stringify(receitaEncontrada))
    })
}else if (method === 'GET' && url.startsWith('/categorias')) { //listar todas as categorias url: localhost:3333/categorias
    lerDadosReceitas((err, receitas) => {
        if (err) {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Erro ao ler dados das receitas'}));
            return;
        }
        const categorias = receitas.map(receita => receita.categoria);
        const categoriasUnicas = [...new Set(categorias)];
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(categoriasUnicas));
    });
}else if (method === 'GET' && url.startsWith('/busca')) {//buscar por categoria url: localhost:3333/busca?termo={categoria}
    const params = new URLSearchParams(url.split('?')[1]);
    const termo = params.get('termo');
    lerDadosReceitas((err, receitas) => {
        if (err) {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Erro ao ler dados das receitas'}));
            return;
        }
        const receitasFiltradas = receitas.filter(receita => receita.categoria.toLowerCase() === termo.toLowerCase());
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(receitasFiltradas));
    });
}else if (method === 'GET' && url.startsWith('/ingredientes')) {//trazer todas as receitas que possue esse ingredientes url: localhost:3333/ingredientes/pesquisa={ingrediente}
    const params = new URLSearchParams(url.split('?')[1]);
    const ingrediente = params.get('pesquisa');
    console.log(ingrediente)
    lerDadosReceitas((err, receitas) => {
        if (err) {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Erro ao ler dados das receitas'}));
            return;
        }
        const receitasComIngrediente = receitas.filter(receita => receita.ingredientes.includes(ingrediente));
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(receitasComIngrediente));
    });
}else{
    response.writeHead(404, {'Content-Type':'application/json'})
    response.end(JSON.stringify({message:'Rota não encontrada'}))
}


})

server.listen(PORT, ()=>{
    console.log(`Servidor on PORT: ${PORT}`)
})