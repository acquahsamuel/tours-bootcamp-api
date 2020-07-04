const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path :`./config.env`});
console.log(app.get('env')); 
console.log(process.env);

const port = 8000 || process.env.PORT;
app.listen(`${port}`, () => {
    console.log(`Listening on port ${port}`)
});
