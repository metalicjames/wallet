var express = require('express');
var router = express.Router({mergeParams: true});

var rpc = require('json-rpc2');

var config = require('../../config/config');

var client = rpc.Client.$create(8383, 
                                'localhost', 
                                config.ckuser, 
                                config.ckpassword);

router.get('/txos/:pubkey', function(req, res) {
    client.call('getpubkeyoutputs', 
                {"publickey": req.params.pubkey},
                function(err, rpcRes) {

        if(err) {
            res.json({success: false,
                      message: err});
            return;
        }
        
        res.json({success: true,
                  txos: rpcRes});
    });
});

module.exports = router;