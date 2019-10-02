var express = require('express');
const router =express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

//get

    const schema = Joi.object().keys({
        ID: Joi.string().min(3).max(37).required(),
        PaymentTerm : Joi.string().required(),
        Due : Joi.string().required(),
        DueBasedOn : Joi.string().required(),
        Status : Joi.string().required(),
        PaymentsTermType : Joi.string().required(),
        Client : Joi.string().required(),
        Supplier : Joi.string().required(),
        Client_ID: Joi.string().required(),
        Created_By:  Joi.string().allow(null),
        IsDeleted: Joi.boolean(),
        IsActive: Joi.boolean(),
        Parent_ID: Joi.string().max(36).allow(null).allow(''),
    })

    router.get('/:Client_ID/paymentsTerm/', function (req, res, next) {
        dbConnection.query('SELECT * FROM PaymentsTerm WHERE Client_ID = ?', req.params.Client_ID, function (error, results ,fields){
            if(error) return next(error);
            if(!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
            return res.send(results)
        })
        
    })

    router.get('/:Client_ID/paymentsTerm/:ID', function (req, res, next) {
        dbConnection.query('SELECT * FROM PaymentsTerm WHERE ID = ? AND Client_ID = ?', [req.params.ID, req.params.Client_ID], function(error, results, fields) {
            if(error) return next(error);
            if (!results || results.length == 0) return res.status(HTTP_STAUS.NOT_FOUND).send()
            var results = results[0];
            
            var paymentsTerm = {
                ID : results.ID,
                PaymentTerm : Joi.string().required(),
                Due : Joi.string().required(),
                DueBasedOn : Joi.string().required(),
                Status : Joi.string().required(),
                PaymentsTermType : Joi.string().required(),
                Client : Joi.string().required(),
                Supplier : Joi.string().required(),
                Client_ID: Joi.string().required(),
                Created_By:  Joi.string().allow(null),
                IsActive: Joi.boolean(),
                IsDeleted: Joi.boolean(),
                Parent_ID: Joi.string().max(36).allow(null).allow(''),
                    
            };
    
           return res.send(paymentsTerm)
        })

    })



//get

//put

router.put('/:Client_ID/paymentsTerm/', function(req, res, next) {
    console.error( req.body)

    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();
        const uuidv4 = require('uuid/v4')
        const USER_ID = req.header('InitiatedBy')
        const Client_ID = req.header('Client_ID')
        const ID = uuidv4();
        const PARENT_ID = req.body.ID;
        req.body.Created_By = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        console.error('4');
        if(err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        } 

       var paymentsTerm = {
                ID : ID,
                PaymentTerm : req.body.PaymentTerm,
                Due : req.body.Due,
                DueBasedOn : req.body.DueBasedOn,
                Status : req.body.Status,
                PaymentsTermType : req.body.PaymentsTermType,
                Client : req.body.Client,
                Supplier : req.body.Supplier,
                Client_ID : Client_ID,
                Created_By : USER_ID,
                IsActive: req.body.IsActive,
                IsDeleted: req.body.IsDeleted,
                Parent_ID: PARENT_ID,
       }

           
        dbConnection.beginTransaction(function (err) {
            if (err) return next(err);
            dbConnection.query("UPDATE PaymentsTerm SET IsActive = 0 WHERE ID = ? AND Client_ID = ?" , [PARENT_ID, req.params.Client_ID], function (errorUpdate , results, fields) {
                if(errorUpdate) {
                    dbConnection.rollback(function () {
                    console.error(errorUpdate);
                    return next(errorUpdate);
                    });
                };

                var query = dbConnection.query("INSERT INTO BRIDGE.PaymentsTerm SET ? ", paymentsTerm, function(errPaymentTERM, result) {
                    if (errPaymentTERM) {
                        dbConnection.rollback(function() {
                            return next(errPaymentTERM);
                        })
                    }
                    console.log(query.sql);
                     console.error(results) 

                dbConnection.commit(function(commitError) {
                    if(commitError) {
                        dbConnection.rollback(function() {
                            console.error(commitError);
                            return next(commitError);
                        });
                    }


           // return res.status(HTTP_STATUS.SUCCESS).send({error : false, data: ID, message : ID})

                })
                
             })

            })
        })
    })
})

    router.post('/:Client_ID/paymentsTerm/', function(req, res ) {

        const schema = Joi.object().keys( {
                ID : Joi.string().min(3).max(37).required(),
                PaymentTerm : Joi.string().required(),
                Due : Joi.string().required(),
                DueBasedOn : Joi.string().required(),
                Status : Joi.string().required(),
                PaymentsTermType : Joi.string().required(),
                Client : Joi.string().required(),
                Supplier : Joi.string().required(),
                Client_ID : Joi.string().min(3).max(37).required(),
                Created_By:  Joi.string().allow(null),
                IsDeleted: Joi.boolean(),
                IsActive: Joi.boolean(),
                Parent_ID: Joi.string().max(36).allow(null).allow(''),
           
                
        })
    

        const uuidv4 = require('uuid/v4')
        let userID = req.header('InitiatedBy')
        let ClientID = req.header('Client_ID')
        let ID = uuidv4();

        var paymentsTerm = {
                ID : ID,
                PaymentTerm : req.body.PaymentTerm,
                Due : req.body.Due,
                DueBasedOn : req.body.DueBasedOn,
                Status : req.body.Status,
                PaymentsTermType : req.body.PaymentsTermType,
                Client : req.body.Client,
                Supplier :  req.body.Supplier,
                Client_ID : ClientID,
                Created_By:  userID,
                IsActive: req.body.IsActive,
                IsDeleted: req.body.IsDeleted,
                Parent_ID: null,
    
    
        }

        Joi.validate(paymentsTerm, schema, (err, result) => {
            if(err) {
                console.error(err);
                return res.status(400).send();
            }
            dbConnection.query("INSERT INTO PaymentsTerm set ?", paymentsTerm, function(error, results, fields) {
                console.error(err);
                if (error) return next(error);
                if (!results || results.affectedrows == 0) res.status(404).send();
    
                

                return res.status(201).send( {
                    error : false,
                    data : results,
                    message :'new Payment Term has been created successfully.'
                })

                
            })
        })
    
    })
/*
    router.delete('/:Client_ID/paymentsTerm/:ID', function(req, res, next) {
        dbConnection.query('DELETE FROM PaymentsTerm WHERE Client_ID = ? AND ID = ?', [req.params.Client_ID, req.params.ID], function (error, results, fields) {
            if (error) return next(error);
    
            if (!results || results.affectedRows == 0) return res.status(404).send();
    
            return res.send(results);
        });
    });

    */
    
    
    module.exports = router;
