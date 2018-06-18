
![Logo of the project](./doc/github-icon.png)
# Inter-view
> Documentation is found in the `/docs` folder
Inter-view is a browser tool that enables you to audio record (semi-)structured interviews in intervals. It requires a Node.JS back-end to set up, but is able to function offline afterwards using a serviceworker.
<!-- Add a nice image here at the end of the week, showing off your shiny frontend 📸 -->

<!-- Maybe a table of contents here? 📚 -->

## Getting started
These instructions will tell you how to get going with this project.

### Prerequisites
You are assumed to be familiar with `Node.JS` and `MySQL` and the server should support these. The project is being tested on OSX and Ubuntu based servers. 

The client (browser) currently needs support for ES6 and modules. In time, the client code will be transpiled to ES5 to support more browsers, but this isn't the case yet. In any case, client browsers would need to support (modern) techniques like XMLHttpRequest, GetUserMedia. For more info on browser support, refer to the browser support section.

Some browsers require HTTPS/SSL before allowing usage of the microphone. Please refer to Setup Local SSL to setup a development certificate for 'localhost'

### Code style
Please make sure ESlint is used to test the code, using the `/.eslintrc.json` file.

### Installation and running
Make sure you have all modules installed using `npm install`.

To build and run the project use:
```
npm start
```

If you have nodemon (`npm install -g nodemon`), you can build and run the project in development:
```
npm run dev
```

> To enable HTTPS/SSL you need to create the certificates (`localhost.key` & `localhost.crt`) in the project root and **run the project as admin**

### Setup local SSL
Use this code to generate a localhost self-signed SSL certificate. I had trouble putting this in package.json as NPM run script.
```
openssl req -x509 -out localhost.crt -keyout localhost.key \ -newkey rsa:2048 -nodes -sha256 \ -subj '/CN=localhost' -extensions EXT -config <( \ printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```
Make sure to run the project as administrator to enable HTTPS/SSL

## Browser Support
This application makes use of a wide variety of (fairly) modern web-browser tech. It is recommended to use an up-to-date version of Chrome on a desktop platform.

| Browser        | Interval recording | Offline functionality* | ES6 Modular |
|----------------|:------------------:|:----------------------:|:-----------:|
| Chrome         | ✓                  | ✓ 45+                 | ✓ 61+       |
| Firefox        | ✓                  | ✓ 44+                 | ✓ 60+       |
| Edge           | ✓                  | ✓ 17+                 | ✓ 16+       |
| Opera          | ✓                  | ✓ 32+                 | ✓ 48+       |
| iOS Safari**   | ✓                  | ✓ 11.3+               | ✓ 11.2+     |
| Android Chrome | ✓                  | ✓ 66+                 | ✓ 66+       |
*: Requires server to setup script and 'install' in browser  
**: iOS Safari includes iOS Chrome

## Contributing
Currently, no contributions are accepted. However, you are free to fork the project and build on it.

## Licence
<!-- How about a license here?  (or is it a licence?) 🤷 -->

## Acknowledgments
* ☕️️️️
