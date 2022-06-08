var express = require('express');
var cors = require ('cors');

var router = express.Router();
router.use(cors());

const {Client} = require('pg');

const connectionData = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
};
const connectionData2 = {
    user: 'root',
    host: 'localhost',
    database: 'graficas',
    password: 'root',
    port: 5432
};
router.get('/getAgrupacionEjercicio', (req, res) => {

        const client = new Client(connectionData);
        client.connect();
        const query = "select ejercicio, count(*) total  from reniresp group by ejercicio order by ejercicio;"

         client.query(query).then(response => {
            res.status(200).json({
                "status": 200,
                "data": response.rows
            });
            client.end();
        }).catch(err => {
            console.log("Error : ", err);
            res.status(500).json({
                "status": 400,
                "mensaje": "Error al consultar BD"
            });
            client.end();
        });

});

router.get('/getAgrupacionPuesto', (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    const query = "select puesto, count(*) total  from reniresp group by puesto order by total desc limit 10;";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    })
});

router.post('/getAgrupaciones', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    let aux = "";
    if (req.body.filtros && req.body.filtros.length>0) {
        req.body.filtros.forEach((item, index) => {
            aux += (index === 0 ? item : (" and " + item))
        });
    }

    let query = "select ejercicio, ramo,institucion, count(*) total  " +
        " from reniresp " +
        (req.body.filtros && req.body.filtros.length>0 ? (" where " + aux) : "") +
        " group by ejercicio,ramo,institucion "+
        " order by total desc,ejercicio,ramo,institucion";
    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.get('/getEjercicios', (req, res) => {
    const client = new Client(connectionData);
    client.connect();
    const query = "select ejercicio from reniresp group by ejercicio order by ejercicio "

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.post('/getRamos', (req, res) => {
    const client = new Client(connectionData);
    let query = "select ramo from reniresp " +
        (req.body.filtros ? (" where " + req.body.filtros) : "") +
        " group by ramo order by ramo ";
    client.connect();

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(400).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.post('/getInstituciones', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    let aux = "";
    if (req.body.filtros) {
        req.body.filtros.forEach((item, index, array) => {
            aux += (index === 0 ? item : (" and " + item))
        });
    }

    let query = "select institucion from reniresp " +
        (req.body.filtros ? (" where " + aux) : "") +
        " group by institucion order by institucion ";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.post("/getTop", (req,res) => {
    const client = new Client(connectionData);
    const {top, filtros} = req.body;

    if (typeof top === 'undefined'){
        res.status(500).json({
            status: 500,
            mensaje: 'Proporcione la variable top (e.g., {"top": "institucion"})'
        });
        return;
    }

    let aux = "";
    if (filtros) {
        filtros.forEach((item, index) => {
            aux += (index === 0 ? item : (" and " + item))
        });

    }

    let query = "";
    if (top!=="id_procedimiento") {
        query = "select " + top + " as top, count(*) total from reniresp " +
            (filtros ? (" where " + aux) : "") +
            " group by " + top + " order by total desc limit 10";
    } else {
        query = "select " + top + " as top, count(*) total, case when id_procedimiento='1' " +
            " then 'CONTRATACIONES' when id_procedimiento='2' then 'CONCESIONES' when " +
            " id_procedimiento='3' then 'ENAJENACIÓN' else 'OTRO' end " +
            " from reniresp " +
            (filtros ? (" where " + aux) : "") +
            " group by " + top + " order by total desc limit 10";
    }
    client.connect();

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.get('/getProcedimientosPeriodo', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select ejercicio,  case when id_procedimiento='1' then 'CONTRATACIONES' when " +
        " id_procedimiento='2' then 'CONCESIONES' when id_procedimiento='3' then 'ENAJENACIÓN' " +
        " else 'OTRO' end,  count(*) total from reniresp group by ejercicio, id_procedimiento " +
        " order by ejercicio,id_procedimiento  desc";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
});

router.get('/getTotalRows', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from reniresp";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})

router.get('/getTotalInstituciones', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from (select institucion from reniresp group by institucion)as instituciones";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})
router.get('/getTotalRamos', (req, res) => {
    const client = new Client(connectionData);
    client.connect();

    const query = "select count(*) from (select ramo from reniresp group by ramo)as ramos";

    client.query(query).then(response => {
        res.status(200).json({
            "status": 200,
            "data": response.rows
        });
        client.end();
    }).catch(err => {
        console.log("Error : ", err);
        res.status(500).json({
            "status": 400,
            "mensaje": "Error al consultar BD"
        });
        client.end();
    });
})

module.exports = router;