const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referência ao ID do usuário
    title: { type: String, required: true }, 
    description: { type: String, required: false }, // A descrição da tarefa
    date: { type: String, required: true },
    token: { type: String, required: false }, // serve pra referenciar o id ao inves dele mesmo (+ segurança)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('task', taskSchema);
