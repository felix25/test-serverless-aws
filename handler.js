'use strict';
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient({
  region: 'us-east-2',
  apiVersion: '2012-08-10',
  convertEmptyValues: true,
});

const TABLE_NAME = 'starwars';
/**
 * Url base
 * @constant
 */
const BASE_URL_DEFAULT = 'https://swapi.py4e.com/api/people/';

/**
 * @constant
 * Object with the translation of each value
 * @property {Object<string, *>}
 */
 const REPLACE_KEYS = {
  name: 'nombre',
  height: 'alto',
  mass:'masa',
  hair_color: 'color_cabello',
  skin_color: 'color_piel',
  eye_color: 'color_ojos',
  birth_year: 'fecha_nacimiento',
  gender: 'genero',
  homeworld: 'mundo_origen',
  films: 'peliculas',
  species: 'especies',
  vehicles: 'vehiculos',
  starships: 'naves_estelares',
  created: 'creado',
  edited: 'editado',
  url: 'url',
}

/**
 * Lists all logs from DynamoDB
 * @returns {object<string, *>}
 */
const getList = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const {Items: list} = await dynamodb.scan(params).promise();
    return list;
  } catch (error) {
    console.error(
      'Unable to read item. Error JSON: ',
      JSON.stringify(error, null, 2),
      '\nEvent: ',
      JSON.stringify(params, null, 2),
    );

    error.httpStatus = 500;
    error.errorType = error.code;

    throw error;
  }
};

/**
 * Save information in BD DynamoDB
 * @param {Object<string*>} data 
 */
const saveDynamoDB = async (data) => {
  const { nombre, alto, masa, color_cabello, color_ojos, fecha_nacimiento, genero, mundo_origen, peliculas, especies, vehiculos, naves_estelares, creado, editado, url } = data;
  const dataSave = [];
  dataSave.push({
    id: uuidv4(),
    nombre,
    alto: alto,
    masa,
    color_cabello,
    color_ojos,
    fecha_nacimiento,
    genero,
    mundo_origen,
    peliculas,
    especies,
    vehiculos,
    naves_estelares,
    creado,
    editado,
    url,
  });
  const addPutRequest = item => ({ PutRequest: { Item: item } });
  const params = {
    RequestItems: {
      [TABLE_NAME]: dataSave.map(addPutRequest),
    },
  };
  try {
    await dynamodb.batchWrite(params).promise();
  } catch (e) {
    console.error(
      'ERROR EN DYNAMO DB JSON: ',
      JSON.stringify(e, null, 2),
      '\nEvent: ',
      JSON.stringify(params, null, 2),
    );
    throw e;
  }
}

/**
 * Configuration to invoke the endpoint ah consult the data
 * @param {String} url 
 * @param {String} method 
 * @returns {Array.<Object>}
 */
const exportData = async (url = BASE_URL_DEFAULT, method = 'get') => {
  try {
    const config = {
      method,
      url,
    };
    const { data } = await axios(config);
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Rename an object's key
 * @param {Array.<Object>} arr - Array of objects 
 * @param {Object} replaceKeys Object of the new keys to replace
 * @returns {Object} Returns the object with the change of the key to Spanish
 */
const changeKeyObjects = (arr, replaceKeys) => {
  return arr.map(item => {
    const newItem = {};
    Object.keys(item).forEach(key => {
      newItem[replaceKeys[key]] = item[[key]];
    });
    return newItem;
  });
};
module.exports = {
  exportData,
}

/**
 * Function to list all records
 * @returns {Object<string, *>}
 */
module.exports.starWars = async () => {
  try {
    const results = await getList();
    return {
      count: results.length,
      results,
    };
  } catch (error) {
    throw JSON.stringify(error);
  }
};

/**
 * Function to list and save the information in DynamoDB
 * @param {number} event.page - Number of the page to list
 * @returns {Object<string, *>}
 */
module.exports.create = async (event) => {
  const { page } = event;
  try {
    const response = await exportData(`${BASE_URL_DEFAULT}${page}`);
    const [ data ] = changeKeyObjects([response], REPLACE_KEYS);
    await saveDynamoDB(data);
    return data;
  } catch (error) {
    throw JSON.stringify(error);
  }
}
