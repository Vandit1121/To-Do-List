//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
// console.log(process.env);

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.mongodbServer, { useNewUrlParser: true },function(err){
    if(err)
    console.log(err);
    else
    console.log("Successfully connected to Server.");
});

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
    name: "Welcome to our To Do List"
});

const item2 = new Item({
    name: "Hit + button to add new item"
});

const item3 = new Item({
    name: "Enjoy"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items:[itemSchema]
});

const List = mongoose.model("List",listSchema);

// let day = date.getDate();

app.get("/", function (req, res) {
    Item.find(function (err, results) {
        if (results.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully saved deafult items to database");
                }
            });
            res.redirect("/");
        }
        else {
            if (err)
                console.log(err);
            else {
                res.render("list", { listTitle: "Today", newItems: results });
            }
        }
    });
});


app.get("/:customeListName",function(req,res){
    const customeListName =_.capitalize(req.params.customeListName);
    List.findOne({name:customeListName},function(err,foundList){
        if(!err)
        {
            if(!foundList)
            {
                const list = new List({
                    name:customeListName,
                    // items: defaultItems
                });
                list.save();
                res.redirect("/"+customeListName);

            }
            else
            {
                res.render("list", { listTitle: foundList.name, newItems: foundList.items});
            }
        }
    })
});


app.post("/", function (req, res) {
    
    const item = new Item({
        name: req.body.item,
    });
    const listName=_.capitalize(req.body.button);
    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkitemId = _.capitalize(req.body.checkbox);
    const listName = req.body.listName;
    if(listName==="Today")
    {
        Item.findByIdAndDelete(checkitemId, function (err) {
            if (err)
                console.log(err);
            else {
                console.log("Successfully Deleted");
                res.redirect("/");
            }
        });
    }
    else
    {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkitemId}}},function(err,result){
            if(!err)
            {
                console.log("Successfully deleted");
                res.redirect("/"+listName);
            }
        });
    }

});









app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on port "+process.env.PORT+".");
});
