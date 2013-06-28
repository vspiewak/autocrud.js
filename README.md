WORK IN PROGRESS
================


Guidelines
==========

Nouns are good, verbs are bad
-----------------------------

Keep your base URL simple and intuitive

2 base URL by resources:
    
    dogs 
    /dogs/1234

Keep verbs out of your base URLs

Use HTTP verbs to operate on the collections and elements.
CRUD with POST, GET, PUT, and DELETE 

Keep verbs out of your base URLs ...    
... Use HTTP verbs to operate on the collections and elements

				POST			GET				PUT						DELETE
				(create)		(read)			(update)				(delete)

	/dogs		a new dog		list dogs		bulk update dogs		delete all dogs

	/dogs/1234	Error			show bo			update bo or error		delete bo

In summary, an intuitive API uses plural rather than singular nouns, and concrete rather than abstract names.

Plural nouns and concrete names
-------------------------------

Simplify associations - sweep complexity under the ‘?’
------------------------------------------------------

    GET /owners/5678/dogs
    GET /dogs?color=red&state=running&location=park

Handling errors
----------------

Start by using the following 3 codes:

- 200 - OK
- 400 - Bad Request
- 500 - Internal Server Error

If you're not comfortable reducing all your error conditions to these 3, 
try picking among these additional 5:
- 201 - Created
- 304 - Not Modified
- 404 – Not Found
- 401 - Unauthorized
 -403 - Forbidden

Make messages returned in the payload as verbose as possible.

    {"developerMessage" : "Verbose, plain language description of
    the problem for the app developer with hints about how to fix
    it.", "userMessage":"Pass this message on to the app user if
    needed.", "errorCode" : 12345, "more info":
    "http://dev.teachdogrest.com/errors/12345"}

Versioning
-----------

At root and just integer:

    /v1/...
    /v2/...

Pagination & partial response
-----------------------------

Add optional fields in a comma-delimited list:

    /dogs?fields=name,color,location

Make it easy for developers to paginate objects in a database:

    /dogs?limit=25&offset=50 

