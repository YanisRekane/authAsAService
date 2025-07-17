const express = require('express');
const app = express();
const userRouter = require('./routes/usersRoutes');

app.use(express.json());
app.use('/auth',userRouter);

app.listen(3000, () => {
    console.log('app listening on http://localhost:3000')
})