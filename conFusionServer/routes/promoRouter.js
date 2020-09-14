// This is a sub Express Application
const express = require('express');
const bodyParser = require('body-parser');

var authenticate = require('../authenticate');
const Promotions = require('../models/promotions');
const cors = require('./cors');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Promotions.find({})
        .then(promotons => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotons);
        }, err => next(err))
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
        .then(prpmotion => {
            console.log('Dish Created ',prpmotion);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(prpmotion);
        }, err => next(err))
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove()
        .then(prpmotions => {
            console.log(prpmotions);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(prpmotions);
        }, err => next(err))
        .catch(err => next(err));
});

promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promoId)
        .then(promotion => {
            console.log(promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        }, err => next(err))
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation is not supported on /promotions/'+req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {$set: req.body}, {new: true})
        .then(promotion => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        }, err => next(err))
        .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
        .then(resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        }, err => next(err))
        .catch(err => next(err));
});

module.exports = promoRouter;