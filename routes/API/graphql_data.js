const axios = require('axios');
const GQL_REQUEST_TIMEOUT = parseInt(process.env.GQL_REQUEST_TIMEOUT || 30000, 10);

console.log('GQL request timeout -> ', GQL_REQUEST_TIMEOUT);

const fetchEntities = endpoint => {
    const query = `
    query{
                    dependencias(sort:{
                        field:nombre
                        direction:ASC
                    }){
                        results{
                        nombre
                        }
                    }
                    }
    `;

    const opts = {
        url: endpoint.url,
        method: "POST",
        timeout: GQL_REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: JSON.stringify({
            query: query,
            variables: {},
        })
    };

    return new Promise((resolve, reject) => {
        return axios(opts).then(response => {
            let {data} = response;
            const entities = data.data.dependencias.results.map(e => {
                e.supplier_id = endpoint.supplier_id;
                return e;
            });
            resolve(entities);
        }).catch(e => {
            reject(e);
        })

    });
};

const fetchData = (endpoint, options) => {

    const {pageSize, page, query} = options;
    // falta sort en el query => $sort: Sort
    /*const gql_query = `
    query test($filtros: Filtros, $first: Int, $start: Int) {
              servidor_publico(filtros: $filtros, first: $first, start: $start){
                totalCount
                pageInfo {
                  hasNextPage
                }
                results {
                  id
                  fecha_captura
                  ejercicio_fiscal
                  periodo_ejercicio {
                    fecha_inicial
                    fecha_final
                  }
                  id_ramo
                  ramo
                  nombrecompleto
                  nombres
                  primer_apellido
                  segundo_apellido
                  genero
                  dependencia {
                    siglas
                    nombre
                    clave
                  }
                  puesto {
                    nombre
                    nivel
                  }
                  tipo_area
                  nivel_responsabilidad
                  tipo_procedimiento
                  tipo_actos
                  superior_inmediato {
                    nombres
                    primer_apellido
                    segundo_apellido
                    
                    puesto {
                      nombre
                      nivel
                    }
                  }
                }
              }
            }
    `;*/

    //console.log(query);

    if (query.hasOwnProperty('institucionDependencia')) {
        query.institucion = query.institucionDependencia;
        delete (query.institucionDependencia);
    }

    if (query.hasOwnProperty('tipoProcedimiento')) {

        const proc = query.tipoProcedimiento[0];
        let acto = "";

        switch (proc) {
            case 1:
                acto = "CONTRATACIONES";
                break;
            case 2:
                acto = "CONCESIONES";
                break;
            case 3:
                acto = "ENAJENACIONES";
                break;
            case 4:
                acto = "DICTAMENES";
                break;
            default:
                acto = "CONTRATACIONES";
        }

        query.tipo_actos = acto;
        delete (query.tipoProcedimiento);
    }

    const opts = {
        url: endpoint.url,
        method: "POST",
        timeout: GQL_REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: JSON.stringify({
            query: gql_query,
            variables: {
                filtros: query, // checar
                first: pageSize,
                start: page === 1 ? page : (pageSize * (page - 1)) + 1 // inicia en 1
                //sort
            },
        })
    };


    return new Promise((resolve, reject) => {
        return axios(opts).then(response => {
            const {data} = response;
            let {servidor_publico} = data.data;
            servidor_publico.supplier_name = endpoint.supplier_name;
            servidor_publico.supplier_id = endpoint.supplier_id;
            servidor_publico.levels = endpoint.levels;
            servidor_publico.endpoint_type = endpoint.type;
            servidor_publico.pagination = {};
            servidor_publico.pagination.totalRows = servidor_publico.totalCount;
            resolve(servidor_publico);
        }).catch(e => {
            reject(e)
        })
    });
};

module.exports = {
    fetchEntities,
    fetchData
};