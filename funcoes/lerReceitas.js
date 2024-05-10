import fs from 'node:fs'

const lerDadosReceitas = (callback) => {
    fs.readFile('receitas.json', 'utf8', (err, data) =>{
        if(err){
            callback(err)
        }
        try {
            const receitas = JSON.parse(data)
            callback(null, receitas)
        } catch (error){
            callback(error)
        }
    })
}

export default lerDadosReceitas;