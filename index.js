const dotenv = require('dotenv');
const express = require('express');
const rootRouter = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors')
const PORT = process.env.PORT || 9000;

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
    limit: "5mb",
    extended: false
}));
app.use(bodyParser.json({limit: "5mb"}));
app.use(express.json());

app.use('/api/v1', rootRouter);

app.listen(PORT, () => {
    console.log(`listening on Port ${PORT}`);
})
