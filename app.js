const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// ======  Database     ====================
// making the connection
mongoose.connect("mongodb://localhost:27017/ContactDB");

// Defining the schema
const ContactDBSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phone: String,
    email: {
        type: String,
        required: [true, "Email is required"]
    }
});

// defining the model
const Contact = mongoose.model("Contact", ContactDBSchema);

// =======   For Home Route       =========================
const toEditObj = {
    name: "",
    phone: "",
    email: ""
};

app.get("/", function(req, res) {
    res.render("main", {toEditObjHTML: toEditObj});
});    

// // For Edit 
let toEdit = false; 

app.post("/", function(req, res) {
  
    toEdit = req.body.isEdit;    
    console.log(toEdit);

    if (toEdit === "true") {
        console.log("V can delete");
        const editId = req.body.editID;   
        console.log("editID:" + editId );

        Contact.findOneAndRemove({_id: editId}, function(err, foundItem) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item for update and deleted is: " + foundItem);
                toEditObj.name = foundItem.name;
                toEditObj.phone = foundItem.phone; 
                toEditObj.email = foundItem.email;

                // editArrHTML.push(foundItem.name, foundItem.phone, foundItem.email);
                console.log("new updated item is, editArrHTML\n" + toEditObj);   
                res.redirect("/");
            }
        });

        // toEdit = false;
    } else {
        // getting the input
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;

        // console.log(name + " " + phone + " " + email);

        Contact.findOne({email: email}, function(err, foundItem) {
            // console.log("foundItem " + foundItem);
            if (foundItem !== null) {
                console.log("Email address already present, please add different email address");
            } else {
                const newUser = new Contact({
                    name: name,
                    phone: phone,
                    email: email
                });
            
                newUser.save(function(err) {
                    if (err) {
                        console.log("In adding a new doc there is an error and the error is: \n" + err); 
                    } else {
                        console.log(newUser + " is added successfully as new item");
                        res.redirect("/all");
                    }
                });

            }
        });
    }
});  

// =======   For ALL Contacts Route      =========================
// From here V can perform 2 option: 1 => Edit, 2 => Delete
// From main page V will come here
// For delete V will go to the main.ejs

let isFilterActive = false;

app.get("/all", function(req, res) {  

    // Applying the pagination
    const page = 1;
    const limit = 2;

    Contact.find({}, function(err, foundItems) {     
        res.render("allContacts", {foundItemsHTML: foundItems});
        
        // console.log(foundItems);
    }); 
    // }).skip((page-1)*limit).limit(limit); 

});
   
// app.post("/all", function(req, res) {
app.post("/all", async function(req, res) {
    
    // db.contacts.createIndex( {name: "text"}, {email: "text"})
    
    // Applying the pagination
    const page = 1;
    const limit = 1;

    isFilterActive = req.body.filterActive;
    console.log("isFilterActive " + isFilterActive); 
 
    if (isFilterActive) {    
        const search = req.body.search;    
        console.log("search entered: " + search);

        Contact.find({$or: [ {name: search}, {email: search} ]}, function(err, foundItem) {
            if (err) {
                console.log("Error in finding an item with OR condition: \n" + err);
            } else {
                console.log("Item found with OR condition: " + foundItem);
                res.render("allContacts", {foundItemsHTML: foundItem});
            }
        }).skip((page-1)*limit).limit(limit);
    } else {
        const contactDeleteID = req.body.contactDeleteID;
        console.log("Id of the item to be deleted is:" + contactDeleteID + ",");

        Contact.findOneAndRemove({_id: contactDeleteID}, function(err, foundItem) {
            if (err) {
                console.log("There is an error for deleting an item \n" + err)
            } else {
                console.log(foundItem + " is deleted");
                res.redirect("/all");
            }
        });
    }

    

});

    

// const user1 = new Contact({
//      name: "Avdhesh",
//      phone: "98765",
//      email: "avd@gmail.com"
//  });

// user1.save();












app.listen(3000, function() {
  console.log("Server started on port 3000");
});






































