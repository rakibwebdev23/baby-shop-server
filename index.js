const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Baby shop server");
});

app.listen(port, () => {
    console.log(`Baby shop server running at: ${port}`);
})