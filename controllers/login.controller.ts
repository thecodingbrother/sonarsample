// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {Request, RestBindings, get, ResponseObject, JsonBodyParser} from '@loopback/rest';
import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import { CountSchema } from '@loopback/repository';

var request = require('request');
const dotenv = require('dotenv').config();


export class LoginController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  @post('/login', {
    responses: {
      '200': {
        description: 'Logged in successfully',
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
  
        },
      },
    })
    login: any,
  ): Promise<any> {
    function synchronousRequest(options: any) {
      return new Promise((resolve, reject) => {
        request(options, (error: any, response: any)=> {
          if(error){
            reject(error)
          }
          else{
            resolve(response);
          }
        })
      })
    }


    var options = {
      method: 'POST',
      uri: process.env.WSO2_HOST+'/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + process.env.WSO2_ADMIN_AUTH
      },
      rejectUnauthorized: false,
      form: {
        grant_type: 'password',
        username: login.userId+'@'+ process.env.WSO2_TENANT,
        password: login.password,
        response_type: '',
        scope: 'openid'
      }
    };

    
    let authResponse: any = await synchronousRequest(options);

    var groupOptions = {
      method: 'GET',
      uri: process.env.WSO2_HOST+'/t/'+ process.env.WSO2_TENANT +'/scim2/Users?filter=userName+Eq+'+ login.userId,
      headers: {
        'Authorization': 'Basic ' + process.env.wso2AuthSecret
      },
      rejectUnauthorized: false,
    };

    let groupResponse: any = await synchronousRequest(groupOptions);
    
    let authRes = JSON.parse(authResponse.body);
    let grpRes = JSON.parse(groupResponse.body);

    let res = {
      "access_token" : authRes.access_token,
      "role" : grpRes.Resources[0].groups[0].display
    }
    return res;
  }

}
