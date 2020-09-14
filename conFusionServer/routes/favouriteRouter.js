const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const Favourites = require('../models/favorite');
const cors = require('./cors');
const { populate } = require('../models/favorite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            if(!favourites){
                err = new Error('You have no Favourites!');
                err.status = 404;
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type','json/application');
            res.json(favourites);
        })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
        .then((favourites) => {
            if(favourites){
                for(var i=0;i<req.body.length;i++){
                    if(favourites.dishes.indexOf(req.body[i]._id) === -1){
                        favourites.dishes.push(req.body[i]._id);
                    }
                }
                favourites.save()
                .then((updatedFavourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(updatedFavourite);
                }, (err) => next(err));
            }
            else{
                Favourites.create({"user": req.user._id, "dishes": req.body})
                .then((updatedFavourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(updatedFavourite);
                }, (err) => next(err));
            }   
        }, (err) => next(err))
        .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403
    res.end("PUT Operation not supported on /favorites")
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOneAndDelete({user: req.user._id})
        .then((favourites) => {
            if(!favourites){
                err = new Error('You have no favourites!');
                err.status = 404;
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favourites);
        })
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end("GET Operation not supported on /favorites");
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
        .then((favourites) => {
            if(favourites){
                if(favourites.dishes.indexOf(req.params.dishId) === -1){
                    favourites.dishes.push(req.params.dishId);
                }
                favourites.save()
                .then((updatedFavourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(updatedFavourite);
                }, (err) => next(err));
            }
            else{
                Favourites.create({"user": req.user._id, "dishes": req.params.dishId})
                .then((updatedFavourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(updatedFavourite);
                }, (err) => next(err));
            }   
        }, (err) => next(err))
        .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end("PUT Operation not supported on /favorites");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
        .then((favourites) => {
            if(!favourites){
                err = new Error('You have no favourites!');
                res.status = 404;
                return next(err);
            }
            const index = favourites.dishes.indexOf(req.params.dishId);
            favourites.dishes.splice(index, 1);
            favourites.save()
                .then((updatedFavourite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(updatedFavourite);
                }, (err) => next(err))
                .catch(err => next(err))
        })
});

module.exports = favouriteRouter;