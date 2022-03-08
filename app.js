const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://Smithbhavsar:ETrEzayjqoWfPDh9@cluster0.bupqe.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = Item({
  name: "Welcome to do our TO Do list"
});

const item2 = Item({
  name: "Welcome to Ukraine"
});

const item3 = Item({
  name: "Welcome to Russia"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

const workItems = [];

app.get('/', function(req, res) {

  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Succesfully Added items to Database");
        }
        res.redirect('/');
      });
    } else {
      res.render('lists', {
        listTitle: "Today",
        addItem: founditems
      });
    }
  })
});

app.get('/:customListName', function(req, res) {

  const listName = _.capitalize(req.params.customListName);

  List.findOne({
    name: listName
  }, function(err, founditems) {
    if (!err) {
      if (!founditems) {
        const list = new List({
          name: listName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + listName)
      } else {
        res.render('lists', {
          listTitle: founditems.name,
          addItem: founditems.items
        });
      }
    }
  })

})

app.get('/work', function(req, res) {
  res.render('lists', {
    listTitle: "Work List",
    addItem: workItems
  });
});

app.post('/', function(req, res) {
  const newItem = req.body.newitem;
  const listItem = req.body.list;

  const item = new Item({
    name: newItem
  })

  if (listItem === "Today") {
    item.save()
    res.redirect('/')
  } else {
    List.findOne({
      name: listItem
    }, function(err, founditems) {
      founditems.items.push(item);
      founditems.save();
      res.redirect("/" + listItem);
    })
  }


});

app.post('/delete', function(req, res) {

  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem.trim(), function(err) {
      if (!err) {
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItem.trim()
          }
        }
      },
      function(err, founditems) {
        if (!err) {
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/about', function(req, res) {
  res.render('about');
});

app.listen('3000');
