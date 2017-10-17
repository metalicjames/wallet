var express = require('express');
var router = express.Router({mergeParams: true});

var rpc = require('json-rpc2');

var config = require('../../config/config');

var client = rpc.Client.$create(8383, 
                                'localhost', 
                                config.ckuser, 
                                config.ckpassword);

router.post('/txos', function(req, res) {
    client.call('getpubkeyoutputs', 
                {"publickey": req.body.pubkey},
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

router.post('/util/getoutputsetid', function(req, res) {
    client.call('getoutputsetid',
                {"outputs": req.body.outputs},
                function(err, rpcRes) {
        if(err) {
            res.json({success: false,
                      message: err
                    });
            return;
        }
        
        res.json({success: true,
                  id: rpcRes
                 });
    });
});

router.post('/util/sendrawtransaction', function(req, res) {
    client.call('sendrawtransaction',
                {"transaction": req.body.tx},
                function(err, rpcRes) {
        if(err) {
            res.json({success: false,
                      message: err
                    });
            return;
        }
        
        res.json({success: true,
                  result: rpcRes
                 });
    });
});

module.exports = router;