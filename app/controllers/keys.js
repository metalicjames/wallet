var express = require('express');
var router = express.Router({mergeParams: true});

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auth = require('../middleware/auth');
var authUser = require('../middleware/authUser');

var User = require('../models/user');
var KeyPair = require('../models/key');

router.get('/', auth, authUser, function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if(err) {
            return res.json({success: false,
                             message: err
                            });
        }
        
        return res.json({success: true,
                         keys: user.keys
                        });
    });
});

router.post('/', auth, authUser, function(req, res) {
    req.checkBody('label', 'Label is required').notEmpty();
    req.checkBody('publicKey', 'Public key is required').notEmpty();

    // TODO: validate public key
    
    req.checkBody('cipherText', 'Private key is required').notEmpty();
    req.checkBody('iv', 'Private key is required').notEmpty();
    req.checkBody('salt', 'Private key is required').notEmpty();
    
    req.getValidationResult().then(function(errors) {
        if(!errors.isEmpty()) {
            var errs = [];
            for(var i in errors.array()) {
                errs.push(errors.array()[i]["msg"]);
            }
            return res.json({success: false,
                             message: errs.join('/n')
                            });
        }
        
        User.findById(req.params.user_id, function(err, user) {
            if(err) {
                return res.json({success: false,
                                 message: err
                                });
            }
            
            for(var i in user.keys) {
                if(user.keys[i].label == req.body.label || 
                   user.keys[i].publicKey == req.body.publicKey) {
                    return res.json({success: false,
                                     message: 'Label or public key already assigned'
                                    });
                }
            }
            
            var keyPair = new Schema(KeyPair);
            keyPair.label = req.body.label;
            keyPair.cipherText = req.body.cipherText;
            keyPair.iv = req.body.iv;
            keyPair.salt = req.body.salt;
            keyPair.publicKey = req.body.publicKey;
            
            user.keys.push(keyPair);
            
            user.save(function(err) {
                if(err) {
                    return res.json({success: false,
                                     message: err
                                    });
                }
                
                res.json({success: true,
                          key: keyPair
                         });
            });
        });
    });
});

module.exports = router;