# mailgun-sender-node
## How to install
1. ```npm i```

2. Copy ```.env.example``` file and rename it to ```.env```. Add environment variables according to the example.

3. ```npm run migrate```

## How to use
```npm start -- -camp <mailgun_template_name> -ml <maillist_file_path>```

or

```node app.js -camp <mailgun_template_name> -ml <maillist_file_path>```

### Parameters
```-camp``` or ```--campaign``` **(required)** - Mailgun template name in the database.

```-ml``` or ```--maillist``` (optional) - Path to a ```.csv``` file in the following format:

    name,email,lang,ext_id
    "Client One",example@mail.com,en,d7DfCaF
    "Client Two",example2@gmail.com,es,e8Afaba
    
    (The first line is optional)

You can pass a file path or just a file name, either with or without the ```.csv``` extension.


### Using example:
``npm start -- -ml test.csv -camp template-name``
