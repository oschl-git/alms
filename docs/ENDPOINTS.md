# ALMS ENDPOINTS
This document attempts to be an exhaustive guide to using ALMS endpoints. With it, you should be able to create your own ALMS client.

**To learn about general ALMS functionality, checkout the [documentation](DOCUMENTATION.md).**

## Error response
All error responses include the same JSON content. It is of the following format:
```
{
   "error": <http error code>,
   "message": "<error detail message>"
}
```
Sometimes, error responses can include additional fields, for example a list of supplied users that do not exist.

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