# Pizza-Delivery-API
---------------------

This is a API developed by **Pulkit Kasera** intended to be submitted as **Homework Assignment-2** in **Node.JS Master Class** course.

## Installing
-------------
For installation of API download the ZIP file and extract it somewhere. After extracting the contents, change your directory so that you will be in the place where you can see **index.js** file.

Then from your terminal run the following command
```shell
node index.js
```

After that you can make API request to the url [localhost:3000](localhost:3000)
Below you can find the [API Documentation](#documentation)


## Documentation
----------------

Below are the routes and their description

| Method | Route | Desciption | Mandatory Parameters | Optional Parameters |
|---|---|---|
| GET | /users | Returns the user object which is curently signed in | token_id in headers | - 
| POST | /users | Creates a new user with email as key | email,password,streetAddress,name as payload data | 
| PUT | /users | Update the currently signed in user data | token_id in headers | name,password,streetAddress
| DELETE | /users | Deletes the currently signed in user | token_id in headers | -
| GET | /tokens | Returns the token object | token_id in headers | -
| POST | /tokens | Login as a user | email,password as payload data | -
| PUT | /tokens | Increases the expiration of token | token_id in haeders | -
| DELETE | /tokens | Delete the token data from database | token_id in headers | -
| GET | /items | Returns all of the items in the store | - | -
| GET | /cart | Returns the cart associated with user | token_id in headers | -
| POST | /cart | Adds a new item in the cart | token_id in headers,item_code,quantity,size as payload data | -
| PUT | /cart | Modify a item in the cart | token_id in headers,item_code as payload data | quantity,size as payload data |
| DELETE | /cart | Deletes a item from cart | token_id in headers, item_code as query string |
| GET | /orders | Returns all of the orders made by logged in user | token_id in headers | -
| POST | /orders | Places an order with the items in the cart | token_id in headers and cart must not be empty | -


## Additional Features

**Stripe Integration** : This API also verifies payment info from Stripe but as it is currently in development mode, hence the option for providing card info is not included, rather it is hardcoded.

**MAILGUN Inetgration** : After a order is placed succesfully, user will be notified with email which will consist of order reciept