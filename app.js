const express = require('express');
const app = express();
const userRouter = require('./routes/usersRoutes');
const mainRoutes = require('./routes/mainRoutes');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use(cookieParser());
app.use(express.json());
app.use('/auth',userRouter);
app.use('', mainRoutes)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(3000, () => {
    console.log('app listening on http://localhost:3000')
})

module.exports = app;