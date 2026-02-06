const app = require('./src/app');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const port = process.env.PORT || 5000;

const http = require('http');
const startSocket = require('./src/socket');

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = startSocket.initSocket(server);

server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
