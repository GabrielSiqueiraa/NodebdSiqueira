const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const { Pool } = require('pg');
const database = require('./bd'); 

const pool = new Pool({
    connectionString: database.connectionString,
});

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/',(req,res) => {
    res.json({ info: 'API do meu curriculo com Node.js, Express e ElephantSQL (POSTGRES)'})
});

// GET
app.get('/Curriculos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Curriculos');
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).send('Erro interno do servidor');
    }
});

// GET BY ID
app.get('/Curriculos/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('SELECT * FROM Curriculos WHERE id = $1', [curriculoId]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Currículo não encontrado' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// POST 
    app.post('/criar-Curriculos', async (req, res) => {
        const { Nome, Endereco, Telefone, Email, DataNascimento, ExperienciaProfissional, Educacao } = req.body;
    

        if (Nome == null || Email == null) {
            return res.status(400).json({ message: 'Nome e email são campos obrigatórios' });
        }
        try {
        const result = await pool.query(
            'INSERT INTO Curriculos ( Nome, Endereco, Telefone, Email, DataNascimento, ExperienciaProfissional, Educacao ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [ Nome, Endereco, Telefone, Email, DataNascimento, ExperienciaProfissional, Educacao ]
        );
    
        res.status(201).json(result.rows[0]);
        } catch (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

// UPDATE
app.put('/editar-Curriculos/:id', async (req, res) => {
  const curriculoId = req.params.id;
  const {Nome, Endereco, Telefone, Email, DataNascimento, ExperienciaProfissional, Educacao } = req.body;

  if (!Nome || !Email) {
    return res.status(400).json({ message: 'Nome Completo e email são campos obrigatórios' });
  }

  try {
    const result = await pool.query(
      'UPDATE Curriculos SET Nome = $1, Endereco = $2, Telefone = $3, Email = $4, DataNascimento = $5, ExperienciaProfissional = $6, Educacao = $7 WHERE id = $8 RETURNING *',
      [Nome, Endereco, Telefone, Email, DataNascimento, ExperienciaProfissional, Educacao, curriculoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Currículo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar no banco de dados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE
app.delete('/deletar-Curriculos/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('DELETE FROM Curriculos WHERE id = $1 RETURNING *', [curriculoId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Currículo não encontrado' });
      }
  
      res.json({ message: 'Currículo removido com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir do banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});