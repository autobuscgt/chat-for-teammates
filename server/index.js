require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 7000;
const sequelize = require('./config/config');
const http = require('http');
const path = require('path');
const models = require('./models/index');
const router = require('./routes/index');
const socketSetup = require('./socket/socket.config');

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors({ origin: '*' }));
app.use('/api', router);

const server = http.createServer(app);

async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => { 
            console.log(`Server is running on port http://localhost:${PORT}`); 
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

start();
socketSetup(server)