const express = require('express');
const app = express();
const userRouter = require('./routes/usersRoutes');
const cors = require("cors");

app.use(express.json());
app.use('/auth',userRouter);
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));


app.listen(3000, () => {
    console.log('app listening on http://localhost:3000')
})