import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(join(__dirname, "public")));

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});