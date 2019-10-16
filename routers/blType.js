var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
            ID: Joi.string().min(2).max(36).required(),
            BlTypes : Joi.string().required(),
            Strategy : Joi.string().required(),
            Description : Joi.string().required(),
            Status : Joi.boolean(),
})

    router.get('/blType/', function (req, res, next) {
    console.log("blgetall");
    dbConnection.query('SELECT * FROM BRIDGE.BlType ', function(error, results, fields) {
        if (error) return next (error);
        if(!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
        return res.send(results);
    })
})
  
   router.get('/blType/:ID', function (req, res, next) { 
    dbConnection.query('SELECT * FROM BRIDGE.BlType WHERE ID = ?', [req.params.ID], function(error, results, fields) {
        console.log("blgetID");
        if(error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STAUS.NOT_FOUND).send()
        return res.send(results);
        
    })

})

router.post('/blType/', function(req, res, next) {
   
    let blTypeS = req.body;

    if(!blTypeS) {
        res.status(400).send({
            error : true,
            message : 'Please provide Bl Types'
        });

        res.end();
        return
    }

    const uuidv4 = require('uuid/v4')
    let ID = uuidv4();

    Joi.validate(req.body, schema, (err, results) => {
        if(err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        }

        var blType = {
            ID : ID,
            BlTypes : req.body.BlTypes,
            Strategy : req.body.Strategy,
            Description : req.body.Description,
            Status : req.body.Status,
            

        }

        Joi.validate(blType, schema, (err, result) => {
            if(err){
                return res.status(400).send();
            }
        })

            var post = dbConnection.query("INSERT INTO BRIDGE.BlType SET ? ", blType, function(errBltypes, result) {
      
               if (!results || results.affetedRows == 0) res.status(404).send();

                console.log(post.sql);
                console.error(result) 

                return res.status(201).send({
                    error: false,
                    data: results,
                    message: 'New Bl Types types has been created successfully.'
                });
            
            })
    })
})



//router.put('/blType/:ID', function(req, res, next) {
    router.put('/blType/', function(req, res, next) {

    
    console.error( req.body)
    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();
   const uuidv4 = require('uuid/v4')
    const ID =  uuidv4;

    Joi.validate(req.body, schema, (err, results) => {
        console.error('mApi4');
        if(err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        } 

        var blType = {
            ID : uuidv4,
            BlTypes : req.body.BlTypes,
            Strategy : req.body.Strategy,
            Description : req.body.Description,
            Status : req.body.Status,
            
            
        }
        

        

        console.error('mApi6');

        dbConnection.beginTransaction(function (err) {
            console.error('mApi7');

             if (err) return next(err);
                var queryInsertPut = dbConnection.query("UPDATE  BRIDGE.BlType SET ? WHERE ID = ? ", [blType, req.body.ID], function(errBltypes, result) {
                
                    if (errBltypes) {
                        dbConnection.rollback(function() {
                            console.error(errBltypes);
                            return next(errBltypes);
                        })
                    }
                    console.log(queryInsertPut.sql);
                     console.error(result) 

                dbConnection.commit(function(commitError) {
                    if(commitError) {
                        dbConnection.rollback(function() {
                            console.error(commitError);
                            return next(commitError);
                        });
                    }
                })
                
                })
                console.log(queryInsertPut.sql);

                return res.send(blType);

            
        })
    })
})

router.delete('/:Client_ID/blType/:ID', function(req, res) {
    var deletequry = dbConnection.query("UPDATE BlTypes SET IsDeleted = 1, IsActive =  0 WHERE ID = ? AND Client_ID = ? ", [req.params.ID, req.params.Client_ID], function (error, results, fields) {
        if (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
        } else {

            if (!results || results.length == 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send();
            } else {
                return res.status(HTTP_STATUS.SUCCESS).send();
            }
        } 
    })

    console.log(deletequry.sql);
})
/*
router.delete('/:Client_ID/blType/:ID', function(req, res) {
    console.error('1');
    dbConnection.query("UPDATE BlTypes SET WHERE ID = ? AND Client_ID = ?", [req.params.Client_ID], function (errorUpdate, results, fields) {
      if (error) {
        console.error('2');
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
      }
      
      else {
        console.error('3');
          if(!results||results.length == 0) {
              return res.status(HTP_STATUS.NOT_FOUND).send();
              
          }
          else
          {
            console.error('4');
              return res.status(HTTP_STATUS.SUCCESS).send();
          }
          
      }
      
      
    })
})

*/

module.exports = router;