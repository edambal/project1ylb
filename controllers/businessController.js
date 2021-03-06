const express = require('express');
const router = express.Router();
const db = require('../models');

//index route
router.get('/', (req, res) => {
    db.Business.find({}, (err, allBusinesses) => {
    if (err) return console.log(err);
    res.render('businesses/index', {
        businesses: allBusinesses
        });
    });
});

//create route - GET
router.get('/new', (req,res) => {
    // Redirect user to login page if not logged in
  if (!req.session.currentUser) {
    return res.redirect('/auth/login');
  }
    res.render('businesses/new');
});

//show route - individual Business
router.get('/:businessId', (req, res) => {
    db.Business.findById(req.params.businessId)
    .populate('products')
    .exec((err,foundBusiness)=>{
        //console.log(foundBusiness);
        if(err) return console.log(err);
        res.render('businesses/show',{
            business : foundBusiness
        })
    })
});

// create route - POST
router.post('/',(req,res)=>{
     // Set fields for address
   req.body.address = {
    streetNumber : req.body.streetNumber,
    streetName: req.body.streetName,
    city: req.body.city,
    state: req.body.states,
  }
  // delete the exitsing fields since address is build as new key value pair
    delete req.body.streetNumber;
    delete req.body.streetName;
    delete req.body.city;
    delete req.body.states;
    console.log(req.body);

      // Redirect user to login page if not logged in
  if (!req.session.currentUser) {
    return res.redirect('/auth/login');
  }

  // Add currentUser to the request.body for the user/author association
  req.body.user = req.session.currentUser
  
    db.Business.create(req.body,(err,createdBusiness)=>{
        db.Business.find({},(err,allBusinesses)=>{
            res.render('businesses',{
                businesses: allBusinesses
            });
        });
    });
});

// edit route - GET
router.get('/:businessId/edit',(req,res)=>{
    console.log("we hit the edit route");
    db.Business.findById(req.params.businessId,(err,foundBusiness)=>{
        console.log(foundBusiness);
        if(err) return console.log(err);
        res.render('businesses/edit', {
            business: foundBusiness
        });
    });
});

// edit route - PUT
router.put('/:businessId',(req,res)=>{
    db.Business.findByIdAndUpdate(req.params.businessId,req.body,{new:true},
        (err,updatedBusiness)=>{
            if(err) return console.log(err)
            res.redirect(`/businesses/${updatedBusiness._id}`);     
        });
});

//delete route
router.delete('/:businessId', (req, res) => {
    db.Business.findByIdAndDelete(req.params.businessId, 
        (err, deletedBusiness) => {
        if (err) return console.log(err);
    db.Product.deleteMany({_id: { $in: deletedBusiness.products}}, 
        (err) => {
            if (err) return console.log(err);
            res.redirect('/businesses');
        });
    });
});


module.exports = router;