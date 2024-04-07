# ALMS API ENDPOINTS DOCUMENTATION
This document attempts to be an exhaustive guide to using ALMS endpoints. With it, you should be able to create your own ALMS client.

**To learn about general ALMS functionality, checkout the [documentation](DOCUMENTATION.md).**

## Aperture Secure Authentication Protocol (ASAP)
ASAP is used for request authorization. For a detailed view of how it works, check out the [relevant section of the documentation](DOCUMENTATION.md#aperture-secure-authentication-protocol-asap). What is important here is that every request that requires authorization needs to have a header titled `token` that will include the current user's session token.

## Error response
All error responses include the same JSON content. It is of the following format:
```
{
   "error": <http error code>,
   "message": "<error detail message>"
}
```
Sometimes, error responses can include additional fields, for example a list of supplied users that do not exist.

## Success response
Endpoints that do not return anything will return a generic success response of the following format:
```
{
   "response": 200,
   "message": "OK"
}
```

## Endpoints:
### POST `/login`
- the login endpoint allowing user authentication
#### Required headers:
- none
#### JSON request content:
```
{
	"username": "<username>",
	"password": "<password>"
}
```
#### 200 OK response:
```
{
   "token": "<session token>",
   "employee": {
      "id": <employeeId>,
      "username": "<username>",
      "name": "<first name>",
      "surname": "<surname>"
   }
}
```

#### ERROR responses:
- **400**
   - *JSON FIELDS MISSING*
   - *ALL FIELDS MUST BE STRING*
- **401**
   - *USER DOES NOT EXIST*
   - *INCORRECT PASSWORD*
- **500**
   - *INTERNAL ALMS ERROR*

### POST `/register`
- the register endpoint allowing creation of new users
#### Required headers:
- none
#### JSON request content:
```
{
	"username": "<username>",
	"password": "<password>",
	"name": "<first name>",
	"surname": "<surname>"
}
```
#### 200 OK response:
- [default success response](#success-response)

#### ERROR responses:
- **400**
   - *JSON FIELDS MISSING*
   - *ALL FIELDS MUST BE STRING*
   - *REQUIREMENTS NOT SATISFIED*
      - response includes an additional array titled `errors` that includes a list of strings explaining which requirements were not satisfied
   - *USERNAME TAKEN*
- **500**
   - *INTERNAL ALMS ERROR*