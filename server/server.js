const app = require('./src/app');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
