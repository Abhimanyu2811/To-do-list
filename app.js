const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yash:Yash0412@cluster0.5z1lv5c.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = new mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    Item.find({}).then((foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems);
            res.redirect("/")
        } else {
            res.render("index", { listTitle: "Today", newListItem: foundItems });
        }

    })
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then((foundList) => {
            if(foundList){
               //show an existing list
                res.render("index" ,{ listTitle: foundList.name, newListItem: foundList.items })  
            }
            else{
                 //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
        }
    )
    .catch(err => { console.log(err) })

    
});


app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName ==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name : listName})
        .then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

    
});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(() => {
            console.log('Successfully deleted checked item')
            res.redirect('/')
        })
        .catch(err => { console.log(err) })
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}})
        .then((foundList)=>{
            res.redirect("/" + listName);
        })
    }


    
});


app.post("/work", function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})


app.listen(3000, function (req, res) {
    console.log("Server is running on port 3000.");
})