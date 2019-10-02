var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
            ID : Joi.string().min(2).max(36).required(),
            Incoterm : Joi.string().required(),
            Description: Joi.string().required(),
            Freight: Joi.string().required(),
            Insurance: Joi.string().required(),
            Status: Joi.string().required(),
            Client_ID: Joi.string().required(),
            Created_By: Joi.string().allow(null),
            IsDeleted: Joi.boolean(),
            IsActive: Joi.boolean(),
            Parent_ID: Joi.string().max(36).allow(null).allow(''),
    
})

router.get('/:Client_ID/incoterm/', function (req, res, next) {

    dbConnection.query('SELECT * FROM Incoterms WHERE Client_ID = ?', [req.params.Client_ID], function (error, results, fields) {
        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send();

        return res.send(results);
    })
})


router.get('/:Client_ID/incoterm/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM Incoterms where Client_ID = ? AND ID = ?', [req.params.Client_ID, req.params.id], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results[0]);

    });
});

router.put('/:Client_ID/incoterm/', function(req, res, next) {
    if(!req.body) return res.status(Http_STATUS.BAD_REQUEST).send();
    const uuidv4 = require('uuid/v4')
    const USER_ID = req.header('InitiatedBy')
    const Client_ID = req.header('Client_ID')
    const ID = uuidv4();
    const PARENT_ID = req.body.ID;
    req.body.Created_By = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        if(err) {
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        }

        var incoterm = {
            ID: req.body.ID,
            Incoterm: req.body.Incoterm,
            Description: req.body.Description,
            Freight: req.body.Freight,
            Insurance: req.body.Insurance,
            Status: req.body.Status,
            Client_ID: Client_ID,
            Created_By: USER_ID,
            IsDeleted: req.body.IsDeleted,
            IsActive: req.body.IsActive,
            Parent_ID: PARENT_ID,
        }

        dbConnection.beginTransaction(function(err) {
            if(err) return next(err);
          var ssql =  dbConnection.query("UPDATE Incoterms SET IsActive = 0 WHERE ID = ? AND Client_ID = ?", [PARENT_ID, req.params.Client_ID], function(errorUpdate, results, fields) {
                if (errorUpdate) {
                    dbConnection.rollback(function() {
                        console.error(errorUpdate);
                        return next (errorUpdate);
                    })
                };

                var query = dbConnection.query("INSERT INTO Incoterms SET ?", incoterm, function(errIncoterms, result) {
                    if(errIncoterms) {
                        dbConnection.rollback(function() {
                            console.error(errIncoterms);
                            return next(errIncoterms);
                        })
                    }

                    console.log(query.sql);
                    console.error(result)

                    dbConnection.commit(function(commitError) {
                        if(commitError) {
                            dbConnection.rollback(function() {
                                console.error(commitError);
                                return next (commitError);
                            });
                        }

                      //  return res.status(HTTP_STATUS.SUCCESS).send({error : false, data : ID, message : ID})
                    })
                })
                console.log(query.sql);

            })

            console.log(ssql.sql)
        })
    })
})


/*
//put
router.put('/:Client_ID/incoterm/', function (req, res, next) {
    const schema = Joi.object().keys({
        Client_ID: Joi.string().min(3).max(37).required(),
        ID: Joi.string().min(3).max(37).required(),
        Incoterm: Joi.string().required(),
        Description:  Joi.string().required(),
        Freight:  Joi.string().required(),
        Insurance:  Joi.string().required(),
        Status:  Joi.string().required(),
        Created_By:  Joi.string().allow(null)
    })

    let userID = req.header('InitiatedBy')
        let ClientID = req.header('Client_ID')

        var intercom = {
            ID: req.body.ID,
            Incoterm: req.body.Incorterm,
            Description: req.body.Description,
            Freight: req.body.Freight,
            Insurance: req.body.Insurance,
            Status: req.body.Status,
            Client_ID: ClientID,
            Created_By: userID
        }

    Joi.validate(intercom, schema, (err, results) => {
        if (err) {
            return res.status(400).send;
        }

        
        dbConnection.querry("UPDATE Incoterms SET ?", intercom, function (error, results, fields) {

            if (error) return next(error);
            if (!results || results.affetedRows == 0) res.status(404).send();
            return res.status(200).status(results);

        })
    })
})

*/

router.post('/:Client_ID/incoterm/', function (req, res) {
console.error('-----> 1');
    const schema = Joi.object().keys({
        Client_ID: Joi.string().min(3).max(37).required(),
        ID: Joi.string().min(3).max(37).allow(null),
        Incoterm: Joi.string().required(),
        Description:  Joi.string().required(),
        Freight:  Joi.string().required(),
        Insurance:  Joi.string().required(),
        Status:  Joi.string().required(),
        Created_By:  Joi.string().allow(null)
    })

    const uuidv4 = require('uuid/v4')
    let userID = req.header('InitiatedBy')
    let ClientID = req.header('Client_ID')
    let incoterm_ID = uuidv4();

    var intercom = {
        ID: incoterm_ID,
        Incoterm: req.body.Incoterm,
        Description: req.body.Description,
        Freight: req.body.Freight,
        Insurance: req.body.Insurance,
        Status: req.body.Status,
        Client_ID: ClientID,
        Created_By: userID
    }
    console.error('-----> 2');
    Joi.validate(intercom, schema, (err, result) => {
        console.error('-----> 3');
        if (err) {
            console.error(err);
            return res.status(400).send();
        }

        dbConnection.query("INSERT INTO Incoterms SET ?",intercom, function (error, results, fields) {
            console.error('-----> 4');
            if (error) return next(error);
            if (!results || results.affetedRows == 0) res.status(404).send();

            console.error('-----> 5');
             return res.status(201).send({
                    error: false,
                    data: results,
                    message: 'New Incoterms types has been created successfully.'
                });
        })
    })
})

router.delete('/incoterm/:id', function (req, res, next) {

    dbConnection.query("UPDATE Incoterms SET Status = 0  WHERE ID = ?", req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);
    });
});

module.exports = router;